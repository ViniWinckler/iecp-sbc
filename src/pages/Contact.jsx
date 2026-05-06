import { useState } from "react";
import { Send, MessageCircle, Instagram, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// ── Contato fixo da IECP SBC ─────────────────────────────────
const CHURCH_CONTACT = {
  whatsapp:  "5511959073490",
  whatsappDisplay: "(11) 95907-3490",
  instagram: "@iecp_sbc",
  instagramUrl: "https://www.instagram.com/iecp_sbc",
  address:   "Estrada dos Casa, 3860 – Jd. Ipanema",
  city:      "São Bernardo do Campo – SP",
  mapsUrl:   "https://www.google.com/maps/dir/?api=1&destination=-23.738,-46.5833",
};

export default function Contact() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Preencha pelo menos nome e mensagem.");
      return;
    }
    setSending(true);
    const text = `Olá! Meu nome é *${name}*${email ? ` (${email})` : ""}.\n\n${message}`;
    const url  = `https://wa.me/${CHURCH_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      setName(""); setEmail(""); setMessage("");
      setSending(false);
      toast.success("Redirecionando para o WhatsApp...");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header Banner ─────── */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=600&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Fale Conosco</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">Contato</h1>
            <p className="text-white/60 mt-2 text-lg">Estamos aqui para ajudar e receber você</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form ─────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold mb-2">Envie sua Mensagem</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Preencha o formulário e sua mensagem será enviada diretamente via WhatsApp.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Como podemos ajudar você?"
                    className="mt-1.5 min-h-[140px] resize-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl transition-colors disabled:opacity-70"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.083.531 4.043 1.463 5.748L0 24l6.394-1.432A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.381l-.36-.213-3.73.835.876-3.636-.235-.374A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.421-4.398 9.818-9.818 9.818z"/>
                  </svg>
                  {sending ? "Abrindo WhatsApp..." : "Enviar via WhatsApp"}
                </motion.button>
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Nenhum dado é salvo. A mensagem é enviada diretamente pelo WhatsApp.
                </p>
              </form>
            </div>
          </motion.div>

          {/* ── Sidebar Info ─────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${CHURCH_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">WhatsApp</p>
                <p className="font-semibold text-foreground">{CHURCH_CONTACT.whatsappDisplay}</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={CHURCH_CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-pink-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Instagram</p>
                <p className="font-semibold text-foreground">{CHURCH_CONTACT.instagram}</p>
              </div>
            </a>

            {/* Endereço */}
            <a
              href={CHURCH_CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Endereço</p>
                <p className="font-semibold text-foreground text-sm leading-snug">{CHURCH_CONTACT.address}</p>
                <p className="text-xs text-muted-foreground">{CHURCH_CONTACT.city}</p>
              </div>
            </a>

            {/* Horários */}
            <div className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Horários</p>
                <p className="text-sm font-medium">Dom. 09h00 — Escola Dominical</p>
                <p className="text-sm font-medium">Dom. 18h00 — Culto de Celebração</p>
                <p className="text-sm font-medium">Qua. 19h30 — Culto de Oração</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}