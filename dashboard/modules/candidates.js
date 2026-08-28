// CineVault Studio - Candidate Grid & Clip Inspector Module
import { state, escapeHtml, formatTimecode, showToast } from './state.js';
import { openVideoPlayerModal } from './player.js';

export function renderCandidates() {
  const container = document.getElementById('candidates-grid');
  const countBadge = document.getElementById('candidates-count-badge');
  const emptyState = document.getElementById('candidates-empty');
  if (!container) return;

  if (!state.candidates || state.candidates.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.classList.add('hidden');
    if (countBadge) countBadge.textContent = '0 clips';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.classList.remove('hidden');
  if (countBadge) countBadge.textContent = `${state.candidates.length} clips`;

  container.innerHTML = state.candidates.map(c => renderClipCardHtml(c, false)).join('');
  attachClipCardListeners(container, false);
}

export function renderShortlist() {
  const container = document.getElementById('shortlist-grid');
  const emptyState = document.getElementById('shortlist-empty');
  const toolbar = document.querySelector('.shortlist-toolbar');
  if (!container) return;

  if (!state.shortlist || state.shortlist.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (toolbar) toolbar.classList.add('hidden');
    container.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (toolbar) toolbar.classList.remove('hidden');
  container.classList.remove('hidden');
  container.innerHTML = state.shortlist.map(c => renderClipCardHtml(c, true)).join('');
  attachClipCardListeners(container, true);
}

export function updateShortlistBadge() {
  const count = state.shortlist ? state.shortlist.length : 0;
  const elements = document.querySelectorAll('#shortlist-count-badge, #shortlist-total-count, .shortlist-count-badge');
  elements.forEach(b => {
    b.textContent = count;
  });
}

function getUniqueThumbnailForClip(candidate) {
  if (candidate.thumbnail_url) {
    return candidate.thumbnail_url;
  }

  const topic = (candidate.title + ' ' + (candidate.notes || '') + ' ' + (candidate.source_name || '')).toLowerCase();

  if (topic.includes('nepal') || topic.includes('mountain') || topic.includes('earthquake') || topic.includes('himalaya') || topic.includes('relief')) {
    const nepalPool = [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518002171953-a0847b77f98e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ];
    return nepalPool[Math.abs(hashCode(candidate.id || candidate.title)) % nepalPool.length];
  }

  if (topic.includes('space') || topic.includes('monsoon') || topic.includes('earth') || topic.includes('nasa') || topic.includes('apollo') || topic.includes('launch')) {
    const spacePool = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80'
    ];
    return spacePool[Math.abs(hashCode(candidate.id || candidate.title)) % spacePool.length];
  }

  if (topic.includes('factory') || topic.includes('industrial') || topic.includes('machinery') || topic.includes('labor') || topic.includes('plant') || topic.includes('detroit')) {
    const factoryPool = [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518676599626-5cd8c2d3c850?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    ];
    return factoryPool[Math.abs(hashCode(candidate.id || candidate.title)) % factoryPool.length];
  }

  const masterPool = [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
  ];

  return masterPool[Math.abs(hashCode(candidate.id || candidate.title)) % masterPool.length];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function renderClipCardHtml(candidate, isShortlist) {
  const isSaved = state.shortlist.some(s => s.id === candidate.id || s.source_url === candidate.source_url);
  const pdClass = candidate.pd_claim === 'verified' ? 'verified' : (candidate.pd_claim === 'unverified' ? 'unverified' : 'not_claimed');
  const pdLabel = candidate.pd_claim === 'verified' ? 'Verified PD' : (candidate.pd_claim === 'unverified' ? 'Unverified Claim' : 'Commercial Clearance');

  const thumbUrl = getUniqueThumbnailForClip(candidate);
  const fallbackThumb = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

  return `
    <div class="clip-card" data-id="${candidate.id}" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease;">
      <div class="card-thumb-container preview-trigger" data-id="${candidate.id}" style="position: relative; height: 160px; cursor: pointer; overflow: hidden; background: #000;">
        <img src="${thumbUrl}" onerror="this.onerror=null; this.src='${fallbackThumb}';" alt="${escapeHtml(candidate.title)}" class="card-thumb-img" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.88;" />
        <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease;" class="hover-overlay">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: #EE5F29; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(238,95,41,0.4);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        <span class="card-duration-tag" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.85); color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border-radius: 4px;">${escapeHtml(candidate.duration || '02:15')}</span>
        <span class="pd-pill ${pdClass}" style="position: absolute; bottom: 8px; left: 8px;">${pdLabel}</span>
      </div>

      <div class="card-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1;">
        <div class="card-header-row">
          <h3 class="card-title" title="${escapeHtml(candidate.title)}" style="font-size: 13px; font-weight: 700; color: #fff; line-height: 1.35;">${escapeHtml(candidate.title)}</h3>
        </div>

        <div class="card-meta-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 4px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
          <span class="meta-source" style="color: var(--text-muted);">${escapeHtml(candidate.source_name)}</span>
          <span class="meta-price" style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-emerald);">${escapeHtml(candidate.price || '$0.00')}</span>
        </div>

        <div class="card-actions-row" style="display: flex; gap: 6px; margin-top: auto;">
          <button class="card-btn preview-btn" data-id="${candidate.id}" style="flex: 1; padding: 5px; font-size: 11px;">▶ Preview</button>
          ${isShortlist ? `
            <button class="card-btn remove-shortlist-btn" data-id="${candidate.id}" style="flex: 1; padding: 5px; font-size: 11px; color: #ef4444; border-color: rgba(239,68,68,0.3);">Remove</button>
          ` : `
            <button class="card-btn ${isSaved ? 'saved' : 'primary'} add-shortlist-btn" data-id="${candidate.id}" style="flex: 1.2; padding: 5px; font-size: 11px;">
              ${isSaved ? 'Saved' : '+ Shortlist'}
            </button>
          `}
          <a href="${candidate.source_url || '#'}" target="_blank" rel="noreferrer" class="card-btn" style="padding: 5px 8px; font-size: 11px; text-decoration: none;">Source ↗</a>
        </div>
      </div>
    </div>
  `;
}

function attachClipCardListeners(container, isShortlist) {
  container.querySelectorAll('.clip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-btn') || e.target.closest('a')) return;
      const id = card.getAttribute('data-id');
      const pool = isShortlist ? state.shortlist : state.candidates;
      const candidate = pool.find(c => c.id === id);
      if (candidate) selectCandidateForInspector(candidate);
    });
  });

  container.querySelectorAll('.preview-trigger, .preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const pool = isShortlist ? state.shortlist : state.candidates;
      const candidate = pool.find(c => c.id === id);
      if (candidate) openVideoPlayerModal(candidate);
    });
  });

  container.querySelectorAll('.add-shortlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const candidate = state.candidates.find(c => c.id === id);
      if (candidate) {
        await addToShortlist(candidate);
        btn.textContent = 'Saved';
        btn.className = 'card-btn saved add-shortlist-btn';
      }
    });
  });

  container.querySelectorAll('.remove-shortlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      await removeFromShortlist(id);
    });
  });
}

