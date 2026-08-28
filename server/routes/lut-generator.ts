// CineVault Studio - Automated Telecine Color Grade & 3D LUT Generator (.cube)
import { Router, Request, Response } from 'express';

const router = Router();

interface LUTRequest {
  film_stock?: string;
  clip_id?: string;
  format?: 'cube' | 'json';
}

router.all('/generate', (req: Request, res: Response) => {
  const filmStock = (req.query.film_stock as string) || req.body?.film_stock || '1960s Technicolor 35mm';
  const format = (req.query.format as string) || req.body?.format || 'json';

  const stockProfiles: Record<string, { title: string; gamma: string; contrast: number; saturation: number; color_temp: string; grain: string }> = {
    '1960s Technicolor 35mm': { title: 'CineVault Technicolor 3-Strip 1965', gamma: '2.2 Film', contrast: 1.15, saturation: 1.25, color_temp: '5600K Warm Daylight', grain: 'Medium Silver Grain' },
    '1970s Kodachrome 64': { title: 'CineVault Kodachrome 64 Archival', gamma: '2.4 Broadcast', contrast: 1.20, saturation: 1.35, color_temp: '5200K Vintage Gold', grain: 'Fine Micro Grain' },
    '1930s B&W Silver Halide': { title: 'CineVault Monochrome Silver Halide 1935', gamma: '2.6 High Contrast Monochrome', contrast: 1.40, saturation: 0.00, color_temp: '6500K Neutral Black & White', grain: 'Heavy 35mm Nitrate Grain' },
    '1980s VHS Telecine': { title: 'CineVault Analog VHS Master 1984', gamma: '2.0 NTSC', contrast: 1.05, saturation: 0.90, color_temp: '6000K Analog Scan', grain: 'Video Tape Signal Noise' }
  };

  const profile = stockProfiles[filmStock] || stockProfiles['1960s Technicolor 35mm'];

  if (format === 'cube') {
    // Generate valid 3D CUBE Look-Up Table header & identity lattice with profile bias
    let cube = `# CineVault Studio Automated Telecine Color Grade 3D LUT\n`;
    cube += `# Profile: ${profile.title}\n`;
    cube += `# Stock: ${filmStock}\n`;
    cube += `TITLE "${profile.title}"\n`;
    cube += `LUT_3D_SIZE 4\n\n`;

    // 4x4x4 3D LUT Lattice
    for (let r = 0; r < 4; r++) {
      for (let g = 0; g < 4; g++) {
        for (let b = 0; b < 4; b++) {
          const rOut = Math.min(1.0, (r / 3.0) * profile.contrast * (profile.saturation > 0 ? 1.05 : 0.9)).toFixed(6);
          const gOut = Math.min(1.0, (g / 3.0) * profile.contrast).toFixed(6);
          const bOut = Math.min(1.0, (b / 3.0) * profile.contrast * (profile.saturation > 0 ? 0.95 : 0.9)).toFixed(6);
          cube += `${rOut} ${gOut} ${bOut}\n`;
        }
      }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="cinevault_${filmStock.toLowerCase().replace(/[^a-z0-9]/g, '_')}.cube"`);
    return res.send(cube);
  }

  return res.json({
    success: true,
    data: {
      film_stock: filmStock,
      profile,
      download_urls: {
        cube_lut: `/api/lut-generator/generate?film_stock=${encodeURIComponent(filmStock)}&format=cube`
      },
      nle_compatibility: ['Adobe Premiere Pro (Lumetri Color)', 'DaVinci Resolve', 'Final Cut Pro X', 'Avid Media Composer']
    }
  });
});

export default router;
