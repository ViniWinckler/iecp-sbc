// =============================================
// Navbar Component — Igreja App
// =============================================
import { getCurrentUser, getCurrentUserData, logout } from '../services/auth.js';
import { navigate } from '../router.js';

export function renderNavbar(user, userData) {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Hide navbar inside dashboard (dashboard has its own header)
  const isDashboard = window.location.hash.includes('/dashboard');
  if (isDashboard && user) { nav.innerHTML = ''; return; }

  nav.innerHTML = user && userData
    ? renderAuthNav(user, userData)
    : renderPublicNav();

  setupEvents();
}

function renderPublicNav() {
  return `
    <nav class="pub-navbar">
      <div class="pub-navbar-brand" data-route="/">
        <span class="material-symbols-rounded">church</span>
        IECP <span style="color:var(--accent);margin-left:4px">SBC</span>
      </div>
      <ul class="pub-navbar-links">
        <li><a data-route="/" href="#/">Início</a></li>
        <li><a data-route="/quem-somos" href="#/quem-somos">Quem Somos</a></li>
        <li><a data-route="/eventos" href="#/eventos">Eventos</a></li>
        <li><a data-route="/contato" href="#/contato">Contato</a></li>
      </ul>
      <div class="pub-navbar-actions">
        <a href="#/login" class="pub-btn pub-btn-navy" style="font-size:13px;padding:10px 22px;">
          <span class="material-symbols-rounded" style="font-size:18px;">login</span>
          Área do Membro
        </a>
      </div>
    </nav>
    <div style="height:72px"></div>
  `;
}

function renderAuthNav(user, userData) {
  const initial = (userData?.Nome_Exibicao || user.email || '?')[0].toUpperCase();
  const photo = user.photoURL
    ? `<img src="${user.photoURL}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--accent)" referrerpolicy="no-referrer">`
    : `<div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${initial}</div>`;

  return `
    <nav class="pub-navbar">
      <div class="pub-navbar-brand" data-route="/dashboard">
        <span class="material-symbols-rounded">church</span>
        IECP <span style="color:var(--accent);margin-left:4px">SBC</span>
      </div>
      <ul class="pub-navbar-links">
        <li><a href="#/dashboard" data-route="/dashboard">Dashboard</a></li>
        <li><a href="#/" data-route="/">Site</a></li>
      </ul>
      <div class="pub-navbar-actions">
        <div class="pub-navbar-user">
          <span style="font-size:14px;color:var(--fg-muted)">${userData?.Nome_Exibicao || ''}</span>
          <div style="position:relative">
            <div id="nav-avatar" style="cursor:pointer">${photo}</div>
            <div id="nav-dropdown" style="display:none;position:absolute;top:calc(100%+8px);right:0;background:white;border:1px solid #e8e2d8;border-radius:4px;box-shadow:var(--shadow-lg);min-width:180px;z-index:999;padding:4px">
              <a href="#/dashboard" style="display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:14px;color:var(--fg);border-radius:2px;transition:background .15s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <span class="material-symbols-rounded" style="font-size:18px">dashboard</span>Dashboard
              </a>
              <div style="height:1px;background:#f1f5f9;margin:4px 0"></div>
              <button id="nav-logout" style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;font-size:14px;color:#ef4444;background:transparent;border:none;cursor:pointer;border-radius:2px;transition:background .15s" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">
                <span class="material-symbols-rounded" style="font-size:18px">logout</span>Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div style="height:72px"></div>
  `;
}

function setupEvents() {
  // Brand click
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', e => {
      const route = el.getAttribute('data-route');
      if (route) { e.preventDefault(); navigate(route); }
    });
  });

  // Avatar dropdown
  const avatar = document.getElementById('nav-avatar');
  const dropdown = document.getElementById('nav-dropdown');
  if (avatar && dropdown) {
    avatar.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { if (dropdown) dropdown.style.display = 'none'; }, { once: false });
  }

  // Logout
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      navigate('/');
    });
  }

  // Active link
  const hash = window.location.hash.slice(1) || '/';
  document.querySelectorAll('.pub-navbar-links a').forEach(a => {
    const r = a.getAttribute('data-route');
    if (r === hash) a.style.color = 'var(--primary)';
  });
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) || '/';
  document.querySelectorAll('.pub-navbar-links a').forEach(a => {
    a.style.color = a.getAttribute('data-route') === hash ? 'var(--primary)' : '';
  });
});
