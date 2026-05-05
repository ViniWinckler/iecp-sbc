import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageCircle, Instagram, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState({});

  useEffect(() => {
    base44.entities.ChurchInfo.list().then((items) => {
      const map = {};
      items.forEach((item) => { map[item.key] = item; });
      setInfo(map);
    }).catch(() => {});
  }, []);

  const whatsapp = info.whatsapp?.value || "";
  const instagram = info.instagram?.value || "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast({ title: "Preencha pelo menos nome e mensagem", variant: "destructive" });
      return;
    }
    if (!whatsapp) {
      toast({ title: "WhatsApp não configurado", variant: "destructive" });
      return;
    }

    const cleanNumber = whatsapp.replace(/\D/g, "");
    const text = `Olá! Meu nome é *${name}*${email ? ` (${email})` : ""}.\n\n${message}`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    setName("");
    setEmail("");
    setMessage("");
    toast({ title: "Redirecionando para o WhatsApp..." });
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=600&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">Contato</h1>
            <p className="text-white/70 text-lg">Envie sua mensagem direto pelo WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold mb-6">Envie sua Mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    className="mt-1.5 min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 gap-2 h-12">
                  <Send className="w-4 h-4" />
                  Enviar via WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Nenhum dado é salvo. A mensagem é enviada diretamente pelo WhatsApp.
                </p>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-semibold">{whatsapp}</p>
                </div>
              </a>
            )}
            {instagram && (
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-pink-300 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  <p className="font-semibold">@{instagram.replace("@", "")}</p>
                </div>
              </a>
            )}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
              <MessageCircle className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-heading font-semibold mb-1">Privacidade</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Não armazenamos nenhum dado pessoal. Sua mensagem é enviada diretamente via WhatsApp.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}