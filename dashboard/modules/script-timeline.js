// CineVault Studio - Script-to-Timeline AI & Voiceover B-Roll Module
import { state, getApiUrl, showToast, escapeHtml } from './state.js';
import { renderCandidates, addToShortlist } from './candidates.js';
import { openVideoPlayerModal } from './player.js';

export function initScriptTimelineModule() {
  const generateBtn = document.getElementById('generate-script-timeline-btn');
  const apolloPreset = document.getElementById('sample-script-apollo');
  const factoryPreset = document.getElementById('sample-script-factory');

  if (generateBtn) {
    generateBtn.addEventListener('click', executeScriptToTimeline);
  }

  const screenplayInput = document.getElementById('screenplay-input');
  if (screenplayInput) {
    screenplayInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeScriptToTimeline();
      }
    });
  }

  if (apolloPreset) {
    apolloPreset.addEventListener('click', () => {
      const input = document.getElementById('screenplay-input');
      if (input) {
        input.value = `SCENE 1: INT. CAPE CANAVERAL LAUNCH CONTROL - 1969 - DAWN\nNASA flight controllers monitor telemetry screens as Saturn V vents LOX vapor on Pad 39A.\n\nSCENE 2: EXT. LUNAR SURFACE - 1969 - NIGHT\nApollo 11 Lunar Module Eagle touches down on Tranquility Base in crisp black and white 70mm archival footage.`;
      }
      executeScriptToTimeline();
    });
  }

  if (factoryPreset) {
    factoryPreset.addEventListener('click', () => {
      const input = document.getElementById('screenplay-input');
      if (input) {
        input.value = `SCENE 1: INT. DETROIT AUTOMOTIVE PLANT - 1962 - DAY\nMassive hydraulic stamping presses pound raw steel. Machinists install V8 engine blocks along the assembly line.\n\nSCENE 2: EXT. HIGHWAY OVERPASS - 1965 - DAY\nClassic vintage automobiles cruise along interstate highway lanes in 1960s Technicolor.`;
      }
      executeScriptToTimeline();
    });
  }

  const spotlightAudioBtn = document.getElementById('spotlight-audio-btn');
  if (spotlightAudioBtn) {
    spotlightAudioBtn.addEventListener('click', () => {
      const scriptTab = document.querySelector('.tab-btn[data-tab="script-timeline"]');
      if (scriptTab) scriptTab.click();
      const input = document.getElementById('screenplay-input');
      if (input) {
        input.value = `[AUDIO NARRATION - GOOGLE CLOUD SPEECH SYNCHRONIZER]\n"NARRATOR (V.O.): In July 1969, three astronauts rode a Saturn V rocket into history. Across the globe, half a billion people watched silent 70mm monitors as mankind took its first steps on another world."`;
      }
      executeScriptToTimeline();
    });
  }

  const spotlightLutBtn = document.getElementById('spotlight-lut-export-btn');
  if (spotlightLutBtn) {
    spotlightLutBtn.addEventListener('click', () => {
      showToast('Generating Technicolor 35mm 3D LUT (.cube)...', 'info');
      window.location.href = getApiUrl('/api/lut-generator/generate?film_stock=1960s%20Technicolor%2035mm&format=cube');
    });
  }
}

export async function executeScriptToTimeline() {
  const screenplayInput = document.getElementById('screenplay-input');
  const generateScriptTimelineBtn = document.getElementById('generate-script-timeline-btn');
  if (!screenplayInput || !screenplayInput.value.trim()) {
    showToast('Please enter or select a screenplay excerpt first', 'alert');
    return;
  }

  const scriptText = screenplayInput.value.trim();
  const btnSpan = generateScriptTimelineBtn?.querySelector('.btn-text');
  const btnSpin = generateScriptTimelineBtn?.querySelector('.btn-spinner');

  if (btnSpan) btnSpan.textContent = 'Deconstructing & Sourcing...';
  if (btnSpin) btnSpin.classList.remove('hidden');
  if (generateScriptTimelineBtn) generateScriptTimelineBtn.disabled = true;

  try {
    const res = await fetch(getApiUrl('/api/script-to-timeline'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script_text: scriptText })
    });

    const json = await res.json();
    if (json.success && json.data) {
      renderScriptScenes(json.data);
      showToast(`Assembled ${json.data.total_scenes} scenes in ${json.data.total_duration_formatted}!`, 'success');
    } else {
      showToast('Failed to deconstruct script', 'alert');
    }
  } catch (err) {
    console.error('Script-to-Timeline error:', err);
    showToast('Script processing error', 'alert');
  } finally {
    if (btnSpan) btnSpan.textContent = 'Deconstruct & Source Timeline';
    if (btnSpin) btnSpin.classList.add('hidden');
    if (generateScriptTimelineBtn) generateScriptTimelineBtn.disabled = false;
  }
}

