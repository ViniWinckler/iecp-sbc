import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Facebook, Youtube, MapPin, Clock, Heart, Users, BookOpen } from 'lucide-react';

// --- Components ---
const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuItems = [
    { name: 'Início', path: '/' },
    { name: 'Quem Somos', path: '/quem-somos' },
    { name: 'Ministérios', path: '/ministerios' },
    { name: 'Agenda', path: '/agenda' },
    { name: 'Contribua', path: '/contribua' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel px-6 py-4">
      <div className="max-width-1200 mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gradient">IECP SBC</Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {menuItems.map(item => (
            <Link key={item.name} to={item.path} className="nav-link">{item.name}</Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-secondary mt-4 rounded-xl"
          >
            <div className="flex flex-col p-6 space-y-4">
              {menuItems.map(item => (
                <Link key={item.name} to={item.path} className="nav-link" onClick={() => setIsOpen(false)}>{item.name}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-secondary p-12 mt-20 border-t border-white/5">
    <div className="max-w-1200 mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h3 className="text-xl font-bold text-primary mb-4">IECP SBC</h3>
        <p className="text-muted text-sm">"Um lugar de recomeços"</p>
      </div>
      <div>
        <h4 className="font-bold mb-4">Endereço</h4>
        <p className="text-muted text-sm flex items-start gap-2">
          <MapPin size={18} className="text-primary shrink-0" />
          Av. Dom Jaime de Barros Câmara, 521<br />Planalto, São Bernardo do Campo - SP
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4">Redes Sociais</h4>
        <div className="flex gap-4">
          <Instagram className="text-muted hover:text-primary cursor-pointer transition-colors" />
          <Facebook className="text-muted hover:text-primary cursor-pointer transition-colors" />
          <Youtube className="text-muted hover:text-primary cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
    <div className="text-center mt-12 text-xs text-muted/50">
      © 2024 IECP SBC - Igreja Evangélica Casa de Prayer
    </div>
  </footer>
);

// --- Pages ---
const Home = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32">
    <section className="text-center">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-5xl md:text-7xl font-extrabold mb-6"
      >
        Seja bem-vindo à <br /><span className="text-gradient">IECP SBC</span>
      </motion.h1>
      <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
        "Alegrei-me quando me disseram: Vamos à casa do Senhor." - Salmos 122:1
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/agenda" className="btn-primary">Nossos Cultos</Link>
        <Link to="/quem-somos" className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-all">Quem Somos</Link>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="glass-panel p-8 rounded-2xl">
        <Users className="text-primary mb-4" size={32} />
        <h3 className="text-xl font-bold mb-2">Comunhão</h3>
        <p className="text-muted text-sm">Um lugar onde você é recebido como família.</p>
      </div>
      <div className="glass-panel p-8 rounded-2xl">
        <BookOpen className="text-primary mb-4" size={32} />
        <h3 className="text-xl font-bold mb-2">Palavra</h3>
        <p className="text-muted text-sm">Ensino fiel às Escrituras para o seu crescimento.</p>
      </div>
      <div className="glass-panel p-8 rounded-2xl">
        <Heart className="text-primary mb-4" size={32} />
        <h3 className="text-xl font-bold mb-2">Adoração</h3>
        <p className="text-muted text-sm">"Os verdadeiros adoradores adorarão o Pai em espírito e em verdade."</p>
      </div>
    </section>
  </motion.div>
);

const About = () => (
  <section className="pt-32">
    <h1 className="text-4xl font-bold mb-8 text-gradient">Quem Somos</h1>
    <div className="glass-panel p-8 rounded-2xl">
      <p className="text-lg text-muted leading-relaxed">
        A Igreja Evangélica Casa de Prayer (IECP) em São Bernardo do Campo é uma comunidade cristã dedicada a ser um "lugar de recomeços". Focamos na adoração genuína, no ensino da Bíblia e no acolhimento de todas as pessoas que buscam uma experiência real com Deus.
      </p>
    </div>
  </section>
);

const Schedule = () => (
  <section className="pt-32">
    <h1 className="text-4xl font-bold mb-8 text-gradient">Nossa Agenda</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { day: 'Terça-feira', time: '20:00', event: 'Culto de Oração' },
        { day: 'Quinta-feira', time: '20:00', event: 'Culto de Ensino' },
        { day: 'Domingo', time: '18:30', event: 'Culto de Celebração' }
      ].map(item => (
        <div key={item.day} className="glass-panel p-6 rounded-xl border-l-4 border-primary">
          <div className="flex items-center gap-2 text-primary font-bold mb-2">
            <Clock size={18} />
            {item.day}
          </div>
          <div className="text-2xl font-bold">{item.time}</div>
          <div className="text-muted">{item.event}</div>
        </div>
      ))}
    </div>
  </section>
);

const Contribute = () => (
  <section className="pt-32 text-center">
    <h1 className="text-4xl font-bold mb-8 text-gradient">Contribua</h1>
    <div className="glass-panel p-12 rounded-3xl max-w-xl mx-auto">
      <p className="text-muted mb-8">Sua contribuição ajuda a manter nossas obras sociais e a manutenção da igreja.</p>
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Chave PIX</h4>
        <div className="text-2xl font-mono">CNPJ: 50.814.717/0001-38</div>
      </div>
      <p className="text-xs text-muted/50">Igreja Evangélica Casa de Prayer - SBC</p>
    </div>
  </section>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/agenda" element={<Schedule />} />
            <Route path="/contribua" element={<Contribute />} />
            <Route path="/ministerios" element={<div className="pt-32 section text-center"><h1>Em breve...</h1></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
