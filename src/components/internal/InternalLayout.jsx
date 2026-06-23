import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, ListChecks, FolderKanban, Megaphone,
  Users, Settings, LogOut, Menu, Church, User
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";
import { Clock } from "lucide-react";

const memberNav = [
  { path: "/dashboard",  label: "Início",    icon: LayoutDashboard },
  { path: "/escalas",    label: "Escalas",   icon: ListChecks },
  { path: "/calendario", label: "Calendário",icon: Calendar },
  { path: "/projetos",   label: "Projetos",  icon: FolderKanban },
  { path: "/avisos",     label: "Avisos",    icon: Megaphone },
];

const managementNav = [
  { path: "/ministerios", label: "Ministérios",   icon: Users,    minRole: "Lider" },
  { path: "/admin",       label: "Administração", icon: Settings, minRole: "Admin" },
];

// Verifica se o usuário tem acesso ao item de nav baseado na hierarquia
function hasAccess(userRole, minRole) {
  const HIERARCHY = { Admin: 4, Pastor: 3, Lider: 2, Membro: 1 };
  return (HIERARCHY[userRole] || 0) >= (HIERARCHY[minRole] || 0);
}

export default function InternalLayout() {
  const { user, userProfile, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Fechar sidebar no mobile ao trocar de rota
  useEffect(() => { setSidebarOpen(false); }, [location]);

  // Aguardando estado de auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Não autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Conta pendente de aprovação
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
          <button
            onClick={() => logout()}
            className="text-sm text-muted-foreground underline"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const role = userProfile?.Nivel_Acesso || "Membro";
  const displayName = userProfile?.Nome_Exibicao || user?.displayName || user?.email?.split("@")[0] || "Membro";

  // Itens de gestão visíveis para este usuário
  const visibleManagement = managementNav.filter(item => hasAccess(role, item.minRole));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Church className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="leading-tight">
            <span className="font-heading text-sm font-bold text-sidebar-foreground block">IECP SBC</span>
            <span className="text-[9px] text-sidebar-foreground/50 uppercase tracking-widest">Portal do Membro</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2">
          Principal
        </p>
        {memberNav.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Seção de Gestão — visível apenas para Líder+ */}
        {visibleManagement.length > 0 && (
          <>
            <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2 mt-4">
              Gestão
            </p>
            {visibleManagement.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/50">{role}</p>
          </div>
        </div>
        <Link
          to="/perfil"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full mb-1"
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  const currentLabel =
    memberNav.find(n => n.path === location.pathname)?.label ||
    managementNav.find(n => n.path === location.pathname)?.label || "";

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar animate-in slide-in-from-left">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-heading text-lg font-semibold truncate">{currentLabel}</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}