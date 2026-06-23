import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getAvisos, createAviso, getMinisterios, getMinisteriosDoUsuario } from "@/services/db";
import { Megaphone, Plus, Globe, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import moment from "moment";
import { deleteAviso } from "@/services/db/eventos";

export default function Announcements() {
  const { userProfile, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newScope, setNewScope] = useState("Global");
  const [newMinistryId, setNewMinistryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userProfile?.Nivel_Acesso === "Admin";
  const isPastorOrAdmin = isAdmin || userProfile?.Nivel_Acesso === "Pastor";
  const isLeader = userProfile?.Nivel_Acesso === "Lider";
  const canCreate = isPastorOrAdmin || isLeader;

  useEffect(() => {
    if (userProfile && userProfile.Status === "Ativo") {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const email = user?.email || userProfile?.Email;
      const [allAnnouncements, allMinistries, myMemberships] = await Promise.all([
        getAvisos(),
        getMinisterios(),
        getMinisteriosDoUsuario(email),
      ]);

      // Filter logic:
      // Admins see everything.
      // Others see Global + Ministry specific if they are part of it.
      const myMinistryIds = myMemberships.map(m => m.id);
      
      const filtered = allAnnouncements.filter(a => {
        if (isAdmin) return true;
        if (a.Escopo === "Global") return true;
        return myMinistryIds.includes(a.ID_Ministerio_Alvo);
      });

      setAnnouncements(filtered);
      setMinistries(allMinistries);
      setMemberships(myMemberships);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar avisos", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      toast({ title: "Preencha título e mensagem", variant: "destructive" });
      return;
    }
    if (newScope === "Ministerio" && !newMinistryId) {
      toast({ title: "Selecione o ministério", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const email = user?.email || userProfile?.Email;
      await createAviso({
        Titulo: newTitle,
        Mensagem: newMessage,
        Escopo: newScope,
        ID_Ministerio_Alvo: newScope === "Ministerio" ? newMinistryId : null,
        Criado_Por_Email: email
      });
      
      toast({ title: "Aviso publicado com sucesso!" });
      setShowCreate(false);
      setNewTitle("");
      setNewMessage("");
      setNewScope("Global");
      setNewMinistryId("");
      loadData();
    } catch (e) {
      toast({ title: "Erro ao criar aviso", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja apagar este aviso?")) return;
    try {
      await deleteAviso(id);
      toast({ title: "Aviso removido." });
      loadData();
    } catch (e) {
      toast({ title: "Erro ao apagar aviso", variant: "destructive" });
    }
  };

  // Líderes só podem postar para os próprios ministérios ou global se autorizado (vamos liberar global para líderes)
  const allowedMinistries = isPastorOrAdmin ? ministries : memberships;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Avisos Internos</h1>
        {canCreate && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Aviso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Publicar Aviso</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="mt-1 min-h-[100px]" />
                </div>
                <div>
                  <Label>Público Alvo (Escopo)</Label>
                  <Select value={newScope} onValueChange={setNewScope}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Global (Todos os Membros)</SelectItem>
                      <SelectItem value="Ministerio">Apenas um Ministério</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newScope === "Ministerio" && (
                  <div>
                    <Label>Selecione o Ministério</Label>
                    <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {allowedMinistries.map((m) => (<SelectItem key={m.id} value={m.id}>{m.Nome_Ministerio}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleCreate} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Publicando..." : "Publicar Aviso"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhum aviso publicado no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => {
            const minName = a.ID_Ministerio_Alvo ? ministries.find(m => m.id === a.ID_Ministerio_Alvo)?.Nome_Ministerio : null;
            const canDelete = isAdmin || (user?.email && a.Criado_Por_Email === user.email);

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 relative group"
              >
                {canDelete && (
                  <button 
                    onClick={() => handleDelete(a.id)}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir Aviso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-start justify-between gap-3 mb-3 pr-10">
                  <div className="flex items-center gap-2">
                    {a.Escopo === "Global" ? (
                      <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <Users className="w-4 h-4 text-accent" />
                    )}
                    <h3 className="font-heading font-semibold text-lg">{a.Titulo}</h3>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Badge variant={a.Escopo === "Global" ? "default" : "secondary"}>
                    {a.Escopo === "Global" ? "Para Todos" : `Ministério: ${minName || "Desconhecido"}`}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{a.Mensagem}</p>
                
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Por: {a.Criado_Por_Email}</span>
                  <span>{a.Data_Publicacao ? moment(a.Data_Publicacao.toDate()).fromNow() : 'Agora'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}