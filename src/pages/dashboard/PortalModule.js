import { getEventosPublicos, deleteEventoPublico, getAllBanners, deleteBanner, createEventoPublico, createBanner } from '../../services/db.js';
import { Timestamp } from 'firebase/firestore';

export function renderPortalTab(userData) {
  return `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 28px; font-weight: 850; margin-bottom: 8px;">Portal <span class="text-gradient">PÃºblico</span></h2>
        <p style="color: var(--text-secondary);">Gerencie o conteÃºdo visÃ­vel na pÃ¡gina inicial para visitantes.</p>
      </div>

      <div class="card" style="padding: 24px; background: white; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0;">
            <span class="material-symbols-rounded" style="color: var(--primary-500);">calendar_month</span>
            Eventos PÃºblicos
          </h3>
          <button class="btn btn-primary" id="btn-add-evento" style="padding: 8px 16px; font-size: 13px; border: 1px solid #000;">
            <span class="material-symbols-rounded" style="font-size: 18px;">add</span>
            Novo Evento
          </button>
        </div>
        <div id="eventos-list" style="display: grid; gap: 12px;">
          <div class="loader-spinner" style="margin: 20px auto;"></div>
        </div>
      </div>

      <div class="card" style="padding: 24px; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0;">
            <span class="material-symbols-rounded" style="color: var(--accent-500);">photo_library</span>
            Banners da PÃ¡gina Inicial
          </h3>
          <button class="btn btn-primary" id="btn-add-banner" style="padding: 8px 16px; font-size: 13px; border: 1px solid #000;">
            <span class="material-symbols-rounded" style="font-size: 18px;">add</span>
            Novo Banner
          </button>
        </div>
        <div id="banners-list" style="display: grid; gap: 12px;">
          <div class="loader-spinner" style="margin: 20px auto;"></div>
        </div>
      </div>
    </div>
  `;
}

export function setupPortalActions(userData) {
  const btnEvento = document.getElementById('btn-add-evento');
  if (btnEvento) btnEvento.onclick = () => showNovoEventoModal(userData);

  const btnBanner = document.getElementById('btn-add-banner');
  if (btnBanner) btnBanner.onclick = () => showNovoBannerModal(userData);
  
  loadPortalData(userData);
}

async function loadPortalData(userData) {
  const { showToast } = await import('../../components/toast.js');

  // Load Eventos
  const eventosList = document.getElementById('eventos-list');
  if (eventosList) {
    try {
      const eventos = await getEventosPublicos();
      if (eventos.length === 0) {
        eventosList.innerHTML = `
          <div style="text-align: center; padding: 40px; background: var(--surface-50); border-radius: 16px; border: 1px dashed var(--surface-200);">
            <span class="material-symbols-rounded" style="font-size: 40px; color: var(--text-muted); opacity: 0.5;">event_busy</span>
            <p style="color: var(--text-muted); margin-top: 12px; font-size: 14px;">Nenhum evento pÃºblico cadastrado.</p>
          </div>`;
      } else {
        eventosList.innerHTML = eventos.map(ev => {
          const dt = ev.Data_Hora?.toDate ? ev.Data_Hora.toDate() : new Date(ev.Data_Hora);
          return `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border: 1px solid var(--surface-100); transition: transform 0.2s; box-shadow: var(--shadow-sm);">
              <div style="display: flex; gap: 20px; align-items: center;">
                <div style="width: 54px; height: 54px; border-radius: 12px; background: var(--primary-50); color: var(--primary-600); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--primary-100);">
                   <span style="font-size: 10px; font-weight: 800; text-transform: uppercase;">${dt.toLocaleDateString('pt-BR', {month: 'short'}).replace('.','')}</span>
                   <span style="font-size: 20px; font-weight: 850;">${dt.getDate()}</span>
                </div>
                <div>
                  <div style="font-weight: 800; font-size: 16px; color: var(--text-primary);">${ev.Titulo}</div>
                  <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                    <span class="material-symbols-rounded" style="font-size: 16px; color: var(--accent-600);">schedule</span>
                    ${dt.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} â€¢ ${ev.Descricao || 'Sem descriÃ§Ã£o'}
                  </div>
                </div>
              </div>
              <button class="btn-icon btn-delete-evento" data-id="${ev.id}" style="background: #fee2e2; color: #dc2626; border-radius: 10px; width: 36px; height: 36px;">
                <span class="material-symbols-rounded" style="font-size: 20px;">delete</span>
              </button>
            </div>
          `;
        }).join('');

        eventosList.querySelectorAll('.btn-delete-evento').forEach(btn => {
          btn.onclick = async () => {
            if (confirm('Remover este evento pÃºblico?')) {
              await deleteEventoPublico(btn.dataset.id);
              showToast('Evento removido.', 'info');
              loadPortalData(userData);
            }
          };
        });
      }
    } catch (e) { console.error(e); }
  }

  // Load Banners
  const bannersList = document.getElementById('banners-list');
  if (bannersList) {
    try {
      const banners = await getAllBanners();
      if (banners.length === 0) {
        bannersList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum banner cadastrado.</p>';
      } else {
        bannersList.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${banners.map(b => `
              <div class="card" style="padding: 12px; background: white; border: 1px solid var(--surface-200); display: flex; flex-direction: column; overflow: hidden; position: relative;">
                <div style="height: 120px; border-radius: 8px; background: var(--surface-100); overflow: hidden; margin-bottom: 12px; border: 1px solid var(--surface-100);">
                   ${b.Imagem_URL ? `<img src="${b.Imagem_URL}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">Sem imagem</div>'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                   <div>
                      <div style="font-weight: 800; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">${b.Titulo}</div>
                      <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Ordem: ${b.Ordem} â€¢ ${b.Ativo === 'Sim' ? '<span style="color:#10b981;">â— Ativo</span>' : '<span style="color:#94a3b8;">â—‹ Inativo</span>'}</div>
                   </div>
                   <button class="btn-icon btn-delete-banner" data-id="${b.id}" style="color: #dc2626; background: #fee2e2; border-radius: 8px; width: 32px; height: 32px;">
                      <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
                   </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        bannersList.querySelectorAll('.btn-delete-banner').forEach(btn => {
          btn.onclick = async () => {
            if (confirm('Remover este banner?')) {
              await deleteBanner(btn.dataset.id);
              showToast('Banner removido.', 'info');
              loadPortalData(userData);
            }
          };
        });
      }
    } catch (e) { console.error(e); }
  }
}

async function showNovoEventoModal(userData) {
  const { showToast } = await import('../../components/toast.js');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 500px; width: 90%;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
         <h2 class="modal-title" style="margin:0;">Publicar Novo Evento</h2>
         <button class="btn-icon btn-close-modal"><span class="material-symbols-rounded">close</span></button>
      </div>
      <form id="form-novo-evento">
        <div class="form-group">
          <label class="form-label">TÃ­tulo do Evento</label>
          <input type="text" id="ev-titulo" class="form-input" placeholder="Ex: ConferÃªncia de Jovens" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
          <div class="form-group"><label class="form-label">Data</label><input type="date" id="ev-data" class="form-input" required></div>
          <div class="form-group"><label class="form-label">Hora de InÃ­cio</label><input type="time" id="ev-hora" class="form-input" required></div>
        </div>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Breve DescriÃ§Ã£o / Local</label>
          <textarea id="ev-desc" class="form-input" style="height: 80px;" placeholder="Ex: Templo Principal, traga sua bÃ­blia..."></textarea>
        </div>
        <div class="modal-actions" style="margin-top: 32px;">
          <button type="submit" class="btn btn-primary" id="btn-save-ev" style="width: 100%; padding: 12px;">Publicar no Site</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('in-view'), 10);
  const close = () => { overlay.classList.remove('in-view'); setTimeout(() => overlay.remove(), 300); };
  overlay.querySelector('.btn-close-modal').onclick = close;

  document.getElementById('form-novo-evento').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-ev');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:white;border-top-color:transparent;"></div>';
    
    try {
      const dataHora = document.getElementById('ev-data').value + 'T' + document.getElementById('ev-hora').value;
      await createEventoPublico({
        Titulo: document.getElementById('ev-titulo').value,
        Descricao: document.getElementById('ev-desc').value,
        Data_Hora: dataHora
      });
      showToast('Evento criado com sucesso!', 'success');
      close();
      loadPortalData(userData);
    } catch (err) { console.error(err); showToast('Erro.', 'error'); btn.disabled = false; btn.innerText = 'Publicar no Site'; }
  };
}

