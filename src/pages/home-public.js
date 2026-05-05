import { getEventosPublicos } from '../services/db.js';

export function renderHomePublicPage() {
  return `
    <div style="min-height:100vh;">
      
      <!-- HERO -->
      <section class="hero-section hero">
        <div class="hero-bg hero-slides" id="hero-carousel">
           <div class="hero-slide active" style="background-image:url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')"></div>
           <div class="hero-slide" style="background-image:url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop')"></div>
           <div class="hero-slide" style="background-image:url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1920&auto=format&fit=crop')"></div>
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-overlay2"></div>
        
        <div class="container hero-content">
           <div class="hero-label">
              ✦ Seja bem-vindo
              <span class="hero-line" style="display:inline-block; vertical-align:middle; margin-left:12px;"></span>
           </div>
           <h1 class="hero-title">
             <span class="hero-title-line"><span>IECP SBC</span></span><br/>
             <span class="hero-title-line"><span>Jd. Ipanema</span></span>
           </h1>
           <p class="hero-subtitle">
             Uma igreja viva, servindo a comunidade com amor e esperança em São Bernardo do Campo.
           </p>
           <div class="hero-btns">
             <a href="#/login" class="pub-btn pub-btn-accent">
                <span class="material-symbols-rounded" style="font-size:20px;">login</span> Área do Membro
             </a>
             <a href="#/quem-somos" class="pub-btn pub-btn-outline">Nossa História</a>
           </div>
        </div>
        
        <div class="hero-controls">
           <div class="hero-dot active" data-index="0"></div>
           <div class="hero-dot" data-index="1"></div>
           <div class="hero-dot" data-index="2"></div>
        </div>
        
        <div class="hero-counter">01 / 03</div>
        
        <div class="hero-scroll">
           Scroll <span class="material-symbols-rounded">expand_more</span>
        </div>
      </section>

      <!-- VERSE -->
      <section class="versiculo-section">
         <span class="material-symbols-rounded versiculo-bg-icon">menu_book</span>
         <div class="container" style="position:relative; z-index:2;">
            <div class="section-label">
               <div class="section-label-line"></div>
               <span class="section-label-text">Palavra do Dia</span>
               <div class="section-label-line"></div>
            </div>
            <p class="versiculo-quote reveal-up">
              "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais."
            </p>
            <div class="versiculo-ref reveal-up delay-1">
              JEREMIAS 29:11
            </div>
         </div>
      </section>

      <!-- SCHEDULE -->
      <section class="horarios-section">
         <div class="container">
            <div style="text-align: center; margin-bottom: 48px;">
               <div class="section-label reveal-up">
                  <span class="section-label-text">Programação</span>
               </div>
               <h2 class="reveal-up" style="font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,48px); font-weight:800; color:var(--primary); margin-top:8px;">Nossos Cultos</h2>
               <div class="section-label-line" style="margin: 16px auto 0;"></div>
            </div>
            <div class="horarios-grid">
               <div class="horario-card reveal-up">
                  <div class="horario-icon"><span class="material-symbols-rounded" style="font-size:28px;">wb_sunny</span></div>
                  <div class="horario-dia">Domingo Manhã</div>
                  <div class="horario-hora">09:00</div>
                  <p class="horario-nome">Escola Dominical e Culto Matutino</p>
               </div>
               <div class="horario-card reveal-up" style="transition-delay:0.1s">
                  <div class="horario-icon"><span class="material-symbols-rounded" style="font-size:28px;">nights_stay</span></div>
                  <div class="horario-dia">Domingo Noite</div>
                  <div class="horario-hora">18:00</div>
                  <p class="horario-nome">Culto de Celebração da Família</p>
               </div>
               <div class="horario-card reveal-up" style="transition-delay:0.2s">
                  <div class="horario-icon"><span class="material-symbols-rounded" style="font-size:28px;">local_fire_department</span></div>
                  <div class="horario-dia">Quarta-Feira</div>
                  <div class="horario-hora">19:30</div>
                  <p class="horario-nome">Culto de Oração e Doutrina</p>
               </div>
            </div>
         </div>
      </section>

      <!-- STATS -->
      <section class="stats-section">
         <div class="container stats-grid">
            <div class="pub-stat-card reveal-up">
               <div class="pub-stat-icon"><span class="material-symbols-rounded">church</span></div>
               <div class="pub-stat-value">40+</div>
               <div class="pub-stat-label">Anos de História</div>
            </div>
            <div class="pub-stat-card reveal-up" style="transition-delay:0.1s">
               <div class="pub-stat-icon"><span class="material-symbols-rounded">groups</span></div>
               <div class="pub-stat-value">300</div>
               <div class="pub-stat-label">Membros</div>
            </div>
            <div class="pub-stat-card reveal-up" style="transition-delay:0.2s">
               <div class="pub-stat-icon"><span class="material-symbols-rounded">account_tree</span></div>
               <div class="pub-stat-value">12</div>
               <div class="pub-stat-label">Ministérios Ativos</div>
            </div>
            <div class="pub-stat-card reveal-up" style="transition-delay:0.3s">
               <div class="pub-stat-icon"><span class="material-symbols-rounded">favorite</span></div>
               <div class="pub-stat-value">1</div>
               <div class="pub-stat-label">Propósito Maior</div>
            </div>
         </div>
      </section>

      <!-- EVENTS -->
      <section class="horarios-section" style="background:#faf9f6">
         <div class="container">
            <div style="text-align: center; margin-bottom: 48px;">
               <div class="section-label reveal-up">
                  <span class="section-label-text">Agenda</span>
               </div>
               <h2 class="reveal-up" style="font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,48px); font-weight:800; color:var(--primary); margin-top:8px;">Próximos Eventos</h2>
               <div class="section-label-line" style="margin: 16px auto 0;"></div>
            </div>
            
            <div id="public-eventos-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:24px; max-width:1000px; margin:0 auto;">
               <div style="grid-column: 1 / -1; text-align: center; color: var(--fg-muted); padding: 32px;">
                  Carregando eventos...
               </div>
            </div>

            <div style="text-align:center; margin-top:40px;">
              <a href="#/eventos" class="pub-btn pub-btn-navy">Ver Toda a Agenda</a>
            </div>
         </div>
      </section>

    </div>
  `;
}

