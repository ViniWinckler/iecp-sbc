export function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const isDashboard = window.location.hash.includes('/dashboard');
  if (isDashboard) { footer.innerHTML = ''; return; }

  footer.innerHTML = `
    <footer style="background:#0d1323;border-top:1px solid rgba(255,255,255,0.06);padding:48px 24px 24px;">
      <div style="max-width:1200px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;margin-bottom:48px;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                <span class="material-symbols-rounded" style="color:white;font-size:18px;">church</span>
              </div>
              <span style="font-weight:800;font-size:16px;color:white;font-family:'Playfair Display',serif;">IECP SBC</span>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;">Igreja Evangélica Cristã Presbiteriana de São Bernardo do Campo.</p>
          </div>
          <div>
            <h4 style="color:white;font-weight:700;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Links</h4>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <a href="#/" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Início</a>
              <a href="#/quem-somos" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Quem Somos</a>
              <a href="#/eventos" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Eventos</a>
              <a href="#/contato" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Contato</a>
            </div>
          </div>
          <div>
            <h4 style="color:white;font-weight:700;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Área do Membro</h4>
            <a href="#/login" style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:600;transition:all 0.2s;" onmouseover="this.style.background='rgba(99,102,241,0.25)'" onmouseout="this.style.background='rgba(99,102,241,0.15)'">
              <span class="material-symbols-rounded" style="font-size:16px;">login</span>Acessar Painel
            </a>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:13px;">© 2025 IECP SBC — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  `;
}
