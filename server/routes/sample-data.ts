import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { geminiAgentClient } from '../gemini-agent-client';
import { parallelClient } from '../parallel-client';

const router = Router();

/**
 * GET /api/samples
 * Returns realistic curated demo prompts and benchmark results
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'sample-queries.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const samples = JSON.parse(raw);
      return res.status(200).json({
        success: true,
        count: samples.length,
        samples
      });
    }
    return res.status(200).json({ success: true, samples: [] });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to load sample queries',
      message: err.message || String(err)
    });
  }
});

import { store } from '../store';

/**
 * GET /api/status
 * Returns system health, runtime integration status for Google Cloud & Parallel, and live metrics
 */
router.get('/status', (req: Request, res: Response) => {
  const geminiStatus = geminiAgentClient.getStatus();
  const parallelStatus = parallelClient.getStatus();
  const mem = process.memoryUsage();

  return res.status(200).json({
    status: 'healthy',
    system: 'CineVault Studio Intelligent Archival Footage Sourcing Agent',
    uptime_seconds: Math.floor(process.uptime()),
    metrics: {
      shortlist_items: store.getShortlist().length,
      monitored_clips: store.getMonitoredClips().length,
      historical_traces: store.getExecutionTraces().length,
      memory_rss_mb: Math.round(mem.rss / (1024 * 1024)),
      memory_heap_mb: Math.round(mem.heapUsed / (1024 * 1024))
    },
    integrations: {
      gemini_enterprise: {
        status: geminiStatus.hasGcpAuth ? 'connected' : 'active_orchestrator',
        details: geminiStatus
      },
      parallel_api: {
        status: parallelStatus.hasKey ? 'connected' : 'active_heuristic_provider',
        details: parallelStatus
      }
    },
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
