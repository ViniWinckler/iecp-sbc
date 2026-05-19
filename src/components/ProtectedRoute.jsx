import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Clock, ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Protege rotas internas verificando:
 *  1. Se o usuário está autenticado (redireciona para /login se não estiver)
 *  2. Se o Status da conta é 'Ativo' (mostra tela de aprovação pendente se 'Pendente')
 *  3. Se o usuário tem a permissão mínima requerida (requiredRole)
 *
 * Props:
 *  - requiredRole: 'Admin' | 'Pastor' | 'Lider' (opcional)
 */
export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, isLoadingAuth, userProfile } = useAuth();

  // Ainda carregando o estado de auth → spinner
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Não autenticado → redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado mas aguardando aprovação pastoral
  if (userProfile?.Status === "Pendente") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-10 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-3">Conta em Análise</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Seu cadastro foi recebido! Aguarde a aprovação de um pastor para acessar o portal interno.
          </p>
          <p className="text-xs text-muted-foreground">
            Em caso de dúvidas, entre em contato pela página de{" "}
            <Link to="/contato" className="text-primary underline">Contato</Link>.
          </p>
        </div>
      </div>
    );
  }

  // Verifica permissão mínima caso requiredRole seja especificado
  if (requiredRole) {
    const role = userProfile?.Nivel_Acesso;
    // Hierarquia de permissões
    const HIERARCHY = {
      Admin:  ["Admin"],
      Pastor: ["Admin", "Pastor"],
      Lider:  ["Admin", "Pastor", "Lider"],
    };
    const allowed = HIERARCHY[requiredRole] || [requiredRole];
    if (!allowed.includes(role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-10 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <ShieldOff className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-3">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}