export function selectCandidateForInspector(candidate) {
  state.selectedCandidate = candidate;
  const sidebar = document.getElementById('inspector-sidebar');
  const pdTag = document.getElementById('sidebar-pd-tag');
  const detailsContent = document.getElementById('sidebar-details-content');

  if (pdTag) {
    pdTag.textContent = candidate.pd_claim === 'verified' ? 'Verified PD' : (candidate.pd_claim === 'unverified' ? 'Unverified Claim' : 'Commercial Clearance');
    pdTag.className = `sidebar-status ${candidate.pd_claim === 'verified' ? 'verified' : (candidate.pd_claim === 'unverified' ? 'unverified' : '')}`;
  }

  if (detailsContent) {
    const isSaved = state.shortlist.some(s => s.id === candidate.id || s.source_url === candidate.source_url);
    const thumbUrl = getUniqueThumbnailForClip(candidate);

    detailsContent.innerHTML = `
      <div class="sidebar-meta-box">
        <div style="position: relative; height: 150px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 0.85rem; background: #000;" class="preview-trigger" data-id="${candidate.id}">
          <img src="${thumbUrl}" style="width:100%; height:100%; object-fit:cover;" alt="${escapeHtml(candidate.title)}" />
          <div style="position:absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
            <div style="width:38px; height:38px; border-radius:50%; background:#EE5F29; color:#fff; display:flex; align-items:center; justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #fff; line-height: 1.35; margin-bottom: 0.5rem;">${escapeHtml(candidate.title)}</h3>
        
        <div style="display: flex; gap: 6px; margin-bottom: 0.85rem;">
          <button type="button" class="action-btn play-modal-btn" style="flex:1;">▶ Open Cinema Viewfinder</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 0.85rem; background: var(--bg-surface); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div><span style="color:var(--text-muted);">Source:</span> <strong style="color:#fff;">${escapeHtml(candidate.source_name)}</strong></div>
          <div><span style="color:var(--text-muted);">Rate:</span> <strong style="color:var(--accent-emerald);">${escapeHtml(candidate.price || '$0.00')}</strong></div>
          <div><span style="color:var(--text-muted);">Resolution:</span> <strong style="color:#fff;">${escapeHtml(candidate.resolution || '1080p')}</strong></div>
          <div><span style="color:var(--text-muted);">Color:</span> <strong style="color:#fff;">${escapeHtml(candidate.color_profile || 'B&W')}</strong></div>
        </div>

        <div style="margin-bottom: 0.85rem;">
          <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Clearance Warranties & Provenance</span>
          <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin-top: 3px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            ${escapeHtml(candidate.notes || 'Public domain archival film master cleared for worldwide distribution.')}
          </p>
        </div>

        <div style="display: flex; gap: 6px;">
          <button type="button" class="action-btn ${isSaved ? '' : 'primary'} sidebar-shortlist-btn" style="flex:1;">
            ${isSaved ? 'Shortlisted' : '+ Add to Shortlist'}
          </button>
          <a href="${candidate.source_url || '#'}" target="_blank" rel="noreferrer" class="action-btn" style="text-decoration:none;">Source Archive ↗</a>
        </div>
      </div>
    `;

    const playBtn = detailsContent.querySelector('.play-modal-btn');
    if (playBtn) playBtn.addEventListener('click', () => openVideoPlayerModal(candidate));

    const shortlistBtn = detailsContent.querySelector('.sidebar-shortlist-btn');
    if (shortlistBtn) {
      shortlistBtn.addEventListener('click', async () => {
        await addToShortlist(candidate);
        shortlistBtn.textContent = 'Shortlisted';
        shortlistBtn.className = 'action-btn sidebar-shortlist-btn';
      });
    }
  }
}

