import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const defaultBanners = [
  {
    title: "IECP SBC\nJd. Ipanema",
    subtitle: "Uma igreja viva, servindo a comunidade com amor e esperança em São Bernardo do Campo.",
    image_url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&h=1080&fit=crop&q=90",
  },
  {
    title: "Transformando\nVidas pela Fé",
    subtitle: "Cultos aos domingos às 9h e 18h. Venha nos visitar!",
    image_url: "https://images.unsplash.com/photo-1477281765962-ef34e8bb0967?w=1920&h=1080&fit=crop&q=90",
  },
  {
    title: "Crescendo\nJuntos em Cristo",
    subtitle: "Comunidade, oração, discipulado e missão.",
    image_url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&h=1080&fit=crop&q=90",
  },
];

export default function HeroBanner({ banners = [] }) {
  const slides = banners.length > 0 ? banners : defaultBanners;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  return (
    <div className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image_url})` }}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      {/* Decorative cross accent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 text-white hidden lg:block pointer-events-none"
      >
        <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
          <rect x="42" y="5" width="16" height="90" rx="3" />
          <rect x="5" y="30" width="90" height="16" rx="3" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-0.5 bg-accent mb-6"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-accent text-sm font-semibold tracking-[0.3em] uppercase mb-4"
            >
              Igreja Cristã ✦ Bem-vindo
            </motion.p>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 whitespace-pre-line">
              {slides[current].title.split("\n").map((line, i) => (
                <motion.span
                  key={i}
                  className="block"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                >
                  {i === 1 ? (
                    <span className="text-accent">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/70 text-lg sm:text-xl max-w-xl leading-relaxed mb-10"
            >
              {slides[current].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/localizacao">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-sm text-sm tracking-wider uppercase hover:bg-accent/90 transition-colors"
                >
                  Planeje sua visita
                </motion.button>
              </Link>
              <Link to="/quem-somos">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 border border-white/40 text-white font-semibold rounded-sm text-sm tracking-wider uppercase hover:bg-white/10 transition-colors"
                >
                  Nossa História
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go((current - 1 + slides.length) % slides.length)}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go((current + 1) % slides.length)}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                className={`transition-all duration-300 ${
                  idx === current
                    ? "w-8 h-0.5 bg-accent"
                    : "w-3 h-0.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-8 sm:right-12 z-20 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase rotate-90 mb-4">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.div>

      {/* Slide number */}
      <div className="absolute bottom-10 right-8 sm:right-12 z-20 text-white/30 text-xs font-mono hidden sm:block">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}