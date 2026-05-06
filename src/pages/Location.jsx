import { MapPin, Navigation, ExternalLink, Clock, Sun, Moon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CHURCH = {
  lat: -23.738,
  lng: -46.5833,
  address: "Estrada dos Casa, 3860, Jd. Ipanema",
  city: "São Bernardo do Campo - SP, CEP 09840-630",
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.738,-46.5833",
  embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.5!2d-46.5833!3d-23.738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ0JzE2LjgiUyA0NsKwMzUnMDEuOSJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr",
};

const serviceTimes = [
  { day: "Domingo Manhã", time: "09h00", desc: "Escola Dominical e Culto Matutino", Icon: Sun },
  { day: "Domingo Noite", time: "18h00", desc: "Culto de Celebração da Família",    Icon: Moon },
  { day: "Quarta-Feira",  time: "19h30", desc: "Culto de Oração e Doutrina",         Icon: Flame },
];

export default function Location() {
  const handleDirections = () => {
    window.open(CHURCH.mapsUrl, "_blank");
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Page Header */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1600&h=600&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Venha nos visitar</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">Localização</h1>
            <p className="text-white/60 mt-2">Saiba como chegar até nós</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Map — 2/3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-xl overflow-hidden border border-border h-[380px] lg:h-[480px] shadow-sm"
          >
            <iframe
              title="Localização IECP SBC"
              src={CHURCH.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Sidebar info — 1/3 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-5"
          >
            {/* Address card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Endereço</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {CHURCH.address}<br />
                {CHURCH.city}
              </p>
            </div>

            {/* Service times */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-4">Horários dos Cultos</h3>
              <div className="space-y-3">
                {serviceTimes.map((s) => (
                  <div key={s.day} className="flex items-start gap-3">
                    <s.Icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{s.day} — {s.time}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Directions button */}
            <Button
              onClick={handleDirections}
              className="w-full bg-primary hover:bg-primary/90 gap-2 h-12 font-semibold tracking-wide"
              size="lg"
            >
              <Navigation className="w-4 h-4" />
              Traçar Rota no Mapa
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}