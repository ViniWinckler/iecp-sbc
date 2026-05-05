export function renderAboutUsPage() {
  return `
    <div style="min-height:100vh; background:var(--bg); padding-top:72px;">
      <!-- Header Secundário -->
      <div class="page-header" style="background-image:url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80')">
        <div class="page-header-overlay"></div>
        <div class="page-header-content">
          <div class="section-label">
            <div class="section-label-line"></div>
            <span class="section-label-text">Nossa História</span>
            <div class="section-label-line"></div>
          </div>
          <h1>Quem Somos</h1>
          <p>Conheça a história e o propósito da nossa comunidade</p>
        </div>
      </div>

      <!-- Conteúdo Sobre -->
      <div class="contact-body">
        <div class="container">
          <div style="max-width:800px; margin:0 auto; font-size:18px; line-height:1.8; color:var(--text-secondary);">
            <p class="reveal-up" style="margin-bottom:24px;">
              A <strong style="color:var(--primary); font-weight:700;">Primeira Igreja Evangélica Cristã Presbiteriana do Jardim Ipanema</strong> tem uma longa história de dedicação à comunidade de São Bernardo do Campo. Nossa missão é ensinar as verdades do evangelho, promover a comunhão entre os irmãos e servir à sociedade com amor e compaixão.
            </p>
            <p class="reveal-up" style="transition-delay:0.1s; margin-bottom:24px;">
              Fundada sob princípios bíblicos sólidos, buscamos ser um ambiente acolhedor para todas as famílias. Acreditamos que a fé genuína se expressa em ações práticas de cuidado e solidariedade.
            </p>
            
            <div class="reveal-up" style="transition-delay:0.2s; margin-top:48px; border-left:4px solid var(--accent); padding-left:24px;">
              <h3 style="font-family:'Playfair Display',serif; font-size:24px; color:var(--primary); margin-bottom:12px;">Nossa Visão</h3>
              <p>Ser uma igreja relevante na cidade, conhecida por seu amor a Deus, compromisso com a Palavra e impacto social positivo.</p>
            </div>

            <div class="reveal-up" style="transition-delay:0.3s; margin-top:32px; border-left:4px solid var(--accent); padding-left:24px;">
              <h3 style="font-family:'Playfair Display',serif; font-size:24px; color:var(--primary); margin-bottom:12px;">Nossos Valores</h3>
              <ul style="list-style-type:none; display:grid; gap:8px;">
                <li><span style="color:var(--accent);">✦</span> Centralidade nas Escrituras</li>
                <li><span style="color:var(--accent);">✦</span> Acolhimento e Relacionamentos</li>
                <li><span style="color:var(--accent);">✦</span> Ensino e Discipulado</li>
                <li><span style="color:var(--accent);">✦</span> Adoração Autêntica</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAboutUsPage() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}
