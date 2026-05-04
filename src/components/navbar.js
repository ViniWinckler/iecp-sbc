import { navigate } from '../router.js';

export function renderNavbar(user, userData) {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const currentHash = window.location.hash;
  const isDashboard = currentHash.includes('/dashboard');

  if (isDashboard && user) {
    nav.innerHTML = '';
    return;
  }

  nav.innerHTML = `
    <header style="position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(13,19,35,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);">
      <div style="max-width:1200px;margin:0 auto;padding:0 24px;height:70px;display:flex;align-items:center;justify-content:space-between;">
        <a href="#/" style="display:flex;align-items:center;gap:12px;text-decoration:none;">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;">
            <span class="material-symbols-rounded" style="color:white;font-size:22px;">church</span>
          </div>
          <span style="font-weight:800;font-size:18px;color:white;font-family:'Playfair Display',serif;">IECP <span style="color:#a5b4fc;">SBC</span></span>
        </a>

        <nav style="display:flex;align-items:center;gap:8px;">
          <a href="#/" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;font-weight:500;padding:8px 16px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='rgba(255,255,255,0.8)';this.style.background='transparent'">Início</a>
          <a href="#/quem-somos" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;font-weight:500;padding:8px 16px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='rgba(255,255,255,0.8)';this.style.background='transparent'">Quem Somos</a>
          <a href="#/eventos" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;font-weight:500;padding:8px 16px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='rgba(255,255,255,0.8)';this.style.background='transparent'">Eventos</a>
          <a href="#/contato" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;font-weight:500;padding:8px 16px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='rgba(255,255,255,0.8)';this.style.background='transparent'">Contato</a>
          ${user
            ? `<a href="#/dashboard" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;margin-left:8px;display:flex;align-items:center;gap:8px;transition:all 0.2s;">
                <span class="material-symbols-rounded" style="font-size:18px;">dashboard</span>Meu Painel
              </a>`
            : `<a href="#/login" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;margin-left:8px;transition:all 0.2s;">Entrar</a>`
          }
        </nav>
      </div>
    </header>
    <div style="height:70px;"></div>
  `;
}
