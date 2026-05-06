import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Plus, Globe, Users } from "lucide-react";
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

export default function Announcements() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLeaderOrAdmin, setIsLeaderOrAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newScope, setNewScope] = useState("global");
  const [newMinistryId, setNewMinistryId] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setIsLeaderOrAdmin(me.role === "admin" || me.role === "leader");

    const [allAnnouncements, allMinistries, myMemberships] = await Promise.all([
      base44.entities.Announcement.list("-created_date"),
      base44.entities.Ministry.list(),
      base44.entities.MinistryMember.filter({ member_email: me.email, status: "accepted" }),
    ]);

    const myMinistryIds = myMemberships.map((m) => m.ministry_id);
    const filtered = allAnnouncements.filter(
      (a) => a.scope === "global" || myMinistryIds.includes(a.ministry_id) || me.role === "admin"
    );

    setAnnouncements(filtered);
    setMinistries(allMinistries);
    setMemberships(myMemberships);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle || !newMessage) {
      toast({ title: "Preencha título e mensagem", variant: "destructive" });
      return;
    }
    const ministry = ministries.find((m) => m.id === newMinistryId);
    await base44.entities.Announcement.create({
      title: newTitle,
      message: newMessage,
      scope: newScope,
      ministry_id: newScope === "ministry" ? newMinistryId : undefined,
      ministry_name: newScope === "ministry" ? ministry?.name : undefined,
      publish_date: new Date().toISOString(),
    });
    setShowCreate(false);
    setNewTitle(""); setNewMessage(""); setNewScope("global"); setNewMinistryId("");
    loadData();
    toast({ title: "Aviso publicado!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Avisos</h1>
        {isLeaderOrAdmin && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Aviso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Criar Aviso</DialogTitle></DialogHeader>
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
                  <Label>Escopo</Label>
                  <Select value={newScope} onValueChange={setNewScope}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (toda a congregação)</SelectItem>
                      <SelectItem value="ministry">Ministério específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newScope === "ministry" && (
                  <div>
                    <Label>Ministério</Label>
                    <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {ministries.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleCreate} className="w-full">Publicar Aviso</Button>
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
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhum aviso publicado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {a.scope === "global" ? (
                    <Globe className="w-4 h-4 text-primary" />
                  ) : (
                    <Users className="w-4 h-4 text-accent" />
                  )}
                  <h3 className="font-heading font-semibold">{a.title}</h3>
                </div>
                <Badge variant={a.scope === "global" ? "default" : "secondary"}>
                  {a.scope === "global" ? "Geral" : a.ministry_name || "Ministério"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-3">{moment(a.created_date).fromNow()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}