export async function initHomePublicPage() {
  // Intersection Observer para as animações de scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

  // Carrossel Simples
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const counter = document.querySelector('.hero-counter');
  let currentSlide = 0;
  
  if (slides.length > 0) {
    const showSlide = (index) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      if (counter) counter.textContent = `0${index + 1} / 0${slides.length}`;
    };

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 7000);

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        currentSlide = idx;
        showSlide(currentSlide);
      });
    });
  }

  // Carregar Eventos do Firestore
  try {
    const eventos = await getEventosPublicos();
    const list = document.getElementById('public-eventos-list');
    if (!list) return;
    if (eventos.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--fg-muted);grid-column:1/-1;">Nenhum evento próximo.</div>';
      return;
    }
    list.innerHTML = eventos.slice(0, 3).map((ev, i) => {
      const dt = ev.Data_Hora?.toDate ? ev.Data_Hora.toDate() : new Date(ev.Data_Hora);
      return `
        <div class="event-card reveal-up" style="transition-delay:${i * 0.1}s">
          <div class="event-date-box">
             <div class="event-date-month">${dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>
             <div class="event-date-day">${dt.getDate()}</div>
          </div>
          <div>
             <div class="event-title">${ev.Titulo}</div>
             <div class="event-meta">
               <span class="material-symbols-rounded" style="font-size:16px;">schedule</span>
               ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
               ${ev.Descricao ? '• '+ev.Descricao : ''}
             </div>
          </div>
        </div>`;
    }).join('');
    
    // Observar os novos cards
    list.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
  } catch(e) { console.error(e); }
}