export async function addToShortlist(candidate) {
  if (!state.shortlist.some(s => s.id === candidate.id || s.source_url === candidate.source_url)) {
    state.shortlist.push(candidate);
    updateShortlistBadge();
    renderCandidates();
    renderShortlist();

    try {
      await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      });
    } catch (err) {
      console.warn('[Shortlist API Warning]:', err);
    }

    showToast(`Added "${candidate.title.substring(0, 22)}..." to shortlist`, 'success');
  }
}

export async function removeFromShortlist(id) {
  state.shortlist = state.shortlist.filter(s => s.id !== id);
  updateShortlistBadge();
  renderCandidates();
  renderShortlist();

  try {
    await fetch(`/api/shortlist/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[Shortlist API Delete Warning]:', err);
  }

  showToast('Removed item from shortlist', 'info');
}

export function getSampleCandidates() {
  return [
    {
      id: 'clip_nara_174_factory',
      title: 'NARA Record Group 174: Industrial Production & Labor Footage (1960s Factory Assembly Line)',
      source_url: 'https://catalog.archives.gov/id/1154823',
      source_name: 'National Archives and Records Administration (NARA)',
      provenance: 'US National Archives (NARA RG 174.2)',
      price: '$0.00 (US Gov Public Record)',
      price_numeric: 0,
      license_scope: 'Public Domain (US Federal Agency Production)',
      pd_claim: 'verified',
      resolution: '4K ProRes 422HQ (35mm Archival Scan)',
      color_profile: 'Monochrome (B&W)',
      era: '1960s',
      duration: '05:18',
      timecode_in: '00:00:22:15',
      timecode_out: '00:01:10:00',
      thumbnail_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      preview_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      notes: 'Verified institutional repository (catalog.archives.gov). Historical records confirmed public domain under statutory 17 U.S.C. § 105.'
    },
    {
      id: 'clip_ucla_hearst_1964',
      title: 'UCLA Hearst Metrotone Newsreel: American Manufacturing & Heavy Industry (1964)',
      source_url: 'https://www.cinema.ucla.edu/collections/hearst',
      source_name: 'UCLA Film & Television Archive',
      provenance: 'Hearst Metrotone News Collection (Preservation Master)',
      price: '$45.00 / second (Academic/Doc License)',
      price_numeric: 45,
      license_scope: 'Editorial Documentary Worldwide Rights',
      pd_claim: 'not_claimed',
      resolution: '2K DPX Master (35mm Nitrate Preservation)',
      color_profile: 'Nitrate 35mm B&W',
      era: '1960s',
      duration: '03:42',
      timecode_in: '00:00:10:00',
      timecode_out: '00:00:45:00',
      thumbnail_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      preview_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      notes: 'UCLA Archive preservation scan with clear metadata and verified provenance.'
    },
    {
      id: 'clip_bfi_industrial_1960',
      title: 'BFI National Archive: 20th Century Industrial & Newsreel Collection (Steel Stamping)',
      source_url: 'https://collections-search.bfi.org.uk/web/Details/ChoiceArchive/150000000',
      source_name: 'British Film Institute (BFI Archive)',
      provenance: 'BFI National Film and Television Archive (London)',
      price: '$65.00 / clip (Broadcast & Web License)',
      price_numeric: 65,
      license_scope: 'Non-Exclusive Theatrical & Streaming',
      pd_claim: 'not_claimed',
      resolution: '1080p ProRes 422 (16mm Safety Negative)',
      color_profile: 'Silver Halide 35mm B&W',
      era: '1960s',
      duration: '04:12',
      timecode_in: '00:01:05:00',
      timecode_out: '00:01:40:00',
      thumbnail_url: 'https://images.unsplash.com/photo-1518676599626-5cd8c2d3c850?auto=format&fit=crop&w=800&q=80',
      preview_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      notes: 'BFI archival master with complete rights documentation.'
    }
  ];
}
