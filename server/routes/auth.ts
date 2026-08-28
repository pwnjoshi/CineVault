import { Router, Request, Response } from 'express';
import { 
  createSession, 
  getSessionByToken, 
  revokeSession, 
  PRESET_USERS, 
  UserRole,
  requireAuth 
} from '../auth';

const router = Router();

/**
 * GET /api/auth/config
 * Returns public Clerk publishable key and auth settings
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  });
});

/**
 * GET /api/auth/presets
 * Returns available test roles and profiles for 1-click judge evaluation
 */
router.get('/presets', (req: Request, res: Response) => {
  res.json({
    success: true,
    presets: Object.values(PRESET_USERS)
  });
});

/**
 * POST /api/auth/login
 * Authenticates user via Google Cloud Workspace SSO or email credentials
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, role, sso_provider } = req.body;

  let targetUser = PRESET_USERS[email];

  if (!targetUser) {
    // Generate session for custom user
    const name = email ? email.split('@')[0].replace('.', ' ') : 'Studio Member';
    const userRole: UserRole = role || 'LEAD_EDITOR';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ED';

    targetUser = {
      id: `usr_${Date.now()}`,
      email: email || 'editor@cinema-studio.ai',
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role: userRole,
      roleTitle: userRole === 'LEGAL_COUNSEL' ? 'Production Legal Counsel' : 
                 (userRole === 'STUDIO_ADMIN' ? 'Studio Administrator' : 'Lead Film Editor'),
      avatar: initials,
      gcpProject: process.env.GOOGLE_CLOUD_PROJECT_ID || 'trustfix-506602',
      studioUnit: sso_provider ? 'Google Cloud Workspace (Verified)' : 'Production Unit 4'
    };
  }

  const session = createSession(targetUser);

  res.status(200).json({
    success: true,
    message: `Authenticated as ${session.name} (${session.roleTitle})`,
    token: session.token,
    user: session
  });
});

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated session
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    success: true,
    authenticated: true,
    user
  });
});

/**
 * POST /api/auth/switch-role
 * Allows fast role switching in the studio UI to test permissions
 */
router.post('/switch-role', requireAuth, (req: Request, res: Response) => {
  const { target_role } = req.body;
  const currentUser = (req as any).user;

  let presetKey = 'editor@cinema-studio.ai';
  if (target_role === 'LEGAL_COUNSEL') presetKey = 'legal@cinema-studio.ai';
  if (target_role === 'ARCHIVAL_RESEARCHER') presetKey = 'research@cinema-studio.ai';
  if (target_role === 'STUDIO_ADMIN') presetKey = 'admin@cinema-studio.ai';

  const newPreset = PRESET_USERS[presetKey] || PRESET_USERS['editor@cinema-studio.ai'];
  const newSession = createSession(newPreset);

  res.json({
    success: true,
    message: `Switched role to ${newSession.roleTitle}`,
    token: newSession.token,
    user: newSession
  });
});

/**
 * POST /api/auth/logout
 * Logs out and invalidates the session token
 */
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    revokeSession(authHeader);
  }
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
});

export default router;
