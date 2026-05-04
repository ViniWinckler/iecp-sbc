import { 
  getMinisteriosDoUsuario, 
  getConvitesPendentes, 
  getAvisos, 
  getEscalasDoMembro, 
  getUserCount, 
  getMinisterioCount, 
  getAllProjetos,
  updateConviteStatus
} from '../../services/db.js';

export function renderGeneralTab(userData) {
  const isLeadership = ['Admin', 'Pastor', 'Lider'].includes(userData.Nivel_Acesso);
  const isPastorOrAdmin = ['Admin', 'Pastor'].includes(userData.Nivel_Acesso);
  const firstName = (userData.Nome_Exibicao || 'UsuÃ¡rio').split(' ')[0];

  const verses = [
    { text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e nÃ£o de mal, para vos dar o fim que esperais.", ref: "Jeremias 29:11" },
    { text: "O Senhor Ã© o meu pastor, nada me faltarÃ¡.", ref: "Salmos 23:1" },
    { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
    { text: "Mas os que esperam no Senhor renovarÃ£o as suas forÃ§as; subirÃ£o com asas como Ã¡guias.", ref: "IsaÃ­as 40:31" },
    { text: "Alegrei-me quando me disseram: Vamos Ã  casa do Senhor.", ref: "Salmos 122:1" }
  ];
  const verse = verses[Math.floor(Math.random() * verses.length)];
  const greeting = getGreeting();

  return `
    <div style="margin-bottom: 32px; background: linear-gradient(135deg, var(--primary-800), var(--primary-600)); padding: 40px; border-radius: 20px; color: #ffffff !important; box-shadow: var(--shadow-lg); position: relative; overflow: hidden;">
      <div style="position: relative; z-index: 2;">
        <h2 style="font-size: 32px; font-weight: 850; margin-bottom: 12px; color: #ffffff !important;">${greeting}, ${firstName}! âœ¨</h2>
        <p style="opacity: 0.9; font-size: 16px; max-width: 500px; line-height: 1.6; color: rgba(255, 255, 255, 0.9) !important;">"${verse.text}" <br><strong style="font-size: 13px; margin-top: 8px; display: block; opacity: 0.8; color: #ffffff !important;">${verse.ref}</strong></p>
      </div>
      <div style="position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -20px; right: 40px; width: 150px; height: 150px; background: rgba(255,255,255,0.03); border-radius: 50%;"></div>
    </div>

    <div class="dashboard-grid">
      ${isPastorOrAdmin ? `
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
            <span class="material-symbols-rounded">people</span>
          </div>
          <div class="stat-card-value" id="stat-total-users">â€”</div>
          <div class="stat-card-label">Total de UsuÃ¡rios</div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <span class="material-symbols-rounded">account_tree</span>
          </div>
          <div class="stat-card-value" id="stat-total-ministerios">â€”</div>
          <div class="stat-card-label">Total de MinistÃ©rios</div>
        </div>
      ` : `
        <div class="card stat-card">
          <div class="stat-card-icon purple">
            <span class="material-symbols-rounded">groups</span>
          </div>
          <div class="stat-card-value" id="stat-ministerios">â€”</div>
          <div class="stat-card-label">Meus MinistÃ©rios</div>
        </div>
      `}
      <div class="card stat-card">
        <div class="stat-card-icon green">
          <span class="material-symbols-rounded">event_available</span>
        </div>
        <div class="stat-card-value" id="stat-escalas">â€”</div>
        <div class="stat-card-label">Escalas Confirmadas</div>
      </div>
      <div class="card stat-card">
        <div class="stat-card-icon amber">
          <span class="material-symbols-rounded">notifications</span>
        </div>
        <div class="stat-card-value" id="stat-avisos">â€”</div>
        <div class="stat-card-label">Novos Avisos</div>
      </div>
      <div class="card stat-card">
        <div class="stat-card-icon pink">
          <span class="material-symbols-rounded">mail</span>
        </div>
        <div class="stat-card-value" id="stat-convites">â€”</div>
        <div class="stat-card-label">Convites Pendentes</div>
      </div>
    </div>
    
    <div style="margin-top: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      <div class="card" style="padding: 24px; background: white;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-rounded" style="color: var(--primary-600);">event_repeat</span>
          Minha Agenda (PrÃ³ximas Escalas)
        </h3>
        <div id="quick-agenda-list" style="display: grid; gap: 12px;">
           <p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Carregando agenda...</p>
        </div>
        <button class="btn btn-outline-primary" style="width: 100%; margin-top: 16px; font-size: 12px;" onclick="window.location.hash='#/calendario'">Ver CalendÃ¡rio Completo</button>
      </div>

      <div class="card" style="padding: 24px; background: white;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-rounded" style="color: var(--accent-600);">campaign</span>
          Mural de Avisos
        </h3>
        <div id="quick-avisos-list" style="display: grid; gap: 12px;">
           <p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Carregando avisos...</p>
        </div>
      </div>

      ${isLeadership ? `
      <div class="card" style="padding: 24px; background: white;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-rounded" style="color: var(--success-600);">rocket_launch</span>
          Projetos Ativos
        </h3>
        <div id="projects-progress-list" style="display: grid; gap: 20px;">
          <p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Carregando projetos...</p>
        </div>
      </div>
      ` : ''}
    </div>

    <div id="no-ministry-warning" style="display: none; margin-top: 24px;">
      <div class="restricted-banner">
        <span class="material-symbols-rounded">lock</span>
        <div class="restricted-banner-text">
          <h3>Sua conta ainda nÃ£o estÃ¡ vinculada</h3>
          <p>O acesso Ã s funÃ§Ãµes avanÃ§adas Ã© liberado por convite.</p>
        </div>
      </div>
    </div>

    <div id="invitations-section" style="display: none; margin-top: 24px;">
      <h3 style="margin-bottom: 16px; font-size: 1.1rem;">ðŸ“¬ Seus Convites Pendentes</h3>
      <div class="list-container" id="invitations-list"></div>
    </div>
  `;
}

export async function loadGeneralStats(userData) {
  // Set skeletons
  const statIds = ['stat-total-users', 'stat-total-ministerios', 'stat-ministerios', 'stat-convites', 'stat-avisos', 'stat-escalas'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="skeleton" style="height:24px; width:40px; margin:0 auto;"></div>';
  });

  const listIds = ['projects-progress-list', 'quick-avisos-list', 'quick-agenda-list'];
  listIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `
    <div class="card skeleton" style="height: 120px; margin-bottom: 16px;"></div>
    <div class="card skeleton" style="height: 120px; margin-bottom: 16px;"></div>
  `;
  });

  try {
    const ministerios = await getMinisteriosDoUsuario(userData.Email);
    const convites = await getConvitesPendentes(userData.Email);
    const avisos = await getAvisos('Global');
    const escalas = await getEscalasDoMembro(userData.Email);

    const isPastorOrAdmin = ['Admin', 'Pastor'].includes(userData.Nivel_Acesso);

    if (isPastorOrAdmin) {
      const totalUsers = await getUserCount();
      const totalMin = await getMinisterioCount();
      const elUsers = document.getElementById('stat-total-users');
      const elMin = document.getElementById('stat-total-ministerios');
      if (elUsers) elUsers.innerText = totalUsers;
      if (elMin) elMin.innerText = totalMin;
    } else {
      const elMin = document.getElementById('stat-ministerios');
      if (elMin) elMin.innerText = ministerios.length;
    }

    const statConvites = document.getElementById('stat-convites');
    if (statConvites) statConvites.innerText = convites.length;
    
    const statAvisos = document.getElementById('stat-avisos');
    if (statAvisos) statAvisos.innerText = avisos.length;
    
    const statEscalas = document.getElementById('stat-escalas');
    if (statEscalas) statEscalas.innerText = escalas.filter(e => e.Membros_Escalados?.some(m => m.email === userData.Email && m.status === 'Confirmado')).length;

    if (ministerios.length === 0) {
      const warning = document.getElementById('no-ministry-warning');
      if (warning) warning.style.display = 'block';
    }

    if (convites.length > 0) {
      const section = document.getElementById('invitations-section');
      const list = document.getElementById('invitations-list');
      if (section && list) {
        section.style.display = 'block';
        list.innerHTML = convites.map(c => `
          <div class="list-item">
            <div class="list-item-info">
              <div class="list-item-title">Convite: ${c.ID_Ministerio}</div>
              <div class="list-item-subtitle">${c.Funcao_no_Ministerio}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-accept" data-id="${c.id}" style="padding: 6px 12px; font-size: 10px;">Aceitar</button>
              <button class="btn btn-secondary btn-reject" data-id="${c.id}" style="padding: 6px 12px; font-size: 10px;">Recusar</button>
            </div>
          </div>
        `).join('');

        list.querySelectorAll('.btn-accept').forEach(btn => {
          btn.onclick = async () => {
            await updateConviteStatus(btn.dataset.id, 'Aceito');
            loadGeneralStats(userData);
          };
        });
        list.querySelectorAll('.btn-reject').forEach(btn => {
          btn.onclick = async () => {
            await updateConviteStatus(btn.dataset.id, 'Recusado');
            loadGeneralStats(userData);
          };
        });
      }
    }

    const quickAvisosList = document.getElementById('quick-avisos-list');
    if (quickAvisosList) {
      if (avisos.length === 0) {
        quickAvisosList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Nenhum aviso global recente.</p>';
      } else {
        const top3 = avisos.slice(0, 3);
        quickAvisosList.innerHTML = top3.map(a => `
          <div style="padding-bottom: 12px; border-bottom: 1px solid var(--surface-100); margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">${a.Titulo}</div>
            <div style="font-size: 12px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${a.Mensagem}</div>
          </div>
        `).join('');
      }
    }

    const quickAgendaList = document.getElementById('quick-agenda-list');
    if (quickAgendaList) {
      if (escalas.length === 0) {
        quickAgendaList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Nenhuma escala agendada.</p>';
      } else {
        const proximas = escalas.slice(0, 3);
        quickAgendaList.innerHTML = proximas.map(e => {
          const mInfo = e.Membros_Escalados?.find(m => m.email === userData.Email);
          return `
            <div style="padding: 12px; background: var(--surface-50); border-radius: 12px; display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--surface-200);">
                <span style="font-size: 10px; font-weight: 700; color: var(--primary-600); line-height: 1;">${new Date(e.Data + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit'})}</span>
                <span style="font-size: 8px; text-transform: uppercase;">${new Date(e.Data + 'T00:00:00').toLocaleDateString('pt-BR', {month: 'short'}).replace('.','')}</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${e.Titulo_Evento || e.Titulo}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${mInfo?.funcao || 'Membro'} â€¢ ${e.Hora || '--:--'}</div>
              </div>
              <span class="badge ${mInfo?.status === 'Confirmado' ? 'badge-success' : (mInfo?.status === 'Recusado' ? 'badge-danger' : 'badge-warning')}" style="font-size: 8px;">
                ${mInfo?.status || 'Pendente'}
              </span>
            </div>
          `;
        }).join('');
      }
    }

    const projectsList = document.getElementById('projects-progress-list');
    if (projectsList) {
      const allProjetos = await getAllProjetos();
      const userMinEmails = ministerios.map(m => m.id);
      
      // Filter: Admin sees everything. Pastor sees everything. Others see what they created or for their ministry.
      const accessibleProjects = allProjetos.filter(p => {
        if (['Admin', 'Pastor'].includes(userData.Nivel_Acesso)) return true;
        if (p.Criado_Por === userData.Email) return true;
        if (p.ID_Ministerio_Alvo && userMinEmails.includes(p.ID_Ministerio_Alvo)) return true;
        if (p.Escopo === 'Geral') return true;
        return false;
      });

      const emAndamento = accessibleProjects.filter(p => (p.Progresso || 0) < 100);
      if (emAndamento.length === 0) {
        projectsList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">Nenhum projeto em andamento.</p>';
      } else {
        projectsList.innerHTML = emAndamento.slice(0, 4).map(p => `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 700; font-size: 14px;">${p.Titulo}</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--primary-600);">${p.Progresso || 0}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--surface-200); border-radius: 4px; overflow: hidden;">
              <div style="width: ${p.Progresso || 0}%; height: 100%; background: linear-gradient(90deg, var(--primary-400), var(--primary-600)); border-radius: 4px; transition: width 1s ease;"></div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (e) { console.error(e); }
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getRoleBadgeInline(nivel) {
  const badges = {
    'Admin': '<span class="badge badge-primary">Admin</span>',
    'Pastor': '<span class="badge badge-success">Pastor</span>',
    'Lider': '<span class="badge badge-warning">LÃ­der</span>',
    'Membro': '<span class="badge badge-primary" style="background: rgba(87, 123, 169, 0.1); color: var(--primary-500);">Membro</span>'
  };
  return badges[nivel] || badges['Membro'];
}
