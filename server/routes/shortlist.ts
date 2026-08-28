import { Router, Request, Response } from 'express';
import { store, Candidate } from '../store';
import { parallelClient } from '../parallel-client';
import { syncBroadcaster } from '../sync-service';

const router = Router();

/**
 * GET /api/shortlist
 * Returns all saved shortlisted candidates
 */
router.get('/', (req: Request, res: Response) => {
  const shortlist = store.getShortlist();
  return res.status(200).json({
    success: true,
    count: shortlist.length,
    shortlist
  });
});

/**
 * POST /api/shortlist
 * Save a candidate to the project shortlist and auto-register with Parallel Monitor
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const candidate: Candidate = req.body;

    if (!candidate || !candidate.id || !candidate.source_url) {
      return res.status(400).json({
        error: 'Invalid candidate payload: "id" and "source_url" are required.'
      });
    }

    const saved = store.addToShortlist(candidate);

    if (req.body.auto_monitor !== false) {
      try {
        await parallelClient.monitorAdd(candidate.source_url, 'Price or license terms change');
        store.addMonitoredClip(candidate, 'Price or availability change');
      } catch (err) {
        console.warn('[Shortlist] Could not auto-register monitor:', err);
      }
    }

    // Real-time broadcast to all connected Premiere Pro panels and web workspaces
    syncBroadcaster.broadcast('shortlist_added', {
      candidate: saved,
      total_count: store.getShortlist().length,
      shortlist: store.getShortlist()
    });

    return res.status(201).json({
      success: true,
      message: 'Candidate added to project shortlist',
      candidate: saved
    });
  } catch (err: any) {
    console.error('[Shortlist] Error adding candidate:', err);
    return res.status(500).json({
      error: 'Failed to add candidate to shortlist',
      message: err.message || String(err)
    });
  }
});

/**
 * DELETE /api/shortlist/:id
 * Remove candidate from shortlist
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const removed = store.removeFromShortlist(id);

  if (removed) {
    syncBroadcaster.broadcast('shortlist_removed', {
      removed_id: id,
      total_count: store.getShortlist().length,
      shortlist: store.getShortlist()
    });

    return res.status(200).json({
      success: true,
      message: `Candidate ${id} removed from shortlist`
    });
  } else {
    return res.status(404).json({
      error: `Candidate ${id} not found in shortlist`
    });
  }
});

/**
/**
 * ALL /api/shortlist/export
 * Formats shortlist for NLE import (supports both GET query and POST body):
 * - premiere_xml (Adobe Premiere Pro FCP XML)
 * - fcpxml (Final Cut Pro X / DaVinci Resolve)
 * - edl (Standard CMX 3600 Edit Decision List)
 * - csv (Spreadsheet)
 * - json (Structured metadata)
 */
