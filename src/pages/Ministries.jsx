import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, UserPlus, Trash2, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function Ministries() {
  const { user, userProfile } = useAuth();
  const [ministries, setMinistries] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation modal state
  const [memberToRemove, setMemberToRemove] = useState(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [allMinistries, allMembers] = await Promise.all([
        base44.entities.Ministry.list(),
        base44.entities.MinistryMember.list(),
      ]);
      setMinistries(allMinistries);
      setMembers(allMembers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinistryMembers = (ministryId) => members.filter((m) => m.ministry_id === ministryId);

  const handleCreate = async () => {
    if (!newName) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    await base44.entities.Ministry.create({
      name: newName,
      description: newDesc,
      leader_email: user?.email,
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

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    await base44.entities.MinistryMember.delete(memberToRemove.id);
    setMemberToRemove(null);
    loadData();
    toast({ title: "Membro removido" });
  };

  const isAdmin = userProfile?.Role === "admin" || userProfile?.Role === "Admin";

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

      {/* Skeleton Loading */}
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
              Tem certeza que deseja remover <span className="font-semibold text-foreground">{memberToRemove?.member_name || memberToRemove?.member_email}</span> deste ministério? Esta ação não pode ser desfeita.
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