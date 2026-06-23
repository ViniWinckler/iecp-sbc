import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getPublicacoes, createPublicacao, updatePublicacao, deletePublicacao, getMinisterios, getMinisteriosDoUsuario } from "@/services/db";
import {
  Megaphone, Plus, Globe, Users, Trash2, Pencil,
  Calendar, PartyPopper, Bell, Info, Check
} from "lucide-react";
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
import "moment/locale/pt-br";

moment.locale("pt-br");

const TIPOS = [
  { value: "Aviso",       label: "📢 Aviso",       icon: Bell },
  { value: "Evento",      label: "📅 Evento",      icon: Calendar },
  { value: "Aniversario", label: "🎉 Aniversário", icon: PartyPopper },
  { value: "Reuniao",     label: "🤝 Reunião",     icon: Users },
  { value: "Outros",      label: "ℹ️ Outros",      icon: Info },
];

const TIPO_COLORS = {
  Aviso:       "bg-yellow-100 text-yellow-800 border-yellow-200",
  Evento:      "bg-blue-100 text-blue-800 border-blue-200",
  Aniversario: "bg-pink-100 text-pink-800 border-pink-200",
  Reuniao:     "bg-purple-100 text-purple-800 border-purple-200",
  Outros:      "bg-gray-100 text-gray-700 border-gray-200",
};

const VISIBILIDADES = [
  { value: "Interno", label: "🔒 Somente Membros (Interno)" },
  { value: "Publico",  label: "🌐 Site Público (Externo)" },
  { value: "Ambos",    label: "✅ Membros + Site Público (Ambos)" },
];

const EMPTY_FORM = {
  Titulo: "", Mensagem: "", Tipo: "Aviso",
  Visibilidade: "Interno", Escopo: "Global",
  ID_Ministerio_Alvo: "", Imagem_URL: "", Data_Evento: ""
};

