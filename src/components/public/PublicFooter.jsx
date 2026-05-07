import { Church, Instagram, Facebook, Youtube, BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    label: "INSTAGRAM",
    icon: Instagram,
    href: "https://www.instagram.com/iecp_sbc",
    color: "hover:text-pink-400",
  },
  {
    label: "FACEBOOK",
    icon: Facebook,
    href: "https://facebook.com",
    color: "hover:text-blue-400",
  },
  {
    label: "YOUTUBE",
    icon: Youtube,
    href: "https://youtube.com",
    color: "hover:text-red-400",
  },
  {
    label: "BLOG",
    icon: BookOpen,
    href: "#",
    color: "hover:text-accent",
  },
];

const navLinks = [
  { path: "/", label: "Início" },
  { path: "/quem-somos", label: "Quem Somos" },
  { path: "/eventos", label: "Eventos" },
  { path: "/dizimos", label: "Dízimos" },
  { path: "/contato", label: "Contato" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1 — Logo + Descrição + Endereço */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="overflow-hidden rounded-full w-16 h-16 mb-4 shadow-lg border border-white/10">
                <img src="/logo.png" alt="IECP SBC" className="w-full h-full object-cover scale-125" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold tracking-wide block">IECP SBC</span>
                <span className="text-white/50 text-xs uppercase tracking-widest">Jd. Ipanema</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Uma igreja viva, servindo a comunidade com amor e esperança em São Bernardo do Campo.
            </p>
            <div className="mt-5 text-white/50 text-sm space-y-1">
              <p>Estrada dos Casa, 3860, Jd. Ipanema</p>
              <p>São Bernardo do Campo - SP</p>
              <p>CEP 09840-630</p>
              <p className="pt-1 text-white/40">Domingos: 09h e 18h &bull; Quartas: 19h30</p>
            </div>
          </div>

          {/* Col 2 — Navegação */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
              Navegação
            </h4>
            <div className="space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-white/60 hover:text-white transition-colors hover:translate-x-1 transform"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Redes Sociais + Acesso Restrito */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
              Redes Sociais
            </h4>
            <div className="space-y-3 mb-8">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 text-sm text-white/60 transition-colors ${s.color}`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </a>
              ))}
            </div>

            {/* Acesso Restrito */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
                Acesso Restrito
              </h4>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-accent transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                ÁREA DO MEMBRO
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} IECP SBC Jd. Ipanema. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/30 italic">
            "Para mim o viver é Cristo..." — Fp 1:21
          </p>
        </div>
      </div>
    </footer>
  );
}