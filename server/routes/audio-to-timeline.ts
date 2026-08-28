import { Router, Request, Response } from 'express';
import { geminiAgentClient } from '../gemini-agent-client';

const router = Router();

/**
 * POST /api/audio-to-timeline
 * Processes voiceover audio transcripts or MP3 narration metadata,
 * extracts phrase timestamps, and automatically sources aligned B-roll archival clips.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { voiceover_text, audio_name } = req.body;

    const textToProcess = voiceover_text || `
      [00:00:00 - 00:00:08] The roar of the Saturn V engines shook the launchpad as Apollo 11 ascended into the Florida sky.
      [00:00:08 - 00:00:18] Inside Detroit auto assembly plants, thousands of steel workers forged the backbone of industrial America.
      [00:00:18 - 00:00:30] Neon lights illuminated the bustling streets of Shibuya as 1980s retro technology began transforming global cities.
    `;

    console.log('[AudioToTimeline] Processing voiceover B-roll alignment for:', audio_name || 'Voiceover Track');
    
    // Leverage Gemini agent client script deconstructor to auto-slice audio timestamps & match clips
    const result = await geminiAgentClient.deconstructScriptToScenes(textToProcess);

    return res.status(200).json({
      success: true,
      audio_title: audio_name || 'Voiceover Narration B-Roll Sequence',
      total_duration_formatted: result.total_duration_formatted,
      scenes: result.scenes
    });
  } catch (err: any) {
    console.error('[AudioToTimeline] Error:', err);
    return res.status(500).json({ error: 'Failed to process voiceover audio', message: err.message || String(err) });
  }
});

export default router;
