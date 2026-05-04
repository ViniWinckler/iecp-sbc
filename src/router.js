// =============================================
// SPA Router â€” Igreja App
// =============================================

const routes = {};
let currentRoute = null;
let notFoundHandler = null;

/**
 * Register a route
 * @param {string} path - e.g. '/', '/login', '/dashboard'
 * @param {Function} handler - async (params) => HTMLString
 */
export function addRoute(path, handler) {
  routes[path] = handler;
}

/**
 * Set 404 handler
 */
export function setNotFound(handler) {
  notFoundHandler = handler;
}

/**
 * Navigate to a route
 * @param {string} path
 * @param {boolean} pushState - whether to push to history
 */
export async function navigate(path, pushState = true) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  // Show loader
  mainContent.innerHTML = `
    <div class="loader-container">
      <div class="loader-spinner"></div>
    </div>
  `;

  // Find matching route
  const handler = routes[path] || notFoundHandler;
  currentRoute = path;

  if (handler) {
    try {
      const html = await handler();
      // Only update if we haven't navigated away during async loading
      if (currentRoute === path) {
        mainContent.innerHTML = `<div class="page-enter">${html}</div>`;
        // Execute any scripts/init for the page
        const event = new CustomEvent('page:mounted', { detail: { path } });
        document.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Route error:', error);
      mainContent.innerHTML = `
        <div class="container" style="padding-top: 120px; text-align: center;">
          <span class="material-symbols-rounded" style="font-size: 48px; color: var(--error-400);">error</span>
          <h2 style="margin-top: 16px;">Erro ao carregar pÃ¡gina</h2>
          <p style="color: var(--text-secondary); margin-top: 8px;">${error.message}</p>
          <button class="btn btn-primary" style="margin-top: 24px;" onclick="window.location.hash='#/'">
            Voltar ao inÃ­cio
          </button>
        </div>
      `;
    }
  }

  if (pushState) {
    window.location.hash = '#' + path;
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

/**
 * Get current route path
 */
export function getCurrentRoute() {
  return currentRoute;
}

/**
 * Initialize router (listen to hash changes)
 */
export function initRouter() {
  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const path = window.location.hash.slice(1) || '/';
    navigate(path, false);
  });

  // Handle initial route
  const initialPath = window.location.hash.slice(1) || '/';
  navigate(initialPath, false);
}

/**
 * Handle click events on links with data-route attribute
 * Usage: <a data-route="/dashboard">Dashboard</a>
 */
document.addEventListener('click', (e) => {
  const routeLink = e.target.closest('[data-route]');
  if (routeLink) {
    e.preventDefault();
    const path = routeLink.getAttribute('data-route');
    navigate(path);
  }
});

