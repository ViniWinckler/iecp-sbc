export function renderAboutUsPage() {
  return `
    <div style="min-height:100vh;background:#f8fafc;padding:60px 24px;">
      <div style="max-width:800px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:60px;">
          <h1 style="font-size:48px;font-weight:850;color:#1e293b;margin-bottom:16px;font-family:'Playfair Display',serif;">Quem <span style="color:#6366f1;">Somos</span></h1>
          <p style="color:#64748b;font-size:18px;line-height:1.7;">Conheça nossa história, missão e valores.</p>
        </div>
        <div style="background:white;border-radius:24px;padding:48px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px;">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;">
              <span class="material-symbols-rounded" style="color:white;font-size:28px;">church</span>
            </div>
            <div>
              <h2 style="margin:0;font-size:24px;font-weight:800;color:#1e293b;">IECP SBC</h2>
              <p style="margin:0;color:#64748b;font-size:14px;">Igreja Evangélica Cristã Presbiteriana de São Bernardo do Campo</p>
            </div>
          </div>
          <p style="color:#475569;font-size:16px;line-height:1.8;margin-bottom:24px;">
            Somos uma comunidade cristã comprometida com o crescimento espiritual, o serviço à comunidade e o amor incondicional ao próximo, fundamentada nos princípios eternos da Palavra de Deus.
          </p>
          <p style="color:#475569;font-size:16px;line-height:1.8;">
            Nossa missão é proclamar o Evangelho de Jesus Cristo, discipular os crentes e servir com excelência, impactando vidas em São Bernardo do Campo e além.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:40px;">
            ${[
              { icon: 'book', title: 'Bíblia', desc: 'Nossa autoridade final' },
              { icon: 'favorite', title: 'Amor', desc: 'O maior mandamento' },
              { icon: 'groups', title: 'Comunidade', desc: 'Juntos em propósito' },
            ].map(v => `
              <div style="text-align:center;padding:24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
                <span class="material-symbols-rounded" style="font-size:32px;color:#6366f1;margin-bottom:12px;display:block;">${v.icon}</span>
                <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">${v.title}</div>
                <div style="font-size:13px;color:#64748b;">${v.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;
}
