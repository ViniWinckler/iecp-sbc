import { motion } from "framer-motion";
import { Copy, Landmark, HeartHandshake } from "lucide-react";
import toast from "react-hot-toast";

export default function Dizimos() {
  const pixKey = "10943114000129";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada!");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            <span className="w-6 h-px bg-accent inline-block" />
            Contribuição
            <span className="w-6 h-px bg-accent inline-block" />
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
            Dízimos e Ofertas
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria." <br/>
            <span className="text-primary font-semibold text-sm">— 2 Coríntios 9:7</span>
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* PIX Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#E5F9F6] flex items-center justify-center mb-6">
              {/* Custom SVG for PIX to match the Base44 feel, or just use Lucide icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2.5 7.5L12 13L21.5 7.5L12 2Z" fill="#32BCAD"/>
                <path d="M12 22L2.5 16.5L12 11L21.5 16.5L12 22Z" fill="#32BCAD"/>
                <path d="M2.5 7.5V16.5L12 22V13L2.5 7.5Z" fill="#32BCAD"/>
                <path d="M21.5 7.5V16.5L12 22V13L21.5 7.5Z" fill="#32BCAD"/>
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Chave PIX</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Contribua para a obra de Deus na IECP SBC Jd. Ipanema através da nossa chave PIX oficial.
            </p>
            <div className="w-full bg-muted rounded-lg p-4 mb-6 relative">
              <p className="font-mono text-lg font-medium tracking-wider text-foreground">
                {pixKey}
              </p>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                CNPJ
              </span>
            </div>
            <button
              onClick={copyPix}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copiar Chave PIX
            </button>
          </motion.div>

          {/* Transferência Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Landmark className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Transferência</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Você também pode realizar transferências bancárias ou depósitos direto na conta da igreja.
            </p>
            <div className="w-full text-left bg-muted rounded-lg p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Banco</p>
                <p className="font-semibold text-foreground">Itaú (341)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Agência</p>
                  <p className="font-semibold text-foreground">6472</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Conta Corrente</p>
                  <p className="font-semibold text-foreground">20177-8</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Favorecido</p>
                <p className="font-semibold text-foreground">IECP SBC Jd. Ipanema</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
