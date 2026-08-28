import { Router, Request, Response } from 'express';
import { geminiAgentClient } from '../gemini-agent-client';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { image_base64, prompt_hint } = req.body;
    if (!image_base64 || typeof image_base64 !== 'string') {
      return res.status(400).json({ error: 'image_base64 is required (as a base64-encoded string).' });
    }

    console.log('[ImageSearch] Processing visual moodboard image analysis');
    const result = await geminiAgentClient.analyzeMoodboardImage(image_base64, prompt_hint || '');

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[ImageSearch] Error:', err);
    return res.status(500).json({ error: 'Failed to process image search', message: err.message || String(err) });
  }
});

export default router;
