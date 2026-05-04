export function renderContactPage() {
  return `
    <div style="min-height:100vh;background:#f8fafc;padding:60px 24px;">
      <div style="max-width:700px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:48px;">
          <h1 style="font-size:48px;font-weight:850;color:#1e293b;margin-bottom:16px;font-family:'Playfair Display',serif;">Entre em <span style="color:#6366f1;">Contato</span></h1>
          <p style="color:#64748b;font-size:18px;">Fale conosco, teremos prazer em responder.</p>
        </div>
        <div style="background:white;border-radius:24px;padding:48px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <form id="contact-form" style="display:grid;gap:20px;">
            <div>
              <label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Nome</label>
              <input type="text" id="c-nome" placeholder="Seu nome completo" required style="width:100%;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Inter,sans-serif;outline:none;transition:border 0.2s;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">E-mail</label>
              <input type="email" id="c-email" placeholder="seu@email.com" required style="width:100%;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Inter,sans-serif;outline:none;transition:border 0.2s;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Mensagem</label>
              <textarea id="c-msg" rows="5" placeholder="Como podemos ajudar?" required style="width:100%;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Inter,sans-serif;outline:none;transition:border 0.2s;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
            </div>
            <button type="submit" id="btn-send-contact" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:16px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s;font-family:Inter,sans-serif;">
              <span class="material-symbols-rounded">send</span>Enviar Mensagem
            </button>
          </form>
          <div style="margin-top:40px;padding-top:32px;border-top:1px solid #f1f5f9;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">
            ${[
              { icon: 'location_on', label: 'Endereço', val: 'São Bernardo do Campo, SP' },
              { icon: 'schedule', label: 'Cultos', val: 'Dom 9h e 19h | Qua 19h30' },
            ].map(i => `
              <div style="display:flex;gap:12px;align-items:flex-start;">
                <div style="width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span class="material-symbols-rounded" style="color:#6366f1;font-size:20px;">${i.icon}</span>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">${i.label}</div>
                  <div style="font-size:14px;font-weight:600;color:#1e293b;margin-top:2px;">${i.val}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-send-contact');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;border-color:white;border-top-color:transparent;"></div>';
    await new Promise(r => setTimeout(r, 1500));
    const { showToast } = await import('../components/toast.js');
    showToast('Mensagem enviada! Entraremos em contato em breve.', 'success');
    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-rounded">send</span>Enviar Mensagem';
  };
}