router.all('/export', (req: Request, res: Response) => {
  const format = (req.query.format as string) || req.body?.format || 'json';
  const shortlist = store.getShortlist();

  // 1. CMX 3600 EDL Export
  if (format === 'edl') {
    let edl = `TITLE: CINEVAULT_ARCHIVAL_SHORTLIST\nFCM: NON-DROP FRAME\n\n`;
    shortlist.forEach((clip, idx) => {
      const eventNum = String(idx + 1).padStart(3, '0');
      const reel = `REEL${String(idx + 1).padStart(2, '0')}`;
      const tcIn = clip.timecode_in || '00:00:00:00';
      const tcOut = clip.timecode_out || '00:01:00:00';
      const recIn = `01:00:${String(idx * 30).padStart(2, '0')}:00`;
      const recOut = `01:00:${String((idx + 1) * 30).padStart(2, '0')}:00`;

      edl += `${eventNum}  ${reel}    V     C        ${tcIn} ${tcOut} ${recIn} ${recOut}\n`;
      edl += `* FROM CLIP NAME: ${clip.title}\n`;
      edl += `* SOURCE: ${clip.source_name} | RIGHTS: ${clip.license_scope || 'N/A'}\n`;
      edl += `* LUT: ${(clip as any).lut_preset || 'Standard'} | ASPECT: ${(clip as any).aspect_ratio || '16:9'}\n`;
      edl += `* PD RISK: ${clip.pd_claim.toUpperCase()} | PRICE: ${clip.price || 'N/A'}\n`;
      edl += `* URL: ${clip.source_url}\n\n`;
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="cinevault_shortlist.edl"');
    return res.send(edl);
  }

  // 2. Final Cut Pro X XML (FCPXML) for DaVinci Resolve / FCP
  if (format === 'fcpxml') {
    let fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p24" frameDuration="1001/24000s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="CineVault Archival Shortlist">
`;
    shortlist.forEach((clip, idx) => {
      fcpxml += `      <asset id="asset-${idx + 1}" name="${clip.title.replace(/[<&>]/g, '')}" src="${clip.source_url}" duration="2400/24s" format="r1">
        <metadata>
          <md key="com.apple.proapps.studio.comment" value="Source: ${clip.source_name} | LUT: ${(clip as any).lut_preset || 'Standard'} | Aspect: ${(clip as any).aspect_ratio || '16:9'} | Rights: ${clip.license_scope} | PD: ${clip.pd_claim.toUpperCase()}"/>
        </metadata>
      </asset>
`;
    });
    fcpxml += `    </event>
  </library>
</fcpxml>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="cinevault_shortlist.fcpxml"');
    return res.send(fcpxml);
  }

  // 3. CSV Spreadsheet Export
  if (format === 'csv') {
    const header = 'ID,Title,Source,URL,Price,License,PD_Claim,Resolution,Era,Color,LUT_Preset,Aspect_Ratio,Relevance,Provenance,E&O_Rating\n';
    const rows = shortlist.map(c => 
      `"${c.id}","${c.title.replace(/"/g, '""')}","${c.source_name}","${c.source_url}","${c.price || ''}","${c.license_scope || ''}","${c.pd_claim}","${c.resolution || ''}","${c.era || ''}","${c.color_profile || ''}","${(c as any).lut_preset || 'Standard'}","${(c as any).aspect_ratio || '16:9'}","${c.relevance_score}","${c.clearance_details?.provenance || ''}","${c.clearance_details?.eo_risk_rating || ''}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cinevault_shortlist.csv"');
    return res.send(header + rows);
  }

  // 4. Adobe Premiere Pro XML Export
  if (format === 'premiere_xml' || format === 'xml') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <project>
    <name>CineVault Shortlist</name>
    <children>
      <bin>
        <name>CineVault Archival Candidates</name>
        <children>
`;
    shortlist.forEach((clip, idx) => {
      xml += `          <clip id="clip-${idx + 1}">
            <name>${clip.title.replace(/[<&>]/g, '')}</name>
            <duration>1440</duration>
            <rate><timebase>24</timebase></rate>
            <comments>
              <mastercomment1>Source: ${clip.source_name} | LUT: ${(clip as any).lut_preset || 'Standard'}</mastercomment1>
              <mastercomment2>Aspect: ${(clip as any).aspect_ratio || '16:9'} | In: ${clip.timecode_in || '00:00:15:00'} Out: ${clip.timecode_out || '00:01:00:00'}</mastercomment2>
              <mastercomment3>Price: ${clip.price || 'N/A'} | Rights: ${clip.license_scope || 'N/A'} | PD: ${clip.pd_claim.toUpperCase()}</mastercomment3>
              <mastercomment4>URL: ${clip.source_url}</mastercomment4>
            </comments>
            <logginginfo>
              <description>${(clip.notes || '').replace(/[<&>]/g, '')}</description>
              <scene>Archival</scene>
              <shottake>${idx + 1}</shottake>
            </logginginfo>
          </clip>
`;
    });
    xml += `        </children>
      </bin>
    </children>
  </project>
</xmeml>`;
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="cinevault_premiere_bin.xml"');
    return res.send(xml);
  }

  return res.status(200).json({
    success: true,
    format: 'json',
    count: shortlist.length,
    shortlist
  });
});

export default router;
