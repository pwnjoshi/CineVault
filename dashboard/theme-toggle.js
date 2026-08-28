/**
 * theme-toggle.js — CineVault Studio Light / Dark Mode Controller
 * Persists theme preference across page reloads and synchronizes icon states.
 */

(function initTheme() {
  const THEME_KEY = 'reelfind_theme';
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';

  // Apply theme to documentElement immediately (always safe in <head>)
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.classList.remove('light-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    if (document.body) {
      document.body.classList.toggle('light-theme', isLight);
    }
    document.documentElement.classList.toggle('light-theme', isLight);
    document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');

    // Update all toggle buttons on page
    document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn').forEach(btn => {
      updateButtonUI(btn, isLight ? 'light' : 'dark');
    });
  }

  function updateButtonUI(btn, theme) {
    if (!btn) return;
    if (theme === 'light') {
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        <span>Dark</span>
      `;
      btn.setAttribute('title', 'Switch to Dark Studio Mode');
    } else {
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <span>Light</span>
      `;
      btn.setAttribute('title', 'Switch to Light Studio Mode');
    }
  }

  // Setup DOM elements when ready
  const onReady = () => {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn').forEach(btn => {
      updateButtonUI(btn, currentTheme);
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isCurrentlyLight = document.documentElement.classList.contains('light-theme') || (document.body && document.body.classList.contains('light-theme'));
        const nextTheme = isCurrentlyLight ? 'dark' : 'light';
        applyTheme(nextTheme);
      };
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Expose globally
  window.toggleReelfindTheme = () => {
    const isCurrentlyLight = document.documentElement.classList.contains('light-theme');
    applyTheme(isCurrentlyLight ? 'dark' : 'light');
  };
})();

