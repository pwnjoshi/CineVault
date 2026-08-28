import { Router, Request, Response } from 'express';
import { geminiAgentClient } from '../gemini-agent-client';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { script_text } = req.body;
    if (!script_text || typeof script_text !== 'string' || script_text.trim().length < 5) {
      return res.status(400).json({ error: 'script_text is required.' });
    }

    console.log('[ScriptToTimeline] Processing script length:', script_text.length);
    const result = await geminiAgentClient.deconstructScriptToScenes(script_text);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[ScriptToTimeline] Error:', err);
    return res.status(500).json({ error: 'Failed to process script', message: err.message || String(err) });
  }
});

export default router;
