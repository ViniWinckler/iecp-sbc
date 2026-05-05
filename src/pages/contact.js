export function renderContactPage() {
  return `
    <div style="min-height:100vh; background:var(--bg); padding-top:72px;">
      <!-- Header Secundário -->
      <div class="page-header" style="background-image:url('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1920&q=80')">
        <div class="page-header-overlay"></div>
        <div class="page-header-content">
          <div class="section-label">
            <div class="section-label-line"></div>
            <span class="section-label-text">Fale Conosco</span>
            <div class="section-label-line"></div>
          </div>
          <h1>Contato</h1>
          <p>Envie sua mensagem direto pelo WhatsApp</p>
        </div>
      </div>

      <!-- Conteúdo do Contato -->
      <div class="contact-body">
        <div class="container">
          <div style="max-width:1000px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:40px;">
            
            <!-- Formulário -->
            <div class="contact-card reveal-up">
              <h2 style="font-family:'Playfair Display',serif; font-size:28px; font-weight:800; color:var(--primary); margin-bottom:24px;">Envie sua mensagem</h2>
              <form id="contact-form" style="display:grid; gap:20px;">
                <div>
                  <label class="contact-label">Nome *</label>
                  <input type="text" id="c-nome" class="contact-input" placeholder="Seu nome" required>
                </div>
                <div>
                  <label class="contact-label">E-mail</label>
                  <input type="email" id="c-email" class="contact-input" placeholder="seu@email.com">
                </div>
                <div>
                  <label class="contact-label">Mensagem *</label>
                  <textarea id="c-msg" rows="5" class="contact-input" placeholder="Escreva sua mensagem..." required style="resize:vertical;"></textarea>
                </div>
                <button type="submit" id="btn-send-contact" class="pub-btn pub-btn-accent" style="width:100%; margin-top:8px;">
                  <span class="material-symbols-rounded" style="font-size:20px;">send</span> Enviar via WhatsApp
                </button>
              </form>
            </div>

            <!-- Informações -->
            <div class="reveal-up" style="transition-delay:0.2s">
               <div style="display:grid; gap:20px;">
                  <!-- Whatsapp -->
                  <div class="contact-card" style="padding:24px; display:flex; gap:16px; align-items:center;">
                    <div style="width:48px; height:48px; border-radius:8px; background:var(--surface-50); display:flex; align-items:center; justify-content:center; color:#25D366;">
                       <span class="material-symbols-rounded" style="font-size:24px;">call</span>
                    </div>
                    <div>
                      <div style="font-size:12px; font-weight:600; color:var(--fg-muted);">WhatsApp</div>
                      <div style="font-weight:700; color:var(--fg);">+55 11 99999-9999</div>
                    </div>
                  </div>

                  <!-- Instagram -->
                  <div class="contact-card" style="padding:24px; display:flex; gap:16px; align-items:center;">
                    <div style="width:48px; height:48px; border-radius:8px; background:var(--surface-50); display:flex; align-items:center; justify-content:center; color:#E1306C;">
                       <span class="material-symbols-rounded" style="font-size:24px;">photo_camera</span>
                    </div>
                    <div>
                      <div style="font-size:12px; font-weight:600; color:var(--fg-muted);">Instagram</div>
                      <div style="font-weight:700; color:var(--fg);">@iecp.sbc</div>
                    </div>
                  </div>

                  <!-- Aviso -->
                  <div class="contact-card" style="padding:24px; background:var(--primary-50); border:1px solid var(--primary-200);">
                     <span class="material-symbols-rounded" style="color:var(--accent); font-size:24px; margin-bottom:12px; display:block;">info</span>
                     <p style="font-size:14px; color:var(--primary-700); line-height:1.6;">
                       Não armazenamos nenhum dado pessoal. Sua mensagem é enviada diretamente via WhatsApp.
                     </p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;
}

export function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-send-contact');
    const nome = document.getElementById('c-nome').value;
    const email = document.getElementById('c-email').value;
    const msg = document.getElementById('c-msg').value;

    const text = `Olá! Me chamo *${nome}*\nEmail: ${email}\n\nMensagem: ${msg}`;
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(text)}`;

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:20px;animation:spin 1s linear infinite;">autorenew</span> Redirecionando...';
    
    await new Promise(r => setTimeout(r, 800));
    window.open(url, '_blank');
    
    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:20px;">send</span> Enviar via WhatsApp';
  };
}
