import { useState, useEffect, useMemo } from "react";
import {
  ListChecks, Plus, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp,
  Clock, Users, CalendarDays, AlertCircle, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import "moment/locale/pt-br";
import { useAuth } from "@/lib/AuthContext";
import {
  getEscalas,
  createEscala,
  createFuncaoEscala,
  confirmarPresenca,
  getFuncoesByEscala,
  responderEscala
} from "@/services/db/escalas";
import { getMinisterios, getMembrosMinisterio } from "@/services/db";
import toast from "react-hot-toast";

moment.locale("pt-br");

// ──────────────────────────────────────────────
// Filtros de data
// ──────────────────────────────────────────────
const DATE_FILTERS = [
  { key: "upcoming", label: "Próximas" },
  { key: "month",    label: "Este Mês" },
  { key: "past",     label: "Passadas" },
  { key: "all",      label: "Todas" },
];

function applyDateFilter(schedules, filter) {
  const now  = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  switch (filter) {
    case "upcoming":
      return schedules.filter(s => new Date(s.Data) >= now);
    case "month":
      return schedules.filter(s => {
        const d = new Date(s.Data);
        return d >= startMonth && d <= endMonth;
      });
    case "past":
      return schedules.filter(s => new Date(s.Data) < now);
    default:
      return schedules;
  }
}

// ──────────────────────────────────────────────
// Verifica conflito de membros no mesmo dia
// ──────────────────────────────────────────────
function detectConflicts(allSchedules, newDate, newMemberEmails) {
  if (!newDate || newMemberEmails.length === 0) return [];
  const targetDate = moment(newDate).format("YYYY-MM-DD");

  const conflicts = [];
  allSchedules.forEach(escala => {
    const escalaDate = moment(escala.Data).format("YYYY-MM-DD");
    if (escalaDate !== targetDate) return;
    (escala.Membros_Escalados || []).forEach(m => {
      if (newMemberEmails.includes(m.email)) {
        conflicts.push({ email: m.email, escalaTitle: escala.Titulo || escala.title });
      }
    });
  });
  return conflicts;
}

export default function Schedules() {
  const { user, userProfile } = useAuth();
  const [schedules, setSchedules]   = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [members, setMembers]       = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [dateFilter, setDateFilter] = useState("upcoming");

  // Create form state
  const [newTitle,      setNewTitle]      = useState("");
  const [newDate,       setNewDate]       = useState("");
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newSlots, setNewSlots] = useState([{ role_name: "", member_email: "" }]);
  const [creating, setCreating] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState([]);

  const isLeader = userProfile?.Role === "admin" || userProfile?.Role === "Admin" ||
                   userProfile?.Role === "Lider" || userProfile?.Role === "Pastor";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allSchedules, allMinistries] = await Promise.all([
        getEscalas(),
        getMinisterios(),
      ]);
      setSchedules(allSchedules);
      setMinistries(allMinistries);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar escalas");
    } finally {
      setIsLoading(false);
    }
  };

  // Load members when ministry is selected in the create form
  useEffect(() => {
    if (!newMinistryId) { setMembers([]); return; }
    getMembrosMinisterio(newMinistryId).then(setMembers).catch(() => setMembers([]));
  }, [newMinistryId]);

  // Re-check conflicts whenever date or slots change
  useEffect(() => {
    const emails = newSlots.map(s => s.member_email).filter(Boolean);
    setConflictWarnings(detectConflicts(schedules, newDate, emails));
  }, [newDate, newSlots, schedules]);

  // Filtered list
  const filteredSchedules = useMemo(
    () => applyDateFilter(schedules, dateFilter),
    [schedules, dateFilter]
  );

  // ── Create Escala ──────────────────────────
  const handleCreate = async () => {
    if (!newTitle || !newDate || !newMinistryId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (conflictWarnings.length > 0) {
      const names = conflictWarnings.map(c => c.email).join(", ");
      if (!window.confirm(`⚠️ Conflito detectado!\n${names} já possui escala nesta data.\n\nDeseja continuar mesmo assim?`)) return;
    }
    setCreating(true);
    try {
      const ministry = ministries.find(m => m.id === newMinistryId);
      const validSlots = newSlots.filter(s => s.role_name && s.member_email);

      const membrosEscalados = validSlots.map(s => {
        const membro = members.find(m => m.Email === s.member_email || m.Firebase_UID === s.member_email);
        return {
          email:  s.member_email,
          nome:   membro?.Nome || s.member_email,
          funcao: s.role_name,
          status: "pendente",
        };
      });

      await createEscala({
        Titulo:           newTitle,
        Data:             newDate,
        ID_Ministerio:    newMinistryId,
        Nome_Ministerio:  ministry?.Nome || "",
        Membros_Escalados: membrosEscalados,
        Criado_Por:       user?.uid,
      });

      toast.success("Escala criada com sucesso!");
      setShowCreate(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar escala");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewTitle(""); setNewDate(""); setNewMinistryId("");
    setNewSlots([{ role_name: "", member_email: "" }]);
  };

  // ── Confirm / Decline presence ─────────────
  const handleRespond = async (escala, resposta) => {
    try {
      await responderEscala(escala.id, user.email, resposta);
      toast.success(resposta === "confirmado" ? "Presença confirmada!" : "Ausência registrada.");
      loadData();
    } catch (e) {
      toast.error("Erro ao responder escala");
    }
  };

  // Helper — get membro status in escala
  const getMeuStatus = (escala) => {
    if (!escala.Membros_Escalados) return null;
    const membro = escala.Membros_Escalados.find(m => m.email === user?.email);
    return membro ? membro.status : null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <Label>Título *</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Culto de Celebração" className="mt-1" />
                </div>
                <div>
                  <Label>Data e Hora *</Label>
                  <Input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Ministério *</Label>
                  <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {ministries.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.Nome || m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Slots */}
                <div>
                  <Label>Funções e Membros</Label>
                  <div className="space-y-2 mt-2">
                    {newSlots.map((slot, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="Função (ex: Violão)"
                          value={slot.role_name}
                          onChange={e => {
                            const copy = [...newSlots];
                            copy[idx].role_name = e.target.value;
                            setNewSlots(copy);
                          }}
                        />
                        <Select
                          value={slot.member_email}
                          onValueChange={val => {
                            const copy = [...newSlots];
                            copy[idx].member_email = val;
                            setNewSlots(copy);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Membro" /></SelectTrigger>
                          <SelectContent>
                            {members.map(m => (
                              <SelectItem key={m.id} value={m.Email || m.Firebase_UID}>
                                {m.Nome || m.Email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newSlots.length > 1 && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setNewSlots(newSlots.filter((_, i) => i !== idx))}
                            className="text-destructive shrink-0"
                          >✕</Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setNewSlots([...newSlots, { role_name: "", member_email: "" }])}
                    >
                      + Adicionar Função
                    </Button>
                  </div>
                </div>

                {/* Conflict warnings */}
                <AnimatePresence>
                  {conflictWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <p className="font-semibold mb-1">⚠️ Conflito de membros detectado!</p>
                        {conflictWarnings.map((c, i) => (
                          <p key={i}><b>{c.email}</b> já está na escala "{c.escalaTitle}" nesta data.</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button onClick={handleCreate} className="w-full" disabled={creating}>
                  {creating ? "Criando..." : "Criar Escala"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Date Filters */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
        <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
        {DATE_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setDateFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              dateFilter === f.key
                ? "bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhuma escala encontrada</p>
          <p className="text-sm mt-1">Tente outro filtro de data</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map((schedule, i) => {
            const expanded = expandedId === schedule.id;
            const isPast   = new Date(schedule.Data) < new Date();
            const meuStatus = getMeuStatus(schedule);
            const membros = schedule.Membros_Escalados || [];
            const confirmados = membros.filter(m => m.status === "confirmado").length;

            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${
                  isPast ? "opacity-60 border-border" : "border-border hover:border-accent/30"
                }`}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : schedule.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className="text-center shrink-0 w-12">
                      <p className="text-2xl font-bold text-accent leading-none">
                        {moment(schedule.Data).format("DD")}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase mt-0.5">
                        {moment(schedule.Data).format("MMM")}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{schedule.Titulo || schedule.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {moment(schedule.Data).format("HH:mm")}
                        </span>
                        {(schedule.Nome_Ministerio || schedule.ministry_name) && (
                          <Badge variant="secondary" className="text-xs">
                            {schedule.Nome_Ministerio || schedule.ministry_name}
                          </Badge>
                        )}
                        {/* Status pessoal do usuário logado */}
                        {meuStatus === "confirmado" && (
                          <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> Confirmado
                          </span>
                        )}
                        {meuStatus === "recusado" && (
                          <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" /> Recusado
                          </span>
                        )}
                        {meuStatus === "pendente" && !isPast && (
                          <span className="text-amber-600 text-xs font-medium animate-pulse">
                            ● Aguardando sua resposta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      <Users className="w-3.5 h-3.5 inline mr-1" />
                      {confirmados}/{membros.length}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 border-t border-border pt-3 overflow-hidden"
                    >
                      {/* My action buttons */}
                      {meuStatus === "pendente" && !isPast && (
                        <div className="flex gap-2 mb-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            onClick={() => handleRespond(schedule, "confirmado")}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Confirmar Presença
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleRespond(schedule, "recusado")}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> Não poderei
                          </Button>
                        </div>
                      )}

                      {/* Member list */}
                      {membros.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhuma função atribuída</p>
                      ) : (
                        <div className="space-y-2">
                          {membros.map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">{m.funcao || m.role_name}</Badge>
                                <span className="text-sm font-medium">{m.nome || m.email}</span>
                              </div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                m.status === "confirmado" ? "bg-green-100 text-green-700"
                                : m.status === "recusado"  ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-700"
                              }`}>
                                {m.status === "confirmado" ? "✓ Confirmou"
                                 : m.status === "recusado"  ? "✗ Não pode"
                                 : "Pendente"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}