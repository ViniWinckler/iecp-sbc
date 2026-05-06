import { motion } from "framer-motion";
import { Heart, Eye, Star, BookOpen, Users } from "lucide-react";

// ── Conteúdo estático da IECP SBC — sem dependência de backend ─────────────
const CHURCH_INFO = {
  about: {
    title: "Nossa História",
    icon: BookOpen,
    content: `A Igreja Evangélica Congregacional do Brasil — IECP SBC, localizada no Jardim Ipanema, em São Bernardo do Campo, nasceu do desejo de servir a comunidade local com o Evangelho de Jesus Cristo.

Ao longo de mais de 40 anos, a IECP SBC cresceu e se tornou um lar espiritual para centenas de famílias, atravessando gerações com a mesma chama de fé, amor e dedicação que a fundou.

Nossa trajetória é marcada por momentos de avivamento, discipulado profundo e serviço ao próximo, refletindo o coração de um povo que ama a Deus e ama a sua cidade.`,
  },
  vision: {
    title: "Nossa Visão",
    icon: Eye,
    content: `Ser uma Igreja transformadora, que faz discípulos de Jesus capazes de impactar cada esfera da sociedade — família, trabalho, escola e cidade — com a graça e a verdade do Evangelho.

Acreditamos que cada membro é chamado a ser agente de mudança onde estiver, vivendo sua fé de forma prática, íntegra e amorosa.`,
  },
  values: {
    title: "Nossos Valores",
    icon: Heart,
    content: `• **Palavra de Deus** — A Bíblia como fundamento absoluto para a vida e a fé.
• **Adoração** — Honrar a Deus em espírito e em verdade em tudo o que fazemos.
• **Família** — Valorizar o lar como base da sociedade e da Igreja.
• **Comunidade** — Viver em koinonia: partilha, cuidado e pertencimento.
• **Missão** — Levar o Evangelho além das nossas portas, local e globalmente.`,
  },
};

const stats = [
  { value: "40+", label: "Anos servindo", icon: Star },
  { value: "300+", label: "Membros ativos", icon: Users },
  { value: "10+", label: "Ministérios", icon: Heart },
];

const pastors = [
  {
    name: "Pr. José Luiz",
    role: "Pastor Titular",
    initials: "JL",
    bio: "Lidera a IECP SBC com dedicação à Palavra e ao cuidado pastoral da congregação.",
  },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: "easeOut" },
  };
}

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Banner ─────── */}
      <div className="relative overflow-hidden bg-primary">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, hsl(43,74%,49%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(222,47%,40%) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20">
          <motion.div {...fadeUp()}>
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              <span className="w-6 h-px bg-accent" />
              Nossa Comunidade
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-white leading-tight max-w-2xl">
              Um lugar de recomeços e fé em São Bernardo.
            </h1>
            <p className="text-white/60 text-lg mt-5 max-w-xl leading-relaxed">
              Servindo o Jardim Ipanema e região com amor, discipulado e missão há mais de 40 anos.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10 max-w-lg">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(0.2 + i * 0.1)} className="text-center">
                <p className="font-heading text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Info Sections ─────── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 space-y-20">
        {Object.values(CHURCH_INFO).map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.title}
              {...fadeUp(i * 0.1)}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              <div className="md:col-span-3">
                <div className="flex items-center gap-3 sticky top-24">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-heading text-lg font-bold leading-snug">{section.title}</h2>
                </div>
              </div>
              <div className="md:col-span-9">
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {section.content.split("\n\n").map((para, pi) => (
                    <p key={pi} className="mb-4 last:mb-0">
                      {para.split("\n").map((line, li) => (
                        <span key={li}>
                          {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                          {li < para.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ── Divider ─────── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="border-t border-border" />
      </div>

      {/* ── Pastoral Team ─────── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <motion.div {...fadeUp()} className="mb-10">
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase">Liderança</span>
          <h2 className="font-heading text-3xl font-bold mt-2">Nossa Equipe Pastoral</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastors.map((pastor, i) => (
            <motion.div
              key={pastor.name}
              {...fadeUp(i * 0.1)}
              className="group bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                <span className="font-heading text-2xl font-bold text-white">{pastor.initials}</span>
              </div>
              <h3 className="font-heading text-lg font-bold">{pastor.name}</h3>
              <p className="text-accent text-sm font-semibold mt-1 uppercase tracking-wide">{pastor.role}</p>
              {pastor.bio && (
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{pastor.bio}</p>
              )}
            </motion.div>
          ))}

          {/* Placeholder for other pastors */}
          <motion.div
            {...fadeUp(0.2)}
            className="bg-muted/40 border border-dashed border-border rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[200px]"
          >
            <Users className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground italic">
              Outros líderes serão<br />adicionados em breve
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}