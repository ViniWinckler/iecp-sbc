import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Church } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { path: "/", label: "Início" },
  { path: "/quem-somos", label: "Quem Somos" },
  { path: "/eventos", label: "Eventos" },
  { path: "/dizimos", label: "Dízimos" },
  { path: "/contato", label: "Contato" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-foreground/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shadow-sm">
              <Church className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-white tracking-wide">
              IECP SBC
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.path
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/login">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground px-5 gap-2 font-semibold tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Área do Membro
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded text-white hover:bg-white/10 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-b border-primary-foreground/10">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded transition-colors ${
                  location.pathname === link.path
                    ? "text-accent bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Área do Membro
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}