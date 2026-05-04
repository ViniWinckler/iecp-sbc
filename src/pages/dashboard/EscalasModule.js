import {
  getMembrosMinisterio, 
  createEscala, 
  responderEscala,
  deleteEscala,
  getEscalasDoMembro,
  getEscalasDoMinisterio,
  getMinisteriosDoUsuario
} from '../../services/db.js';
import { showToast } from '../../components/toast.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

let currentEscalasView = 'minhas';

export function renderEscalasTab(userData) {
  const isLeader = ['Admin', 'Pastor', 'Lider'].includes(userData.Nivel_Acesso);

  return `
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 28px; font-weight: 850; margin-bottom: 8px;">GestÃ£o de <span class="text-gradient">Escalas</span></h2>
          <p style="color: var(--text-secondary);">Visualize suas escalas e confirme presenÃ§a.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline-light" id="btn-export-escalas" style="padding: 10px 20px; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-rounded" style="font-size: 20px;">picture_as_pdf</span>
            RelatÃ³rios
          </button>
          ${isLeader ? `
            <button class="btn btn-primary" id="btn-nova-escala" style="padding: 10px 20px;">
              <span class="material-symbols-rounded" style="font-size: 20px;">add_circle</span>
              Nova Escala
            </button>
          ` : ''}
        </div>
      </div>

      <div class="tabs-subnav" style="display: flex; gap: 24px; margin-bottom: 24px; border-bottom: 1px solid var(--surface-200);">
        <button class="escalas-subtab active" data-target="minhas" style="background: none; border: none; font-weight: 600; color: var(--primary-600); border-bottom: 2px solid var(--primary-600); padding: 8px 0; cursor: pointer; transform: translateY(1px);">Minhas Escalas</button>
        ${isLeader ? `<button class="escalas-subtab" data-target="gerenciar" style="background: none; border: none; font-weight: 500; color: var(--text-secondary); border-bottom: 2px solid transparent; padding: 8px 0; cursor: pointer; transform: translateY(1px);">Escalas dos MinistÃ©rios</button>` : ''}
      </div>

      <div id="escalas-feed" style="display: grid; gap: 20px;">
        <div class="card" style="padding: 40px; text-align: center; background: white;">
          <div class="loader-spinner" style="margin: 0 auto 16px;"></div>
          <p>Carregando escalas...</p>
        </div>
      </div>
    </div>
  `;
}

export function setupEscalasActions(userData) {
  const btnNova = document.getElementById('btn-nova-escala');
  if (btnNova) btnNova.onclick = () => showNovaEscalaModal(userData);

  const btnExport = document.getElementById('btn-export-escalas');
  if (btnExport) btnExport.onclick = () => exportEscalasToPDF(userData);

  document.querySelectorAll('.escalas-subtab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.escalas-subtab').forEach(b => {
        b.classList.remove('active');
        b.style.borderBottomColor = 'transparent';
        b.style.color = 'var(--text-secondary)';
      });
      btn.classList.add('active');
      btn.style.borderBottomColor = 'var(--primary-600)';
      btn.style.color = 'var(--primary-600)';
      currentEscalasView = btn.dataset.target;
      loadEscalasList(userData);
    };
  });
  
  loadEscalasList(userData);
}

