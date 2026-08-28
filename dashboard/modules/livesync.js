// CineVault Studio - Server-Sent Events (SSE) Live Sync Module
import { state, getApiUrl, showToast } from './state.js';
import { updateShortlistBadge, renderShortlist } from './candidates.js';

export function initDashboardLiveSync() {
  try {
    const sseUrl = getApiUrl('/api/live-sync');
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[LiveSync] Web Studio connected to CineVault real-time event pipeline');
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'shortlist_added' && data.payload?.candidate) {
          const exists = state.shortlist.some(s => s.id === data.payload.candidate.id);
          if (!exists) {
            state.shortlist.push(data.payload.candidate);
            updateShortlistBadge();
            renderShortlist();
            showToast(`Real-time Sync: "${data.payload.candidate.title.substring(0, 24)}..." added to project`, 'info');
          }
        } else if (data.type === 'shortlist_removed' && data.payload?.removed_id) {
          state.shortlist = state.shortlist.filter(s => s.id !== data.payload.removed_id);
          updateShortlistBadge();
          renderShortlist();
        }
      } catch (err) {
        console.warn('[LiveSync] SSE event parse notice:', err);
      }
    };
  } catch (err) {
    console.warn('[LiveSync] Web SSE initialization notice:', err);
  }
}
