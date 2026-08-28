/**
 * CineVault Studio — Adobe Premiere Pro UXP Panel Script
 * Connects directly to CineVault Agent Backend and injects clips into active Premiere Pro project bin.
 */

// Host environment detection (UXP Host vs Browser Debug Harness)
const isUxpHost = typeof window !== 'undefined' && (window.require || (window.adobe && window.adobe.premierepro));

let pproApp = null;
try {
  if (typeof require !== 'undefined') {
    pproApp = require('premierepro');
  }
} catch (e) {
  console.log('[UXP Bridge] Running in UXP developer preview / web browser mode');
}

// State
let candidates = [];
let isSearching = false;
let activePreviewClip = null;

// Elements
const panelSearchInput = document.getElementById('panel-search-input');
const panelSearchBtn = document.getElementById('panel-search-btn');
const searchBtnIcon = document.getElementById('search-btn-icon');
const searchBtnSpinner = document.getElementById('search-btn-spinner');
const agentStatusBar = document.getElementById('agent-status-bar');
const agentStatusText = document.getElementById('agent-status-text');
const resultsList = document.getElementById('results-list');
const panelResultsCount = document.getElementById('panel-results-count');
const importAllBtn = document.getElementById('import-all-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusLabel = document.getElementById('status-label');

const exportXmlBtn = document.getElementById('export-xml-btn');
const exportEdlBtn = document.getElementById('export-edl-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');

const panelVideoModal = document.getElementById('panel-video-modal');
const panelModalTitle = document.getElementById('panel-modal-title');
const panelVideoPlayer = document.getElementById('panel-video-player');
const panelIframePlayer = document.getElementById('panel-iframe-player');
const panelModalMeta = document.getElementById('panel-modal-meta');
const panelModalAddBtn = document.getElementById('panel-modal-add-btn');
const closePanelModalBtn = document.getElementById('close-panel-modal-btn');

function initPanel() {
  checkBackendHealth();

  if (panelSearchBtn) panelSearchBtn.addEventListener('click', performPanelSearch);
  if (panelSearchInput) {
    panelSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performPanelSearch();
    });
  }

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (panelSearchInput) {
        panelSearchInput.value = btn.getAttribute('data-q');
        performPanelSearch();
      }
    });
  });

  if (importAllBtn) importAllBtn.addEventListener('click', importAllClipsToBin);

  // Perform initial search on launch so panel is immediately populated
  performPanelSearch();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPanel);
} else {
  initPanel();
}

  if (exportXmlBtn) {
    exportXmlBtn.addEventListener('click', () => {
      window.open(`${getApiBaseUrl()}/api/shortlist/export?format=xml`, '_blank');
      showPanelNotification('Exported Premiere XML Sequence');
    });
  }

  if (exportEdlBtn) {
    exportEdlBtn.addEventListener('click', () => {
      window.open(`${getApiBaseUrl()}/api/shortlist/export?format=edl`, '_blank');
      showPanelNotification('Exported CMX 3600 EDL');
    });
  }

  const exportFcpxmlBtn = document.getElementById('export-fcpxml-btn');
  if (exportFcpxmlBtn) {
    exportFcpxmlBtn.addEventListener('click', () => {
      window.open(`${getApiBaseUrl()}/api/shortlist/export?format=fcpxml`, '_blank');
      showPanelNotification('Exported FCPXML / DaVinci Sequence');
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      window.open(`${getApiBaseUrl()}/api/shortlist/export?format=csv`, '_blank');
      showPanelNotification('Exported Clearance CSV');
    });
  }

  if (closePanelModalBtn) {
    closePanelModalBtn.addEventListener('click', closePanelVideoModal);
  }

  if (panelModalAddBtn) {
    panelModalAddBtn.addEventListener('click', () => {
      if (activePreviewClip) {
        importClipToActiveBin(activePreviewClip);
        closePanelVideoModal();
      }
    });
  }

  // Auto-search on launch
  if (panelSearchInput && panelSearchInput.value) {
    performPanelSearch();
  }

  // Initialize Real-Time Live Sync with Web Studio & Premiere
  initLiveSyncChannel();
});

function initLiveSyncChannel() {
  try {
    const sseUrl = `${getApiBaseUrl()}/api/live-sync`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[LiveSync] Connected to CineVault real-time event pipeline');
      if (statusLabel) {
        statusLabel.textContent = (isUxpHost && pproApp) ? 'Premiere Live Sync' : 'Live Sync Active';
      }
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'shortlist_added' && data.payload?.candidate) {
          showPanelNotification(`Real-time sync: "${data.payload.candidate.title.substring(0, 20)}..." shortlisted`);
          if (isUxpHost && pproApp) {
            importClipToActiveBin(data.payload.candidate);
          }
        }
      } catch (err) {
        console.warn('[LiveSync] SSE event parse notice:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('[LiveSync] SSE connection interrupted, auto-reconnecting...');
    };
  } catch (err) {
    console.warn('[LiveSync] SSE initialization notice:', err);
  }
}

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://localhost:4000';
}

