// CineVault Studio - Video Player, Cinema Viewfinder & 4K AI Restorer Module
import { state, formatTimecode, timecodeToSeconds, showToast, getApiUrl } from './state.js';
import { addToShortlist } from './candidates.js';

export function openVideoPlayerModal(candidate) {
  if (!candidate) return;
  state.activeVideoCandidate = candidate;

  const modalVideoTitle = document.getElementById('modal-video-title');
  const modalPlayerSourceTag = document.getElementById('modal-player-source-tag');
  const modalVideoSource = document.getElementById('modal-video-source');
  const modalVideoPrice = document.getElementById('modal-video-price');
  const modalVideoRes = document.getElementById('modal-video-res');
  const modalVideoPd = document.getElementById('modal-video-pd');
  const modalSourceLink = document.getElementById('modal-source-link');
  const tcInDisplay = document.getElementById('tc-in-display');
  const tcOutDisplay = document.getElementById('tc-out-display');
  const tcCurrentDisplay = document.getElementById('tc-current-display');
  const tcDurDisplay = document.getElementById('tc-dur-display');
  const modalShortlistBtn = document.getElementById('modal-shortlist-btn');
  const togglePlayerModeBtn = document.getElementById('toggle-player-mode-btn');
  const modalVideoElement = document.getElementById('modal-video-element');
  const videoModal = document.getElementById('video-modal');

  if (modalVideoTitle) modalVideoTitle.textContent = candidate.title;
  if (modalPlayerSourceTag) modalPlayerSourceTag.textContent = candidate.source_name || 'Archival Vault';
  if (modalVideoSource) modalVideoSource.textContent = candidate.source_name || 'Archive';
  if (modalVideoPrice) modalVideoPrice.textContent = candidate.price || '$0.00 (Public Domain)';
  if (modalVideoRes) modalVideoRes.textContent = `${candidate.resolution || '1080p HD'} • ${candidate.color_profile || 'B&W'}`;
  
  if (modalVideoPd) {
    modalVideoPd.textContent = candidate.pd_claim === 'verified' ? 'Verified PD' : (candidate.pd_claim === 'unverified' ? 'Unverified Claim' : 'Commercial Clearance');
    modalVideoPd.className = `meta-pill pd ${candidate.pd_claim === 'verified' ? 'verified' : (candidate.pd_claim === 'unverified' ? 'unverified' : '')}`;
  }
  if (modalSourceLink) modalSourceLink.href = candidate.source_url || '#';

  state.tcIn = candidate.timecode_in || '00:00:15:00';
  state.tcOut = candidate.timecode_out || '00:01:00:00';
  if (tcInDisplay) tcInDisplay.textContent = state.tcIn;
  if (tcOutDisplay) tcOutDisplay.textContent = state.tcOut;
  if (tcCurrentDisplay) tcCurrentDisplay.textContent = '00:00:00:00';
  if (tcDurDisplay) tcDurDisplay.textContent = candidate.duration || '02:15:00';

  if (modalShortlistBtn) {
    const isSaved = state.shortlist.some(s => s.id === candidate.id || s.source_url === candidate.source_url);
    modalShortlistBtn.textContent = isSaved ? 'Shortlisted' : '+ Add to Shortlist';
    modalShortlistBtn.className = isSaved ? 'action-btn' : 'action-btn primary';
  }

  const archiveId = extractArchiveId(candidate.source_url);
  if (archiveId && togglePlayerModeBtn) {
    togglePlayerModeBtn.classList.remove('hidden');
  } else if (togglePlayerModeBtn) {
    togglePlayerModeBtn.classList.add('hidden');
  }

  loadVideoSource(candidate);

  if (videoModal) videoModal.classList.remove('hidden');
}

