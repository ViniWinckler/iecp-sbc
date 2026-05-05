
import { loginWithGoogle, completeRegistration, getCurrentUser, loginWithEmail, registerWithEmail } from '../services/auth.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

let isLoginMode = true;

export function renderLoginPage() {
  const user = getCurrentUser();
  if (user) {
    setTimeout(() => navigate('/dashboard'), 0);
    return '<div class="loader-container"><div class="loader-spinner"></div></div>';
  }

  return `
    <div class="pub-login-page">
      <div class="pub-login-card reveal-up">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 56px; height: 56px; background: var(--primary-50); color: var(--primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span class="material-symbols-rounded" style="font-size: 28px;">church</span>
          </div>
          <h1 id="auth-title" style="font-family:'Playfair Display',serif; font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">Bem-vindo de volta!</h1>
          <p id="auth-subtitle" style="color: var(--text-secondary); font-size: 14px;">Use seu e-mail para acessar a plataforma.</p>
        </div>

        <!-- Tabs Toggle -->
        <div style="display: flex; background: var(--surface-100); padding: 4px; border-radius: 4px; margin-bottom: 24px;">
          <button id="tab-login" style="flex: 1; padding: 10px; border-radius: 2px; font-weight: 600; font-size: 14px; background: white; box-shadow: var(--shadow-sm); color: var(--text-primary); border: none; cursor: pointer; transition: all 0.2s;">Entrar</button>
          <button id="tab-register" style="flex: 1; padding: 10px; border-radius: 2px; font-weight: 500; font-size: 14px; background: transparent; color: var(--text-secondary); border: none; cursor: pointer; transition: all 0.2s;">Criar Conta</button>
        </div>

        <!-- Forms Container -->
        <div id="auth-forms-container">
          <!-- Renders dynamically in init -->
        </div>

        <div style="display: flex; align-items: center; margin: 24px 0;">
          <div style="flex: 1; height: 1px; background: var(--surface-200);"></div>
          <div style="padding: 0 16px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">OU</div>
          <div style="flex: 1; height: 1px; background: var(--surface-200);"></div>
        </div>

        <!-- Google Button -->
        <button class="pub-btn pub-btn-outline" id="google-login-btn" style="width: 100%; color: var(--fg); border-color: #e8e2d8; margin-bottom: 24px;">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar com o Google
        </button>

        <div style="text-align: center;">
           <a href="#/" style="color: var(--primary); text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; font-weight:600;">
             <span class="material-symbols-rounded" style="font-size: 18px;">arrow_back</span>
             Voltar ao Início
           </a>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPage() {
  isLoginMode = true; // FIX A: sempre resetar para "Entrar" ao (re)entrar na página
  const container = document.getElementById('auth-forms-container');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  if (!container) return;

  const renderForms = () => {
    if (isLoginMode) {
      // Login Form
      title.innerText = 'Bem-vindo de volta!';
      subtitle.innerText = 'Use seu e-mail para acessar a plataforma.';
      tabLogin.style.background = 'white';
      tabLogin.style.boxShadow = 'var(--shadow-sm)';
      tabLogin.style.color = 'var(--text-primary)';
      tabLogin.style.fontWeight = '600';
      tabRegister.style.background = 'transparent';
      tabRegister.style.boxShadow = 'none';
      tabRegister.style.color = 'var(--text-secondary)';
      tabRegister.style.fontWeight = '500';

      container.innerHTML = `
        <form id="email-login-form">
          <div class="form-group">
            <label class="form-label" style="font-size: 13px;">E-mail</label>
            <input type="email" id="login-email" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="seu@email.com">
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label" style="font-size: 13px;">Senha</label>
            <input type="password" id="login-password" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢">
          </div>
          <button type="submit" class="btn btn-primary" id="btn-submit-email" style="width: 100%; height: 50px; border-radius: 12px; margin-top: 24px;">Acessar Ãrea do Membro</button>
        </form>
      `;

      document.getElementById('email-login-form').onsubmit = handleEmailLogin;
    } else {
      // Register Form
      title.innerText = 'Criar Nova Conta';
      subtitle.innerText = 'FaÃ§a parte da nossa plataforma digital.';
      tabRegister.style.background = 'white';
      tabRegister.style.boxShadow = 'var(--shadow-sm)';
      tabRegister.style.color = 'var(--text-primary)';
      tabRegister.style.fontWeight = '600';
      tabLogin.style.background = 'transparent';
      tabLogin.style.boxShadow = 'none';
      tabLogin.style.color = 'var(--text-secondary)';
      tabLogin.style.fontWeight = '500';

      container.innerHTML = `
        <form id="email-register-form">
          <div class="form-group">
            <label class="form-label" style="font-size: 13px;">Nome Completo</label>
            <input type="text" id="reg-name" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="Ex: JoÃ£o Silva">
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label" style="font-size: 13px;">E-mail</label>
            <input type="email" id="reg-email" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="seu@email.com">
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label" style="font-size: 13px;">Senha</label>
            <input type="password" id="reg-password" minlength="6" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="MÃ­nimo de 6 caracteres">
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label" style="font-size: 13px;">Confirmar Senha</label>
            <input type="password" id="reg-password-confirm" minlength="6" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required placeholder="Repita a senha">
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label" style="font-size: 13px;">Qual o seu cargo?</label>
            <select id="reg-role" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" required>
              <option value="Membro">Membro</option>
              <option value="Lider">LÃ­der de MinistÃ©rio</option>
              <option value="Pastor">Pastor</option>
            </select>
          </div>
          <div id="leader-extra-fields" style="display: none; margin-top: 16px; animation: slideDown 0.3s ease-out;">
            <div class="form-group">
              <label class="form-label" style="font-size: 13px;">Nome do seu MinistÃ©rio</label>
              <input type="text" id="reg-min-name" class="form-input" style="background: var(--surface-50); border: 1px solid var(--surface-200); border-radius: 12px; padding: 12px 16px;" placeholder="Ex: MinistÃ©rio de Louvor">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" id="btn-submit-reg" style="width: 100%; height: 50px; border-radius: 12px; margin-top: 24px;">Finalizar Cadastro</button>
        </form>
      `;

      document.getElementById('email-register-form').onsubmit = handleEmailRegister;
      
      const roleSel = document.getElementById('reg-role');
      const extraFields = document.getElementById('leader-extra-fields');
      roleSel.onchange = () => {
        extraFields.style.display = roleSel.value === 'Lider' ? 'block' : 'none';
      };
    }
  };

  // Bind Tabs
  tabLogin.onclick = () => { isLoginMode = true; renderForms(); };
  tabRegister.onclick = () => { isLoginMode = false; renderForms(); };

  // Render initially
  renderForms();

  // Setup Google
  setupGoogleBtn();
}

async function handleEmailLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-email');
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  
  if (!email || !pass) return;

  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:white;border-top-color:transparent;"></div>`;

  try {
    const res = await loginWithEmail(email, pass);
    showToast(`Bem-vindo de volta, ${res.userData.Nome_Exibicao}!`, 'success');
    navigate('/dashboard');
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      showToast('E-mail nÃ£o cadastrado ou senha incorreta.', 'error');
    } else {
      showToast('Erro ao entrar. Verifique os dados.', 'error');
    }
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function handleEmailRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-reg');
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-password').value;
  const passConfirm = document.getElementById('reg-password-confirm').value;
  const role = document.getElementById('reg-role').value;
  const minName = document.getElementById('reg-min-name')?.value || '';

  if (!email || !pass || !name) return;

  // FIX C: Validar confirmação de senha
  if (pass !== passConfirm) {
    const { showToast } = await import('../components/toast.js');
    showToast('As senhas não coincidem. Verifique e tente novamente.', 'error');
    return;
  }

  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:white;border-top-color:transparent;"></div>`;

  try {
    const res = await registerWithEmail(email, pass, name, role, minName);
    showToast(`Conta criada! Bem-vindo, ${res.userData.Nome_Exibicao}!`, 'success');
    navigate('/dashboard');
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-in-use') {
      showToast('Este e-mail jÃ¡ possui uma conta. FaÃ§a login.', 'warning');
    } else {
      showToast('Erro ao criar conta. Tente novamente.', 'error');
    }
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function setupGoogleBtn() {
  const btn = document.getElementById('google-login-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `
      <div class="loader-spinner" style="width:20px;height:20px;border-width:2px;"></div>
      Conectando...
    `;

    try {
      const result = await loginWithGoogle();
      if (!result) {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
        return;
      }

      if (result.isNew) {
        showDisplayNameModal(result.user);
      } else {
        showToast(`Bem-vindo de volta, ${result.userData.Nome_Exibicao}!`, 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Erro ao entrar com Google.', 'error');
      btn.disabled = false;
      btn.innerHTML = oldHtml;
    }
  });
}

function showDisplayNameModal(user) {
  const suggestedName = user.displayName || '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'display-name-modal';
  overlay.innerHTML = `
    <div class="modal">
      <h2 class="modal-title">ðŸ‘‹ Falta Pouco!</h2>
      <p class="modal-description">Complete seu cadastro definindo seu cargo e como gostaria de ser chamado.</p>
      
      <div class="form-group">
        <label class="form-label" for="google-display-name">Nome de ExibiÃ§Ã£o</label>
        <input type="text" class="form-input" id="google-display-name" value="${suggestedName}" required>
      </div>

      <div class="form-group" style="margin-top: 16px;">
        <label class="form-label">Qual o seu cargo?</label>
        <select id="google-role" class="form-input" required>
          <option value="Membro">Membro</option>
          <option value="Lider">LÃ­der de MinistÃ©rio</option>
          <option value="Pastor">Pastor</option>
        </select>
      </div>

      <div id="google-leader-fields" style="display: none; margin-top: 16px;">
        <div class="form-group">
          <label class="form-label">Nome do seu MinistÃ©rio</label>
          <input type="text" id="google-min-name" class="form-input" placeholder="Ex: MÃ­dia e Som">
        </div>
      </div>

      <div class="modal-actions" style="margin-top: 24px;">
        <button class="btn btn-primary" id="save-google-data" style="width: 100%;">
          Concluir Cadastro
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => overlay.classList.add('in-view'), 10);

  const roleSel = document.getElementById('google-role');
  const extraFields = document.getElementById('google-leader-fields');
  roleSel.onchange = () => {
    extraFields.style.display = roleSel.value === 'Lider' ? 'block' : 'none';
  };

  document.getElementById('save-google-data').onclick = async () => {
    const nameInput = document.getElementById('google-display-name');
    const roleSelect = document.getElementById('google-role');
    const name = nameInput.value.trim();
    const role = roleSelect.value;
    const minName = document.getElementById('google-min-name')?.value || '';
    
    if (!name) {
      nameInput.focus();
      return;
    }

    try {
      const btn = document.getElementById('save-google-data');
      btn.disabled = true;
      btn.innerText = 'Salvando...';
      
      await completeRegistration(name, role, minName);
      
      overlay.classList.remove('in-view');
      setTimeout(() => overlay.remove(), 300);
      
      showToast('Cadastro concluÃ­do com sucesso!', 'success');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar os dados.', 'error');
      document.getElementById('save-google-data').disabled = false;
      document.getElementById('save-google-data').innerText = 'Concluir Cadastro';
    }
  };
}
