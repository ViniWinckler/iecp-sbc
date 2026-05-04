import {
  autoUpdateProjectProgress, 
  createTarefa, 
  getAllUsers,
  deleteProjeto,
  deleteTarefa,
  getAllProjetos,
  createProjeto,
  getTarefasPorProjeto,
  updateTarefaStatus,
  getProjeto
} from '../../services/db.js';
import { showToast } from '../../components/toast.js';

export function renderProjetosTab(userData) {
  return `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 28px; font-weight: 850; margin-bottom: 8px;">Projetos e <span class="text-gradient">Demandas</span></h2>
          <p style="color: var(--text-secondary);">Gerencie os fluxos de trabalho da IECP SBC.</p>
        </div>
        <button class="btn btn-primary" id="btn-novo-projeto" style="padding: 10px 24px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
          <span class="material-symbols-rounded" style="font-size: 20px;">add_task</span>
          Novo Projeto
        </button>
      </div>

      <div id="projetos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
        <div class="card" style="padding: 40px; text-align: center; background: white; grid-column: 1 / -1;">
          <div class="loader-spinner" style="margin: 0 auto 16px;"></div>
          <p>Carregando projetos...</p>
        </div>
      </div>
    </div>
  `;
}

export function setupProjetosActions(userData) {
  const btnNovo = document.getElementById('btn-novo-projeto');
  if (btnNovo) btnNovo.onclick = () => showNovoProjetoModal(userData);
  
  loadProjetosList(userData);
}

