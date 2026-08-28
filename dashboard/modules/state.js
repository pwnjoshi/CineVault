// CineVault Studio - Central State & Core Helper Utilities

export const state = {
  candidates: [],
  shortlist: [],
  activeVideoCandidate: null,
  latestTrace: null,
  filters: {
    era: 'all',
    rights: 'all',
    color: 'all',
    resolution: 'all'
  },
  tcIn: '00:00:15:00',
  tcOut: '00:01:00:00',
  currentQuery: '',
  user: null,
  isLoading: false
};

export function getApiUrl(endpoint) {
  if (!endpoint) return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
    const origin = window.location.origin;
    return `${origin}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }
  return `http://localhost:4000${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatTimecode(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00:00:00';
  const secNum = Math.max(0, Number(seconds));
  const hrs = Math.floor(secNum / 3600);
  const mins = Math.floor((secNum % 3600) / 60);
  const secs = Math.floor(secNum % 60);
  const frames = Math.floor((secNum % 1) * 24);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

export function timecodeToSeconds(tc) {
  if (!tc || typeof tc !== 'string') return 0;
  const parts = tc.split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 4) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / 24;
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}
