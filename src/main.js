// =============================================
// Main Entry Point â€” Igreja App
// =============================================

import './style.css';
import { initAuth, onAuthChange, getCurrentUser, getCurrentUserData } from './services/auth.js';
import { addRoute, initRouter, navigate, setNotFound } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderLoginPage, initLoginPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderHomePublicPage, initHomePublicPage } from './pages/home-public.js';
import { renderAboutUsPage } from './pages/about-us.js';
import { renderEventsPage } from './pages/events.js';
import { renderContactPage, initContactPage } from './pages/contact.js';
import { renderFooter } from './components/footer.js';

// =============================================
// Register Routes
// =============================================

// Public routes
addRoute('/', () => renderHomePublicPage());
addRoute('/login', () => renderLoginPage());
addRoute('/quem-somos', () => renderAboutUsPage());
addRoute('/eventos', () => renderEventsPage());
addRoute('/contato', () => renderContactPage());

// Authenticated routes
addRoute('/dashboard', () => renderDashboardPage());
addRoute('/projetos', () => authGuard(() => placeholderPage('Projetos e Chamados', 'assignment', 'SerÃ¡ construÃ­do na Etapa 7')));
addRoute('/avisos', () => authGuard(() => placeholderPage('Avisos e Comunicados', 'campaign', 'SerÃ¡ construÃ­do na Etapa 4')));
addRoute('/perfil', () => authGuard(() => placeholderPage('Meu Perfil', 'person', 'SerÃ¡ construÃ­do na Etapa 3')));

// 404
setNotFound(() => `
  <div class="container" style="padding-top: 120px; text-align: center;">
    <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-muted);">search_off</span>
    <h2 style="margin-top: 16px; font-size: 24px;">PÃ¡gina nÃ£o encontrada</h2>
    <p style="color: var(--text-secondary); margin-top: 8px;">A pÃ¡gina que vocÃª procura nÃ£o existe.</p>
    <a data-route="/" class="btn btn-primary" style="margin-top: 24px;">
      <span class="material-symbols-rounded" style="font-size:18px;">home</span>
      Voltar ao inÃ­cio
    </a>
  </div>
`);

// =============================================
// Page Init Handlers
// =============================================

document.addEventListener('page:mounted', (e) => {
  const { path } = e.detail;

  switch (path) {
    case '/':
      initHomePublicPage();
      break;
    case '/login':
      initLoginPage();
      break;
    case '/contato':
      initContactPage();
      break;
  }

});

// =============================================
// Auth State Observer
// =============================================

onAuthChange((user, userData) => {
  renderNavbar(user, userData);
  renderFooter();
});

// =============================================
// Helper Functions
// =============================================

function authGuard(renderFn) {
  const user = getCurrentUser();
  const userData = getCurrentUserData();
  if (!user || !userData) {
    setTimeout(() => navigate('/login'), 0);
    return '<div class="loader-container"><div class="loader-spinner"></div></div>';
  }
  return renderFn();
}

// Re-render navbar and footer on route change to properly hide/show it based on the current page
document.addEventListener('page:mounted', () => {
  const user = getCurrentUser();
  const userData = getCurrentUserData();
  renderNavbar(user, userData);
  renderFooter();
});

function placeholderPage(title, icon, description) {
  return `
    <div class="container" style="padding-top: 120px; text-align: center;">
      <span class="material-symbols-rounded" style="font-size: 56px; color: var(--primary-400);">${icon}</span>
      <h1 style="font-size: 28px; font-weight: 700; margin-top: 16px;">${title}</h1>
      <p style="color: var(--text-secondary); margin-top: 8px; font-size: 15px;">${description}</p>
      <div style="margin-top: 32px; padding: 20px; background: var(--surface-100); border-radius: var(--radius-lg); border: 1px dashed var(--surface-400); display: inline-flex; align-items: center; gap: 8px;">
        <span class="material-symbols-rounded" style="font-size: 20px; color: var(--accent-400);">construction</span>
        <span style="font-size: 14px; color: var(--text-muted);">Em construÃ§Ã£o â€” diga "prÃ³xima etapa" para avanÃ§armos</span>
      </div>
    </div>
  `;
}

// =============================================
// Initialize App
// =============================================

initAuth();
initRouter();

console.log('ðŸ›ï¸ Igreja App initialized');
