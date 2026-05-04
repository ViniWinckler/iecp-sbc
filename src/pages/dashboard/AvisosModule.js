import { getAvisos, getMinisteriosDoUsuario, createAviso, deleteAviso } from '../../services/db.js';
import { showToast } from '../../components/toast.js';

let cachedAvisos = [];

export function renderAvisosTab(userData) {
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 28px; font-weight: 850; margin-bottom: 8px;">Mural de <span class="text-gradient">Avisos</span></h2>
          <p style="color: var(--text-secondary);">Fique por dentro do que acontece na IECP SBC.</p>
        </div>
        ${['Admin', 'Pastor', 'Lider'].includes(userData.Nivel_Acesso) ? `
          <button class="btn btn-primary" id="btn-new-aviso" style="padding: 10px 20px;">
            <span class="material-symbols-rounded" style="font-size: 20px;">add_comment</span>
            Novo Aviso
          </button>
        ` : ''}
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 32px;">
        <div style="flex: 1; position: relative;">
          <span class="material-symbols-rounded" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted);">search</span>
          <input type="text" id="avisos-search-input" class="form-input" placeholder="Buscar por tÃ­tulo ou mensagem..." style="padding-left: 48px; background: white; border-radius: 16px;">
        </div>
        <select id="avisos-filter-select" class="form-input" style="width: auto; min-width: 160px; background: white; border-radius: 16px;">
          <option value="Todos">Todos os Avisos</option>
          <option value="Global">Apenas Globais</option>
          <option value="Ministerio">Apenas MinistÃ©rio</option>
        </select>
      </div>

      <div id="avisos-feed" style="display: grid; gap: 20px;">
        <div class="card" style="padding: 40px; text-align: center; background: white;">
          <div class="loader-spinner" style="margin: 0 auto 16px;"></div>
          <p>Buscando mensagens...</p>
        </div>
      </div>
    </div>
  `;
}

export function setupAvisosActions(userData) {
  const btn = document.getElementById('btn-new-aviso');
  if (btn) btn.onclick = () => showAvisoModal(userData);

  const searchInput = document.getElementById('avisos-search-input');
  const filterSelect = document.getElementById('avisos-filter-select');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderAvisosFeed(cachedAvisos, userData)); // Bug 11 fix: passar userData
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', () => renderAvisosFeed(cachedAvisos, userData)); // Bug 11 fix: passar userData
  }
  
  loadAvisosList(userData);
}

async function loadAvisosList(userData) {
  const feed = document.getElementById('avisos-feed');
  if (!feed) return;
  feed.innerHTML = `
    <div class="card skeleton" style="height: 120px; margin-bottom: 16px;"></div>
    <div class="card skeleton" style="height: 120px; margin-bottom: 16px;"></div>
  `;

  try {
    const [globalAvisos, meusMin] = await Promise.all([
      getAvisos('Global'),
      getMinisteriosDoUsuario(userData.Email)
    ]);
    // Bug 8 fix: buscar avisos de todos os ministérios em paralelo
    const minAvisosArrays = await Promise.all(
      meusMin.map(min => getAvisos('Ministerio', min.id))
    );
    let allAvisos = [...globalAvisos, ...minAvisosArrays.flat()];

    allAvisos.sort((a,b) => (b.Data_Publicacao?.seconds || 0) - (a.Data_Publicacao?.seconds || 0));
    cachedAvisos = allAvisos;
    renderAvisosFeed(cachedAvisos, userData);
  } catch (err) {
    feed.innerHTML = '<p>Erro ao carregar avisos.</p>';
    console.error(err);
  }
}

function renderAvisosFeed(avisos, userData) {
  const feed = document.getElementById('avisos-feed');
  const searchInput = document.getElementById('avisos-search-input');
  const filterSelect = document.getElementById('avisos-filter-select');
  
  if (!feed) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const filterVal = filterSelect ? filterSelect.value : 'Todos';

  const filtered = avisos.filter(a => {
    if (filterVal !== 'Todos' && a.Escopo !== filterVal) return false;
    if (searchTerm) {
      const matchTitulo = a.Titulo.toLowerCase().includes(searchTerm);
      const matchTexto = a.Mensagem.toLowerCase().includes(searchTerm);
      if (!matchTitulo && !matchTexto) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div class="card" style="padding: 60px; text-align: center; color: var(--text-muted); background: white; border: 2px dashed var(--surface-200);">
        <span class="material-symbols-rounded" style="font-size: 56px; margin-bottom: 16px; color: var(--surface-300);">campaign</span>
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Nenhum aviso por aqui</h3>
        <p style="font-size: 14px;">Tente mudar os filtros ou busque por outro termo.</p>
      </div>
    `;
    return;
  }

  const userEmail = userData?.Email || ''; 
  const isAdmin = userData?.Nivel_Acesso === 'Admin';
  
  feed.innerHTML = filtered.map(a => {
    const isAuthor = a.Criado_Por_Email === userEmail;
    const authorInitial = a.Criado_Por_Email ? a.Criado_Por_Email.charAt(0).toUpperCase() : '?';
    
    return `
      <div class="card reveal-up" style="padding: 28px; background: white; border: 1px solid var(--surface-100); box-shadow: var(--shadow-sm); position: relative; overflow: hidden;">
        <div style="position: absolute; top:0; left:0; width: 6px; height: 100%; background: ${a.Escopo === 'Global' ? 'var(--primary-500)' : 'var(--accent-500)'};"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: ${a.Escopo === 'Global' ? 'var(--primary-50)' : 'var(--accent-50)'}; color: ${a.Escopo === 'Global' ? 'var(--primary-700)' : 'var(--accent-700)'}; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 1px solid ${a.Escopo === 'Global' ? 'var(--primary-100)' : 'var(--accent-100)'};">
               ${authorInitial}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                 <div style="font-weight: 800; font-size: 16px; color: var(--text-primary);">${a.Titulo}</div>
                 <span class="badge ${a.Escopo === 'Global' ? 'badge-primary' : 'badge-warning'}" style="font-size: 10px; border-radius: 6px; padding: 2px 8px;">${a.Escopo}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px; font-weight: 500;">
                 Publicado por ${isAuthor ? 'VocÃª' : (a.Criado_Por_Email || 'Sistema')} â€¢ ${formatarDataAviso(a.Data_Publicacao)}
              </div>
            </div>
          </div>
          
          ${isAdmin || isAuthor ? `
            <button class="btn-icon btn-delete-aviso" data-id="${a.id}" title="Excluir Aviso" style="background: var(--surface-50); color: #dc2626; width: 32px; height: 32px; border-radius: 8px;">
              <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
            </button>
          ` : ''}
        </div>

        <div style="line-height: 1.7; color: #334155; font-size: 15px; white-space: pre-wrap; background: var(--surface-50); padding: 20px; border-radius: 16px; border: 1px solid var(--surface-100);">
           <span class="material-symbols-rounded" style="float: left; margin: 0 12px 0 0; color: var(--text-muted); opacity: 0.3; font-size: 24px;">format_quote</span>
           ${a.Mensagem}
        </div>
      </div>
    `;
  }).join('');
  
  // Binding delete actions
  feed.querySelectorAll('.btn-delete-aviso').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Deseja excluir este aviso permanentemente?')) {
        try {
          await deleteAviso(btn.dataset.id);
          showToast('Aviso removido.', 'info');
          cachedAvisos = cachedAvisos.filter(x => x.id !== btn.dataset.id);
          renderAvisosFeed(cachedAvisos, userData);
        } catch (e) {
          showToast('Erro ao remover aviso.', 'error');
        }
      }
    };
  });
  
  setTimeout(() => {
    feed.querySelectorAll('.reveal-up').forEach((el, index) => {
      setTimeout(() => el.classList.add('in-view'), index * 60);
    });
  }, 10);
}

