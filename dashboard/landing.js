/**
 * Reelfind Studio — Landing & Public Navigation Controller
 * Protects Studio Workspace and Premiere Panel access with Clerk authentication
 */

// Application Auth State
const state = {
  user: null
};

// DOM Elements
const signInBtn = document.getElementById('sign-in-btn');
const userProfileWrapper = document.getElementById('user-profile-wrapper');
const userProfileBtn = document.getElementById('user-profile-btn');
const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
const userAvatarText = document.getElementById('user-avatar-text');
const userNameText = document.getElementById('user-name-text');
const dropdownUserName = document.getElementById('dropdown-user-name');
const dropdownUserEmail = document.getElementById('dropdown-user-email');
const signOutBtn = document.getElementById('sign-out-btn');
const workspaceNavBtn = document.getElementById('workspace-nav-btn');
const toastContainer = document.getElementById('toast-container');

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  attachEventListeners();
  initScrollAnimations();
  initFaqAccordion();
  initHeroSearch();
});

function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is unavailable
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const isActive = faqItem.classList.contains('active');
      
      // Close other accordion items
      document.querySelectorAll('.faq-item.active').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

function initHeroSearch() {
  const heroForm = document.getElementById('hero-search-form');
  const heroInput = document.getElementById('hero-search-input');
  if (heroForm && heroInput) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = heroInput.value.trim();
      const targetUrl = val ? `/dashboard?q=${encodeURIComponent(val)}` : '/dashboard';
      if (!isUserAuthenticated()) {
        showToast('Please sign in with Clerk to run live searches.', 'alert');
        triggerClerkSignIn(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    });
  }
}


function initAuth() {
  const saved = localStorage.getItem('reelfind_user');
  if (saved) {
    try {
      state.user = JSON.parse(saved);
    } catch {
      state.user = null;
    }
  }
  updateAuthUI();
}

function updateAuthUI() {
  if (state.user) {
    if (workspaceNavBtn) workspaceNavBtn.classList.remove('hidden');
    if (signInBtn) signInBtn.classList.add('hidden');
    if (userProfileWrapper) userProfileWrapper.classList.remove('hidden');
    if (userAvatarText) {
      if (state.user.imageUrl) {
        userAvatarText.innerHTML = `<img src="${state.user.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="${state.user.name}" />`;
        userAvatarText.style.padding = '0';
      } else {
        userAvatarText.textContent = state.user.avatar || 'PJ';
      }
    }
    if (userNameText) userNameText.textContent = state.user.name || 'Studio Member';
    if (dropdownUserName) dropdownUserName.textContent = state.user.name || 'Studio Member';
    if (dropdownUserEmail) dropdownUserEmail.textContent = state.user.email || 'user@studio.ai';
  } else {
    if (workspaceNavBtn) workspaceNavBtn.classList.add('hidden');
    if (signInBtn) signInBtn.classList.remove('hidden');
    if (userProfileWrapper) userProfileWrapper.classList.add('hidden');
  }
}

function triggerClerkSignIn(targetUrl) {
  if (window._clerk && typeof window._clerk.openSignIn === 'function') {
    window._clerk.openSignIn({
      afterSignInUrl: targetUrl || '/dashboard',
      afterSignUpUrl: targetUrl || '/dashboard'
    });
  } else {
    showToast('Initializing authentication... Please click again in a moment.', 'alert');
  }
}

function isUserAuthenticated() {
  if (window._clerk && window._clerk.user) return true;
  if (state.user && state.user.token) return true;
  const saved = localStorage.getItem('reelfind_user');
  return !!saved;
}

function attachEventListeners() {
  // Sign In Header Button
  if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerClerkSignIn('/dashboard');
    });
  }

  // Intercept all links to /dashboard or /premiere to enforce authentication
  document.querySelectorAll('a[href^="/dashboard"], a[href^="/premiere"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isUserAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        const targetHref = link.getAttribute('href') || '/dashboard';
        const label = link.textContent.trim() || 'this feature';
        showToast(`Please sign in with Clerk to access ${label}.`, 'alert');
        triggerClerkSignIn(targetHref);
      }
    });
  });

  // Profile Dropdown
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (profileDropdownMenu) profileDropdownMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', () => {
    if (profileDropdownMenu) profileDropdownMenu.classList.add('hidden');
  });

  // Sign Out
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      if (profileDropdownMenu) profileDropdownMenu.classList.add('hidden');
      if (window._clerk && typeof window._clerk.signOut === 'function') {
        await window._clerk.signOut();
      }
      state.user = null;
      localStorage.removeItem('reelfind_user');
      updateAuthUI();
      showToast('Signed out of Reelfind Studio', 'alert');
    });
  }
}

function showToast(message, type = 'success') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'alert' ? 'alert' : 'success'}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

