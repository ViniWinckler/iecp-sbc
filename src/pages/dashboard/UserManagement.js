import { 
  getMinisteriosDoUsuario, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  createConvite,
  getMinisterios,
  deleteMinisterio
} from '../../services/db.js';
import { getRoleBadgeInline } from './Stats.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function renderMinisteriosTab(userData) {
  return `
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="margin: 0;">GestÃ£o de MinistÃ©rios</h3>
        ${userData.Nivel_Acesso === 'Admin' ? '<button class="btn btn-primary" id="btn-new-min" style="padding: 8px 16px; font-size: 12px; border: 1px solid #000;">+ Novo Ministério</button>' : ''}
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr><th>Nome</th><th>LÃ­der</th><th>Status</th><th>AÃ§Ãµes</th></tr>
          </thead>
          <tbody id="ministerios-table-body">
            <tr><td colspan="4"><div class="skeleton" style="height:40px; margin:10px;"></div></td></tr>
            <tr><td colspan="4"><div class="skeleton" style="height:40px; margin:10px;"></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export async function loadMinisteriosList(userData) {
  const tbody = document.getElementById('ministerios-table-body');
  if (!tbody) return;
  try {
    const { showToast } = await import('../../components/toast.js');
    // Bug 6 fix: getMinisterios e deleteMinisterio já importados no topo do arquivo
    const ministerios = await getMinisterios();
    
    if (ministerios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-muted);">Nenhum ministÃ©rio cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = ministerios.map(m => `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${m.Nome_Ministerio}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${m.Descricao || 'Sem descriÃ§Ã£o'}</div>
        </td>
        <td>
          <div style="font-size: 13px; color: var(--text-secondary);">${m.Lider_Responsavel_Email || '<span style="color:var(--text-muted);">NÃ£o definido</span>'}</div>
        </td>
        <td><span class="badge badge-success">Ativo</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            ${userData.Nivel_Acesso === 'Admin' ? `
              <button class="btn-icon btn-delete-min" data-id="${m.id}" data-nome="${m.Nome_Ministerio}" title="Excluir MinistÃ©rio" style="color: #ef4444; background: #fee2e2; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
              </button>
            ` : 'â€”'}
          </div>
        </td>
      </tr>
    `).join('');

    if (userData.Nivel_Acesso === 'Admin') {
      tbody.querySelectorAll('.btn-delete-min').forEach(btn => {
        btn.onclick = async () => {
          if (confirm(`Excluir o ministÃ©rio "${btn.dataset.nome}"? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`)) {
            try {
              await deleteMinisterio(btn.dataset.id);
              showToast('MinistÃ©rio removido.', 'success');
              loadMinisteriosList(userData);
            } catch (err) {
              showToast('Erro ao excluir.', 'error');
            }
          }
        };
      });
    }
  } catch (e) { 
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar ministÃ©rios.</td></tr>'; 
  }
}

export function setupMinisteriosActions(userData) {
  const btn = document.getElementById('btn-new-min');
  if (btn) btn.onclick = () => showNovoMinisterioModal(userData);
}

async function showNovoMinisterioModal(userData) {
  const { createMinisterio, getAllUsers } = await import('../../services/db.js');
  const { showToast } = await import('../../components/toast.js');
  
  const users = await getAllUsers();
  const potLeaders = users.filter(u => ['Admin', 'Pastor', 'Lider'].includes(u.Nivel_Acesso));

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3 style="margin-bottom: 24px;">Criar Novo MinistÃ©rio</h3>
      <form id="form-novo-min" style="display: grid; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Nome do MinistÃ©rio</label>
          <input type="text" id="min-nome" class="form-input" placeholder="Ex: Louvor e AdoraÃ§Ã£o" required>
        </div>
        <div class="form-group">
          <label class="form-label">DescriÃ§Ã£o</label>
          <textarea id="min-desc" class="form-input" style="height: 80px;" placeholder="Qual o propÃ³sito deste ministÃ©rio?"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">E-mail do LÃ­der ResponsÃ¡vel</label>
          <select id="min-lider" class="form-input" required>
            <option value="">Selecione um lÃ­der...</option>
            ${potLeaders.map(u => `<option value="${u.Email}">${u.Nome_Exibicao} (${u.Email})</option>`).join('')}
          </select>
        </div>
        <div class="modal-actions" style="margin-top: 16px;">
          <button type="submit" class="btn btn-primary" id="btn-save-min" style="flex: 2;">Confirmar CriaÃ§Ã£o</button>
          <button type="button" class="btn btn-outline-light btn-cancel" style="flex: 1; color: var(--text-secondary);">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.btn-cancel').onclick = () => modal.remove();
  
  document.getElementById('form-novo-min').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-min');
    btn.disabled = true;
    btn.innerText = 'Criando...';

    try {
      await createMinisterio({
        Nome_Ministerio: document.getElementById('min-nome').value,
        Descricao: document.getElementById('min-desc').value,
        Lider_Responsavel_Email: document.getElementById('min-lider').value
      });
      showToast('MinistÃ©rio criado com sucesso!', 'success');
      modal.remove();
      loadMinisteriosList(userData);
    } catch (err) {
      showToast('Erro ao criar ministÃ©rio.', 'error');
      btn.disabled = false;
      btn.innerText = 'Confirmar CriaÃ§Ã£o';
    }
  };
}

export function renderMembrosTab(userData) {
  return `
    <div style="margin-bottom: 24px;">
      <div style="position: relative; max-width: 400px;">
        <span class="material-symbols-rounded" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 20px;">search</span>
        <input type="text" id="membros-search" class="form-input" placeholder="Buscar membros pelo nome ou e-mail..." style="padding-left: 40px; background: white; border-radius: 12px;">
      </div>
    </div>

    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px; flex-wrap: wrap;">
        <h3 style="margin: 0;">Membros e LideranÃ§a</h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline-light" id="btn-export-pdf" style="padding: 8px 16px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded" style="font-size: 18px;">picture_as_pdf</span>
            Exportar PDF
          </button>
          ${userData.Nivel_Acesso === 'Admin' || userData.Nivel_Acesso === 'Lider' ? '<button class="btn btn-primary" id="btn-invite-member" style="padding: 8px 16px; font-size: 12px;">Convidar Membro</button>' : ''}
        </div>
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr><th>Nome/E-mail</th><th>Telefone</th><th>NÃ­vel</th><th>AÃ§Ãµes</th></tr>
          </thead>
          <tbody id="membros-table-body">
            <tr><td colspan="4"><div class="skeleton" style="height:40px; margin:10px;"></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function setupMembrosActions(userData) {
  const btnPdf = document.getElementById('btn-export-pdf');
  if (btnPdf) btnPdf.onclick = () => exportMembrosToPDF(userData);

  const btnInvite = document.getElementById('btn-invite-member');
  if (btnInvite) btnInvite.onclick = () => showInviteModal(userData);

  const search = document.getElementById('membros-search');
  if (search) {
    search.oninput = () => loadMembrosList(userData, search.value);
  }

  loadMembrosList(userData);
}