function formatarDataAviso(timestamp) {
  if (!timestamp) return 'Agora';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

async function showAvisoModal(userData) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3 style="margin-bottom: 20px;">Publicar Novo Aviso</h3>
      <form id="aviso-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label">TÃ­tulo</label>
          <input type="text" id="aviso-titulo" class="form-input" placeholder="Assunto do aviso" required>
        </div>
        <div class="form-group">
          <label class="form-label">Escopo da Mensagem</label>
          <select id="aviso-escopo" class="form-input" required>
            ${userData.Nivel_Acesso === 'Admin' || userData.Nivel_Acesso === 'Pastor' ? '<option value="Global">Global (Toda a Igreja)</option>' : ''}
            <option value="Ministerio">Para um MinistÃ©rio</option>
          </select>
        </div>
        <div class="form-group" id="aviso-min-group" style="display: none;">
          <label class="form-label">Qual MinistÃ©rio?</label>
          <select id="aviso-ministerio" class="form-input">
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mensagem</label>
          <textarea id="aviso-msg" class="form-input" rows="4" placeholder="ConteÃºdo do aviso..." required></textarea>
        </div>
        <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="aviso-email-notif" style="width: 18px; height: 18px; cursor: pointer;">
          <label for="aviso-email-notif" style="font-size: 13px; color: var(--text-secondary); cursor: pointer;">Notificar alvos por e-mail</label>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Publicar</button>
          <button type="button" class="btn btn-secondary btn-cancel" style="padding: 10px 20px;">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const escopo = modal.querySelector('#aviso-escopo');
  const minGroup = modal.querySelector('#aviso-min-group');
  const minSelect = modal.querySelector('#aviso-ministerio');

  escopo.onchange = async () => {
    if (escopo.value === 'Ministerio') {
      minGroup.style.display = 'block';
      const minData = await getMinisteriosDoUsuario(userData.Email);
      minSelect.innerHTML = minData.map(m => `<option value="${m.id}">${m.Nome_Ministerio}</option>`).join('');
    } else {
      minGroup.style.display = 'none';
    }
  };

  modal.querySelector('.btn-cancel').onclick = () => modal.remove();

  modal.querySelector('#aviso-form').onsubmit = async (e) => {
    e.preventDefault(); // Bug 10 fix: sem isso o form recarregava a página
    const btn = e.submitter;
    const shouldEmail = document.getElementById('aviso-email-notif').checked;
    
    btn.disabled = true;
    btn.innerHTML = '<div class="loader-spinner" style="width:18px;height:18px;border-width:2px;border-color:white;border-top-color:transparent;"></div>';

    try {
      await createAviso({
        Titulo: document.getElementById('aviso-titulo').value,
        Mensagem: document.getElementById('aviso-msg').value,
        Escopo: document.getElementById('aviso-escopo').value,
        ID_Ministerio_Alvo: document.getElementById('aviso-ministerio').value || null,
        Criado_Por_Email: userData.Email
      });

      if (shouldEmail) {
        showToast('Enviando e-mails para os membros...', 'info');
        await new Promise(r => setTimeout(r, 1500)); // Simulation
      }

      showToast('Aviso publicado!', 'success');
      modal.remove();
      loadAvisosList(userData);
    } catch (err) {
      console.error(err);
      showToast('Erro ao publicar aviso.', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Publicar';
    }
  };
}
