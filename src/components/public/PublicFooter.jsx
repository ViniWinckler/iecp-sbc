import { Church } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center">
                <Church className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-base font-semibold">Nossa Igreja</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Um lugar de fé, amor e comunhão. Venha nos visitar e fazer parte desta família.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/40 mb-4">
              Navegação
            </h4>
            <div className="space-y-2.5">
              {[
                { path: "/", label: "Início" },
                { path: "/quem-somos", label: "Quem Somos" },
                { path: "/eventos", label: "Eventos" },
                { path: "/localizacao", label: "Localização" },
                { path: "/contato", label: "Contato" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/40 mb-4">
              Membros
            </h4>
            <Link
              to="/login"
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Área do Membro
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} Nossa Igreja. Todos os direitos reservados.
          </p>
          <p className="text-sm text-primary-foreground/40">
            Feito para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
}