export function renderScriptScenes(data) {
  const scriptScenesOutput = document.getElementById('script-scenes-output');
  if (!scriptScenesOutput) return;

  const scriptCandidates = [];
  if (data.scenes && Array.isArray(data.scenes)) {
    data.scenes.forEach(scene => {
      if (scene.candidates && Array.isArray(scene.candidates)) {
        scene.candidates.forEach(c => {
          if (!scriptCandidates.some(existing => existing.id === c.id)) {
            scriptCandidates.push(c);
          }
        });
      }
    });
  }

  if (scriptCandidates.length > 0) {
    state.candidates = scriptCandidates;
    renderCandidates();
  }

  let html = `
    <div style="background: rgba(238, 95, 41, 0.08); border: 1px solid rgba(238, 95, 41, 0.3); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 1.25rem;">
      <div>
        <span style="font-size: 11px; font-weight: 700; color: #EE5F29; text-transform: uppercase; letter-spacing: 0.05em;">ASSEMBLED TIMELINE SEQUENCE</span>
        <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 2px;">${escapeHtml(data.script_title)}</h4>
        <span style="font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono);">${data.total_scenes} Scenes • Total Duration: ${data.total_duration_formatted}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="action-btn primary script-export-btn" style="background-color: #EE5F29; border-color: #EE5F29; color: #fff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Premiere XML Timeline
        </button>
      </div>
    </div>

    <!-- Visual Multi-Track NLE Sequence Preview Bar -->
    <div style="background: #090b10; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; font-family: var(--font-mono);">
      <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; display: flex; justify-content: space-between;">
        <span>NLE TIMELINE TRACK MAP (V1 / V2 / A1 / A2)</span>
        <span style="color: var(--accent-cyan);">24.00 FPS • SMPTE TIMECODE</span>
      </div>
      
      <!-- Video Track 1 -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 50px; font-size: 10px; font-weight: 800; color: #EE5F29; background: rgba(238,95,41,0.15); border: 1px solid rgba(238,95,41,0.3); padding: 4px; border-radius: 4px; text-align: center;">V1</div>
        <div style="flex: 1; display: flex; gap: 6px; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
          ${data.scenes.map((s, idx) => `
            <div style="flex: ${s.duration_seconds}; background: rgba(238,95,41,0.25); border: 1px solid #EE5F29; border-radius: 3px; padding: 6px 10px; font-size: 10.5px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(s.heading)}">
              SCENE ${s.scene_number}: ${escapeHtml(s.heading)} (${s.duration_seconds}s)
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Audio Track 1 (Voiceover) -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 50px; font-size: 10px; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 4px; border-radius: 4px; text-align: center;">A1 VO</div>
        <div style="flex: 1; display: flex; gap: 6px; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
          ${data.scenes.map((s) => `
            <div style="flex: ${s.duration_seconds}; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; border-radius: 3px; padding: 6px 10px; font-size: 10px; color: #93c5fd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              🗣️ VO: "${escapeHtml(s.narration.substring(0, 30))}..."
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Audio Track 2 (Foley Ambient Room Tone) -->
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 50px; font-size: 10px; font-weight: 800; color: #34d399; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 4px; border-radius: 4px; text-align: center;">A2 SFX</div>
        <div style="flex: 1; display: flex; background: rgba(16,185,129,0.15); border: 1px solid #34d399; border-radius: 3px; padding: 6px 10px; font-size: 10px; color: #34d399;">
          🔊 Synchronized Period Optical Foley & Mechanical Room Tone (Master Bed)
        </div>
      </div>
    </div>
  `;

  data.scenes.forEach(scene => {
    html += `
      <div class="script-scene-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
        <div class="script-scene-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.6rem; margin-bottom: 0.85rem;">
          <div>
            <span style="font-size: 10px; font-weight: 700; color: var(--accent-cyan); background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); margin-right: 6px;">SCENE ${scene.scene_number}</span>
            <strong style="color: #fff; font-size: 13.5px;">${escapeHtml(scene.heading)}</strong>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-amber);">${scene.timecode_start} &rarr; ${scene.timecode_end} (${scene.duration_seconds}s)</span>
        </div>

        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; font-style: italic; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 4px; margin-bottom: 1rem;">
          "${escapeHtml(scene.narration)}"
        </p>

        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
            Matched Archival Masters (${scene.candidates?.length || 0} candidates):
          </div>
          <div class="scene-candidates-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
            ${(scene.candidates || []).map(c => {
              const thumb = c.thumbnail_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
              const fallback = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
              const pdLabel = c.pd_claim === 'verified' ? 'Verified PD' : (c.pd_claim === 'unverified' ? 'Unverified Claim' : 'Commercial Clearance');
              const pdClass = c.pd_claim === 'verified' ? 'verified' : (c.pd_claim === 'unverified' ? 'unverified' : 'not_claimed');
              return `
              <div class="clip-card" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; display: flex; flex-direction: column;">
                <div class="script-play-btn" data-id="${c.id}" style="position: relative; height: 110px; border-radius: 4px; overflow: hidden; margin-bottom: 6px; cursor: pointer; background: #000;">
                  <img src="${thumb}" onerror="this.onerror=null; this.src='${fallback}';" style="width: 100%; height: 100%; object-fit: cover;" alt="${escapeHtml(c.title)}" />
                  <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
                    <div style="width: 34px; height: 34px; border-radius: 50%; background: #EE5F29; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 10px rgba(238,95,41,0.5);">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  </div>
                  <span class="pd-pill ${pdClass}" style="position: absolute; bottom: 4px; left: 4px; font-size: 9px; padding: 1px 5px;">${pdLabel}</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</div>
                <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted); margin-top: 4px;">
                  <span>${escapeHtml(c.source_name)}</span>
                  <strong style="color: var(--accent-emerald); font-family: var(--font-mono);">${escapeHtml(c.price || '$0.00')}</strong>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                  <button type="button" class="script-play-btn action-btn" data-id="${c.id}" style="flex: 1; padding: 5px; font-size: 11px; justify-content: center;">
                    ▶ Play
                  </button>
                  <button type="button" class="script-add-bin-btn action-btn primary" data-id="${c.id}" style="flex: 1.3; padding: 5px; font-size: 11px; justify-content: center; background: rgba(238,95,41,0.18); border-color: rgba(238,95,41,0.4); color: #EE5F29;">
                    + Add to Bin
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });

  scriptScenesOutput.innerHTML = html;

  // Attach event listeners to Export button
  const exportBtn = scriptScenesOutput.querySelector('.script-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.open(getApiUrl('/api/shortlist/export?format=xml'), '_blank');
      showToast('Exported Script Sequence to Premiere Pro XML!', 'success');
    });
  }

  // Attach event listeners to Play & Add to Bin buttons
  scriptScenesOutput.querySelectorAll('.script-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const candidate = scriptCandidates.find(item => item.id === id) || state.candidates.find(item => item.id === id);
      if (candidate) {
        openVideoPlayerModal(candidate);
      }
    });
  });

  scriptScenesOutput.querySelectorAll('.script-add-bin-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const candidate = scriptCandidates.find(item => item.id === id) || state.candidates.find(item => item.id === id);
      if (candidate) {
        await addToShortlist(candidate);
        btn.textContent = 'Saved to Bin';
        btn.style.background = 'rgba(16,185,129,0.2)';
        btn.style.borderColor = 'rgba(16,185,129,0.4)';
        btn.style.color = '#34d399';
      }
    });
  });
}

window.playCandidateById = function(id) {
  const c = state.candidates.find(item => item.id === id);
  if (c) openVideoPlayerModal(c);
};

window.addScriptCandidateToBin = function(id) {
  const c = state.candidates.find(item => item.id === id);
  if (c) addToShortlist(c);
};

window.exportScriptTimelineToPremiere = function() {
  window.open(getApiUrl('/api/shortlist/export?format=xml'), '_blank');
  showToast('Exported Script Sequence to Premiere Pro XML!', 'success');
};
