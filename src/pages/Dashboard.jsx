import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, ListChecks, Clock, UserPlus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import moment from "moment";
import { useAuth } from "@/lib/AuthContext";
import { 
  getMinisteriosDoUsuario, 
  getConvitesPendentes, 
  updateConviteStatus,
  getEscalasDoMembro,
  getAvisos
} from "@/services/db";

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [nextSlot, setNextSlot] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    if (userProfile && userProfile.Status === "Ativo") {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    try {
      // 1. Memberships
      const myMemberships = await getMinisteriosDoUsuario(user.uid);
      setMemberships(myMemberships);

      // 2. Pending invites
      const invites = await getConvitesPendentes(user.email);
      setPendingInvites(invites);

      // 3. Announcements
      const allAnnouncements = await getAvisos();
      // Filter out global or specific ministry
      const myMinistryIds = myMemberships.map((m) => m.Ministerio_ID);
      const filtered = allAnnouncements.filter(
        (a) => !a.Ministerio_ID || myMinistryIds.includes(a.Ministerio_ID)
      );
      setAnnouncements(filtered.slice(0, 5));

      // 4. Next schedule slot
      const mySchedules = await getEscalasDoMembro(user.uid);
      if (mySchedules.length > 0) {
        // Sort by date upcoming
        const now = new Date();
        const upcoming = mySchedules
          .filter((s) => new Date(s.Data_Hora) >= now)
          .sort((a, b) => new Date(a.Data_Hora) - new Date(b.Data_Hora));
          
        if (upcoming.length > 0) {
          const next = upcoming[0];
          setNextSchedule({ title: next.Titulo, date: next.Data_Hora, id: next.id });
          setNextSlot({ role_name: next.Funcao || "Membro", confirmed: next.Confirmado });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    await updateConviteStatus(inviteId, "Aceito");
    loadData();
  };

  const handleDeclineInvite = async (inviteId) => {
    await updateConviteStatus(inviteId, "Recusado");
    loadData();
  };

  const displayName = userProfile?.Nome || user?.displayName || user?.email?.split("@")[0] || "Membro";

  if (userProfile?.Status === "Pendente") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Conta em Análise</h2>
        <p className="text-muted-foreground">Sua conta foi criada e está aguardando a aprovação de um pastor para acessar o painel completo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Olá, {displayName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {moment().format("dddd, D [de] MMMM [de] YYYY")}
        </p>
      </motion.div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-accent/10 border border-accent/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Convites Pendentes</h3>
            <Badge className="bg-accent text-accent-foreground">{pendingInvites.length}</Badge>
          </div>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
                <div>
                  <p className="text-sm font-medium">Convite para: {invite.Ministerio_Nome}</p>
                  <p className="text-xs text-muted-foreground">Enviado por: {invite.Convidado_Por}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptInvite(invite.id)} className="bg-green-600 hover:bg-green-700 text-white">
                    Aceitar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(invite.id)}>
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Próxima Escala</h3>
          </div>
          {nextSchedule && nextSlot ? (
            <div>
              <p className="font-semibold text-lg">{nextSchedule.title}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <Clock className="w-4 h-4" />
                {moment(nextSchedule.date).format("DD/MM — dddd [às] HH:mm")}
              </div>
              <Badge className="mt-2" variant="secondary">{nextSlot.role_name}</Badge>
              {!nextSlot.confirmed && (
                <Link to="/escalas">
                  <Button size="sm" className="w-full mt-3">Confirmar Presença</Button>
                </Link>
              )}
              {nextSlot.confirmed && (
                <p className="text-green-600 text-sm mt-3 font-medium">✓ Presença confirmada</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma escala próxima</p>
          )}
        </motion.div>

        {/* Mini Calendar Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-heading font-semibold">Calendário</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Veja todas as suas atividades e eventos do mês
          </p>
          <Link to="/calendario">
            <Button variant="outline" className="w-full">Ver Calendário</Button>
          </Link>
        </motion.div>

        {/* Memberships */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-heading font-semibold">Meus Ministérios</h3>
          </div>
          {memberships.length > 0 ? (
            <div className="space-y-2">
              {memberships.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">{m.Ministerio_Nome}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">
                Você ainda não faz parte de nenhum ministério. Aguarde o convite do seu líder.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-accent" />
            <h3 className="font-heading font-semibold text-lg">Mural de Avisos</h3>
          </div>
          <Link to="/avisos" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="border-l-2 border-accent pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{a.Titulo}</h4>
                  <Badge variant={!a.Ministerio_ID ? "default" : "secondary"} className="text-xs">
                    {!a.Ministerio_ID ? "Geral" : "Ministério"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{a.Descricao}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {moment(a.Data_Hora).fromNow()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum aviso recente</p>
        )}
      </motion.div>
    </div>
  );
}