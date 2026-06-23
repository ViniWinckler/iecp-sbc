import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  Users, CheckCircle, XCircle, Shield, Trash2, AlertTriangle,
  RefreshCw, Clock, Crown, UserCheck, Search, Church
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getAllUsers, updateUser, deleteUser, getMinisterios } from "@/services/db";
import { Input } from "@/components/ui/input";

const ROLES = ["Membro", "Lider", "Pastor", "Admin"];

const roleColors = {
  Admin:   "bg-red-100 text-red-700 border-red-200",
  Pastor:  "bg-purple-100 text-purple-700 border-purple-200",
  Lider:   "bg-blue-100 text-blue-700 border-blue-200",
  Membro:  "bg-gray-100 text-gray-700 border-gray-200",
  Pastor_Pendente: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function AdminPanel() {
  const { user, userProfile } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [allMinisterios, setAllMinisterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");

  const isAdmin = userProfile?.Nivel_Acesso === "Admin";
  const isPastorOrAdmin = isAdmin || userProfile?.Nivel_Acesso === "Pastor";

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [users, ministerios] = await Promise.all([
        getAllUsers(),
        getMinisterios()
      ]);
      setAllUsers(users);
      setAllMinisterios(ministerios);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (u) => {
    try {
      await updateUser(u.Firebase_UID || u.id, { Status: "Ativo" });
      toast({ title: `${u.Nome_Exibicao} aprovado(a)!` });
      loadUsers();
    } catch (e) {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    }
  };

  const handleReject = async (u) => {
    try {
      await updateUser(u.Firebase_UID || u.id, { Status: "Rejeitado" });
      toast({ title: `${u.Nome_Exibicao} rejeitado(a).` });
      loadUsers();
    } catch (e) {
      toast({ title: "Erro ao rejeitar", variant: "destructive" });
    }
  };

  const handleChangeRole = async (u, newRole) => {
    if (!isAdmin) {
      toast({ title: "Apenas o Admin pode alterar cargos", variant: "destructive" });
      return;
    }
    try {
      await updateUser(u.Firebase_UID || u.id, { Nivel_Acesso: newRole });
      toast({ title: `Cargo de ${u.Nome_Exibicao} alterado para ${newRole}` });
      loadUsers();
    } catch (e) {
      toast({ title: "Erro ao alterar cargo", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.Firebase_UID || userToDelete.id, user?.email);
      toast({ title: "Usuário removido" });
      setUserToDelete(null);
      loadUsers();
    } catch (e) {
      toast({ title: e.message || "Erro ao remover", variant: "destructive" });
    }
  };

  const pendingUsers  = allUsers.filter(u => u.Status !== "Ativo" && u.Status !== "Rejeitado");
  const activeUsers   = allUsers.filter(u => u.Status === "Ativo");
  const rejectedUsers = allUsers.filter(u => u.Status === "Rejeitado");

  const filteredPendingUsers = searchEmail.trim() 
    ? pendingUsers.filter(u => u.Email.toLowerCase().includes(searchEmail.toLowerCase()))
    : pendingUsers;

  const UserCard = ({ u, showActions = true }) => {
    const min = allMinisterios.find(m => m.Lider_Responsavel_Email === u.Email);
    return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
        {(u.Nome_Exibicao || u.Email || "?").charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{u.Nome_Exibicao || "—"}</p>
        <p className="text-xs text-muted-foreground truncate">{u.Email}</p>
        {u.Nivel_Acesso === "Lider" && min && (
           <p className="text-xs text-primary flex items-center gap-1 mt-1 truncate">
             <Church className="w-3 h-3 shrink-0"/> Ministério: {min.Nome_Ministerio} {min.Descricao ? `(${min.Descricao})` : ''}
           </p>
        )}
      </div>

      {/* Role badge */}
      <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[u.Nivel_Acesso] || roleColors.Membro}`}>
        {u.Nivel_Acesso || "Membro"}
      </span>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 shrink-0">
          {/* Pending: Approve / Reject */}
          {u.Status === "Pendente" && isPastorOrAdmin && (
            <>
              <Button size="sm" onClick={() => handleApprove(u)} className="gap-1 bg-green-600 hover:bg-green-700 text-white h-8">
                <CheckCircle className="w-3.5 h-3.5" /> Aprovar
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleReject(u)} className="gap-1 text-destructive border-destructive/30 h-8">
                <XCircle className="w-3.5 h-3.5" /> Rejeitar
              </Button>
            </>
          )}

          {/* Active: Change role (Admin only) */}
          {u.Status === "Ativo" && isAdmin && u.Email !== user?.email && (
            <Select value={u.Nivel_Acesso || "Membro"} onValueChange={(val) => handleChangeRole(u, val)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Delete (Admin only, cannot delete self) */}
          {isAdmin && u.Email !== user?.email && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setUserToDelete(u)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Administração</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie membros, aprovações e cargos</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: allUsers.length,   icon: Users,     color: "bg-primary/10 text-primary" },
          { label: "Ativos",    value: activeUsers.length, icon: UserCheck, color: "bg-green-100 text-green-700" },
          { label: "Pendentes", value: pendingUsers.length,icon: Clock,     color: "bg-yellow-100 text-yellow-700" },
          { label: "Admins",    value: allUsers.filter(u => u.Nivel_Acesso === "Admin").length, icon: Crown, color: "bg-red-100 text-red-700" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            Aprovações
            {pendingUsers.length > 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Membros Ativos</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        </TabsList>

        {/* Aprovações Pendentes */}
        <TabsContent value="pending" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-4 bg-muted/30 p-2 rounded-xl border border-border/50">
            <Search className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            <Input 
               placeholder="Buscar e-mail do Líder/Pastor para aprovar..." 
               value={searchEmail}
               onChange={e => setSearchEmail(e.target.value)}
               className="border-0 bg-transparent focus-visible:ring-0 shadow-none h-8 w-full"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : filteredPendingUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhuma aprovação encontrada para esta busca</p>
            </div>
          ) : (
            filteredPendingUsers.map(u => <UserCard key={u.id} u={u} />)
          )}
        </TabsContent>

        {/* Membros Ativos */}
        <TabsContent value="active" className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum membro ativo ainda</p>
            </div>
          ) : (
            activeUsers.map(u => <UserCard key={u.id} u={u} />)
          )}
        </TabsContent>

        {/* Rejeitados */}
        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejectedUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum usuário rejeitado</p>
            </div>
          ) : (
            rejectedUsers.map(u => <UserCard key={u.id} u={u} showActions={false} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Delete */}
      <Dialog open={!!userToDelete} onOpenChange={open => { if (!open) setUserToDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle className="font-heading text-lg">Remover Usuário</DialogTitle>
            </div>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{userToDelete?.Nome_Exibicao}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1 gap-2">
              <Trash2 className="w-4 h-4" /> Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}