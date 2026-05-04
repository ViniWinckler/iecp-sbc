import { getEscalasDoMembro, getEventosPublicos, getMinisteriosDoUsuario, getEscalasDoMinisterio } from '../../services/db.js';

export function renderCalendarTab(userData) {
  return `
    <div class="calendar-module" style="padding-right: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
        <div>
          <h2 style="font-size: 28px; font-weight: 850; margin-bottom: 8px;">CalendÃ¡rio <span class="text-gradient">Integrado</span></h2>
          <p style="color: var(--text-secondary);">Visualize todas as escalas e eventos pÃºblicos em um sÃ³ lugar.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 6px; border-radius: 12px; border: 1px solid var(--surface-100); box-shadow: var(--shadow-sm);">
          <button class="btn-icon" id="cal-prev" style="width: 32px; height: 32px;"><span class="material-symbols-rounded">chevron_left</span></button>
          <div id="cal-month-title" style="min-width: 160px; text-align: center; font-weight: 700; font-size: 15px; text-transform: capitalize;">Carregando...</div>
          <button class="btn-icon" id="cal-next" style="width: 32px; height: 32px;"><span class="material-symbols-rounded">chevron_right</span></button>
        </div>
      </div>

      <div class="card" style="padding: 1px; background: var(--surface-200); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md);">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--surface-50); border-bottom: 1px solid var(--surface-200);">
          ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'].map(d => `<div style="padding: 12px; text-align: center; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${d}</div>`).join('')}
        </div>
        <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); background: white;">
          ${Array(35).fill('<div style="height: 120px; background: white; border: 1px solid var(--surface-50);" class="skeleton"></div>').join('')}
        </div>
      </div>

      <div style="margin-top: 32px; display: flex; gap: 24px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width:12px;height:12px;border-radius:3px;background:var(--primary-500);"></div><span style="font-size:13px;color:var(--text-secondary);">Escalas</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width:12px;height:12px;border-radius:3px;background:var(--accent-500);"></div><span style="font-size:13px;color:var(--text-secondary);">Eventos PÃºblicos</span></div>
      </div>
    </div>
  `;
}

export async function setupCalendarActions(userData) {
  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();
  const monthNames = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const updateUI = async (m, y) => {
    const title = document.getElementById('cal-month-title');
    if (title) title.innerText = `${monthNames[m]} ${y}`;
    
    try {
      const [eventos, minhasEscalas] = await Promise.all([
        getEventosPublicos(),
        getEscalasDoMembro(userData.Email)
      ]);

      const ministries = await getMinisteriosDoUsuario(userData.Email);
      let allMinistryEscalas = [];
      for (const min of ministries) {
        try {
          const ex = await getEscalasDoMinisterio(min.id);
          allMinistryEscalas = allMinistryEscalas.concat(ex);
        } catch (err) { console.warn('Failed to load scales for ministry', min.id); }
      }

      renderGrid(m, y, [...eventos, ...minhasEscalas, ...allMinistryEscalas]);
    } catch (err) {
      console.error('Calendar update error', err);
    }
  };

  const renderGrid = (m, y, allItems) => {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();
    
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      grid.innerHTML += `<div style="height: 120px; background: var(--surface-50); border: 0.5px solid var(--surface-100); opacity: 0.5;"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;
      const dayDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dayItems = allItems.filter(item => {
        const itemDate = item.Data_Hora ? (item.Data_Hora.toDate ? item.Data_Hora.toDate().toISOString().split('T')[0] : item.Data_Hora.split('T')[0]) : item.Data;
        return itemDate === dayDateStr;
      });

      const uniqueItems = Array.from(new Set(dayItems.map(a => a.id))).map(id => dayItems.find(a => a.id === id));

      grid.innerHTML += `
        <div style="height: 120px; background: white; border: 0.5px solid var(--surface-100); padding: 8px; position: relative; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 14px; font-weight: ${isToday ? '800' : '500'}; color: ${isToday ? 'var(--primary-600)' : 'var(--text-primary)'}; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: ${isToday ? 'var(--primary-50)' : 'transparent'};">
            ${d}
          </div>
          <div style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
            ${uniqueItems.slice(0, 3).map(item => {
              const isEscala = !!item.Membros_Escalados;
              return `
                <div title="${item.Titulo_Evento || item.Titulo}" style="font-size: 10px; padding: 4px 6px; border-radius: 4px; background: ${isEscala ? 'var(--primary-50)' : 'var(--accent-50)'}; color: ${isEscala ? 'var(--primary-700)' : 'var(--accent-700)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 2px solid ${isEscala ? 'var(--primary-500)' : 'var(--accent-500)'}; font-weight: 600;">
                  ${item.Hora || (item.Data_Hora?.toDate ? item.Data_Hora.toDate().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '')} ${item.Titulo_Evento || item.Titulo}
                </div>
              `;
            }).join('')}
            ${uniqueItems.length > 3 ? `<div style="font-size: 9px; color: var(--text-muted); text-align: center;">+ ${uniqueItems.length - 3} mais</div>` : ''}
          </div>
        </div>
      `;
    }

    const totalCellsProduced = firstDay + daysInMonth;
    const remaining = 42 - totalCellsProduced;
    for (let i = 0; i < remaining; i++) {
        grid.innerHTML += `<div style="height: 120px; background: var(--surface-50); border: 0.5px solid var(--surface-100); opacity: 0.5;"></div>`;
    }
  };

  await updateUI(currentMonth, currentYear);

  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');

  if (prevBtn) prevBtn.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    updateUI(currentMonth, currentYear);
  };

  if (nextBtn) nextBtn.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    updateUI(currentMonth, currentYear);
  };
}
