import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import moment from "moment";

const typeColors = {
  schedule: "bg-blue-100 text-blue-700 border-blue-200",
  meeting: "bg-purple-100 text-purple-700 border-purple-200",
  rehearsal: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-orange-100 text-orange-700 border-orange-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
};

const typeLabels = {
  schedule: "Escala",
  meeting: "Reunião",
  rehearsal: "Ensaio",
  maintenance: "Manutenção",
  general: "Geral",
};

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [filter, setFilter] = useState("all");
  const [ministries, setMinistries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState("general");
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setIsLeader(me.role === "admin" || me.role === "leader");
    const [allEvents, allMinistries] = await Promise.all([
      base44.entities.CalendarEvent.list("-date"),
      base44.entities.Ministry.list(),
    ]);
    setEvents(allEvents);
    setMinistries(allMinistries);
  };

  const handleCreate = async () => {
    if (!newTitle || !newDate) {
      toast({ title: "Preencha título e data", variant: "destructive" });
      return;
    }
    const ministry = ministries.find((m) => m.id === newMinistryId);
    await base44.entities.CalendarEvent.create({
      title: newTitle,
      date: newDate,
      type: newType,
      ministry_id: newMinistryId || undefined,
      ministry_name: ministry?.name || "",
      description: newDescription,
    });
    setShowCreate(false);
    setNewTitle("");
    setNewDate("");
    setNewType("general");
    setNewMinistryId("");
    setNewDescription("");
    loadData();
    toast({ title: "Evento criado!" });
  };

  const startOfMonth = currentDate.clone().startOf("month");
  const endOfMonth = currentDate.clone().endOf("month");
  const startDay = startOfMonth.clone().startOf("week");
  const endDay = endOfMonth.clone().endOf("week");

  const days = [];
  let day = startDay.clone();
  while (day.isBefore(endDay)) {
    days.push(day.clone());
    day.add(1, "day");
  }

  const filteredEvents = events.filter((e) => {
    if (filter === "mine") {
      return true; // simplified — ideally filter by user's schedules
    }
    if (filter !== "all" && filter !== "mine") {
      return e.ministry_id === filter;
    }
    return true;
  });

  const getEventsForDay = (d) => {
    return filteredEvents.filter((e) => moment(e.date).isSame(d, "day"));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Calendário</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              <SelectItem value="mine">Meus Compromissos</SelectItem>
              {ministries.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLeader && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Evento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Criar Evento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Título</Label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Data e Hora</Label>
                    <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ministério (opcional)</Label>
                    <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                      <SelectContent>
                        {ministries.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="mt-1" />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate((d) => d.clone().subtract(1, "month"))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-heading text-lg font-semibold capitalize">
          {currentDate.format("MMMM [de] YYYY")}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate((d) => d.clone().add(1, "month"))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-3 border-b border-border">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dayEvents = getEventsForDay(d);
            const isToday = d.isSame(moment(), "day");
            const isCurrentMonth = d.isSame(currentDate, "month");

            return (
              <div
                key={i}
                className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-border ${
                  !isCurrentMonth ? "bg-muted/30" : ""
                }`}
              >
                <p className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-accent text-accent-foreground" : isCurrentMonth ? "" : "text-muted-foreground/50"
                }`}>
                  {d.format("D")}
                </p>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${typeColors[ev.type] || typeColors.general}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} mais</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}