async function loadProjetosList(userData) {
  const grid = document.getElementById('projetos-grid');
  if (!grid) return;

  try {
    const projetos = await getAllProjetos();

    if (projetos.length === 0) {
      grid.innerHTML = `
        <div class="card" style="padding: 60px; text-align: center; background: white; grid-column: 1 / -1; border: 2px dashed var(--surface-200);">
          <span class="material-symbols-rounded" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;">inventory_2</span>
          <h3 style="color: var(--text-primary); margin-bottom: 8px;">Nenhum projeto ativo</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">Comece criando um novo projeto para organizar as demandas.</p>
          <button class="btn btn-outline-primary" style="margin: 0 auto;" id="btn-first-project">Criar Meu Primeiro Projeto</button>
        </div>
      `;
      const btnFirst = document.getElementById('btn-first-project');
      if (btnFirst) btnFirst.onclick = () => showNovoProjetoModal(userData);
      return;
    }

    grid.innerHTML = projetos.map(p => `
      <div class="card project-card" style="padding: 24px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s ease; border: 1px solid var(--surface-100); position: relative; overflow: hidden;" data-id="${p.id}">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${p.Status === 'Concluido' ? 'var(--success-500)' : 'var(--primary-500)'};"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <span class="badge ${p.Status === 'Concluido' ? 'badge-success' : 'badge-primary'}" style="font-size: 10px;">${p.Status}</span>
          <button class="btn-icon btn-delete-project" data-id="${p.id}" title="Excluir Projeto" style="background: #fee2e2; color: #ef4444; width: 28px; height: 28px;">
            <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
          </button>
        </div>
        <h3 style="font-size: 18px; margin-bottom: 8px; font-weight: 800; color: var(--text-primary);">${p.Titulo}</h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.5; min-height: 42px;">
          ${p.Descricao || 'Sem descriÃ§Ã£o definida.'}
        </p>
        
        <div style="margin-top: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Progresso</span>
            <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">${p.Progresso || 0}%</span>
          </div>
          <div style="height: 8px; background: var(--surface-50); border-radius: 10px; overflow: hidden; border: 1px solid var(--surface-100);">
            <div style="width: ${p.Progresso || 0}%; height: 100%; background: var(--primary-500); border-radius: 10px; transition: width 0.8s ease;"></div>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.project-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.btn-delete-project')) return;
        showKanbanBoard(card.dataset.id, userData);
      };
    });

    grid.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm('Deseja realmente excluir este projeto e todas as suas tarefas?')) {
          try {
            await deleteProjeto(btn.dataset.id);
            showToast('Projeto removido.', 'info');
            loadProjetosList(userData);
          } catch (err) { console.error(err); }
        }
      };
    });

  } catch (e) {
    console.error(e);
    grid.innerHTML = '<p>Erro ao carregar projetos.</p>';
  }
}

async function showNovoProjetoModal(userData) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 450px; width: 90%;">
      <h2 class="modal-title">Novo Projeto</h2>
      <form id="form-novo-projeto">
        <div class="form-group">
          <label class="form-label">TÃ­tulo do Projeto</label>
          <input type="text" id="proj-titulo" class="form-input" placeholder="Ex: Reforma da Fachada" required>
        </div>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">DescriÃ§Ã£o Breve</label>
          <textarea id="proj-desc" class="form-input" style="height: 100px;" placeholder="Qual o objetivo desse projeto?"></textarea>
        </div>
        <div class="modal-actions" style="margin-top: 24px;">
          <button type="button" class="btn btn-outline-light" id="btn-cancel-proj" style="flex: 1;">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-save-proj" style="flex: 2;">Criar Projeto</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('in-view'), 10);
  const close = () => { overlay.classList.remove('in-view'); setTimeout(() => overlay.remove(), 300); };
  document.getElementById('btn-cancel-proj').onclick = close;

  document.getElementById('form-novo-projeto').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await createProjeto({
        Titulo: document.getElementById('proj-titulo').value,
        Descricao: document.getElementById('proj-desc').value,
        Criado_Por: userData.Email
      });
      showToast('Projeto criado!', 'success');
      close();
      loadProjetosList(userData);
    } catch (err) { showToast('Erro ao criar.', 'error'); }
  };
}

async function showKanbanBoard(projetoId, userData) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.background = '#f8fafc';
  
  overlay.innerHTML = `
    <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; padding: 32px 40px; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <button class="btn-icon" id="btn-back-kanban" style="background: white; border:1px solid var(--surface-200);"><span class="material-symbols-rounded">arrow_back</span></button>
          <h2 id="kanban-project-title" style="font-size: 24px; font-weight: 850; margin: 0; color: var(--text-primary);">...</h2>
        </div>
        <button class="btn btn-primary" id="btn-add-tarefa">
          <span class="material-symbols-rounded">add</span>
          Nova Tarefa
        </button>
      </div>

      <div class="kanban-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; flex-grow: 1; overflow-x: auto; padding-bottom: 20px;">
        <div class="kanban-column" style="background:#edf2f7; border-radius: 16px; padding:16px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; padding:0 8px;">
            <span style="font-weight:800; font-size:12px; text-transform:uppercase; color:#64748b;">Pendente</span>
            <span id="count-todo" class="badge" style="background:white; color:#64748b;">0</span>
          </div>
          <div id="list-todo" style="flex:1; overflow-y:auto;"></div>
        </div>
        <div class="kanban-column" style="background:#fff9eb; border-radius: 16px; padding:16px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; padding:0 8px;">
            <span style="font-weight:800; font-size:12px; text-transform:uppercase; color:#b45309;">Em Progresso</span>
            <span id="count-doing" class="badge" style="background:white; color:#b45309;">0</span>
          </div>
          <div id="list-doing" style="flex:1; overflow-y:auto;"></div>
        </div>
        <div class="kanban-column" style="background:#f0fdf4; border-radius: 16px; padding:16px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; padding:0 8px;">
            <span style="font-weight:800; font-size:12px; text-transform:uppercase; color:#166534;">ConcluÃ­do</span>
            <span id="count-done" class="badge" style="background:white; color:#166534;">0</span>
          </div>
          <div id="list-done" style="flex:1; overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('in-view'), 10);
  document.getElementById('btn-back-kanban').onclick = () => { overlay.classList.remove('in-view'); setTimeout(() => overlay.remove(), 300); loadProjetosList(userData); };

  const refreshTarefas = async () => {
    try {
      const proj = await getProjeto(projetoId);
      if (proj) document.getElementById('kanban-project-title').innerText = proj.Titulo;

      const tarefas = await getTarefasPorProjeto(projetoId);
      const listTodo = document.getElementById('list-todo');
      const listDoing = document.getElementById('list-doing');
      const listDone = document.getElementById('list-done');

      const renderCard = (t) => {
        const pColors = { 'Alta': '#ef4444', 'MÃ©dia': '#f59e0b', 'Baixa': '#10b981' };
        return `
          <div class="card kanban-card" style="padding:16px; margin-bottom:12px; background:white; border-top: 3px solid ${pColors[t.Prioridade] || '#cbd5e1'}; position:relative;">
            <button class="btn-icon btn-delete-task" data-id="${t.id}" style="position:absolute; top:8px; right:8px; opacity:0.3;">
              <span class="material-symbols-rounded" style="font-size:14px;">delete</span>
            </button>
            <div style="font-size:14px; font-weight:700; margin-bottom:8px;">${t.Titulo}</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${t.Prazo ? `<div style="font-size:10px; color:var(--text-muted); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:12px;">calendar_today</span> ${new Date(t.Prazo).toLocaleDateString('pt-BR')}</div>` : ''}
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:10px; color:var(--text-secondary); font-weight:600;">${t.Atribuido_Nome || 'â€”'}</span>
                <select class="status-mini-select" data-id="${t.id}" style="font-size:10px; padding:2px 4px; border-radius:4px; border:1px solid var(--surface-200);">
                  <option value="A Fazer" ${t.Status === 'A Fazer' ? 'selected' : ''}>Pendente</option>
                  <option value="Em Progresso" ${t.Status === 'Em Progresso' ? 'selected' : ''}>Doing</option>
                  <option value="Concluido" ${t.Status === 'Concluido' ? 'selected' : ''}>Done</option>
                </select>
              </div>
            </div>
          </div>
        `;
      };

      listTodo.innerHTML = tarefas.filter(t => t.Status === 'A Fazer').map(renderCard).join('');
      listDoing.innerHTML = tarefas.filter(t => t.Status === 'Em Progresso').map(renderCard).join('');
      listDone.innerHTML = tarefas.filter(t => t.Status === 'Concluido').map(renderCard).join('');
      document.getElementById('count-todo').innerText = tarefas.filter(t => t.Status === 'A Fazer').length;
      document.getElementById('count-doing').innerText = tarefas.filter(t => t.Status === 'Em Progresso').length;
      document.getElementById('count-done').innerText = tarefas.filter(t => t.Status === 'Concluido').length;

      document.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.onclick = async () => { if(confirm('Excluir?')) { await deleteTarefa(btn.dataset.id); await autoUpdateProjectProgress(projetoId); refreshTarefas(); }};
      });
      document.querySelectorAll('.status-mini-select').forEach(sel => {
        sel.onchange = async () => { await updateTarefaStatus(sel.dataset.id, sel.value); await autoUpdateProjectProgress(projetoId); refreshTarefas(); showToast('Atualizado!', 'success'); };
      });
    } catch (e) { console.error(e); }
  };

  refreshTarefas();

  document.getElementById('btn-add-tarefa').onclick = async () => {
    const users = await getAllUsers();
    const taskModal = document.createElement('div');
    taskModal.className = 'modal-overlay';
    taskModal.style.zIndex = '10001';
    taskModal.innerHTML = `
      <div class="modal" style="max-width: 400px; width: 90%;">
        <h3 class="modal-title">Nova Tarefa</h3>
        <form id="form-nova-tarefa" style="display:grid; gap:16px;">
          <div class="form-group"><label class="form-label">TÃ­tulo</label><input type="text" id="task-title" class="form-input" required></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label class="form-label">Prioridade</label><select id="task-priority" class="form-input"><option value="Baixa">Baixa</option><option value="MÃ©dia" selected>MÃ©dia</option><option value="Alta">Alta</option></select></div>
            <div class="form-group"><label class="form-label">Prazo</label><input type="date" id="task-deadline" class="form-input"></div>
          </div>
          <div class="form-group"><label class="form-label">ResponsÃ¡vel</label><select id="task-user" class="form-input"><option value="">Selecione...</option>${users.map(u => `<option value="${u.Email}" data-nome="${u.Nome_Exibicao}">${u.Nome_Exibicao}</option>`).join('')}</select></div>
          <div class="modal-actions"><button type="submit" class="btn btn-primary" style="flex:1;">Adicionar</button><button type="button" class="btn btn-outline-light btn-cancel">Cancelar</button></div>
        </form>
      </div>
    `;
    document.body.appendChild(taskModal);
    setTimeout(() => taskModal.classList.add('in-view'), 10);
    const closeTask = () => { taskModal.classList.remove('in-view'); setTimeout(() => taskModal.remove(), 300); };
    taskModal.querySelector('.btn-cancel').onclick = closeTask;

    document.getElementById('form-nova-tarefa').onsubmit = async (e) => {
      e.preventDefault();
      const userSel = document.getElementById('task-user');
      try {
        await createTarefa({
          ID_Projeto: projetoId,
          Titulo: document.getElementById('task-title').value,
          Prioridade: document.getElementById('task-priority').value,
          Prazo: document.getElementById('task-deadline').value,
          Atribuido_Email: userSel.value,
          Atribuido_Nome: userSel.options[userSel.selectedIndex].dataset.nome || '',
          Criado_Por: userData.Email
        });
        await autoUpdateProjectProgress(projetoId);
        showToast('Sucesso!', 'success');
        closeTask();
        refreshTarefas();
      } catch (err) { showToast('Erro!', 'error'); }
    };
  };
}
