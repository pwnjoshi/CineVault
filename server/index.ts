import { clerkMiddleware } from '@clerk/express';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from possible locations
const envCandidates = [
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '..', '.env.local'),
  path.join(__dirname, '..', '..', '.env')
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

import searchFootageRouter from './routes/search-footage';
import shortlistRouter from './routes/shortlist';
import monitorRouter from './routes/monitor';
import sampleDataRouter from './routes/sample-data';
import authRouter from './routes/auth';
import scriptRouter from './routes/script-to-timeline';
import imageSearchRouter from './routes/image-search';
import certificateRouter from './routes/certificate';
import audioToTimelineRouter from './routes/audio-to-timeline';
import videoIntelligenceRouter from './routes/video-intelligence';
import { globalApiLimiter, searchOrchestrationLimiter, mutationLimiter } from './rate-limiter';

const app = express();

// Production Security Hardening Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(clerkMiddleware());
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

import { syncBroadcaster } from './sync-service';

// Apply global rate limiting across all API routes
app.use('/api', globalApiLimiter);

// Server-Sent Events (SSE) Live Sync Pipeline for Premiere Pro & Web Workspaces
app.get('/api/live-sync', (req, res) => {
  syncBroadcaster.handleConnection(req, res);
});

// API Routes with Tiered Rate Limiting & Protection
app.use('/api/auth', authRouter);
app.use('/api/search-footage', searchOrchestrationLimiter, searchFootageRouter);
app.use('/api/script-to-timeline', searchOrchestrationLimiter, scriptRouter);
app.use('/api/audio-to-timeline', searchOrchestrationLimiter, audioToTimelineRouter);
app.use('/api/video-intelligence', searchOrchestrationLimiter, videoIntelligenceRouter);
app.use('/api/image-search', searchOrchestrationLimiter, imageSearchRouter);
app.use('/api/legal-certificate', certificateRouter);
app.use('/api/shortlist', mutationLimiter, shortlistRouter);
app.use('/api/monitor', mutationLimiter, monitorRouter);
app.use('/api/samples', sampleDataRouter);
app.use('/api', sampleDataRouter); // for /api/status

// Resolve Static Assets Path Helper
function findStaticDir(dirName: string): string {
  const possiblePaths = [
    path.join(__dirname, '..', '..', dirName),
    path.join(__dirname, '..', dirName),
    path.join(process.cwd(), dirName),
    path.join(process.cwd(), '..', dirName),
    path.join(__dirname, dirName)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }

  return path.join(__dirname, '..', dirName);
}

const dashboardPath = findStaticDir('dashboard');
const premierePanelPath = findStaticDir('premiere-panel');

console.log(`[Static] Dashboard resolved to: ${dashboardPath}`);
console.log(`[Static] Premiere Panel resolved to: ${premierePanelPath}`);

// Favicon Handler
app.get(['/favicon.ico', '/favicon.svg'], (req, res) => {
  const favPath = path.join(dashboardPath, 'favicon.svg');
  if (fs.existsSync(favPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(favPath);
  }
  return res.status(204).end();
});

// Public Landing Page
app.get('/', (req, res) => {
  const landingPath = path.join(dashboardPath, 'landing.html');
  if (fs.existsSync(landingPath)) {
    return res.sendFile(landingPath);
  }
  return res.sendFile(path.join(dashboardPath, 'index.html'));
});

// Documentation Page
app.get('/docs', (req, res) => {
  const docsPath = path.join(dashboardPath, 'docs.html');
  if (fs.existsSync(docsPath)) {
    return res.sendFile(docsPath);
  }
  return res.status(404).send('Documentation docs.html not found');
});

// Studio Web Dashboard
app.get('/dashboard', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const indexPath = path.join(dashboardPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send('Dashboard index.html not found');
});



// Serve Premiere Panel static files (no-cache so edits always show immediately)
app.use('/premiere', express.static(premierePanelPath, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Serve Dashboard static assets (no-cache)
app.use(express.static(dashboardPath, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Health check endpoints (both /health and /api/health for panel compat)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Catch-all for SPA dashboard
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(dashboardPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send(`Dashboard index.html not found at ${indexPath}`);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    const hasParallelKey = !!(process.env.PARALLEL_API_KEY && process.env.PARALLEL_API_KEY.trim().length > 5);
    const gcpProject = process.env.GOOGLE_CLOUD_PROJECT_ID || 'trustfix-506602';

    console.log(`
=====================================================
[CINEVAULT STUDIO SERVER RUNNING ON PORT ${PORT}]
=====================================================
Web Dashboard:      http://localhost:${PORT}/
API Base:           http://localhost:${PORT}/api
Premiere Panel:     http://localhost:${PORT}/premiere
Parallel API Key:   ${hasParallelKey ? 'CONFIGURED (' + process.env.PARALLEL_API_KEY!.substring(0, 4) + '...)' : 'ACTIVE (Live Sandbox + Fallback Heuristics)'}
GCP Project:        ${gcpProject} (Google Cloud Vertex AI Ready)
=====================================================
`);
  });
}

export default app;