async function exportEscalasToPDF(userData) {
  const { showToast } = await import('../../components/toast.js');
  const { getMinisteriosDoUsuario, getEscalasDoMinisterio } = await import('../../services/db.js');
  
  try {
    const mios = await getMinisteriosDoUsuario(userData.Email);
    if (mios.length === 0) {
      showToast('Nenhum ministÃ©rio encontrado para exportar.', 'warning');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RelatÃ³rio de Escalas - IECP SBC', 14, 22);
    
    let currentY = 32;

    for (const m of mios) {
      const escalas = await getEscalasDoMinisterio(m.id);
      if (escalas.length === 0) continue;

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text(`MinistÃ©rio: ${m.Nome_Ministerio}`, 14, currentY);
      currentY += 8;

      const tableData = escalas.map(e => [
        `${new Date(e.Data + 'T00:00:00').toLocaleDateString('pt-BR')} ${e.Hora}`,
        e.Titulo_Evento,
        e.Membros_Escalados?.map(mem => `${mem.nome} (${mem.funcao}) [${mem.status}]`).join('\n') || '--'
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Data/Hora', 'Evento', 'Membros']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 40 },
          2: { cellWidth: 100 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    doc.save(`escalas_ministerios_${new Date().getTime()}.pdf`);
    showToast('RelatÃ³rio de escalas gerado!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Erro ao gerar relatÃ³rio.', 'error');
  }
}

async function loadEscalasList(userData) {
  const feed = document.getElementById('escalas-feed');
  if (!feed) return;
  feed.innerHTML = `
    <div class="card skeleton" style="height: 140px; margin-bottom: 20px;"></div>
    <div class="card skeleton" style="height: 140px; margin-bottom: 20px;"></div>
    <div class="card skeleton" style="height: 140px; margin-bottom: 20px;"></div>
  `;

  try {
    if (currentEscalasView === 'minhas') {
      const escalas = await getEscalasDoMembro(userData.Email);
      if (escalas.length === 0) {
        feed.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">VocÃª nÃ£o possui escalas programadas.</div>';
        return;
      }
      feed.innerHTML = renderEscalasFeedView(escalas, userData.Email, true);
      bindEscalaRespostas(userData.Email, userData);
    } else {
      const mios = await getMinisteriosDoUsuario(userData.Email);
      if (mios.length === 0) {
         feed.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">VocÃª nÃ£o lidera nenhum ministÃ©rio ainda.</div>';
         return;
      }
      
      let allEscalas = [];
      for (const m of mios) {
        const es = await getEscalasDoMinisterio(m.id);
        allEscalas = allEscalas.concat(es.map(x => ({...x, MinisterioNome: m.Nome_Ministerio})));
      }

      if (allEscalas.length === 0) {
        feed.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">Nenhuma escala encontrada.</div>';
        return;
      }

      allEscalas.sort((a, b) => new Date(b.Data) - new Date(a.Data));
      feed.innerHTML = renderEscalasFeedView(allEscalas, userData.Email, false);
      bindEscalaRespostas(userData.Email, userData);
    }
  } catch (err) {
    console.error(err);
    feed.innerHTML = '<div style="color: red; padding: 20px;">Erro ao carregar escalas.</div>';
  }
}

function formatDate(dateStr) {
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const formatted = date.toLocaleDateString('pt-BR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function renderEscalasFeedView(escalas, userEmail, isMinhaVisao) {
  const badgeMap = {
    'Pendente': '<span class="badge badge-warning" style="gap:4px;"><span class="material-symbols-rounded" style="font-size:14px;">hourglass_empty</span>Pendente</span>',
    'Confirmado': '<span class="badge badge-success" style="gap:4px;"><span class="material-symbols-rounded" style="font-size:14px;">check_circle</span>Confirmado</span>',
    'Recusado': '<span class="badge" style="background:#fee2e2; color:#dc2626; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px;">cancel</span>Recusado</span>'
  };

  return escalas.map(e => {
    let myStatus = null;
    let myFuncao = null;
    if (e.Membros_Escalados) {
      const me = e.Membros_Escalados.find(m => m.email === userEmail);
      if (me) {
        myStatus = me.status;
        myFuncao = me.funcao;
      }
    }

    const isPast = new Date(e.Data + 'T00:00:00') < new Date().setHours(0,0,0,0);

    return `
      <div class="card" style="padding: 24px; background: white; border-left: 4px solid ${isPast ? '#cbd5e1' : 'var(--primary-500)'}; transition: transform 0.2s; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div style="flex: 1; min-width: 250px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
               <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--surface-50); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--surface-100);">
                  <span style="font-size: 10px; font-weight: 700; color: var(--primary-600); text-transform: uppercase;">${new Date(e.Data + 'T00:00:00').toLocaleDateString('pt-BR', {month: 'short'}).replace('.','')}</span>
                  <span style="font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1;">${(() => { const d = new Date(e.Data + 'T00:00:00'); return d.getDate(); })()}</span>
               </div>
               <div>
                  <h3 style="font-size: 18px; margin: 0; font-weight: 800; color: var(--text-primary);">${e.Titulo_Evento}</h3>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                     <p style="color: var(--text-secondary); margin: 0; font-size: 13px; display: flex; align-items: center; gap: 4px; font-weight: 500;">
                       <span class="material-symbols-rounded" style="font-size: 16px; color: var(--accent-600);">schedule</span>
                       ${e.Hora} â€” ${formatDate(e.Data)}
                     </p>
                     ${!isMinhaVisao && e.MinisterioNome ? `<span class="badge badge-primary" style="font-size: 10px; padding: 2px 8px;">${e.MinisterioNome}</span>` : ''}
                  </div>
               </div>
            </div>

            ${isMinhaVisao && myFuncao ? `
              <div style="margin-top: 16px; padding: 12px 16px; background: var(--primary-50); border-radius: 12px; display: inline-flex; align-items: center; gap: 10px; border: 1px solid var(--primary-100);">
                 <span class="material-symbols-rounded" style="color: var(--primary-600); font-size: 20px;">assignment_ind</span>
                 <div>
                    <div style="font-size: 11px; color: var(--primary-700); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Sua FunÃ§Ã£o</div>
                    <div style="font-size: 14px; color: var(--primary-900); font-weight: 600;">${myFuncao}</div>
                 </div>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
            ${isMinhaVisao && myStatus ? badgeMap[myStatus] : ''}
            
            <div style="display: flex; gap: 8px; align-items: center;">
              ${!isMinhaVisao ? `
                <button class="btn-icon btn-delete-escala" data-id="${e.id}" title="Excluir Escala" style="background: #fee2e2; color: #dc2626; border-radius: 8px; width: 36px; height: 36px;">
                  <span class="material-symbols-rounded" style="font-size: 20px;">delete</span>
                </button>
              ` : ''}

              ${isMinhaVisao && myStatus === 'Pendente' ? `
                <div style="display: flex; gap: 8px;" id="actions-${e.id}">
                  <button class="btn btn-primary btn-responder-escala" data-id="${e.id}" data-resposta="Confirmado" style="background: #10B981; border-color: #10B981; padding: 8px 16px; text-transform: none; font-size: 13px;">
                    Confirmar PresenÃ§a
                  </button>
                  <button class="btn btn-outline-light btn-responder-escala" data-id="${e.id}" data-resposta="Recusado" style="color: #dc2626; border-color: #fca5a5; padding: 8px 16px; text-transform: none; font-size: 13px;">
                    Recusar
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${!isMinhaVisao && e.Membros_Escalados ? `
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--surface-100);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
               <p style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin: 0;">Equipe Escalada</p>
               <span style="font-size: 11px; color: var(--text-muted);">${e.Membros_Escalados.length} integrantes</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
              ${e.Membros_Escalados.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-50); padding: 10px 12px; border-radius: 12px; border: 1px solid var(--surface-100);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: white; color: var(--text-primary); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border: 1px solid var(--surface-200);">
                       ${m.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2;">${m.nome.split(' ')[0]}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${m.funcao}</div>
                    </div>
                  </div>
                  <div>
                    ${m.status === 'Confirmado' ? '<span class="material-symbols-rounded" style="color: #10B981; font-size: 18px;">check_circle</span>' : 
                      m.status === 'Recusado' ? '<span class="material-symbols-rounded" style="color: #ef4444; font-size: 18px;">cancel</span>' :
                      '<span class="material-symbols-rounded" style="color: #f59e0b; font-size: 18px;">hourglass_top</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function bindEscalaRespostas(email, userData) {
  document.querySelectorAll('.btn-delete-escala').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Deseja excluir esta escala permanentemente?')) {
        try {
          await deleteEscala(btn.dataset.id);
          showToast('Escala excluÃ­da.', 'info');
          loadEscalasList(userData);
        } catch (e) {
          showToast('Erro ao excluir escala.', 'error');
        }
      }
    };
  });

  document.querySelectorAll('.btn-responder-escala').forEach(btn => {
    btn.onclick = async () => {
      const escalaId = btn.dataset.id;
      const resposta = btn.dataset.resposta;
      
      const container = document.getElementById(`actions-${escalaId}`);
      if (container) {
        container.innerHTML = '<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:var(--primary-500);border-top-color:transparent;"></div>';
      }

      try {
        const { showToast } = await import('../../components/toast.js');
        await responderEscala(escalaId, email, resposta);
        showToast(`Sua resposta foi enviada: ${resposta}`, 'success');
        loadEscalasList(userData);
      } catch (err) {
        console.error(err);
        showToast('Erro ao salvar resposta.', 'error');
        loadEscalasList(userData);
      }
    };
  });
}

async function showNovaEscalaModal(userData) {
  const { showToast } = await import('../../components/toast.js');

  const ministerios = await getMinisteriosDoUsuario(userData.Email);
  if (ministerios.length === 0) {
    showToast('VocÃª precisa liderar um ministÃ©rio para criar escalas.', 'error');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-nova-escala';
  
  overlay.innerHTML = `
    <div class="modal" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 class="modal-title" style="margin: 0;">Nova Escala</h2>
        <button class="btn-icon" id="fechar-escala-modal"><span class="material-symbols-rounded">close</span></button>
      </div>
      
      <form id="form-nova-escala">
        <div class="form-group">
          <label class="form-label">MinistÃ©rio</label>
          <select id="escala-min" class="form-input" required>
            <option value="">Selecione o ministÃ©rio...</option>
            ${ministerios.map(m => `<option value="${m.id}">${m.Nome_Ministerio}</option>`).join('')}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Nome do Evento</label>
            <input type="text" id="escala-titulo" class="form-input" placeholder="Ex: Culto de Domingo" required>
          </div>
          <div class="form-group">
            <label class="form-label">Data</label>
            <input type="date" id="escala-data" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Hora</label>
            <input type="time" id="escala-hora" class="form-input" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Repetir esta escala?</label>
            <select id="escala-recorrencia" class="form-input">
              <option value="none">NÃ£o repetir</option>
              <option value="4">Repetir para as prÃ³ximas 4 semanas</option>
              <option value="8">Repetir para as prÃ³ximas 8 semanas</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">DescriÃ§Ã£o / ObservaÃ§Ãµes (Opcional)</label>
          <textarea id="escala-descricao" class="form-input" style="height: 60px;" placeholder="Ex: Trazer violÃ£o, tema serÃ¡ GratidÃ£o..."></textarea>
        </div>

        <div id="membros-container" style="margin-top: 24px; display: none;">
          <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-primary);">Membros DisponÃ­veis</h4>
          <div id="lista-membros" style="display: grid; gap: 8px;"></div>
        </div>

        <div class="modal-actions" style="margin-top: 32px;">
          <button type="submit" class="btn btn-primary" id="btn-salvar-escala" style="width: 100%;">Criar Escala</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('in-view'), 10);

  document.getElementById('fechar-escala-modal').onclick = () => {
    overlay.classList.remove('in-view');
    setTimeout(() => overlay.remove(), 300);
  };

  const minSelect = document.getElementById('escala-min');
  const checkContainer = document.getElementById('membros-container');
  const listaMembros = document.getElementById('lista-membros');

  minSelect.onchange = async () => {
    const val = minSelect.value;
    if (!val) {
      checkContainer.style.display = 'none';
      return;
    }

    listaMembros.innerHTML = '<div class="loader-spinner" style="margin: 20px auto;"></div>';
    checkContainer.style.display = 'block';

    try {
      const membrosReq = await getMembrosMinisterio(val);
      if (membrosReq.length === 0) {
        listaMembros.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Nenhum membro ativo neste ministÃ©rio.</p>';
        return;
      }

      listaMembros.innerHTML = membrosReq.map(m => `
        <div style="display: flex; align-items: center; gap: 12px; background: var(--surface-50); padding: 12px; border-radius: 8px; border: 1px solid var(--surface-200);">
          <input type="checkbox" class="escala-membro-check" id="check-${m.Email_Convidado}" value="${m.Email_Convidado}" data-nome="${m.Nome_Convidado || m.Email_Convidado}" style="width: 18px; height: 18px; accent-color: var(--primary-600);">
          <label for="check-${m.Email_Convidado}" style="flex: 1; font-size: 14px; font-weight: 500; cursor: pointer;">${m.Nome_Convidado || m.Email_Convidado}</label>
          <input type="text" class="form-input escala-membro-funcao" data-email="${m.Email_Convidado}" placeholder="FunÃ§Ã£o" style="width: 180px; font-size: 12px; padding: 6px 12px;">
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
      listaMembros.innerHTML = '<p style="color: red; font-size: 13px;">Erro ao buscar membros.</p>';
    }
  };

  document.getElementById('form-nova-escala').onsubmit = async (e) => {
    e.preventDefault();
    const minId = minSelect.value;
    const titulo = document.getElementById('escala-titulo').value;
    const data = document.getElementById('escala-data').value;
    const hora = document.getElementById('escala-hora').value;
    const descricao = document.getElementById('escala-descricao').value;
    const recorrenciaVal = document.getElementById('escala-recorrencia').value;

    const selecionados = Array.from(document.querySelectorAll('.escala-membro-check:checked'));
    if (selecionados.length === 0) {
      showToast('Selecione pelo menos um membro para compor a escala.', 'warning');
      return;
    }

    const membrosPayload = selecionados.map(check => {
      const email = check.value;
      const nome = check.dataset.nome;
      const funcaoInput = document.querySelector(`.escala-membro-funcao[data-email="${email}"]`);
      return {
        email: email,
        nome: nome,
        funcao: funcaoInput.value.trim() || 'Escalado',
        status: 'Pendente'
      };
    });

    const btn = document.getElementById('btn-salvar-escala');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:white;border-top-color:transparent;"></div>';

    try {
      const numRepeticoes = recorrenciaVal === 'none' ? 1 : parseInt(recorrenciaVal);
      
      for (let i = 0; i < numRepeticoes; i++) {
        const dataAtualArr = data.split('-');
        const novaData = new Date(dataAtualArr[0], dataAtualArr[1] - 1, dataAtualArr[2]);
        novaData.setDate(novaData.getDate() + (i * 7));
        
        // Bug 4 fix: toISOString() retorna UTC e perde 1 dia no Brasil.
        // Montar a string de data manualmente com valores locais.
        const yyyy = novaData.getFullYear();
        const mm = String(novaData.getMonth() + 1).padStart(2, '0');
        const dd = String(novaData.getDate()).padStart(2, '0');
        const dataStr = `${yyyy}-${mm}-${dd}`;

        await createEscala({
          ID_Ministerio: minId,
          Titulo_Evento: titulo,
          Data: dataStr,
          Hora: hora,
          Descricao: descricao,
          Criado_Por: userData.Email,
          Membros_Escalados: membrosPayload
        });
      }

      showToast(numRepeticoes > 1 ? `${numRepeticoes} escalas criadas!` : 'Escala criada com sucesso!', 'success');
      document.getElementById('fechar-escala-modal').click();
      loadEscalasList(userData);
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar escala.', 'error');
      btn.disabled = false;
      btn.innerText = 'Criar Escala';
    }
  };
}
