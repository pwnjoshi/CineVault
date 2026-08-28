/**
 * clerk-auth.js — CineVault Studio Clerk Authentication Controller
 *
 * Single responsibility:
 *  1. Load the Clerk JS SDK
 *  2. Expose window._clerk so app.js can call openSignIn() / signOut()
 *  3. On successful sign-in, sync user data into the CineVault Studio UI
 *  4. On sign-out, clear state and reset the header to "Sign In"
 */

(async function initClerkAuth() {
  // ─── Config ──────────────────────────────────────────────────────────────
  let publishableKey = '';
  try {
    const res = await fetch('/api/auth/config');
    const data = await res.json();
    publishableKey = data.clerkPublishableKey || '';
  } catch {
    // server couldn't provide key — fall back to project dev key
  }

  if (!publishableKey) {
    publishableKey = 'pk_test_ZmFpci10dXJrZXktNTAyNy5jbGVyay5hY2NvdW50cy5kZXYk';
  }

  // ─── Load Clerk SDK ───────────────────────────────────────────────────────
  function loadClerkScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.setAttribute('data-clerk-publishable-key', publishableKey);
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let clerk = null;

  try {
    if (!window.Clerk) {
      try {
        await loadClerkScript('https://fair-turkey-5027.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js');
      } catch {
        await loadClerkScript('https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js');
      }
    }

    if (window.Clerk) {
      clerk = typeof window.Clerk === 'function' ? new window.Clerk(publishableKey) : window.Clerk;

      await clerk.load({
        appearance: {
          variables: {
            colorBackground: '#171922',
            colorText: '#f8fafc',
            colorTextSecondary: '#94a3b8',
            colorPrimary: '#6c47ff',
            colorInputBackground: '#0f1117',
            colorInputText: '#f8fafc',
            borderRadius: '6px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          elements: {
            socialButtonsBlockButton: {
              backgroundColor: '#222634 !important',
              border: '1px solid #3b4259 !important',
              color: '#ffffff !important',
              '&:hover': {
                backgroundColor: '#2d3345 !important',
                borderColor: '#60a5fa !important'
              }
            },
            socialButtonsBlockButtonText: {
              color: '#ffffff !important',
              fontWeight: '600 !important',
              fontSize: '13.5px !important'
            },
            socialButtonsBlockButton__google: {
              backgroundColor: '#222634 !important',
              border: '1px solid #3b4259 !important',
              color: '#ffffff !important'
            },
            socialButtonsBlockButtonText__google: {
              color: '#ffffff !important'
            },
            socialButtonsIconButton: {
              backgroundColor: '#222634 !important',
              borderColor: '#3b4259 !important',
              color: '#ffffff !important'
            },
            formFieldLabel: {
              color: '#cbd5e1 !important'
            },
            formFieldInput: {
              backgroundColor: '#0f1117 !important',
              borderColor: '#2d3345 !important',
              color: '#ffffff !important'
            },
            dividerText: {
              color: '#94a3b8 !important'
            },
            dividerLine: {
              backgroundColor: '#2d3345 !important'
            },
            footerActionText: {
              color: '#94a3b8 !important'
            },
            footerActionLink: {
              color: '#a78bfa !important'
            }
          }
        }
      });

      // Expose globally so app.js signInBtn and signOutBtn can call it
      window._clerk = clerk;

      let lastWelcomedUserId = sessionStorage.getItem('cinevault_welcomed_user');

      // If already signed in via Clerk session
      if (clerk.user) {
        applyClerkUserToUI(clerk);
      } else {
        // Restore local user session if present
        const savedUserStr = localStorage.getItem('cinevault_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            restoreLocalUserToUI(savedUser);
          } catch {}
        }
      }

      // React to explicit Clerk auth state changes
      clerk.addListener(({ user }) => {
        if (user) {
          applyClerkUserToUI(clerk);
        }
      });
    }
  } catch (err) {
    console.warn('[Clerk] Init warning:', err);
    // Restore local user session if Clerk fails or is blocked
    const savedUserStr = localStorage.getItem('cinevault_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        restoreLocalUserToUI(savedUser);
      } catch {}
    }
  }

  // ─── Apply Clerk user to CineVault UI ─────────────────────────────────────
  function applyClerkUserToUI(clerkInstance) {
    const u = clerkInstance.user;
    if (!u) return;

    const name = u.fullName ||
      `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
      u.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      'Studio Member';

    const email = u.primaryEmailAddress?.emailAddress ||
      u.emailAddresses?.[0]?.emailAddress || 'user@studio.ai';

    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'CV';

    const userObj = {
      id: u.id,
      name,
      email,
      avatar: initials,
      imageUrl: u.imageUrl || null,
      role: 'LEAD_EDITOR',
      roleTitle: 'Lead Film Editor',
      token: clerkInstance.session?.id || `clerk_${u.id}`,
      provider: 'clerk',
    };

    // Persist for page reloads
    localStorage.setItem('cinevault_user', JSON.stringify(userObj));

    // Sync into app state if app.js is loaded
    if (window.state) window.state.user = userObj;
    if (typeof updateAuthUI === 'function') updateAuthUI();

    // Update header & modal elements directly
    _setEl('sign-in-btn', el => el.classList.add('hidden'));
    _setEl('user-profile-wrapper', el => el.classList.remove('hidden'));
    _setEl('auth-gate-modal', el => el.classList.add('hidden'));
    _setEl('workspace-nav-btn', el => el.classList.remove('hidden'));
    _setEl('user-name-text', el => el.textContent = name);
    _setEl('user-avatar-text', el => el.textContent = initials);
    _setEl('dropdown-user-name', el => el.textContent = name);
    _setEl('dropdown-user-email', el => el.textContent = email);

    // Show single welcome toast per browser session
    if (lastWelcomedUserId !== u.id) {
      lastWelcomedUserId = u.id;
      sessionStorage.setItem('cinevault_welcomed_user', u.id);
      if (typeof showToast === 'function') {
        showToast(`Welcome to CineVault Studio, ${name}! Signed in with Clerk.`, 'success');
      }
    }
  }

  function restoreLocalUserToUI(userObj) {
    if (!userObj) return;
    if (window.state) window.state.user = userObj;
    if (typeof updateAuthUI === 'function') updateAuthUI();

    _setEl('sign-in-btn', el => el.classList.add('hidden'));
    _setEl('user-profile-wrapper', el => el.classList.remove('hidden'));
    _setEl('auth-gate-modal', el => el.classList.add('hidden'));
    _setEl('workspace-nav-btn', el => el.classList.remove('hidden'));
    _setEl('user-name-text', el => el.textContent = userObj.name || 'Studio Member');
    _setEl('user-avatar-text', el => el.textContent = userObj.avatar || 'PJ');
    _setEl('dropdown-user-name', el => el.textContent = userObj.name || 'Studio Member');
    _setEl('dropdown-user-email', el => el.textContent = userObj.email || 'user@studio.ai');
  }

  // ─── Sign Out ─────────────────────────────────────────────────────────────
  function clearCineVaultUser() {
    localStorage.removeItem('cinevault_user');
    sessionStorage.removeItem('cinevault_welcomed_user');
    if (window.state) window.state.user = null;
    if (typeof updateAuthUI === 'function') updateAuthUI();

    _setEl('sign-in-btn', el => el.classList.remove('hidden'));
    _setEl('user-profile-wrapper', el => el.classList.add('hidden'));
    _setEl('workspace-nav-btn', el => el.classList.add('hidden'));
    _setEl('auth-gate-modal', el => el.classList.remove('hidden'));
  }

  // ─── Profile Dropdown Event Listener Setup ────────────────────────────────
  function initProfileDropdown() {
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    const signOutBtn = document.getElementById('sign-out-btn');
    const signInBtn = document.getElementById('sign-in-btn');

    if (profileBtn && dropdownMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (dropdownMenu && !dropdownMenu.contains(e.target) && !profileBtn.contains(e.target)) {
          dropdownMenu.classList.add('hidden');
        }
      });
    }

    if (signOutBtn) {
      signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        if (window._clerk) {
          try {
            await window._clerk.signOut();
          } catch (err) {
            console.warn('[Clerk] Sign out notice:', err);
          }
        }
        clearCineVaultUser();
        if (typeof showToast === 'function') {
          showToast('Signed out of CineVault Studio', 'info');
        } else {
          alert('Signed out of CineVault Studio');
        }
        window.location.reload();
      });
    }

    window.loginAsDemoLeadEditor = function() {
      const demoUser = {
        id: 'usr_demo_lead_editor',
        name: 'Pawan Joshi',
        email: 'joshipawan2021@gmail.com',
        avatar: 'PJ',
        role: 'LEAD_EDITOR',
        roleTitle: 'Lead Film Editor & Colorist',
        token: 'token_demo_lead_editor_active',
        provider: 'demo'
      };
      localStorage.setItem('cinevault_user', JSON.stringify(demoUser));
      if (window.state) window.state.user = demoUser;
      
      const authGateModal = document.getElementById('auth-gate-modal');
      if (authGateModal) authGateModal.classList.add('hidden');
      
      const signInBtn = document.getElementById('sign-in-btn');
      const userProfileWrapper = document.getElementById('user-profile-wrapper');
      if (signInBtn) signInBtn.classList.add('hidden');
      if (userProfileWrapper) userProfileWrapper.classList.remove('hidden');
      
      const userNameText = document.getElementById('user-name-text');
      const userAvatarText = document.getElementById('user-avatar-text');
      const dropdownUserName = document.getElementById('dropdown-user-name');
      const dropdownUserEmail = document.getElementById('dropdown-user-email');
      if (userNameText) userNameText.textContent = demoUser.name;
      if (userAvatarText) userAvatarText.textContent = demoUser.avatar;
      if (dropdownUserName) dropdownUserName.textContent = demoUser.name;
      if (dropdownUserEmail) dropdownUserEmail.textContent = demoUser.email;

      showClerkToast('Signed in as Demo Lead Editor (Full Unlocked Studio Access)!');
    };

    const demoLoginBtn = document.getElementById('demo-login-btn');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.loginAsDemoLeadEditor();
      });
    }

    const authGateDemoBtn = document.getElementById('auth-gate-demo-btn');
    if (authGateDemoBtn) {
      authGateDemoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.loginAsDemoLeadEditor();
      });
    }

    if (signInBtn) {
      signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window._clerk && typeof window._clerk.openSignIn === 'function') {
          window._clerk.openSignIn();
        } else {
          window.loginAsDemoLeadEditor();
        }
      });
    }

    const gateSignInBtn = document.getElementById('auth-gate-sign-in-btn');
    if (gateSignInBtn) {
      gateSignInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window._clerk && typeof window._clerk.openSignIn === 'function') {
          window._clerk.openSignIn();
        } else {
          window.loginAsDemoLeadEditor();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileDropdown);
  } else {
    initProfileDropdown();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _setEl(id, fn) {
    const el = document.getElementById(id);
    if (el) fn(el);
  }

  function showClerkToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
})();

