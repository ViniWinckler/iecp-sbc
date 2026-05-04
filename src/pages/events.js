import { getEventosPublicos } from '../services/db.js';

export function renderEventsPage() {
  return `
    <div style="min-height:100vh;background:#f8fafc;padding:60px 24px;">
      <div style="max-width:900px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:48px;">
          <h1 style="font-size:48px;font-weight:850;color:#1e293b;margin-bottom:16px;font-family:'Playfair Display',serif;">Próximos <span style="color:#6366f1;">Eventos</span></h1>
          <p style="color:#64748b;font-size:18px;">Confira a agenda completa da IECP SBC.</p>
        </div>
        <div id="eventos-page-list" style="display:grid;gap:20px;">
          <div style="text-align:center;padding:60px;color:#94a3b8;">
            <div class="loader-spinner" style="margin:0 auto 16px;"></div>
            <p>Carregando eventos...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initEventsPage() {
  try {
    const eventos = await getEventosPublicos();
    const list = document.getElementById('eventos-page-list');
    if (!list) return;
    if (eventos.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;background:white;border-radius:20px;border:2px dashed #e2e8f0;"><span class="material-symbols-rounded" style="font-size:48px;display:block;margin-bottom:16px;">event_busy</span>Nenhum evento próximo.</div>';
      return;
    }
    list.innerHTML = eventos.map(ev => {
      const dt = ev.Data_Hora?.toDate ? ev.Data_Hora.toDate() : new Date(ev.Data_Hora);
      return `
        <div style="background:white;border-radius:20px;padding:28px;border:1px solid #e2e8f0;box-shadow:0 2px 12px rgba(0,0,0,0.06);display:flex;gap:24px;align-items:center;">
          <div style="width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:11px;font-weight:800;color:rgba(255,255,255,0.8);text-transform:uppercase;">${dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span>
            <span style="font-size:28px;font-weight:850;color:white;line-height:1;">${dt.getDate()}</span>
          </div>
          <div style="flex:1;">
            <div style="font-weight:800;font-size:20px;color:#1e293b;margin-bottom:8px;">${ev.Titulo}</div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              <span style="display:flex;align-items:center;gap:4px;color:#64748b;font-size:14px;">
                <span class="material-symbols-rounded" style="font-size:16px;color:#8b5cf6;">schedule</span>
                ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
              </span>
              ${ev.Descricao ? `<span style="color:#64748b;font-size:14px;">${ev.Descricao}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch(e) { console.error(e); }
}