async function exportMembrosToPDF(userData) {
  const { showToast } = await import('../../components/toast.js');
  try {
    const users = await getAllUsers();
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('RelatÃ³rio de Membros - IECP SBC', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} Ã s ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

    const tableData = users.map(u => [
      u.Nome_Exibicao || 'Sem Nome',
      u.Email || 'Sem E-mail',
      u.Telefone || '--',
      u.Nivel_Acesso || 'Membro'
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Nome', 'E-mail', 'Telefone', 'NÃ­vel']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] }, // --primary-600 approx
      styles: { fontSize: 10, cellPadding: 4 },
    });

    doc.save('relatorio_membros_iecp.pdf');
    showToast('PDF gerado com sucesso!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Erro ao gerar PDF.', 'error');
  }
}

export async function loadMembrosList(userData, filter = '') {
  const tbody = document.getElementById('membros-table-body');
  if (!tbody) return;
  try {
    const { showToast } = await import('../../components/toast.js');
    const users = await getAllUsers();
    
    const filtered = users.filter(u => 
      u.Nome_Exibicao?.toLowerCase().includes(filter.toLowerCase()) || 
      u.Email?.toLowerCase().includes(filter.toLowerCase())
    );

    const isSuperAdmin = userData.Email === 'vini.wincklerferreira@gmail.com';

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-muted);">Nenhum membro encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(u => {
      const initials = u.Nome_Exibicao?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || '??';
      const isSelf = u.Email === userData.Email;
      const isMainAdmin = u.Email === 'vini.wincklerferreira@gmail.com';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--primary-100); color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">
                ${initials}
              </div>
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">${u.Nome_Exibicao} ${isSelf ? '<span style="font-weight:400; color:var(--text-muted); font-size:11px;">(VocÃª)</span>' : ''}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${u.Email}</div>
              </div>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-secondary);">${u.Telefone || '<span style="color:var(--text-muted);">NÃ£o inf.</span>'}</td>
          <td>${u.Nivel_Acesso === 'Pastor_Pendente'
            ? `<span class="badge" style="background:#fefce8;color:#854d0e;border:1px solid #fde68a;gap:4px;"><span class="material-symbols-rounded" style="font-size:12px;">hourglass_top</span>Pastor (Pendente)</span>`
            : getRoleBadgeInline(u.Nivel_Acesso)
          }</td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${isSuperAdmin ? `
                <select class="form-input role-select" data-uid="${u.id}" ${isMainAdmin ? 'disabled' : ''} style="padding: 6px 10px; font-size: 12px; border-radius: 8px; width: 110px; height: 32px; background: ${isMainAdmin ? 'var(--surface-100)' : 'var(--surface-50)'};">
                  <option value="Membro" ${u.Nivel_Acesso === 'Membro' ? 'selected' : ''}>Membro</option>
                  <option value="Lider" ${u.Nivel_Acesso === 'Lider' ? 'selected' : ''}>LÃ­der</option>
                  <option value="Pastor" ${u.Nivel_Acesso === 'Pastor' ? 'selected' : ''}>Pastor</option>
                  <option value="Admin" ${u.Nivel_Acesso === 'Admin' ? 'selected' : ''}>Admin</option>
                </select>
                
                ${!isMainAdmin ? `
                  <button class="btn-icon btn-delete-user" data-uid="${u.id}" data-nome="${u.Nome_Exibicao}" title="Excluir Conta" style="color: #ef4444; background: #fee2e2; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
                  </button>
                ` : '<div style="width: 32px;"></div>'}
              ` : '<span style="font-size:11px;color:var(--text-muted); padding-left: 8px;">Apenas leitura</span>'}
              ${isSuperAdmin && u.Nivel_Acesso === 'Pastor_Pendente' ? `
                <button class="btn-icon btn-approve-pastor" data-uid="${u.id}" data-nome="${u.Nome_Exibicao}" title="Aprovar como Pastor" style="color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-rounded" style="font-size: 18px;">check_circle</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Select Actions
    if (isSuperAdmin) {
      tbody.querySelectorAll('.role-select').forEach(sel => {
        sel.onchange = async () => {
          try {
            await updateUserRole(sel.dataset.uid, sel.value, userData.Email);
            showToast(`PermissÃ£o atualizada para ${sel.value}`, 'success');
            loadMembrosList(userData);
          } catch (err) { 
            showToast(err.message || 'Erro ao atualizar.', 'error'); 
            loadMembrosList(userData);
          }
        };
      });

      // Bind Delete Actions
      tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.onclick = async () => {
          const nome = btn.dataset.nome;
          const uid = btn.dataset.uid;
          if (confirm(`TEM CERTEZA? Isso excluirÃ¡ permanentemente a conta de ${nome} e todos os acessos vinculados.`)) {
            try {
              await deleteUser(uid, userData.Email);
              showToast(`Conta de ${nome} excluÃ­da com sucesso.`, 'info');
              loadMembrosList(userData);
            } catch (err) {
              showToast(err.message || 'Erro ao excluir conta.', 'error');
            }
          }
        };
      });

      // Bind Approve Pastor Actions
      tbody.querySelectorAll('.btn-approve-pastor').forEach(btn => {
        btn.onclick = async () => {
          const nome = btn.dataset.nome;
          if (confirm(`Aprovar "${nome}" como Pastor? Isso liberará acesso completo ao painel pastoral.`)) {
            try {
              await updateUserRole(btn.dataset.uid, 'Pastor', userData.Email);
              showToast(`${nome} aprovado(a) como Pastor!`, 'success');
              loadMembrosList(userData);
            } catch (err) {
              showToast(err.message || 'Erro ao aprovar.', 'error');
            }
          }
        };
      });
    }
  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar.</td></tr>';
  }
}


async function showInviteModal(userData) {
  const { showToast } = await import('../../components/toast.js');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3 style="margin-bottom: 20px;">Convidar Novo Membro</h3>
      <form id="invite-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group"><label class="form-label">E-mail</label><input type="email" id="invite-email" class="form-input" required></div>
        <div class="form-group"><label class="form-label">MinistÃ©rio</label><select id="invite-min" class="form-input" required></select></div>
        <div class="form-group"><label class="form-label">FunÃ§Ã£o</label><input type="text" id="invite-role" class="form-input" placeholder="Ex: Guitarrista" required></div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Enviar</button>
          <button type="button" class="btn btn-secondary btn-cancel" style="padding: 10px 20px;">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const select = document.getElementById('invite-min');
  try {
    const list = await getMinisteriosDoUsuario(userData.Email);
    select.innerHTML = '<option value="">Selecione...</option>' + list.map(m => `<option value="${m.id}">${m.Nome_Ministerio}</option>`).join('');
  } catch(e) { console.error(e); }

  modal.querySelector('.btn-cancel').onclick = () => modal.remove();
  document.getElementById('invite-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await createConvite({
        Email_Convidado: document.getElementById('invite-email').value,
        ID_Ministerio: document.getElementById('invite-min').value,
        Funcao_no_Ministerio: document.getElementById('invite-role').value
      });
      showToast('Convite enviado!', 'success');
      modal.remove();
    } catch (err) { showToast('Erro ao enviar.', 'error'); }
  };
}

export function renderAccountTab(userData) {
  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <div class="card" style="padding: 32px; background: white;">
        <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--surface-100);">
           <div style="width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, var(--primary-500), var(--primary-600)); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);">
             <span class="material-symbols-rounded" style="font-size: 40px;">person</span>
           </div>
           <div>
             <h2 style="font-size: 22px; font-weight: 800; margin: 0;">${userData.Nome_Exibicao}</h2>
             <p style="color: var(--text-muted); margin: 4px 0 0 0;">${userData.Email}</p>
           </div>
        </div>

        <form id="form-minha-conta">
          <div style="display: grid; gap: 20px;">
            <div class="form-group">
              <label class="form-label">Nome de ExibiÃ§Ã£o</label>
              <input type="text" id="acc-nome" class="form-input" value="${userData.Nome_Exibicao || ''}" required style="background: var(--surface-50);">
            </div>
            <div class="form-group">
              <label class="form-label">Telefone / WhatsApp</label>
              <input type="text" id="acc-telefone" class="form-input" value="${userData.Telefone || ''}" placeholder="(00) 00000-0000" style="background: var(--surface-50); font-family: monospace;">
            </div>
            <div class="form-group">
              <label class="form-label">NÃ­vel de Acesso</label>
              <div style="padding: 12px 16px; background: var(--surface-100); border-radius: 12px; color: var(--text-secondary); font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-rounded" style="font-size: 18px;">verified_user</span>
                ${userData.Nivel_Acesso}
              </div>
            </div>
          </div>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--surface-100);">
            <button type="submit" class="btn btn-primary" id="btn-save-acc" style="width: 100%;">Salvar AlteraÃ§Ãµes</button>
            <p style="font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 16px;">
              DÃºvidas sobre o sistema? Procure a secretaria.
            </p>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function setupAccountActions(userData) {
  const phoneInput = document.getElementById('acc-telefone');
  if (phoneInput) {
    phoneInput.oninput = (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    };
  }

  const form = document.getElementById('form-minha-conta');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const { updateUser } = await import('../../services/db.js');
      const { showToast } = await import('../../components/toast.js');
      
      const btn = document.getElementById('btn-save-acc');
      btn.disabled = true;
      btn.innerText = 'Salvando...';

      try {
        await updateUser(userData.Firebase_UID, {
          Nome_Exibicao: document.getElementById('acc-nome').value,
          Telefone: document.getElementById('acc-telefone').value
        });
        showToast('Dados atualizados com sucesso!', 'success');
        // Update local session data via auth listener would be ideal, 
        // but for now we reload or update manually if needed.
      } catch (err) {
        showToast('Erro ao atualizar dados.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Salvar AlteraÃ§Ãµes';
      }
    };
  }
}
