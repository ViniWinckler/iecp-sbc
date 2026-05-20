import { useState, useEffect } from "react";
import { Users, Plus, UserPlus, Trash2, Mail, AlertTriangle, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { 
  getMinisterios, createMinisterio, deleteMinisterio,
  getConvitesByMinisterio, createConvite, updateConviteStatus
} from "@/services/db";

export default function Ministries() {
  const { user, userProfile } = useAuth();
  const [ministries, setMinistries] = useState([]);
  const [membersCache, setMembersCache] = useState({});
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [memberToRemove, setMemberToRemove] = useState(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const role = userProfile?.Nivel_Acesso;
  const isAdmin = role === "Admin";
  const isPastorOrAdmin = isAdmin || role === "Pastor";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allMinistries = await getMinisterios();
      // Líderes só veem os ministérios que eles lideram. Pastores e Admins veem todos.
      const filtered = isPastorOrAdmin 
        ? allMinistries 
        : allMinistries.filter(m => m.Lider_Responsavel_Email === user?.email);
      setMinistries(filtered);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar ministérios", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async (minId) => {
    try {
      const convites = await getConvitesByMinisterio(minId);
      // Ignorar removidos
      setMembersCache(prev => ({ ...prev, [minId]: convites.filter(c => c.Status !== 'Removido') }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMinistry = (min) => {
    if (selectedMinistry?.id === min.id) {
      setSelectedMinistry(null);
    } else {
      setSelectedMinistry(min);
      if (!membersCache[min.id]) {
        loadMembers(min.id);
      }
    }
  };

  const handleCreate = async () => {
    if (!newName) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    try {
      await createMinisterio({
        Nome_Ministerio: newName,
        Descricao: newDesc,
        Lider_Responsavel_Email: user?.email,
      });
      setShowCreate(false);
      setNewName(""); setNewDesc("");
      loadData();
      toast({ title: "Ministério criado!" });
    } catch (e) {
      toast({ title: "Erro ao criar", variant: "destructive" });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedMinistry) { toast({ title: "E-mail obrigatório", variant: "destructive" }); return; }
    try {
      await createConvite({
        Email_Convidado: inviteEmail,
        ID_Ministerio: selectedMinistry.id,
        Funcao_no_Ministerio: inviteRole,
      });
      setShowInvite(false);
      setInviteEmail(""); setInviteRole("");
      loadMembers(selectedMinistry.id);
      toast({ title: "Convite enviado com sucesso!" });
    } catch (e) {
      toast({ title: "Erro ao enviar convite", variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await updateConviteStatus(memberToRemove.id, "Removido");
      setMemberToRemove(null);
      if (selectedMinistry) loadMembers(selectedMinistry.id);
      toast({ title: "Membro removido" });
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Ministérios</h1>
        {isPastorOrAdmin && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Ministério</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Criar Ministério</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" placeholder="Ex: Louvor" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleCreate} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ministries.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Church className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Nenhum ministério encontrado</p>
            </div>
          ) : (
            ministries.map((ministry, i) => {
              const mMembers = membersCache[ministry.id] || [];
              const isSelected = selectedMinistry?.id === ministry.id;
              const isMyMinistry = ministry.Lider_Responsavel_Email === user?.email || isPastorOrAdmin;

              return (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected ? "border-accent shadow-md" : "border-border hover:border-accent/30"
                  }`}
                  onClick={() => handleSelectMinistry(ministry)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold text-lg">{ministry.Nome_Ministerio}</h3>
                    {isSelected && <Badge variant="secondary">{mMembers.length} convites</Badge>}
                  </div>
                  {ministry.Descricao && (
                    <p className="text-muted-foreground text-sm mb-3">{ministry.Descricao}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Líder: {ministry.Lider_Responsavel_Email}</p>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {isMyMinistry && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 mb-3"
                          onClick={(e) => { e.stopPropagation(); setShowInvite(true); }}
                        >
                          <UserPlus className="w-4 h-4" /> Convidar Membro
                        </Button>
                      )}
                      {mMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum membro convidado ainda.</p>
                      ) : (
                        mMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {(member.Email_Convidado).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{member.Email_Convidado}</p>
                                <p className="text-xs text-muted-foreground">{member.Funcao_no_Ministerio || "Membro"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={member.Status === "Aceito" ? "default" : member.Status === "Pendente" ? "secondary" : "destructive"} className="text-xs">
                                {member.Status}
                              </Badge>
                              {isMyMinistry && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMemberToRemove(member);
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Convidar Membro por E-mail</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>E-mail do Membro</Label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="membro@email.com" className="mt-1" />
            </div>
            <div>
              <Label>Função (Opcional)</Label>
              <Input value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} placeholder="Ex: Mesa de Som, Baterista..." className="mt-1" />
            </div>
            <Button onClick={handleInvite} className="w-full gap-2"><Mail className="w-4 h-4" /> Enviar Convite</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal — Remove Member */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle className="font-heading text-lg">Remover Membro</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Tem certeza que deseja remover <span className="font-semibold text-foreground">{memberToRemove?.Email_Convidado}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setMemberToRemove(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} className="flex-1 gap-2">
              <Trash2 className="w-4 h-4" /> Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}