import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/", label: "Início" },
  { path: "/quem-somos", label: "Quem Somos" },
  { path: "/eventos", label: "Eventos" },
  { path: "/dizimos", label: "Dízimos" },
  { path: "/contato", label: "Contato" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  // Transparent on home hero, solid after scroll or on other pages
  const transparent = isHome && !scrolled && !open;

  // Text color depends on navbar state
  const textColor = transparent ? "text-white/90 hover:text-white" : "text-primary/80 hover:text-primary";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          transparent
            ? "bg-transparent border-transparent"
            : "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[70px]">
            
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-14 h-14 flex items-center justify-center transition-all duration-300">
                <img 
                  src="/logo.png" 
                  alt="IECP SBC Logo" 
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <span className={`font-heading text-base font-bold tracking-wide block transition-colors group-hover:text-accent ${transparent ? "text-white" : "text-primary"}`}>
                  IECP SBC
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 uppercase tracking-wide group ${textColor}`}
                  >
                    {link.label}
                    {/* Animated Line (Invisible default, Gray on hover, Orange when active) */}
                    <span 
                      className={`absolute left-4 right-4 bottom-0 h-[2px] transition-all duration-300 origin-left ${
                        active 
                          ? "bg-accent scale-x-100 opacity-100" 
                          : transparent 
                            ? "bg-white/40 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100" 
                            : "bg-gray-300 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                      }`} 
                    />
                  </Link>
                );
              })}

              {/* CTA button */}
              <Link to="/login" className="ml-4">
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: "hsl(43,74%,55%)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors relative group overflow-hidden"
                  style={{ backgroundColor: "hsl(43,74%,49%)" }}
                >
                  <User className="w-4 h-4" />
                  ÁREA DO MEMBRO
                </motion.button>
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setOpen(!open)}
              className={`md:hidden p-2 rounded-lg transition-colors ${transparent ? "text-white hover:bg-white/10" : "text-primary hover:bg-primary/10"}`}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white border-t border-border shadow-xl"
            >
              <div className="px-5 py-5 space-y-1">
                {navLinks.map((link, i) => {
                  const active = location.pathname === link.path;
                  return (
                    <motion.div key={link.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "text-accent bg-accent/10 border-l-2 border-accent pl-3"
                            : "text-primary/70 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.05 }} className="pt-3 pb-1">
                  <Link to="/login">
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-sm font-bold uppercase rounded-lg shadow-sm hover:bg-accent/90 transition-colors">
                      <User className="w-4 h-4" />
                      ÁREA DO MEMBRO
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer para páginas que não são home */}
      {!isHome && <div className="h-[70px]" />}
    </>
  );
}