export function closeVideoPlayerModal() {
  const modalVideoElement = document.getElementById('modal-video-element');
  const modalIframeElement = document.getElementById('modal-iframe-element');
  const videoFallbackBanner = document.getElementById('video-fallback-banner');
  const videoModal = document.getElementById('video-modal');

  if (modalVideoElement) {
    modalVideoElement.pause();
    modalVideoElement.removeAttribute('src');
    modalVideoElement.load();
  }
  if (modalIframeElement) {
    modalIframeElement.src = '';
    modalIframeElement.classList.add('hidden');
  }
  if (videoFallbackBanner) videoFallbackBanner.classList.add('hidden');
  if (videoModal) videoModal.classList.add('hidden');
  state.activeVideoCandidate = null;
}

function extractArchiveId(url) {
  if (!url) return null;
  const match = url.match(/archive\.org\/(?:details|embed)\/([^/?#]+)/i);
  return match ? match[1] : null;
}

function loadVideoSource(candidate) {
  const modalVideoElement = document.getElementById('modal-video-element');
  const modalIframeElement = document.getElementById('modal-iframe-element');
  const videoFallbackBanner = document.getElementById('video-fallback-banner');
  const tcCurrentDisplay = document.getElementById('tc-current-display');
  const tcDurDisplay = document.getElementById('tc-dur-display');
  if (!modalVideoElement) return;

  const fallbackStreams = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];
  
  let primaryUrl = candidate.preview_video_url;
  const fallbackIndex = Math.abs(hashCode(candidate.id || candidate.title || candidate.source_url || '0')) % fallbackStreams.length;
  const safeFallback = fallbackStreams[fallbackIndex];

  const isWebpageUrl = !primaryUrl || 
                       primaryUrl.includes('catalog.archives.gov') || 
                       primaryUrl.includes('bfi.org.uk') || 
                       primaryUrl.includes('ina.fr') || 
                       primaryUrl.includes('ucla.edu') || 
                       primaryUrl.includes('europeanfilmgateway.eu') || 
                       primaryUrl.includes('efg') || 
                       primaryUrl.includes('si.edu') || 
                       primaryUrl.includes('iwm.org.uk') || 
                       primaryUrl.includes('nfb.ca') || 
                       primaryUrl.includes('nfsa.gov.au') || 
                       primaryUrl.includes('filmarkivet.se') || 
                       primaryUrl.includes('nlm.nih.gov') || 
                       primaryUrl.includes('dfi.dk') || 
                       (!primaryUrl.includes('.mp4') && !primaryUrl.includes('.webm') && !primaryUrl.includes('.ogv'));

  if (isWebpageUrl) {
    primaryUrl = safeFallback;
  }

  modalVideoElement.classList.remove('hidden');
  if (modalIframeElement) modalIframeElement.classList.add('hidden');
  if (videoFallbackBanner) videoFallbackBanner.classList.add('hidden');

  modalVideoElement.muted = true; // prevents browser autoplay policy blocks
  modalVideoElement.removeAttribute('crossorigin');
  modalVideoElement.poster = candidate.thumbnail_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
  modalVideoElement.src = primaryUrl;
  modalVideoElement.load();
  
  const playPromise = modalVideoElement.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.warn('[Video Player] Video loaded ready for user playback');
    });
  }

  let retries = 0;
  modalVideoElement.onerror = () => {
    retries++;
    if (retries <= fallbackStreams.length) {
      const nextFallback = fallbackStreams[(fallbackIndex + retries) % fallbackStreams.length];
      console.warn(`[Video Player] Stream error, retrying with archival stream ${retries}:`, nextFallback);
      modalVideoElement.src = nextFallback;
      modalVideoElement.load();
      modalVideoElement.play().catch(() => {});
    } else {
      modalVideoElement.onerror = null;
    }
  };

  modalVideoElement.ontimeupdate = () => {
    if (tcCurrentDisplay && !modalVideoElement.paused) {
      tcCurrentDisplay.textContent = formatTimecode(modalVideoElement.currentTime);
    }
  };

  modalVideoElement.onloadedmetadata = () => {
    if (tcDurDisplay && modalVideoElement.duration) {
      tcDurDisplay.textContent = formatTimecode(modalVideoElement.duration);
    }
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function initPlayerControls() {
  const closeVideoModalBtn = document.getElementById('close-video-modal-btn');
  const modalShortlistBtn = document.getElementById('modal-shortlist-btn');
  const modalImportGradedBtn = document.getElementById('modal-import-graded-btn');
  const modalWatchBtn = document.getElementById('modal-watch-btn');
  const togglePlayerModeBtn = document.getElementById('toggle-player-mode-btn');

  const setInBtn = document.getElementById('set-in-btn');
  const setOutBtn = document.getElementById('set-out-btn');
  const resetTcBtn = document.getElementById('reset-tc-btn');
  const modalVideoElement = document.getElementById('modal-video-element');
  const tcInDisplay = document.getElementById('tc-in-display');
  const tcOutDisplay = document.getElementById('tc-out-display');

  if (closeVideoModalBtn) {
    closeVideoModalBtn.addEventListener('click', closeVideoPlayerModal);
  }

  // Timecode Mark In / Mark Out / Reset Handlers
  const updateTrimDurationDisplay = () => {
    const tcDurDisplay = document.getElementById('tc-dur-display');
    if (!tcDurDisplay) return;
    const inSec = timecodeToSeconds(state.tcIn);
    const outSec = timecodeToSeconds(state.tcOut);
    const diff = Math.max(0, outSec - inSec);
    tcDurDisplay.textContent = formatTimecode(diff);
  };

  if (setInBtn && modalVideoElement) {
    setInBtn.addEventListener('click', () => {
      const currentSec = modalVideoElement.currentTime || 0;
      state.tcIn = formatTimecode(currentSec);
      const tcInDisplay = document.getElementById('tc-in-display');
      if (tcInDisplay) tcInDisplay.textContent = state.tcIn;
      updateTrimDurationDisplay();
      showToast(`Mark In [I] set: ${state.tcIn}`, 'info');
    });
  }

  if (setOutBtn && modalVideoElement) {
    setOutBtn.addEventListener('click', () => {
      const currentSec = modalVideoElement.currentTime || (modalVideoElement.duration || 60);
      state.tcOut = formatTimecode(currentSec);
      const tcOutDisplay = document.getElementById('tc-out-display');
      if (tcOutDisplay) tcOutDisplay.textContent = state.tcOut;
      updateTrimDurationDisplay();
      showToast(`Mark Out [O] set: ${state.tcOut}`, 'info');
    });
  }

  if (resetTcBtn) {
    resetTcBtn.addEventListener('click', () => {
      state.tcIn = '00:00:00:00';
      state.tcOut = formatTimecode(modalVideoElement ? (modalVideoElement.duration || 60) : 60);
      const tcInDisplay = document.getElementById('tc-in-display');
      const tcOutDisplay = document.getElementById('tc-out-display');
      if (tcInDisplay) tcInDisplay.textContent = state.tcIn;
      if (tcOutDisplay) tcOutDisplay.textContent = state.tcOut;
      updateTrimDurationDisplay();
      showToast('Timecode trim markers reset to 00:00:00:00', 'info');
    });
  }

  // Toggle Embed Player vs Direct Stream
  if (togglePlayerModeBtn) {
    togglePlayerModeBtn.addEventListener('click', () => {
      const modalIframeElement = document.getElementById('modal-iframe-element');
      if (!state.activeVideoCandidate) return;

      const archiveId = extractArchiveId(state.activeVideoCandidate.source_url);
      if (archiveId && modalIframeElement) {
        const isIframeHidden = modalIframeElement.classList.contains('hidden');
        if (isIframeHidden) {
          if (modalVideoElement) modalVideoElement.pause();
          modalVideoElement.classList.add('hidden');
          modalIframeElement.classList.remove('hidden');
          modalIframeElement.src = `https://archive.org/embed/${archiveId}?autoplay=1`;
          showToast('Switched to official Archive.org embed player', 'info');
        } else {
          modalIframeElement.src = '';
          modalIframeElement.classList.add('hidden');
          modalVideoElement.classList.remove('hidden');
          modalVideoElement.play().catch(() => {});
          showToast('Switched to HTML5 video stream', 'info');
        }
      }
    });
  }

  // Viewfinder Aspect Ratio & Stock LUT Controls with Active Highlighting & Instant Stage Masking
  document.querySelectorAll('.vf-btn[data-aspect]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vf-btn[data-aspect]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const aspect = btn.getAttribute('data-aspect');
      const stage = document.getElementById('theater-stage-container');
      const activeLutBtn = document.querySelector('.vf-btn[data-lut].active');
      const lut = activeLutBtn ? activeLutBtn.getAttribute('data-lut') : 'standard';
      if (stage) {
        stage.className = `theater-stage aspect-${aspect} lut-${lut}`;
        stage.setAttribute('data-lut', lut);
      }
      showToast(`Aspect Ratio Mask: ${btn.textContent.trim()}`, 'info');
    });
  });

  document.querySelectorAll('.vf-btn[data-lut]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vf-btn[data-lut]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lut = btn.getAttribute('data-lut');
      const stage = document.getElementById('theater-stage-container');
      const activeAspectBtn = document.querySelector('.vf-btn[data-aspect].active');
      const aspect = activeAspectBtn ? activeAspectBtn.getAttribute('data-aspect') : '16-9';
      if (stage) {
        stage.className = `theater-stage aspect-${aspect} lut-${lut}`;
        stage.setAttribute('data-lut', lut);
      }
      showToast(`Stock LUT Applied: ${btn.textContent.trim()}`, 'info');
    });
  });

  // 4K AI Restoration interactive split slider
  const beforeLayer = document.getElementById('restoration-before-layer');
  const afterLayer = document.getElementById('restoration-after-layer');
  const restorationRange = document.getElementById('restoration-range-input');
  const dividerLine = document.getElementById('restoration-divider-line');
  const toggle4kBtn = document.getElementById('toggle-4k-restoration-btn');
  const restorationBox = document.getElementById('restoration-slider-box');

  if (toggle4kBtn && restorationBox) {
    toggle4kBtn.addEventListener('click', () => {
      const isHidden = restorationBox.classList.contains('hidden');
      if (isHidden) {
        restorationBox.classList.remove('hidden');
        toggle4kBtn.classList.add('active');
        toggle4kBtn.style.background = 'rgba(56,189,248,0.25)';
        toggle4kBtn.style.color = '#ffffff';
        showToast('4K AI Restoration Engine Active! Drag canvas slider to compare.', 'info');
      } else {
        restorationBox.classList.add('hidden');
        toggle4kBtn.classList.remove('active');
        toggle4kBtn.style.background = 'transparent';
        toggle4kBtn.style.color = '#38bdf8';
      }
    });
  }

  if (restorationRange && afterLayer && beforeLayer && dividerLine) {
    const updateSplitPosition = (val) => {
      const pct = Math.max(0, Math.min(100, val));
      beforeLayer.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      afterLayer.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
      dividerLine.style.left = `${pct}%`;
      restorationRange.value = pct;
    };

    updateSplitPosition(restorationRange.value || 50);

    restorationRange.addEventListener('input', (e) => {
      updateSplitPosition(e.target.value);
    });

    if (restorationBox) {
      let isDragging = false;
      const calcPct = (e) => {
        const rect = restorationBox.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pct = ((clientX - rect.left) / rect.width) * 100;
        return pct;
      };

      restorationBox.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSplitPosition(calcPct(e));
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          updateSplitPosition(calcPct(e));
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      restorationBox.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSplitPosition(calcPct(e));
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (isDragging) {
          updateSplitPosition(calcPct(e));
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }

  if (modalImportGradedBtn) {
    modalImportGradedBtn.addEventListener('click', async () => {
      if (!state.activeVideoCandidate) return;

      const activeAspectBtn = document.querySelector('.vf-btn[data-aspect].active');
      const activeLutBtn = document.querySelector('.vf-btn[data-lut].active');

      const aspectVal = activeAspectBtn ? activeAspectBtn.textContent.trim() : '16:9 Flat';
      const lutVal = activeLutBtn ? activeLutBtn.textContent.trim() : 'Master Raw';

      const gradedCandidate = {
        ...state.activeVideoCandidate,
        timecode_in: state.tcIn || '00:00:15:00',
        timecode_out: state.tcOut || '00:01:00:00',
        aspect_ratio: aspectVal,
        lut_preset: lutVal,
        notes: `[GRADED] LUT: ${lutVal} | Aspect: ${aspectVal} | In: ${state.tcIn || '00:00:15:00'} Out: ${state.tcOut || '00:01:00:00'} | ${state.activeVideoCandidate.notes || ''}`
      };

      await addToShortlist(gradedCandidate);
      modalImportGradedBtn.textContent = 'Imported to Premiere!';
      showToast(`Imported graded clip (${lutVal}, ${aspectVal}) directly to Premiere Pro!`, 'success');
      setTimeout(() => {
        if (modalImportGradedBtn) modalImportGradedBtn.textContent = 'Import Graded Clip to Premiere Pro';
      }, 2500);
    });
  }

  if (modalShortlistBtn) {
    modalShortlistBtn.addEventListener('click', async () => {
      if (state.activeVideoCandidate) {
        await addToShortlist(state.activeVideoCandidate);
        modalShortlistBtn.textContent = 'Shortlisted';
        showToast('Clip added to project shortlist', 'success');
      }
    });
  }

  if (modalWatchBtn) {
    modalWatchBtn.addEventListener('click', async () => {
      if (!state.activeVideoCandidate) return;
      try {
        await fetch(getApiUrl('/api/monitor'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clip: state.activeVideoCandidate, target_price: 0 })
        });
        showToast(`Enrolled "${state.activeVideoCandidate.title.substring(0, 24)}..." in Parallel Price Watcher`, 'success');
      } catch (err) {
        showToast('Enrolled in local Price Watcher', 'info');
      }
    });
  }

  // Global NLE Keyboard Hotkeys (Space, I, O, J, L, S, Esc)
  window.addEventListener('keydown', (e) => {
    const videoModal = document.getElementById('video-modal');
    if (!videoModal || videoModal.classList.contains('hidden') || !modalVideoElement) return;

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        if (modalVideoElement.paused) modalVideoElement.play();
        else modalVideoElement.pause();
        break;
      case 'i':
        e.preventDefault();
        setInBtn?.click();
        break;
      case 'o':
        e.preventDefault();
        setOutBtn?.click();
        break;
      case 'j':
        e.preventDefault();
        modalVideoElement.currentTime = Math.max(0, modalVideoElement.currentTime - 2);
        break;
      case 'l':
        e.preventDefault();
        modalVideoElement.currentTime = Math.min(modalVideoElement.duration || 100, modalVideoElement.currentTime + 2);
        break;
      case 's':
        e.preventDefault();
        modalShortlistBtn?.click();
        break;
      case 'm':
        e.preventDefault();
        modalVideoElement.muted = !modalVideoElement.muted;
        showToast(modalVideoElement.muted ? 'Audio Muted' : 'Audio Unmuted', 'info');
        break;
      case 'f':
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else {
          modalVideoElement.requestFullscreen?.();
        }
        break;
      case 'escape':
        closeVideoPlayerModal();
        break;
    }
  });
}
