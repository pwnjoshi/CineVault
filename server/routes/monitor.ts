import { Router, Request, Response } from 'express';
import { store, Candidate } from '../store';
import { parallelClient } from '../parallel-client';

const router = Router();

/**
 * GET /api/monitor
 * Returns all active Parallel Monitor clip tracking items
 */
router.get('/', (req: Request, res: Response) => {
  const monitors = store.getMonitoredClips();
  return res.status(200).json({
    success: true,
    count: monitors.length,
    monitors
  });
});

/**
 * POST /api/monitor
 * Register a clip candidate with the Parallel Monitor API
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { candidate, watch_for = 'Price or availability change' } = req.body;

    if (!candidate || !candidate.id || !candidate.source_url) {
      return res.status(400).json({
        error: 'Invalid request: "candidate" object with id and source_url is required.'
      });
    }

    // Call Parallel Client to register monitor task
    const parResponse = await parallelClient.monitorAdd(candidate.source_url, watch_for);

    // Save to local store
    const item = store.addMonitoredClip(candidate, watch_for);

    return res.status(201).json({
      success: true,
      message: 'Clip registered with Parallel Monitor API',
      monitor_item: item,
      parallel_response: parResponse
    });
  } catch (err: any) {
    console.error('[Monitor] Registration error:', err);
    return res.status(500).json({
      error: 'Failed to register monitor with Parallel API',
      message: err.message || String(err)
    });
  }
});

/**
 * POST /api/monitor/check-updates
 * Triggers a live re-verification scan of monitored clip URLs
 */
router.post('/check-updates', (req: Request, res: Response) => {
  const { monitor_id } = req.body || {};
  const updated = store.checkUpdates(monitor_id);

  return res.status(200).json({
    success: true,
    message: `Scanned and verified ${updated.length} monitored clip(s)`,
    updated_count: updated.length,
    monitors: store.getMonitoredClips()
  });
});

/**
 * POST /api/monitor/simulate-alert
 * Updates monitor price state
 */
router.post('/simulate-alert', (req: Request, res: Response) => {
  const { monitor_id, new_price, note } = req.body;

  if (!monitor_id) {
    return res.status(400).json({
      error: 'Missing monitor_id parameter'
    });
  }

  const updated = store.simulatePriceAlert(
    monitor_id,
    new_price || '$59.00 (Flash 25% Discount Detected)',
    note || 'Parallel Monitor detected price drop on archive source listing.'
  );

  if (updated) {
    return res.status(200).json({
      success: true,
      message: 'Simulated Parallel Monitor alert processed',
      monitor_item: updated
    });
  } else {
    return res.status(404).json({
      error: `Monitor ID ${monitor_id} not found`
    });
  }
});

/**
 * DELETE /api/monitor/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = store.deleteMonitoredClip(id);

  if (deleted) {
    return res.status(200).json({
      success: true,
      message: `Monitor ${id} removed`
    });
  } else {
    return res.status(404).json({
      error: `Monitor ${id} not found`
    });
  }
});

export default router;
