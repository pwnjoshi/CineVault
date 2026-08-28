import { Router, Request, Response } from 'express';
import { geminiAgentClient, SearchFilters } from '../gemini-agent-client';
import { store } from '../store';

const router = Router();

/**
 * POST /api/search-footage
 * Body: { shot_query: string, filters?: SearchFilters }
 * Returns: Ranked shortlist + agent execution trace
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { shot_query, filters } = req.body;

    if (!shot_query || typeof shot_query !== 'string' || shot_query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request: "shot_query" is required and must be a non-empty string.'
      });
    }

    const cleanQuery = shot_query.trim().substring(0, 500);

    console.log(`[API /api/search-footage] Received shot search query: "${cleanQuery}"`, filters);

    // Execute multi-step agent orchestration pipeline
    const result = await geminiAgentClient.orchestrateShotSearch(cleanQuery, filters as SearchFilters);

    return res.status(200).json({
      success: true,
      shot_query: result.shot_query,
      decomposed_queries: result.decomposed_queries,
      candidates: result.candidates,
      execution_time_ms: result.execution_time_ms,
      trace: result.trace,
      platform: result.platform
    });
  } catch (err: any) {
    console.error('[API /api/search-footage] Orchestration error:', err);
    return res.status(500).json({
      error: 'Failed to process footage search orchestration',
      message: err.message || String(err)
    });
  }
});

/**
 * GET /api/search-footage/traces
 * Returns historical agent execution traces for inspection
 */
router.get('/traces', (req: Request, res: Response) => {
  const traces = store.getExecutionTraces();
  return res.status(200).json({
    success: true,
    count: traces.length,
    traces
  });
});

/**
 * GET /api/search-footage/latest-trace
 * Returns the most recent agent execution trace
 */
router.get('/latest-trace', (req: Request, res: Response) => {
  const trace = store.getLatestTrace();
  return res.status(200).json({
    success: true,
    trace
  });
});

export default router;
