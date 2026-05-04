import { getEventosPublicos, getBannersAtivos } from '../services/db.js';

export function renderHomePublicPage() {
  return `
    <div style="min-height:100vh;">
      <!-- Hero -->
      <section style="position:relative;min-height:90vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d1323 0%,#1a1f3a 50%,#0d1323 100%);overflow:hidden;">
        <div style="position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop') center/cover;opacity:0.15;"></div>
        <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%);border-radius:50%;"></div>
        <div style="position:relative;z-index:2;text-align:center;padding:0 24px;max-width:800px;animation:fadeIn 0.8s ease-out;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);padding:8px 20px;border-radius:100px;margin-bottom:32px;">
            <span class="material-symbols-rounded" style="color:#a5b4fc;font-size:16px;">church</span>
            <span style="color:#a5b4fc;font-size:13px;font-weight:600;letter-spacing:0.05em;">IECP SBC — São Bernardo do Campo</span>
          </div>
          <h1 style="font-size:clamp(40px,6vw,72px);font-weight:850;color:white;line-height:1.1;margin-bottom:24px;font-family:'Playfair Display',serif;">
            Uma comunidade<br><span style="background:linear-gradient(135deg,#a5b4fc,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">viva em Cristo</span>
          </h1>
          <p style="font-size:18px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:48px;max-width:560px;margin-left:auto;margin-right:auto;">
            Encontre comunidade, propósito e fé. Venha fazer parte da família IECP.
          </p>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
            <a href="#/login" style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;padding:16px 32px;border-radius:14px;font-size:16px;font-weight:700;box-shadow:0 8px 32px rgba(99,102,241,0.4);border:1px solid #000;transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
              <span class="material-symbols-rounded">login</span>Área do Membro
            </a>
            <a href="#/eventos" style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;text-decoration:none;padding:16px 32px;border-radius:14px;font-size:16px;font-weight:600;transition:all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
              <span class="material-symbols-rounded">calendar_month</span>Próximos Eventos
            </a>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section style="background:#fff;padding:80px 24px;">
        <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px;text-align:center;">
          ${[
            { icon: 'church', val: 'Desde 1985', label: 'Servindo a comunidade' },
            { icon: 'groups', val: '500+', label: 'Membros ativos' },
            { icon: 'account_tree', val: '10+', label: 'Ministérios' },
            { icon: 'favorite', val: '∞', label: 'Amor em Cristo' }
          ].map(s => `
            <div>
              <div style="width:64px;height:64px;border-radius:18px;background:rgba(99,102,241,0.08);color:#6366f1;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <span class="material-symbols-rounded" style="font-size:28px;">${s.icon}</span>
              </div>
              <div style="font-size:28px;font-weight:850;color:#1e293b;margin-bottom:4px;">${s.val}</div>
              <div style="font-size:14px;color:#64748b;">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Próximos Eventos -->
      <section style="background:#f8fafc;padding:80px 24px;">
        <div style="max-width:1200px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:48px;">
            <h2 style="font-size:36px;font-weight:850;color:#1e293b;margin-bottom:12px;font-family:'Playfair Display',serif;">Próximos <span style="color:#6366f1;">Eventos</span></h2>
            <p style="color:#64748b;font-size:16px;">Fique por dentro da agenda da nossa comunidade.</p>
          </div>
          <div id="public-eventos-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">
            <div style="text-align:center;padding:40px;color:#94a3b8;grid-column:1/-1;">Carregando eventos...</div>
          </div>
          <div style="text-align:center;margin-top:32px;">
            <a href="#/eventos" style="display:inline-flex;align-items:center;gap:8px;color:#6366f1;text-decoration:none;font-weight:600;font-size:15px;">Ver todos os eventos <span class="material-symbols-rounded">arrow_forward</span></a>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:80px 24px;text-align:center;">
        <div style="max-width:600px;margin:0 auto;">
          <h2 style="font-size:40px;font-weight:850;color:white;margin-bottom:16px;font-family:'Playfair Display',serif;">Faça parte da família</h2>
          <p style="color:rgba(255,255,255,0.8);font-size:18px;margin-bottom:40px;">Cadastre-se e acesse nossa plataforma de gestão ministerial.</p>
          <a href="#/login" style="display:inline-flex;align-items:center;gap:10px;background:white;color:#4f46e5;text-decoration:none;padding:16px 40px;border-radius:14px;font-size:16px;font-weight:700;box-shadow:0 8px 32px rgba(0,0,0,0.2);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
            <span class="material-symbols-rounded">person_add</span>Criar Minha Conta
          </a>
        </div>
      </section>
    </div>
  `;
}

export async function initHomePublicPage() {
  try {
    const eventos = await getEventosPublicos();
    const list = document.getElementById('public-eventos-list');
    if (!list) return;
    if (eventos.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;grid-column:1/-1;">Nenhum evento próximo. Volte em breve!</div>';
      return;
    }
    list.innerHTML = eventos.slice(0, 3).map(ev => {
      const dt = ev.Data_Hora?.toDate ? ev.Data_Hora.toDate() : new Date(ev.Data_Hora);
      return `
        <div style="background:white;border-radius:20px;padding:24px;border:1px solid #e2e8f0;box-shadow:0 2px 12px rgba(0,0,0,0.06);display:flex;gap:20px;align-items:flex-start;">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(99,102,241,0.15);flex-shrink:0;">
            <span style="font-size:10px;font-weight:800;color:#6366f1;text-transform:uppercase;">${dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span>
            <span style="font-size:24px;font-weight:850;color:#1e293b;line-height:1;">${dt.getDate()}</span>
          </div>
          <div>
            <div style="font-weight:800;font-size:16px;color:#1e293b;margin-bottom:6px;">${ev.Titulo}</div>
            <div style="font-size:13px;color:#64748b;display:flex;align-items:center;gap:4px;">
              <span class="material-symbols-rounded" style="font-size:14px;color:#8b5cf6;">schedule</span>
              ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} ${ev.Descricao ? '• '+ev.Descricao : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  } catch(e) { console.error(e); }
}
