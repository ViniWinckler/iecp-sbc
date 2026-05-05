import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, UserPlus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function Ministries() {
  const [user, setUser] = useState(null);
  const [ministries, setMinistries] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [allMinistries, allMembers] = await Promise.all([
      base44.entities.Ministry.list(),
      base44.entities.MinistryMember.list(),
    ]);
    setMinistries(allMinistries);
    setMembers(allMembers);
  };

  const getMinistryMembers = (ministryId) => members.filter((m) => m.ministry_id === ministryId);

  const handleCreate = async () => {
    if (!newName) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    await base44.entities.Ministry.create({
      name: newName,
      description: newDesc,
      leader_email: user.email,
    });
    setShowCreate(false);
    setNewName(""); setNewDesc("");
    loadData();
    toast({ title: "Ministério criado!" });
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedMinistry) { toast({ title: "E-mail obrigatório", variant: "destructive" }); return; }
    await base44.entities.MinistryMember.create({
      ministry_id: selectedMinistry.id,
      member_email: inviteEmail,
      member_name: inviteName || inviteEmail,
      role_in_ministry: inviteRole,
      status: "pending",
    });
    setShowInvite(false);
    setInviteEmail(""); setInviteName(""); setInviteRole("");
    loadData();
    toast({ title: "Convite enviado!" });
  };

  const handleRemoveMember = async (memberId) => {
    await base44.entities.MinistryMember.delete(memberId);
    loadData();
    toast({ title: "Membro removido" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Ministérios</h1>
        {isAdmin && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministries.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Nenhum ministério cadastrado</p>
          </div>
        ) : (
          ministries.map((ministry, i) => {
            const mMembers = getMinistryMembers(ministry.id);
            const isSelected = selectedMinistry?.id === ministry.id;
            const isMyMinistry = ministry.leader_email === user?.email || isAdmin;

            return (
              <motion.div
                key={ministry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected ? "border-accent shadow-md" : "border-border hover:border-accent/30"
                }`}
                onClick={() => setSelectedMinistry(isSelected ? null : ministry)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-lg">{ministry.name}</h3>
                  <Badge variant="secondary">{mMembers.length} membros</Badge>
                </div>
                {ministry.description && (
                  <p className="text-muted-foreground text-sm mb-3">{ministry.description}</p>
                )}

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
                      <p className="text-sm text-muted-foreground">Nenhum membro ainda</p>
                    ) : (
                      mMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(member.member_name || member.member_email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.member_name || member.member_email}</p>
                              <p className="text-xs text-muted-foreground">{member.role_in_ministry || "Membro"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={member.status === "accepted" ? "default" : member.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                              {member.status === "accepted" ? "Ativo" : member.status === "pending" ? "Pendente" : "Recusado"}
                            </Badge>
                            {isMyMinistry && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id); }}>
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

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Convidar Membro</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>E-mail</Label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="membro@email.com" className="mt-1" />
            </div>
            <div>
              <Label>Nome</Label>
              <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nome do membro" className="mt-1" />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} placeholder="Ex: Mesa de Som" className="mt-1" />
            </div>
            <Button onClick={handleInvite} className="w-full gap-2"><Mail className="w-4 h-4" /> Enviar Convite</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}