async function showNovoBannerModal(userData) {
  const { showToast } = await import('../../components/toast.js');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 550px; width: 90%;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
         <h2 class="modal-title" style="margin:0;">Adicionar Banner</h2>
         <button class="btn-icon btn-close-modal"><span class="material-symbols-rounded">close</span></button>
      </div>
      <form id="form-novo-banner">
        <div class="form-group">
          <label class="form-label">TÃ­tulo do Banner (Apenas Interno)</label>
          <input type="text" id="bn-titulo" class="form-input" placeholder="Ex: Banner de Boas Vindas" required>
        </div>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">URL da Imagem</label>
          <div style="display:flex; gap:8px;">
             <input type="url" id="bn-img" class="form-input" placeholder="https://..." required style="flex:1;">
             <button type="button" class="btn btn-outline-light" id="btn-preview-img" style="white-space:nowrap;">Testar Link</button>
          </div>
        </div>
        
        <div id="banner-preview-area" style="margin-top: 16px; height: 160px; background: var(--surface-50); border: 2px dashed var(--surface-200); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
           <span style="color: var(--text-muted); font-size: 13px;">PrÃ©-visualizaÃ§Ã£o da Imagem</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px;">
          <div class="form-group"><label class="form-label">Ordem de ExibiÃ§Ã£o</label><input type="number" id="bn-ordem" class="form-input" value="1" min="1"></div>
          <div class="form-group"><label class="form-label">Status</label><select id="bn-ativo" class="form-input"><option value="Sim">Exibir no Site</option><option value="NÃ£o">Ocultar</option></select></div>
        </div>
        <div class="modal-actions" style="margin-top: 32px;">
          <button type="submit" class="btn btn-primary" id="btn-save-bn" style="width: 100%;">Salvar e Publicar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('in-view'), 10);
  const close = () => { overlay.classList.remove('in-view'); setTimeout(() => overlay.remove(), 300); };
  overlay.querySelector('.btn-close-modal').onclick = close;

  const inputImg = document.getElementById('bn-img');
  const previewArea = document.getElementById('banner-preview-area');
  
  document.getElementById('btn-preview-img').onclick = () => {
    const url = inputImg.value.trim();
    if (url) {
      previewArea.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\'color:#ef4444\'>URL de imagem invÃ¡lida ou bloqueada</span>'">`;
    }
  };

  document.getElementById('form-novo-banner').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-bn');
    btn.disabled = true;
    
    try {
      await createBanner({
        Titulo: document.getElementById('bn-titulo').value,
        Imagem_URL: document.getElementById('bn-img').value,
        Ordem: parseInt(document.getElementById('bn-ordem').value) || 1,
        Ativo: document.getElementById('bn-ativo').value
      });
      showToast('Banner adicionado!', 'success');
      close();
      loadPortalData(userData);
    } catch (err) { console.error(err); showToast('Erro.', 'error'); btn.disabled = false; }
  };
}
