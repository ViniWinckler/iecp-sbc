export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
  const colors = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '#22c55e' },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#f59e0b' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#3b82f6' }
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display:flex;align-items:center;gap:12px;padding:14px 18px;background:${c.bg};
    border:1px solid ${c.border};border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.1);
    min-width:280px;max-width:360px;pointer-events:all;
    opacity:0;transform:translateX(20px);transition:all 0.3s ease;font-family:Inter,sans-serif;
  `;
  toast.innerHTML = `
    <span class="material-symbols-rounded" style="color:${c.icon};font-size:20px;flex-shrink:0">${icons[type]||'info'}</span>
    <span style="font-size:14px;font-weight:500;color:${c.text};flex:1">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
