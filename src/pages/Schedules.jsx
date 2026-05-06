import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ListChecks, Plus, ThumbsUp, ChevronDown, ChevronUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import moment from "moment";

export default function Schedules() {
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [ministries, setMinistries] = useState([]);
  const [members, setMembers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newSlots, setNewSlots] = useState([{ role_name: "", member_email: "" }]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setIsLeader(me.role === "admin" || me.role === "leader");

    const [allSchedules, allSlots, allMinistries, allMembers] = await Promise.all([
      base44.entities.Schedule.list("-date"),
      base44.entities.ScheduleSlot.list(),
      base44.entities.Ministry.list(),
      base44.entities.MinistryMember.filter({ status: "accepted" }),
    ]);

    setSchedules(allSchedules);
    setSlots(allSlots);
    setMinistries(allMinistries);
    setMembers(allMembers);
    setIsLoading(false);
  };

  const handleConfirm = async (slot) => {
    await base44.entities.ScheduleSlot.update(slot.id, { confirmed: true });
    toast({ title: "Presença confirmada!" });
    loadData();
  };

  const handleCreate = async () => {
    if (!newTitle || !newDate || !newMinistryId) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const ministry = ministries.find((m) => m.id === newMinistryId);
    const schedule = await base44.entities.Schedule.create({
      title: newTitle,
      date: newDate,
      ministry_id: newMinistryId,
      ministry_name: ministry?.name || "",
    });

    // Create calendar event
    await base44.entities.CalendarEvent.create({
      title: newTitle,
      date: newDate,
      type: "schedule",
      ministry_id: newMinistryId,
      ministry_name: ministry?.name || "",
      schedule_id: schedule.id,
    });

    // Create slots
    const validSlots = newSlots.filter((s) => s.role_name && s.member_email);
    if (validSlots.length > 0) {
      const slotsData = validSlots.map((s) => {
        const member = members.find((m) => m.member_email === s.member_email);
        return {
          schedule_id: schedule.id,
          role_name: s.role_name,
          member_email: s.member_email,
          member_name: member?.member_name || s.member_email,
        };
      });
      await base44.entities.ScheduleSlot.bulkCreate(slotsData);
    }

    setShowCreate(false);
    setNewTitle("");
    setNewDate("");
    setNewMinistryId("");
    setNewSlots([{ role_name: "", member_email: "" }]);
    loadData();
    toast({ title: "Escala criada com sucesso!" });
  };

  const getScheduleSlots = (scheduleId) => slots.filter((s) => s.schedule_id === scheduleId);
  const confirmedCount = (scheduleId) => getScheduleSlots(scheduleId).filter((s) => s.confirmed).length;
  const totalCount = (scheduleId) => getScheduleSlots(scheduleId).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Escalas</h1>
        {isLeader && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Escala</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Criar Escala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Culto de Celebração" className="mt-1" />
                </div>
                <div>
                  <Label>Data e Hora</Label>
                  <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Ministério</Label>
                  <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {ministries.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Funções e Membros</Label>
                  <div className="space-y-2 mt-2">
                    {newSlots.map((slot, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="Função"
                          value={slot.role_name}
                          onChange={(e) => {
                            const copy = [...newSlots];
                            copy[idx].role_name = e.target.value;
                            setNewSlots(copy);
                          }}
                        />
                        <Select
                          value={slot.member_email}
                          onValueChange={(val) => {
                            const copy = [...newSlots];
                            copy[idx].member_email = val;
                            setNewSlots(copy);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Membro" /></SelectTrigger>
                          <SelectContent>
                            {members.filter((m) => !newMinistryId || m.ministry_id === newMinistryId).map((m) => (
                              <SelectItem key={m.id} value={m.member_email}>{m.member_name || m.member_email}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewSlots([...newSlots, { role_name: "", member_email: "" }])}
                    >
                      + Adicionar Função
                    </Button>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full">Criar Escala</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl border border-border"></div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhuma escala encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule, i) => {
            const scheduleSlots = getScheduleSlots(schedule.id);
            const expanded = expandedId === schedule.id;
            const isPast = new Date(schedule.date) < new Date();

            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${isPast ? "opacity-60 border-border" : "border-border hover:border-accent/30"}`}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : schedule.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <p className="text-2xl font-bold text-accent">{moment(schedule.date).format("DD")}</p>
                      <p className="text-xs text-muted-foreground uppercase">{moment(schedule.date).format("MMM")}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{schedule.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{moment(schedule.date).format("HH:mm")}</span>
                        {schedule.ministry_name && (
                          <Badge variant="secondary" className="text-xs">{schedule.ministry_name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {confirmedCount(schedule.id)}/{totalCount(schedule.id)}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    {scheduleSlots.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma função atribuída</p>
                    ) : (
                      <div className="space-y-2">
                        {scheduleSlots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{slot.role_name}</Badge>
                              <span className="text-sm font-medium">{slot.member_name || slot.member_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {slot.confirmed ? (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                  <ThumbsUp className="w-3.5 h-3.5" /> Confirmou
                                </span>
                              ) : slot.member_email === user?.email ? (
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleConfirm(slot)}>
                                  <ThumbsUp className="w-3.5 h-3.5" /> Confirmar
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">Pendente</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}