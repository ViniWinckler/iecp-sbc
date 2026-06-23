import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { 
  FolderKanban, Plus, AlertTriangle, ArrowRight, MoreVertical, 
  Trash2, Edit, ImagePlus, Loader2, ArrowLeft, LayoutList, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllProjetos, 
  createProjeto,
  updateProjeto,
  deleteProjeto,
  getTarefasPorProjeto, 
  createTarefa, 
  updateTarefaStatus, 
  autoUpdateProjectProgress,
  getMinisterios,
  getMinisteriosDoUsuario
} from "@/services/db";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CATEGORIAS = [
  "Evento", "Manutenção", "Culto Especial", "Treinamento", "Construção / Obra", "Outros"
];

export default function Projects() {
  const { userProfile, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [myMinistries, setMyMinistries] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const isAdminOrPastor = userProfile?.Nivel_Acesso === "Admin" || userProfile?.Nivel_Acesso === "Pastor";
  const isLeader = isAdminOrPastor || userProfile?.Nivel_Acesso === "Lider";

  // Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newCategory, setNewCategory] = useState("Outros");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { 
    if (userProfile) loadData(); 
  }, [userProfile]);

  const loadData = async () => {
    try {
      const email = user?.email || userProfile?.Email;
      const [allProjects, allMinistries, myMin] = await Promise.all([
        getAllProjetos(),
        getMinisterios(),
        getMinisteriosDoUsuario(email),
      ]);
      setProjects(allProjects);
      setMinistries(allMinistries);
      setMyMinistries(myMin);
      
      const tasksPromises = allProjects.map(p => getTarefasPorProjeto(p.id));
      const allTasksArrays = await Promise.all(tasksPromises);
      setTasks(allTasksArrays.flat());
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados");
    }
  };

  const getProjectTasks = (projectId) => tasks.filter((t) => t.ID_Projeto === projectId);
  
  const openCreate = () => {
    setIsEditing(false); setEditingId(null);
    setNewName(""); setNewDesc(""); setNewMinistryId("");
    setNewCategory("Outros"); setImageFile(null); setPreviewUrl("");
    setShowForm(true);
  };

  const openEdit = (p, e) => {
    e.stopPropagation();
    setIsEditing(true); setEditingId(p.id);
    setNewName(p.Nome || ""); setNewDesc(p.Descricao || ""); 
    setNewMinistryId(p.ID_Ministerio || ""); setNewCategory(p.Categoria || "Outros");
    setImageFile(null); setPreviewUrl(p.Imagem_URL || "");
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Deseja realmente apagar este projeto?")) return;
    try {
      await deleteProjeto(id);
      toast.success("Projeto apagado.");
      if (selectedProject?.id === id) setSelectedProject(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao apagar projeto.");
    }
  };

  const handleSaveProject = async () => {
    if (!newName) { toast.error("Nome obrigatório"); return; }
    setIsSubmitting(true);
    try {
      let finalImageUrl = previewUrl; // Use existing if editing
      
      if (imageFile) {
        const storage = getStorage();
        const fileRef = ref(storage, `projetos/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(snap.ref);
      }

      const ministry = ministries.find((m) => m.id === newMinistryId);
      const data = {
        Nome: newName,
        Descricao: newDesc,
        ID_Ministerio: newMinistryId,
        Nome_Ministerio: ministry?.Nome || "",
        Categoria: newCategory,
        Imagem_URL: finalImageUrl,
        Criado_Por: userProfile.Email,
      };

      if (isEditing) {
        await updateProjeto(editingId, data);
        toast.success("Projeto atualizado!");
        if (selectedProject?.id === editingId) {
          setSelectedProject({ ...selectedProject, ...data });
        }
      } else {
        await createProjeto(data);
        toast.success("Projeto criado!");
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const newStatus = task.Status === "Concluido" ? "A Fazer" : "Concluido";
      await updateTarefaStatus(task.id, newStatus);
      await autoUpdateProjectProgress(task.ID_Projeto);
      loadData();
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleAddTask = async (projectId, title) => {
    if (!title) return;
    try {
      await createTarefa({ 
        ID_Projeto: projectId, Titulo: title, Tipo: "Tarefa", Criado_Por: userProfile.Email
      });
      await autoUpdateProjectProgress(projectId);
      loadData();
    } catch (error) {
      toast.error("Erro ao adicionar tarefa");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Projetos & Tarefas</h1>
          <p className="text-muted-foreground text-sm">Gerencie o avanço dos ministérios.</p>
        </div>
        
        {isLeader && (
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Novo Projeto
          </Button>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{isEditing ? "Editar Projeto" : "Criar Projeto"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Capa do Projeto</Label>
              <div 
                className="relative h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-muted/30 overflow-hidden group cursor-pointer"
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImagePlus className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Clique para alterar a capa</span>
                  </div>
                )}
                <input 
                  type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if(f) { setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                  }}
                />
              </div>
            </div>

            <div><Label>Nome do Projeto</Label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div><Label>Descrição</Label><Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ministério Responsável</Label>
                <Select value={newMinistryId} onValueChange={setNewMinistryId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(isAdminOrPastor ? ministries : myMinistries).map(m => (<SelectItem key={m.id} value={m.id}>{m.Nome}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleSaveProject} disabled={isSubmitting} className="w-full mt-4">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Projeto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          tasks={getProjectTasks(selectedProject.id)}
          onBack={() => setSelectedProject(null)}
          onToggleTask={toggleTask}
          onAddTask={handleAddTask}
          isLeader={isAdminOrPastor || myMinistries.some(m => m.id === selectedProject.ID_Ministerio)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-20 text-muted-foreground bg-card border border-dashed rounded-xl">
              <FolderKanban className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm opacity-70">Crie o primeiro projeto para começar.</p>
            </div>
          ) : (
            <AnimatePresence>
              {projects.map((p, i) => (
                <motion.div
                  key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedProject(p)}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all flex flex-col group"
                >
                  <div className="relative h-32 bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {p.Imagem_URL ? (
                      <img src={p.Imagem_URL} alt={p.Nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <FolderKanban className="w-10 h-10 text-muted-foreground/30" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {p.Categoria && <Badge className="bg-black/60 hover:bg-black/80 backdrop-blur-sm border-none text-white">{p.Categoria}</Badge>}
                      {p.Nome_Ministerio && <Badge className="bg-primary/80 hover:bg-primary backdrop-blur-sm border-none text-white">{p.Nome_Ministerio}</Badge>}
                    </div>
                    
                    {/* Ações Rápidas */}
                    {(isAdminOrPastor || p.Criado_Por === userProfile.Email) && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white border-none">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => openEdit(p, e)}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDelete(p.id, e)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Apagar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-lg mb-1 leading-tight line-clamp-1">{p.Nome}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{p.Descricao || "Sem descrição..."}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
                        <span className="text-xs font-bold text-primary">{p.Progresso || 0}%</span>
                      </div>
                      <Progress value={p.Progresso || 0} className="h-2 bg-muted" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Project Detail View (Kanban / Columns)
// ─────────────────────────────────────────────────────────
function ProjectDetail({ project, tasks, onBack, onToggleTask, onAddTask, isLeader }) {
  const [newTask, setNewTask] = useState("");
  const taskItems = tasks.filter(t => t.Tipo === "Tarefa");
  const tickets = tasks.filter(t => t.Tipo === "Chamado");

  const pendingTasks = taskItems.filter(t => t.Status !== "Concluido");
  const completedTasks = taskItems.filter(t => t.Status === "Concluido");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
        {project.Imagem_URL ? (
          <div className="h-48 md:h-64 relative w-full">
            <img src={project.Imagem_URL} alt="Capa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <Button onClick={onBack} variant="secondary" size="sm" className="absolute top-4 left-4 bg-black/40 text-white border-none hover:bg-black/60 backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
            </Button>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {project.Categoria && <Badge className="bg-accent text-accent-foreground border-none">{project.Categoria}</Badge>}
                {project.Nome_Ministerio && <Badge className="bg-primary text-primary-foreground border-none">{project.Nome_Ministerio}</Badge>}
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{project.Nome}</h2>
              <p className="text-white/80 line-clamp-2 max-w-3xl text-sm md:text-base">{project.Descricao}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <Button onClick={onBack} variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar aos projetos
            </Button>
            <div className="flex gap-2 mb-3">
              {project.Categoria && <Badge variant="secondary">{project.Categoria}</Badge>}
              {project.Nome_Ministerio && <Badge variant="default">{project.Nome_Ministerio}</Badge>}
            </div>
            <h2 className="font-heading text-3xl font-bold mb-2">{project.Nome}</h2>
            <p className="text-muted-foreground max-w-3xl">{project.Descricao}</p>
          </div>
        )}
        
        <div className="bg-muted/50 p-4 border-t border-border flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <span>Progresso Geral</span>
              <span className="text-primary">{project.Progresso || 0}%</span>
            </div>
            <Progress value={project.Progresso || 0} className="h-2" />
          </div>
        </div>
      </div>

      {/* Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Column 1: Tarefas Pendentes */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
            <LayoutList className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-lg">Para Fazer</h3>
            <Badge variant="secondary" className="ml-auto">{pendingTasks.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="group flex items-start gap-3 p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <Checkbox checked={false} disabled={!isLeader} onCheckedChange={() => onToggleTask(task)} className="mt-0.5" />
                <span className="text-sm font-medium leading-tight pt-0.5">{task.Titulo}</span>
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa pendente.</p>}
          </div>

          {isLeader && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <Label className="text-xs text-muted-foreground mb-2 block">Adicionar Tarefa</Label>
              <div className="flex gap-2">
                <Input placeholder="O que precisa ser feito?" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { onAddTask(project.id, newTask); setNewTask(""); } }} />
                <Button onClick={() => { onAddTask(project.id, newTask); setNewTask(""); }}>Add</Button>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Tarefas Concluídas & Chamados */}
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-heading font-semibold text-lg">Concluídas</h3>
              <Badge variant="secondary" className="ml-auto">{completedTasks.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-2 opacity-60 hover:opacity-100 transition-opacity">
                  <Checkbox checked={true} disabled={!isLeader} onCheckedChange={() => onToggleTask(task)} className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                  <span className="text-sm line-through pt-0.5">{task.Titulo}</span>
                </div>
              ))}
              {completedTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nada concluído ainda.</p>}
            </div>
          </div>

          {tickets.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-heading font-semibold text-lg">Chamados Ativos</h3>
              </div>
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{ticket.Titulo}</p>
                      <Badge variant={ticket.Status === "Concluido" ? "outline" : "destructive"} className="text-[10px] h-5">
                        {ticket.Status}
                      </Badge>
                    </div>
                    {ticket.Descricao && <p className="text-xs text-muted-foreground">{ticket.Descricao}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </motion.div>
  );
}