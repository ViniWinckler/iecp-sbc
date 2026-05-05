import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Calendar, ListChecks, FolderKanban, Megaphone,
  Users, Settings, LogOut, Menu, X, Church, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const memberNav = [
  { path: "/dashboard", label: "Início", icon: LayoutDashboard },
  { path: "/escalas", label: "Escalas", icon: ListChecks },
  { path: "/calendario", label: "Calendário", icon: Calendar },
  { path: "/projetos", label: "Projetos", icon: FolderKanban },
  { path: "/avisos", label: "Avisos", icon: Megaphone },
];

const adminNav = [
  { path: "/ministerios", label: "Ministérios", icon: Users },
  { path: "/admin", label: "Administração", icon: Settings },
];

export default function InternalLayout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate("/login"));
  }, [navigate]);

  const isAdmin = user?.role === "admin";
  const isLeaderOrAdmin = user?.role === "admin" || user?.role === "leader" || user?.role === "pastor";

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  const displayName = user?.display_name || user?.full_name || "Membro";

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Church className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading text-base font-semibold text-sidebar-foreground">
            Nossa Igreja
          </span>
        </Link>
      </div>

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
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}

        {isLeaderOrAdmin && (
          <>
            <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2 mt-4">
              Gestão
            </p>
            {adminNav.map((item) => {
              if (item.path === "/admin" && !isAdmin) return null;
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role || "membro"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
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
          <h2 className="font-heading text-lg font-semibold truncate">
            {memberNav.find((n) => n.path === location.pathname)?.label ||
              adminNav.find((n) => n.path === location.pathname)?.label ||
              ""}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}