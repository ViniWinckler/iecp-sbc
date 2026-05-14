import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Clock, BookOpen, ArrowRight, MapPin, Heart, Users, Star, Sun, Moon, Flame } from "lucide-react";
import HeroBanner from "../components/public/HeroBanner";
import { getEventosPublicos } from "../services/db";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

function AnimatedSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ value, label, icon: Icon, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <p className="font-heading text-4xl font-bold text-white">{value}</p>
      <p className="text-white/50 text-sm mt-1">{label}</p>
    </motion.div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState([
    {
      id: "1",
      image_url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80",
      title: "Uma comunidade viva em Cristo",
      subtitle: "Servindo a cidade com esperança e amor",
      button_text: "Conheça a Igreja",
      button_link: "/quem-somos",
      active: true
    },
    {
      id: "2",
      image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80",
      title: "Nossa História",
      subtitle: "Conheça nosso propósito e valores",
      button_text: "Saiba Mais",
      button_link: "/quem-somos",
      active: true
    }
  ]);
  const [serviceTimes, setServiceTimes] = useState([
    { id: "1", day_of_week: "Domingo Manhã", time: "09:00", name: "Escola Dominical e Culto Matutino", icon: Sun },
    { id: "2", day_of_week: "Domingo Noite", time: "18:00", name: "Culto de Celebração da Família", icon: Moon },
    { id: "3", day_of_week: "Quarta-Feira", time: "19:30", name: "Culto de Oração e Doutrina", icon: Flame }
  ]);
  const [verse, setVerse] = useState({
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    reference: "JEREMIAS 29:11"
  });

  return (
    <div className="bg-background">
      {/* Hero */}
      <HeroBanner banners={banners} />

      {/* Daily Verse Banner */}
      {verse && (
        <section className="bg-primary text-primary-foreground py-14 px-6 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <BookOpen className="w-80 h-80 text-white" />
          </motion.div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-5">
                <span className="w-6 h-px bg-accent" />
                Palavra do Dia
                <span className="w-6 h-px bg-accent" />
              </span>
              <p className="font-heading text-xl sm:text-2xl lg:text-3xl leading-relaxed font-medium">
                "{verse.text}"
              </p>
              <p className="mt-5 text-accent font-semibold tracking-wide">{verse.reference}</p>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Service Times */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              <span className="w-6 h-px bg-accent inline-block" />
              Venha nos visitar
              <span className="w-6 h-px bg-accent inline-block" />
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Horários dos Cultos</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {serviceTimes.length > 0 ? (
              serviceTimes.map((st, i) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                  className="border border-border rounded-sm p-8 text-center bg-card cursor-default transition-colors hover:border-accent/50"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-5">
                    <st.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-accent font-semibold text-sm tracking-wider uppercase">{st.day_of_week}</p>
                  <p className="font-heading text-4xl font-bold text-foreground mt-2">{st.time}</p>
                  <h3 className="font-medium text-muted-foreground mt-2">{st.name}</h3>
                  {st.description && (
                    <p className="text-muted-foreground text-sm mt-2">{st.description}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Horários em breve
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats — dark section */}
      <section className="bg-primary py-20 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Uma comunidade que cresce pela fé
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { value: "25+", label: "Anos de história", icon: Star, delay: 0 },
              { value: "300+", label: "Membros", icon: Users, delay: 0.1 },
              { value: "12", label: "Ministérios ativos", icon: Heart, delay: 0.2 },
              { value: "1", label: "Propósito", icon: Clock, delay: 0.3 },
            ].map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* About CTA — split */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection delay={0}>
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              <span className="w-6 h-px bg-accent inline-block" />
              Quem Somos
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Uma História de Fé e Dedicação
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Somos uma Igreja comprometida com a Palavra de Deus, acolhendo famílias e transformando vidas através do evangelho de Cristo.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Nossa missão é fazer discípulos, servir ao próximo e glorificar a Deus em tudo o que fazemos.
            </p>
            <Link to="/quem-somos">
              <motion.button
                whileHover={{ gap: "16px" }}
                className="inline-flex items-center gap-3 text-primary font-semibold group uppercase tracking-wider text-sm"
              >
                Conheça Nossa História
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  className="transition-transform"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="relative">
              <motion.div
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop&q=90"
                  alt="Igreja"
                  className="w-full h-72 sm:h-96 object-cover rounded-sm"
                />
              </motion.div>
              {/* Decorative box */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent/30 rounded-sm -z-0" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Onde Estamos */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&h=900&fit=crop&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-16 h-0.5 bg-accent mx-auto mb-8"
            />
            <p className="text-accent text-sm font-semibold tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              Onde Estamos
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
              Estrada dos Casa, 3860<br/>
              <span className="text-xl sm:text-2xl font-normal text-white/80 mt-2 block">
                Jd. Ipanema, São Bernardo do Campo - SP, CEP 09840-630
              </span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-white/80 mb-10">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-accent" />
                <span>Domingos: 09h00</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-accent" />
                <span>Domingos: 18h00</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                <span>Quartas: 19h30</span>
              </div>
            </div>

            <div className="flex justify-center">
              <a href="https://www.google.com/maps/dir/?api=1&destination=-23.7380,-46.5833" target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-accent text-accent-foreground font-semibold text-sm tracking-wider uppercase rounded-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Traçar Rota no Mapa
                </motion.button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}