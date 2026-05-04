// =============================================
// Dashboard Page â€” Igreja App (Refactored)
// =============================================
// Container for role-based modules.

import { getCurrentUser, getCurrentUserData } from '../services/auth.js';
import { navigate } from '../router.js';

// Import Modules
import { renderGeneralTab, loadGeneralStats, getGreeting, getRoleBadgeInline } from './dashboard/Stats.js';
import { renderAvisosTab, setupAvisosActions } from './dashboard/AvisosModule.js';
import { renderEscalasTab, setupEscalasActions } from './dashboard/EscalasModule.js';
import { renderProjetosTab, setupProjetosActions } from './dashboard/ProjetosModule.js';
import { renderPortalTab, setupPortalActions } from './dashboard/PortalModule.js';
import { renderCalendarTab, setupCalendarActions } from './dashboard/CalendarioModule.js';
import { 
  renderMinisteriosTab, loadMinisteriosList, setupMinisteriosActions,
  renderMembrosTab, loadMembrosList, setupMembrosActions,
  renderAccountTab, setupAccountActions
} from './dashboard/UserManagement.js';
import { getConvitesPendentes, getEscalasDoMembro } from '../services/db.js';

let currentTab = 'geral';

export function renderDashboardPage() {
  const user = getCurrentUser();
  const userData = getCurrentUserData();

  if (!user || !userData) {
    setTimeout(() => navigate('/login'), 0);
    return '<div class="loader-container"><div class="loader-spinner"></div></div>';
  }

  // Setup periodic refresh or just initial load
  setTimeout(() => initDashboardListeners(userData), 100);

  const firstName = (userData.Nome_Exibicao || 'UsuÃ¡rio').split(' ')[0];

  return `
    <div class="dashboard-page">
      <div class="container">
        <div class="dashboard-header" style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 16px 24px; border-radius: 20px; border: 1px solid var(--surface-100); box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: var(--primary-800); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              <span class="material-symbols-rounded">church</span>
            </div>
            <div>
              <h1 style="font-size: 18px; font-weight: 850; margin: 0; color: var(--primary-800);">IECP <span class="text-gradient">SBC</span></h1>
              <p style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Painel de GestÃ£o</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: right; display: none; display: md-block; @media (min-width: 768px) { display: block; }">
              <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${userData.Nome_Exibicao}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${userData.Email}</div>
            </div>
            <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--surface-50); color: var(--primary-600); display: flex; align-items: center; justify-content: center; font-weight: 800; border: 1px solid var(--surface-100); cursor: pointer; transition: all 0.2s;" class="profile-pill">
              ${firstName[0].toUpperCase()}
            </div>
          </div>
        </div>

        ${userData.Nivel_Acesso === 'Pastor_Pendente' ? `
        <div style="margin-bottom: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; gap: 14px;">
          <span class="material-symbols-rounded" style="color: #f59e0b; font-size: 28px; flex-shrink: 0;">hourglass_top</span>
          <div>
            <div style="font-weight: 700; font-size: 15px; color: #78350f;">Conta pastoral aguardando aprovação</div>
            <div style="font-size: 13px; color: #92400e; margin-top: 2px;">Sua solicitação de acesso como Pastor está sendo analisada pela administração. Enquanto isso, você tem acesso como membro.</div>
          </div>
        </div>
        ` : ''}
        <div class="dashboard-layout">
          <!-- Sidebar Navigation -->
          <aside class="dashboard-sidebar">
            <nav class="sidebar-nav">
              ${renderSidebarLinks(userData.Nivel_Acesso)}
            </nav>
          </aside>

          <!-- Main Content Area -->
          <main class="dashboard-content" id="dashboard-main-content" style="flex-grow: 1; padding: 0 0 40px 40px; min-height: 500px;">
            ${renderTabContent(currentTab, userData)}
          </main>
        </div>
      </div>
    </div>
  `;
}