export default function Announcements() {
  const { userProfile, user } = useAuth();
  const [publicacoes, setPublicacoes] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const isAdmin = userProfile?.Nivel_Acesso === "Admin";
  const isPastor = userProfile?.Nivel_Acesso === "Pastor";
  const isLeader = userProfile?.Nivel_Acesso === "Lider";
  const canCreate = isAdmin || isPastor || isLeader;

  useEffect(() => {
    if (userProfile?.Status === "Ativo") loadData();
  }, [userProfile]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const email = user?.email || userProfile?.Email;
      const [all, allMin, myMin] = await Promise.all([
        getPublicacoes(),
        getMinisterios(),
        getMinisteriosDoUsuario(email),
      ]);
      const myMinIds = myMin.map(m => m.id);
      // Filter: admin sees all; others see Internal-Global + their ministries
      const filtered = all.filter(p => {
        if (p.Visibilidade === "Publico") return false; // internal screen hides pure-public
        if (isAdmin) return true;
        if (p.Escopo === "Global") return true;
        return myMinIds.includes(p.ID_Ministerio_Alvo);
      });
      setPublicacoes(filtered);
      setMinistries(allMin);
      setMemberships(myMin);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar publicações", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.Titulo.trim()) { toast({ title: "Informe o título", variant: "destructive" }); return; }
    if (form.Escopo === "Ministerio" && !form.ID_Ministerio_Alvo) {
      toast({ title: "Selecione o ministério", variant: "destructive" }); return;
    }
    setIsSubmitting(true);
    try {
      const email = user?.email || userProfile?.Email;
      await createPublicacao({ ...form, Criado_Por_Email: email });
      toast({ title: "Publicação criada com sucesso!" });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao criar publicação", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      Titulo: p.Titulo || "",
      Mensagem: p.Mensagem || "",
      Tipo: p.Tipo || "Aviso",
      Visibilidade: p.Visibilidade || "Interno",
      Escopo: p.Escopo || "Global",
      ID_Ministerio_Alvo: p.ID_Ministerio_Alvo || "",
      Imagem_URL: p.Imagem_URL || "",
      Data_Evento: p.Data_Evento ? moment(p.Data_Evento.toDate ? p.Data_Evento.toDate() : p.Data_Evento).format("YYYY-MM-DDTHH:mm") : ""
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!form.Titulo.trim()) { toast({ title: "Informe o título", variant: "destructive" }); return; }
    setIsSubmitting(true);
    try {
      const updates = {
        Titulo: form.Titulo, Mensagem: form.Mensagem, Tipo: form.Tipo,
        Visibilidade: form.Visibilidade, Escopo: form.Escopo,
        ID_Ministerio_Alvo: form.ID_Ministerio_Alvo || null,
        Imagem_URL: form.Imagem_URL || "",
        Data_Evento: form.Data_Evento ? new Date(form.Data_Evento) : null
      };
      await updatePublicacao(editingId, updates);
      toast({ title: "Publicação atualizada!" });
      setShowEdit(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadData();
    } catch (e) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, autorEmail) => {
    const canDel = isAdmin || (user?.email && autorEmail === user.email);
    if (!canDel) { toast({ title: "Sem permissão", variant: "destructive" }); return; }
    if (!confirm("Apagar esta publicação?")) return;
    try {
      await deletePublicacao(id);
      toast({ title: "Publicação removida." });
      loadData();
    } catch { toast({ title: "Erro ao apagar", variant: "destructive" }); }
  };

  const allowedMin = (isAdmin || isPastor) ? ministries : memberships;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Comunicados</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Avisos, eventos e anúncios da congregação</p>
        </div>
        {canCreate && (
          <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); if (!v) setForm(EMPTY_FORM); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Publicação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-heading">Criar Publicação</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">

                {/* Tipo */}
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.Tipo} onValueChange={v => upd("Tipo", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Título */}
                <div>
                  <Label>Título *</Label>
                  <Input value={form.Titulo} onChange={e => upd("Titulo", e.target.value)} className="mt-1" placeholder="Ex: Ensaio cancelado esta semana" />
                </div>

                {/* Mensagem */}
                <div>
                  <Label>Mensagem / Descrição</Label>
                  <Textarea value={form.Mensagem} onChange={e => upd("Mensagem", e.target.value)} className="mt-1 min-h-[80px]" placeholder="Detalhes da publicação..." />
                </div>

                {/* Data do Evento */}
                {(form.Tipo === "Evento" || form.Tipo === "Reuniao" || form.Tipo === "Aniversario") && (
                  <div>
                    <Label>Data e Hora</Label>
                    <Input type="datetime-local" value={form.Data_Evento} onChange={e => upd("Data_Evento", e.target.value)} className="mt-1" />
                  </div>
                )}

                {/* URL da Imagem */}
                <div>
                  <Label>URL da Imagem <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input value={form.Imagem_URL} onChange={e => upd("Imagem_URL", e.target.value)} className="mt-1" placeholder="https://..." />
                </div>

                {/* Visibilidade */}
                <div>
                  <Label>Visibilidade *</Label>
                  <Select value={form.Visibilidade} onValueChange={v => upd("Visibilidade", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VISIBILIDADES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.Visibilidade === "Publico" && "Aparecerá na página de Eventos do site público."}
                    {form.Visibilidade === "Interno" && "Visível apenas para membros logados."}
                    {form.Visibilidade === "Ambos" && "Visível para membros internos E no site público."}
                  </p>
                </div>

                {/* Escopo interno */}
                {(form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
                  <div>
                    <Label>Público Interno</Label>
                    <Select value={form.Escopo} onValueChange={v => upd("Escopo", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Global">🌍 Todos os Membros</SelectItem>
                        <SelectItem value="Ministerio">⛪ Apenas um Ministério</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.Escopo === "Ministerio" && (form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
                  <div>
                    <Label>Ministério</Label>
                    <Select value={form.ID_Ministerio_Alvo} onValueChange={v => upd("ID_Ministerio_Alvo", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {allowedMin.map(m => <SelectItem key={m.id} value={m.id}>{m.Nome_Ministerio}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleCreate} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl border border-border" />)}
        </div>
      ) : publicacoes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhum comunicado publicado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicacoes.map((p, i) => {
            const minName = p.ID_Ministerio_Alvo ? ministries.find(m => m.id === p.ID_Ministerio_Alvo)?.Nome_Ministerio : null;
            const canDel = isAdmin || (user?.email && p.Criado_Por_Email === user?.email);
            const tipoData = TIPOS.find(t => t.value === p.Tipo);

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-5 relative group"
              >
                {canDel && (
                  <div className="absolute top-4 right-4 flex gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.Criado_Por_Email)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-3 pr-10">
                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TIPO_COLORS[p.Tipo] || TIPO_COLORS.Outros}`}>
                        {tipoData?.label || p.Tipo}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {p.Visibilidade === "Publico" ? "🌐 Público" : p.Visibilidade === "Ambos" ? "✅ Ambos" : "🔒 Interno"}
                      </Badge>
                      {p.Escopo === "Ministerio" && minName && (
                        <Badge variant="secondary" className="text-[10px]">⛪ {minName}</Badge>
                      )}
                    </div>

                    <h3 className="font-heading font-semibold text-base">{p.Titulo}</h3>

                    {p.Imagem_URL && (
                      <img src={p.Imagem_URL} alt={p.Titulo} className="mt-3 w-full max-h-52 object-cover rounded-lg border border-border" />
                    )}

                    {p.Mensagem && (
                      <p className="text-muted-foreground text-sm leading-relaxed mt-2 whitespace-pre-line">{p.Mensagem}</p>
                    )}

                    {p.Data_Evento && (
                      <div className="flex items-center gap-1.5 text-primary text-sm mt-3 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {moment(p.Data_Evento.toDate ? p.Data_Evento.toDate() : p.Data_Evento).format("dddd, D [de] MMMM [de] YYYY [às] HH:mm")}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por: {p.Criado_Por_Email}</span>
                      <span>{p.Data_Publicacao ? moment(p.Data_Publicacao.toDate()).fromNow() : "Agora"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { setShowEdit(v); if (!v) { setEditingId(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">Editar Publicação</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Tipo</Label>
              <Select value={form.Tipo} onValueChange={v => upd("Tipo", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Título *</Label>
              <Input value={form.Titulo} onChange={e => upd("Titulo", e.target.value)} className="mt-1" />
            </div>
            <div><Label>Mensagem / Descrição</Label>
              <Textarea value={form.Mensagem} onChange={e => upd("Mensagem", e.target.value)} className="mt-1 min-h-[80px]" />
            </div>
            <div><Label>URL da Imagem <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input value={form.Imagem_URL} onChange={e => upd("Imagem_URL", e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            <div><Label>Visibilidade *</Label>
              <Select value={form.Visibilidade} onValueChange={v => upd("Visibilidade", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{VISIBILIDADES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
              <div><Label>Público Interno</Label>
                <Select value={form.Escopo} onValueChange={v => upd("Escopo", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Global">🌍 Todos os Membros</SelectItem>
                    <SelectItem value="Ministerio">⛪ Apenas um Ministério</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.Escopo === "Ministerio" && (form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
              <div><Label>Ministério</Label>
                <Select value={form.ID_Ministerio_Alvo} onValueChange={v => upd("ID_Ministerio_Alvo", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{allowedMin.map(m => <SelectItem key={m.id} value={m.id}>{m.Nome_Ministerio}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}