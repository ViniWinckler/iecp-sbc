import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FolderKanban, Plus, CheckCircle2, Circle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function Projects() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMinistryId, setNewMinistryId] = useState("");

  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketProjectId, setTicketProjectId] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setIsLeader(me.role === "admin" || me.role === "leader");
    const [allProjects, allTasks, allMinistries] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Task.list("-created_date"),
      base44.entities.Ministry.list(),
    ]);
    setProjects(allProjects);
    setTasks(allTasks);
    setMinistries(allMinistries);
  };

  const getProjectTasks = (projectId) => tasks.filter((t) => t.project_id === projectId);
  const getProgress = (projectId) => {
    const pTasks = getProjectTasks(projectId);
    if (pTasks.length === 0) return 0;
    return Math.round((pTasks.filter((t) => t.status === "resolved").length / pTasks.length) * 100);
  };

  const handleCreateProject = async () => {
    if (!newName) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    const ministry = ministries.find((m) => m.id === newMinistryId);
    await base44.entities.Project.create({
      name: newName,
      description: newDesc,
      ministry_id: newMinistryId,
      ministry_name: ministry?.name || "",
      leader_email: user.email,
    });
    setShowCreate(false);
    setNewName(""); setNewDesc(""); setNewMinistryId("");
    loadData();
    toast({ title: "Projeto criado!" });
  };

  const handleCreateTicket = async () => {
    if (!ticketTitle || !ticketProjectId) { toast({ title: "Preencha os campos", variant: "destructive" }); return; }
    await base44.entities.Task.create({
      project_id: ticketProjectId,
      title: ticketTitle,
      description: ticketDesc,
      type: "ticket",
    });
    setShowTicket(false);
    setTicketTitle(""); setTicketDesc(""); setTicketProjectId("");
    loadData();
    toast({ title: "Chamado aberto!" });
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "resolved" ? "open" : "resolved";
    await base44.entities.Task.update(task.id, { status: newStatus });
    loadData();
  };

  const handleAddTask = async (projectId, title) => {
    if (!title) return;
    await base44.entities.Task.create({ project_id: projectId, title, type: "task" });
    loadData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Projetos</h1>
        <div className="flex gap-2">
          <Dialog open={showTicket} onOpenChange={setShowTicket}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><AlertTriangle className="w-4 h-4" /> Abrir Chamado</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Abrir Chamado</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Projeto</Label>
                  <Select value={ticketProjectId} onValueChange={setTicketProjectId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Problema</Label>
                  <Input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Ex: Microfone 2 falhando" className="mt-1" />
                </div>
                <div>
                  <Label>Detalhes</Label>
                  <Textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleCreateTicket} className="w-full">Abrir Chamado</Button>
              </div>
            </DialogContent>
          </Dialog>
          {isLeader && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Projeto</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Criar Projeto</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Ministério</Label>
                    <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {ministries.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateProject} className="w-full">Criar Projeto</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          tasks={getProjectTasks(selectedProject.id)}
          progress={getProgress(selectedProject.id)}
          onBack={() => setSelectedProject(null)}
          onToggleTask={toggleTask}
          onAddTask={handleAddTask}
          isLeader={isLeader}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Nenhum projeto encontrado</p>
            </div>
          ) : (
            projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedProject(project)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-accent/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold">{project.name}</h3>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {project.ministry_name && (
                  <Badge variant="secondary" className="text-xs mb-3">{project.ministry_name}</Badge>
                )}
                <Progress value={getProgress(project.id)} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">{getProgress(project.id)}% concluído</p>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, tasks, progress, onBack, onToggleTask, onAddTask, isLeader }) {
  const [newTask, setNewTask] = useState("");
  const taskItems = tasks.filter((t) => t.type === "task");
  const tickets = tasks.filter((t) => t.type === "ticket");

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-primary hover:underline">← Voltar aos projetos</button>
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl font-bold mb-2">{project.name}</h2>
        {project.description && <p className="text-muted-foreground mb-4">{project.description}</p>}
        {project.ministry_name && <Badge variant="secondary" className="mb-4">{project.ministry_name}</Badge>}
        <Progress value={progress} className="h-3 mb-2" />
        <p className="text-sm text-muted-foreground">{progress}% concluído</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold mb-4">Tarefas</h3>
        <div className="space-y-2">
          {taskItems.map((task) => (
            <div key={task.id} className="flex items-center gap-3 py-2">
              <Checkbox
                checked={task.status === "resolved"}
                onCheckedChange={() => onToggleTask(task)}
              />
              <span className={`text-sm ${task.status === "resolved" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
        {isLeader && (
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Nova tarefa..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddTask(project.id, newTask);
                  setNewTask("");
                }
              }}
            />
            <Button onClick={() => { onAddTask(project.id, newTask); setNewTask(""); }}>Adicionar</Button>
          </div>
        )}
      </div>

      {tickets.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Chamados
          </h3>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{ticket.title}</p>
                  {ticket.description && <p className="text-xs text-muted-foreground">{ticket.description}</p>}
                </div>
                <Badge variant={ticket.status === "resolved" ? "default" : "secondary"}>
                  {ticket.status === "resolved" ? "Resolvido" : ticket.status === "in_progress" ? "Em andamento" : "Aberto"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}