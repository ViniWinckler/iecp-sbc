import { getEventosPublicos } from '../services/db.js';

export function renderEventsPage() {
  return `
    <div style="min-height:100vh; background:var(--bg); padding-top:72px;">
      <!-- Header Secundário -->
      <div class="page-header" style="background-image:url('https://images.unsplash.com/photo-1544427920-c49ccfaf8c56?auto=format&fit=crop&w=1920&q=80')">
        <div class="page-header-overlay"></div>
        <div class="page-header-content">
          <div class="section-label">
            <div class="section-label-line"></div>
            <span class="section-label-text">Agenda Oficial</span>
            <div class="section-label-line"></div>
          </div>
          <h1>Próximos Eventos</h1>
          <p>Fique por dentro da programação da nossa comunidade</p>
        </div>
      </div>

      <!-- Conteúdo dos Eventos -->
      <div class="contact-body">
        <div class="container">
          <div id="events-feed-page" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:24px; max-width:1000px; margin:0 auto;">
            <div style="grid-column: 1 / -1; text-align: center; color: var(--fg-muted); padding: 32px;">
               <div class="loader-spinner" style="margin:0 auto 16px;"></div>
               Carregando programação...
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initEventsPage() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  try {
    const eventos = await getEventosPublicos();
    const list = document.getElementById('events-feed-page');
    if (!list) return;

    if (eventos.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--fg-muted);grid-column:1/-1;">Nenhum evento agendado no momento.</div>';
      return;
    }

    list.innerHTML = eventos.map((ev, i) => {
      const dt = ev.Data_Hora?.toDate ? ev.Data_Hora.toDate() : new Date(ev.Data_Hora);
      return `
        <div class="event-card reveal-up" style="transition-delay:${(i % 3) * 0.1}s">
          <div class="event-date-box">
             <div class="event-date-month">${dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>
             <div class="event-date-day">${dt.getDate()}</div>
          </div>
          <div>
             <div class="event-title">${ev.Titulo}</div>
             <div class="event-meta">
               <span class="material-symbols-rounded" style="font-size:16px;">schedule</span>
               ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
             </div>
             ${ev.Descricao ? `<div style="font-size:13px; color:var(--fg-muted); margin-top:8px; line-height:1.5;">${ev.Descricao}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
  } catch(e) {
    console.error(e);
  }
}
