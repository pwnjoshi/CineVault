// CineVault Studio - Gemini Pro Vision Visual Moodboard Matcher Module
import { state, getApiUrl, showToast } from './state.js';
import { renderCandidates } from './candidates.js';

export function initMoodboardModule() {
  const dropzoneBox = document.getElementById('moodboard-dropzone-box') || document.getElementById('moodboard-dropzone-container');
  const fileInput = document.getElementById('moodboard-file-input');
  const toggleBtn = document.getElementById('toggle-moodboard-btn');
  const closeBtn = document.getElementById('close-moodboard-box-btn');
  const executeBtn = document.getElementById('execute-moodboard-search-btn');

  if (toggleBtn && dropzoneBox) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropzoneBox.classList.toggle('hidden');
      if (!dropzoneBox.classList.contains('hidden')) {
        dropzoneBox.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (closeBtn && dropzoneBox) {
    closeBtn.addEventListener('click', () => {
      dropzoneBox.classList.add('hidden');
    });
  }

  if (dropzoneBox && fileInput) {
    dropzoneBox.addEventListener('click', (e) => {
      if (e.target.closest('.preset-frame-btn') || e.target.closest('#execute-moodboard-search-btn') || e.target.closest('#close-moodboard-box-btn')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processMoodboardImage(e.target.files[0]);
      }
    });

    dropzoneBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneBox.classList.add('dragover');
    });

    dropzoneBox.addEventListener('dragleave', () => {
      dropzoneBox.classList.remove('dragover');
    });

    dropzoneBox.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneBox.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processMoodboardImage(e.dataTransfer.files[0]);
      }
    });
  }

  // Preset Storyboard Frame buttons
  document.querySelectorAll('.preset-frame-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const preset = btn.getAttribute('data-preset');
      handlePresetMoodboard(preset);
    });
  });

  if (executeBtn) {
    executeBtn.addEventListener('click', () => {
      if (fileInput && fileInput.files && fileInput.files[0]) {
        processMoodboardImage(fileInput.files[0]);
      } else {
        handlePresetMoodboard('apollo');
      }
    });
  }
}

export async function processMoodboardImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please upload a valid image file (PNG, JPG, WEBP)', 'alert');
    return;
  }

  showToast(`Analyzing visual moodboard: ${file.name}...`, 'info');
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    
    // Render immediate client-side visual thumbnail preview in drop target
    const dropTarget = document.getElementById('moodboard-drop-target');
    if (dropTarget) {
      dropTarget.innerHTML = `
        <div class="moodboard-preview-container" style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border-radius: var(--radius-sm);">
          <img src="${base64}" alt="Reference Still Preview" style="max-height: 120px; max-width: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
          <div style="font-size: 11px; color: var(--brand-primary); margin-top: 6px; font-weight: 600;">Analyzing Reference Still with Gemini Pro Vision...</div>
        </div>
      `;
    }

    try {
      const searchBtn = document.getElementById('search-btn') || document.getElementById('search-submit-btn');
      const btnText = searchBtn?.querySelector('.btn-text');
      const btnSpinner = searchBtn?.querySelector('.btn-spinner');

      if (btnText) btnText.textContent = 'Vision Matching...';
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (searchBtn) searchBtn.disabled = true;

      const res = await fetch(getApiUrl('/api/image-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64, prompt_hint: '' })
      });

      const data = await res.json();
      if (data.success && data.data) {
        state.candidates = data.data.candidates || [];
        renderCandidates();

        const footageTab = document.querySelector('[data-tab="candidates-tab"]');
        if (footageTab) footageTab.click();

        showToast(`Moodboard Matched: ${data.data.suggested_era} • ${data.data.film_stock}`, 'success');
      } else {
        showToast('Could not find matching footage for image', 'alert');
      }
    } catch (err) {
      console.error('Moodboard analysis error:', err);
      showToast('Error processing moodboard image', 'alert');
    } finally {
      const searchBtn = document.getElementById('search-btn') || document.getElementById('search-submit-btn');
      const btnText = searchBtn?.querySelector('.btn-text');
      const btnSpinner = searchBtn?.querySelector('.btn-spinner');
      if (btnText) btnText.textContent = 'Search Footage';
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (searchBtn) searchBtn.disabled = false;
    }
  };
  reader.readAsDataURL(file);
}

function handlePresetMoodboard(presetKey) {
  showToast(`Matching archival footage for frame preset: ${presetKey.toUpperCase()}...`, 'info');

  const presetQueries = {
    apollo: '1969 Apollo 11 Saturn V moon launch 70mm color NASA',
    factory: '1962 Detroit automotive stamping plant assembly line B&W',
    tokyo: '1980s Shibuya Tokyo neon streets 16mm Kodachrome'
  };

  const query = presetQueries[presetKey] || presetQueries.apollo;
  const searchInput = document.getElementById('shot-query-input');
  if (searchInput) searchInput.value = query;

  const searchBtn = document.getElementById('search-btn') || document.getElementById('search-submit-btn');
  if (searchBtn) searchBtn.click();
}
