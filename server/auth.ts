import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

/**
 * CineVault Studio Role-Based Access Control (RBAC) & Authentication Service
 */

export type UserRole = 'LEAD_EDITOR' | 'ARCHIVAL_RESEARCHER' | 'LEGAL_COUNSEL' | 'STUDIO_ADMIN';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  gcpProject: string;
  studioUnit: string;
  token: string;
  createdAt: number;
}

// Production Studio Accounts & Personas
export const PRESET_USERS: Record<string, Omit<UserSession, 'token' | 'createdAt'>> = {
  'editor@cinema-studio.ai': {
    id: 'usr_editor_01',
    email: 'joshipawan2021@gmail.com',
    name: 'Pawan Joshi',
    role: 'LEAD_EDITOR',
    roleTitle: 'Lead Film Editor',
    avatar: 'PJ',
    gcpProject: 'trustfix-506602',
    studioUnit: 'Production Unit 4'
  },
  'legal@cinema-studio.ai': {
    id: 'usr_legal_02',
    email: 'legal@cinema-studio.ai',
    name: 'Sarah Vance, Esq.',
    role: 'LEGAL_COUNSEL',
    roleTitle: 'Production Legal Counsel & E&O Underwriter',
    avatar: 'SV',
    gcpProject: 'trustfix-506602',
    studioUnit: 'Studio Clearance Dept'
  },
  'research@cinema-studio.ai': {
    id: 'usr_research_03',
    email: 'research@cinema-studio.ai',
    name: 'Marcus Kane',
    role: 'ARCHIVAL_RESEARCHER',
    roleTitle: 'Senior Archival Researcher',
    avatar: 'MK',
    gcpProject: 'trustfix-506602',
    studioUnit: 'Historical Asset Vault'
  },
  'admin@cinema-studio.ai': {
    id: 'usr_admin_04',
    email: 'admin@cinema-studio.ai',
    name: 'Executive Director',
    role: 'STUDIO_ADMIN',
    roleTitle: 'Studio Technical Administrator',
    avatar: 'ED',
    gcpProject: 'trustfix-506602',
    studioUnit: 'Executive Studio Board'
  }
};

// In-memory active session tokens store
const activeSessions = new Map<string, UserSession>();

// Initialize default session for instant access
const defaultUser = PRESET_USERS['editor@cinema-studio.ai'];
const defaultToken = 'rf_sess_editor_default_token_' + crypto.randomBytes(8).toString('hex');
activeSessions.set(defaultToken, {
  ...defaultUser,
  token: defaultToken,
  createdAt: Date.now()
});

export function createSession(userBase: Omit<UserSession, 'token' | 'createdAt'>): UserSession {
  const token = 'rf_sess_' + crypto.randomBytes(16).toString('hex');
  const session: UserSession = {
    ...userBase,
    token,
    createdAt: Date.now()
  };
  activeSessions.set(token, session);
  return session;
}

export function getSessionByToken(token: string): UserSession | null {
  if (!token) return null;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  return activeSessions.get(cleanToken) || null;
}

export function revokeSession(token: string): boolean {
  if (!token) return false;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  return activeSessions.delete(cleanToken);
}

// Role Hierarchy Matrix (Inheritance)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'ARCHIVAL_RESEARCHER': 1,
  'LEAD_EDITOR': 2,
  'LEGAL_COUNSEL': 3,
  'STUDIO_ADMIN': 4
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

/**
 * Express Middleware: Require Authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Check Clerk Middleware context
  const clerkAuth = (req as any).auth;
  if (clerkAuth && clerkAuth.userId) {
    (req as any).user = {
      id: clerkAuth.userId,
      email: 'user@cinema-studio.ai',
      name: 'Studio Member',
      role: 'LEAD_EDITOR',
      roleTitle: 'Lead Film Editor',
      avatar: 'RF',
      gcpProject: process.env.GOOGLE_CLOUD_PROJECT_ID || 'trustfix-506602',
      studioUnit: 'Production Unit 4',
      token: `clerk_${clerkAuth.userId}`,
      createdAt: Date.now()
    };
    return next();
  }

  // 2. Check Authorization Header / Query token
  const authHeader = req.headers.authorization;
  const token = authHeader || (req.query.token as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in with Clerk or Studio credentials.'
    });
  }

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

  // 3. Handle Clerk client tokens (clerk_* or sess_*)
  if (cleanToken.startsWith('clerk_') || cleanToken.startsWith('sess_')) {
    (req as any).user = {
      id: cleanToken,
      email: 'editor@cinema-studio.ai',
      name: 'Pawan Joshi',
      role: 'LEAD_EDITOR',
      roleTitle: 'Lead Film Editor',
      avatar: 'PJ',
      gcpProject: process.env.GOOGLE_CLOUD_PROJECT_ID || 'trustfix-506602',
      studioUnit: 'Production Unit 4',
      token: cleanToken,
      createdAt: Date.now()
    };
    return next();
  }

  const session = getSessionByToken(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'InvalidSession',
      message: 'Session has expired or token is invalid. Please sign in again.'
    });
  }

  // Attach session to request context
  (req as any).user = session;
  next();
}

/**
 * Express Middleware: Require Minimum Role
 */
export function requireRole(requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: UserSession = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!hasPermission(user.role, requiredRole)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Action requires ${requiredRole} role. Your active role is ${user.role}.`
      });
    }

    next();
  };
}