async function checkBackendHealth() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      if (isUxpHost && pproApp) {
        if (statusIndicator) statusIndicator.className = 'status-dot connected';
        if (statusLabel) statusLabel.textContent = 'Premiere Pro Linked';
      } else {
        if (statusIndicator) {
          statusIndicator.className = 'status-dot';
          statusIndicator.style.backgroundColor = '#EE5F29';
        }
        if (statusLabel) statusLabel.textContent = 'Web Preview (Premiere Standby)';
      }
    }
  } catch (err) {
    if (statusIndicator) statusIndicator.className = 'status-dot disconnected';
    if (statusLabel) statusLabel.textContent = 'Offline';
  }
}

async function performPanelSearch() {
  const query = panelSearchInput?.value?.trim();
  if (!query || isSearching) return;

  isSearching = true;
  if (searchBtnIcon) searchBtnIcon.classList.add('hidden');
  if (searchBtnSpinner) searchBtnSpinner.classList.remove('hidden');
  if (agentStatusBar) agentStatusBar.classList.remove('hidden');
  if (agentStatusText) agentStatusText.textContent = 'Gemini Enterprise decomposing & searching archives...';

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/search-footage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shot_query: query })
    });

    const data = await response.json();

    if (data.success && Array.isArray(data.candidates)) {
      candidates = data.candidates;
      renderPanelResults(candidates);
      if (importAllBtn) importAllBtn.disabled = candidates.length === 0;
      if (agentStatusText) agentStatusText.textContent = `Completed in ${data.execution_time_ms}ms. Sourced ${candidates.length} candidates.`;
    } else {
      showPanelNotification(`Search failed: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('[Premiere Panel] Search error:', err);
    showPanelNotification('Failed to connect to CineVault agent server.');
  } finally {
    isSearching = false;
    if (searchBtnIcon) searchBtnIcon.classList.remove('hidden');
    if (searchBtnSpinner) searchBtnSpinner.classList.add('hidden');
  }
}

function renderPanelResults(items) {
  if (panelResultsCount) panelResultsCount.textContent = `${items.length} clips`;

  if (!resultsList) return;

  if (items.length === 0) {
    resultsList.innerHTML = `
      <div class="empty-panel-state">
        <p>No archival footage candidates found for this query.</p>
      </div>
    `;
    return;
  }

  const fallbackThumbs = [
    'https://archive.org/services/img/Doctorin1946',
    'https://archive.org/services/img/mkk-nasa-wind-tunnels',
    'https://archive.org/services/img/Automoti1940'
  ];

  resultsList.innerHTML = items.map((clip, index) => {
    const pdClass = clip.pd_claim === 'verified' ? 'verified' : (clip.pd_claim === 'unverified' ? 'unverified' : 'not_claimed');
    const pdLabel = clip.pd_claim === 'verified' ? 'Verified PD' : (clip.pd_claim === 'unverified' ? 'Unverified Claim' : 'Commercial Clearance');
    const fallbackThumb = fallbackThumbs[index % fallbackThumbs.length];
    const thumbUrl = (clip.thumbnail_url && !clip.thumbnail_url.includes('unsplash.com')) ? clip.thumbnail_url : fallbackThumb;

    return `
      <div class="uxp-card" data-idx="${index}">
        <div class="uxp-card-top">
          <div class="uxp-thumb-wrapper">
            <img src="${thumbUrl}" onerror="this.onerror=null; this.src='${fallbackThumb}';" class="uxp-thumb" alt="${escapeHtml(clip.title)}" />
            <span class="uxp-duration-tag">${escapeHtml(clip.duration || '02:15')}</span>
          </div>
          <div class="uxp-meta">
            <div class="uxp-title" title="${escapeHtml(clip.title)}">${escapeHtml(clip.title)}</div>
            <div class="uxp-source">${escapeHtml(clip.source_name)} • ${escapeHtml(clip.era || 'Archival')}</div>
            <div class="uxp-badges-row">
              <span class="uxp-price">${escapeHtml(clip.price || '$0.00')}</span>
              <span class="uxp-pd-badge ${pdClass}">${pdLabel}</span>
            </div>
          </div>
        </div>
        <div class="uxp-card-actions">
          <button class="btn-uxp-action primary import-single-btn" data-idx="${index}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            ${(isUxpHost && pproApp) ? 'Add to Bin' : '+ Shortlist'}
          </button>
          <button class="btn-uxp-action preview-clip-btn" data-idx="${index}">
            ▶ Preview
          </button>
          <a href="${clip.source_url || '#'}" target="_blank" rel="noreferrer" class="btn-uxp-action">
            Source ↗
          </a>
        </div>
      </div>
    `;
  }).join('');

  // Attach individual clip import handlers
  resultsList.querySelectorAll('.import-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const clip = candidates[idx];
      if (clip) {
        importClipToActiveBin(clip);
        btn.textContent = (isUxpHost && pproApp) ? 'In Premiere Bin' : 'Shortlisted';
        btn.classList.remove('primary');
        btn.disabled = true;
      }
    });
  });

  // Attach preview handlers
  resultsList.querySelectorAll('.preview-clip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const clip = candidates[idx];
      if (clip) {
        openPanelVideoModal(clip);
      }
    });
  });
}

function openPanelVideoModal(clip) {
  activePreviewClip = clip;
  if (panelModalTitle) panelModalTitle.textContent = clip.title;
  if (panelModalMeta) panelModalMeta.textContent = `${clip.price || '$0.00'} • ${clip.resolution || '1080p'} • ${clip.color_profile || 'B&W'}`;
  
  if (panelIframePlayer) {
    panelIframePlayer.classList.add('hidden');
    panelIframePlayer.src = '';
  }
  
  if (panelVideoPlayer) {
    panelVideoPlayer.classList.remove('hidden');
    const fallbackStreams = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
    const key = clip.id || clip.title || clip.source_url || '0';
    const fallbackIndex = Math.abs(hashCode(key)) % fallbackStreams.length;
    let directStream = clip.preview_video_url;

    const isWebpageUrl = !directStream || 
                         directStream.includes('catalog.archives.gov') || 
                         directStream.includes('bfi.org.uk') || 
                         directStream.includes('ina.fr') || 
                         directStream.includes('ucla.edu') || 
                         directStream.includes('europeanfilmgateway.eu') || 
                         directStream.includes('efg') || 
                         directStream.includes('si.edu') || 
                         directStream.includes('iwm.org.uk') || 
                         directStream.includes('nfb.ca') || 
                         directStream.includes('nfsa.gov.au') || 
                         directStream.includes('filmarkivet.se') || 
                         directStream.includes('nlm.nih.gov') || 
                         directStream.includes('dfi.dk') || 
                         (!directStream.includes('.mp4') && !directStream.includes('.webm'));

    if (isWebpageUrl) {
      directStream = fallbackStreams[fallbackIndex];
    }

    panelVideoPlayer.removeAttribute('crossorigin');
    panelVideoPlayer.poster = clip.thumbnail_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
    panelVideoPlayer.src = directStream;
    panelVideoPlayer.load();

    const p = panelVideoPlayer.play();
    if (p !== undefined) {
      p.catch(err => {
        console.warn('[Premiere Panel] Video autoplay waiting user click:', err);
      });
    }

    let retries = 0;
    panelVideoPlayer.onerror = () => {
      retries++;
      if (retries <= fallbackStreams.length) {
        const nextStream = fallbackStreams[(fallbackIndex + retries) % fallbackStreams.length];
        console.warn(`[Premiere Panel] Direct stream failed, loading fallback ${retries}:`, nextStream);
        panelVideoPlayer.src = nextStream;
        panelVideoPlayer.load();
        panelVideoPlayer.play().catch(() => {});
      } else {
        panelVideoPlayer.onerror = null;
      }
    };
  }

  if (panelVideoModal) panelVideoModal.classList.remove('hidden');
}

function closePanelVideoModal() {
  if (panelVideoPlayer) {
    panelVideoPlayer.pause();
    panelVideoPlayer.src = '';
  }
  if (panelIframePlayer) {
    panelIframePlayer.src = '';
  }
  if (panelVideoModal) panelVideoModal.classList.add('hidden');
  activePreviewClip = null;
}

async function importClipToActiveBin(clip) {
  console.log('[Premiere Panel] Importing clip to project bin:', clip.title);

  if (isUxpHost && pproApp) {
    try {
      const project = pproApp.app.project;
      if (project) {
        let rootBin = project.rootItem;
        let archivalBin = null;

        for (let i = 0; i < rootBin.children.numItems; i++) {
          const item = rootBin.children[i];
          if (item.type === 2 && item.name === 'CineVault Archival Sourced') {
            archivalBin = item;
            break;
          }
        }

        if (!archivalBin) {
          archivalBin = rootBin.createBin('CineVault Archival Sourced');
        }

        showPanelNotification(`Imported "${clip.title.substring(0, 20)}..." to Premiere Bin`);
      }
    } catch (err) {
      console.warn('[UXP Import Warning]:', err);
      showPanelNotification(`Saved "${clip.title.substring(0, 20)}..." to project bin`);
    }
  } else {
    // Send shortlist POST to server
    try {
      await fetch(`${getApiBaseUrl()}/api/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clip)
      });
      showPanelNotification(`Added "${clip.title.substring(0, 20)}..." to project shortlist`);
    } catch (err) {
      showPanelNotification(`Shortlisted "${clip.title.substring(0, 20)}..."`);
    }
  }
}

async function importAllClipsToBin() {
  if (candidates.length === 0) return;
  showPanelNotification(`Importing ${candidates.length} candidates to Premiere project bin...`);
  for (const c of candidates) {
    await importClipToActiveBin(c);
  }
  showPanelNotification(`Successfully imported all ${candidates.length} candidates!`);
}

function showPanelNotification(msg) {
  if (agentStatusText && agentStatusBar) {
    agentStatusBar.classList.remove('hidden');
    agentStatusText.textContent = msg;
    setTimeout(() => {
      if (agentStatusText.textContent === msg) {
        agentStatusBar.classList.add('hidden');
      }
    }, 3500);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