function renderSidebarLinks(role) {
  const links = [
    { id: 'geral', label: 'VisÃ£o Geral', icon: 'dashboard', roles: ['Admin', 'Pastor', 'Lider', 'Membro', 'Pastor_Pendente'] },
    { id: 'ministerios', label: 'MinistÃ©rios', icon: 'account_tree', roles: ['Admin', 'Pastor', 'Lider'] },
    { id: 'membros', label: 'Membros', icon: 'group', roles: ['Admin', 'Pastor', 'Lider'] },
    { id: 'escalas', label: 'Escalas', icon: 'event_available', roles: ['Admin', 'Pastor', 'Lider', 'Membro', 'Pastor_Pendente'] },
    { id: 'calendario', label: 'CalendÃ¡rio', icon: 'calendar_month', roles: ['Admin', 'Pastor', 'Lider', 'Membro', 'Pastor_Pendente'] },
    { id: 'projetos', label: 'Tarefas', icon: 'view_kanban', roles: ['Admin', 'Pastor', 'Lider'] },
    { id: 'avisos', label: 'Mensagens', icon: 'notifications', roles: ['Admin', 'Pastor', 'Lider', 'Membro', 'Pastor_Pendente'] },
    { id: 'portal', label: 'Portal PÃºblico', icon: 'public', roles: ['Admin', 'Pastor'] },
    { id: 'conta', label: 'ConfiguraÃ§Ãµes', icon: 'settings', roles: ['Admin', 'Pastor', 'Lider', 'Membro', 'Pastor_Pendente'] }
  ];

  return links
    .filter(link => link.roles.includes(role))
    .map(link => `
      <button class="sidebar-link ${currentTab === link.id ? 'active' : ''}" data-tab="${link.id}" ${['ministerios', 'portal'].includes(link.id) ? 'style="border: 1px solid #000;"' : ''}>
        <span class="material-symbols-rounded">${link.icon}</span>
        ${link.label}
      </button>
    `).join('') + `
      <div style="flex-grow: 1;"></div>
      <button class="sidebar-link" id="logout-btn-sidebar" style="color: #dc2626; margin-top: 32px;">
        <span class="material-symbols-rounded">logout</span>
        Sair da Conta
      </button>
    `;
}

function renderTabContent(tab, userData) {
  switch (tab) {
    case 'geral': return renderGeneralTab(userData);
    case 'ministerios': return renderMinisteriosTab(userData);
    case 'membros': return renderMembrosTab(userData);
    case 'escalas': return renderEscalasTab(userData);
    case 'projetos': return renderProjetosTab(userData);
    case 'avisos': return renderAvisosTab(userData);
    case 'portal': return renderPortalTab(userData);
    case 'calendario': return renderCalendarTab(userData);
    case 'conta': return renderAccountTab(userData);
    default: return '<div>ConteÃºdo nÃ£o encontrado.</div>';
  }
}

function initDashboardListeners(userData) {
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.onclick = () => {
      const tabId = btn.dataset.tab;
      if (!tabId) return;

      currentTab = tabId;
      const content = document.getElementById('dashboard-main-content');
      if (content) {
        content.innerHTML = renderTabContent(currentTab, userData);
        document.querySelectorAll('.sidebar-link').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
        initTabLogic(currentTab, userData);
      }
    };
  });

  initTabLogic(currentTab, userData);
  updateSidebarBadges(userData);

  const logoutBtn = document.getElementById('logout-btn-sidebar');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      const { logout } = await import('../services/auth.js');
      await logout();
      navigate('/');
    };
  }
}

function initTabLogic(tab, userData) {
  if (tab === 'geral') loadGeneralStats(userData);
  if (tab === 'ministerios') {
    loadMinisteriosList(userData);
    setupMinisteriosActions(userData);
  }
  if (tab === 'membros') {
    loadMembrosList(userData);
    setupMembrosActions(userData);
  }
  if (tab === 'avisos') {
    setupAvisosActions(userData);
  }
  if (tab === 'escalas') {
    setupEscalasActions(userData);
  }
  if (tab === 'projetos') {
    setupProjetosActions(userData);
  }
  if (tab === 'portal') {
    setupPortalActions(userData);
  }
  if (tab === 'calendario') {
    setupCalendarActions(userData);
  }
  if (tab === 'conta') {
    setupAccountActions(userData);
  }
}

async function updateSidebarBadges(userData) {
  try {
    const [convites, escalas] = await Promise.all([
      getConvitesPendentes(userData.Email),
      getEscalasDoMembro(userData.Email)
    ]);

    const pendentesEscalas = escalas.filter(e => e.Membros_Escalados?.some(m => m.email === userData.Email && m.status === 'Pendente')).length;
    
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
      const tab = link.dataset.tab;
      // Remove existing badges
      const oldBadge = link.querySelector('.sidebar-badge');
      if (oldBadge) oldBadge.remove();

      if (tab === 'geral' && convites.length > 0) {
        link.innerHTML += `<span class="sidebar-badge">${convites.length}</span>`;
      }
      if (tab === 'escalas' && pendentesEscalas > 0) {
        link.innerHTML += `<span class="sidebar-badge">${pendentesEscalas}</span>`;
      }
    });
  } catch (e) {
    console.warn('Could not update badges', e);
  }
}
