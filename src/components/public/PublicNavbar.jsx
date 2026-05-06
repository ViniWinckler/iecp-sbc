import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Church, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/",           label: "Início" },
  { path: "/quem-somos", label: "Quem Somos" },
  { path: "/eventos",    label: "Eventos" },
  { path: "/dizimos",    label: "Dízimos" },
  { path: "/contato",    label: "Contato" },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Transparent on Hero, solid when scrolled
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location]);

  const isHome = location.pathname === "/";

  return (
    <>
      <motion.nav
        animate={{
          backgroundColor: scrolled || !isHome ? "hsl(222,47%,18%)" : "transparent",
          boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.25)" : "none",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backdropFilter: scrolled || !isHome ? "blur(12px)" : "none" }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[70px]">

            {/* ── Logo ── */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 group"
            >
              <img src="/logo.png" alt="IECP SBC Logo" className="w-11 h-auto" />
              <div className="leading-tight hidden sm:block">
                <span className="font-heading text-base font-bold text-white tracking-wide block transition-colors group-hover:text-accent">
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
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 uppercase tracking-wide group ${
                      active ? "text-white" : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.label}
                    {/* Hover Animated Dashed Line */}
                    <span className={`absolute left-4 right-4 bottom-1 h-[2px] overflow-hidden ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-300`}>
                       <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScnJz48cmVjdCB3aWR0aD0nNicgaGVpZ2h0PScnJyBmaWxsPScjZjZiNzNkJy8+PC9zdmc+')] animate-[dash_1s_linear_infinite]" />
                    </span>
                  </Link>
                );
              })}

              {/* CTA button */}
              <Link to="/login" className="ml-4" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
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
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="x"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
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
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: "hsl(222,47%,13%)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="px-5 py-5 space-y-1">
                {navLinks.map((link, i) => {
                  const active = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "text-accent bg-white/8 border-l-2 border-accent pl-3"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="pt-3 pb-1"
                >
                  <Link to="/login">
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-lg shadow-sm hover:bg-accent/90 transition-colors">
                      <User className="w-4 h-4" />
                      Área do Membro
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}