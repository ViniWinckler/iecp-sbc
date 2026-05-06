import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Phone, Instagram, Save, Loader2, Plus, Trash2, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function AdminPanel() {
  const [info, setInfo] = useState({});
  const [verse, setVerse] = useState({ text: "", reference: "" });
  const [pastors, setPastors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newPastor, setNewPastor] = useState({ name: "", role: "Pastor", bio: "", photo_url: "" });
  const [pastorToDelete, setPastorToDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [allInfo, allVerses, allPastors] = await Promise.all([
      base44.entities.ChurchInfo.list(),
      base44.entities.DailyVerse.filter({ active: true }),
      base44.entities.Pastor.list("order"),
    ]);
    const map = {};
    allInfo.forEach((item) => { map[item.key] = item; });
    setInfo(map);
    setPastors(allPastors);
    if (allVerses.length > 0) setVerse(allVerses[0]);
  };

  const saveInfo = async (key, value, image_url) => {
    setSaving(true);
    if (info[key]) {
      await base44.entities.ChurchInfo.update(info[key].id, { value, image_url });
    } else {
      await base44.entities.ChurchInfo.create({ key, value, image_url });
    }
    await loadData();
    setSaving(false);
    toast({ title: "Salvo com sucesso!" });
  };

  const saveVerse = async () => {
    setSaving(true);
    if (verse.id) {
      await base44.entities.DailyVerse.update(verse.id, { text: verse.text, reference: verse.reference });
    } else {
      await base44.entities.DailyVerse.create({ text: verse.text, reference: verse.reference, active: true });
    }
    setSaving(false);
    toast({ title: "Versículo salvo!" });
  };

  const handleAddPastor = async () => {
    if (!newPastor.name) return;
    await base44.entities.Pastor.create({ ...newPastor, order: pastors.length });
    setNewPastor({ name: "", role: "Pastor", bio: "", photo_url: "" });
    loadData();
  };

  const handleDeletePastor = async () => {
    if (!pastorToDelete) return;
    await base44.entities.Pastor.delete(pastorToDelete.id);
    setPastorToDelete(null);
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Administração</h1>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Igreja</TabsTrigger>
          <TabsTrigger value="pastors">Pastores</TabsTrigger>
          <TabsTrigger value="verse">Versículo</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="location">Local</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6 space-y-6">
          {["about", "vision", "values"].map((key) => (
            <InfoEditor
              key={key}
              label={{ about: "Sobre a Igreja", vision: "Visão", values: "Valores" }[key]}
              value={info[key]?.value || ""}
              imageUrl={info[key]?.image_url || ""}
              onSave={(val, img) => saveInfo(key, val, img)}
              saving={saving}
            />
          ))}
        </TabsContent>

        <TabsContent value="pastors" className="mt-6 space-y-5">
          {/* Existing Pastors */}
          {pastors.map((pastor) => (
            <div key={pastor.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                {pastor.photo_url ? (
                  <img src={pastor.photo_url} alt={pastor.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="font-bold text-primary">{pastor.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{pastor.name}</p>
                <p className="text-sm text-accent">{pastor.role}</p>
                {pastor.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{pastor.bio}</p>}
              </div>
              <button onClick={() => setPastorToDelete(pastor)} className="p-2 hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {/* Add New Pastor */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Pastor
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome *</Label>
                <Input value={newPastor.name} onChange={(e) => setNewPastor({ ...newPastor, name: e.target.value })} className="mt-1" placeholder="Nome completo" />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input value={newPastor.role} onChange={(e) => setNewPastor({ ...newPastor, role: e.target.value })} className="mt-1" placeholder="Pastor, Co-pastor..." />
              </div>
            </div>
            <div>
              <Label>Biografia</Label>
              <Textarea value={newPastor.bio} onChange={(e) => setNewPastor({ ...newPastor, bio: e.target.value })} className="mt-1" placeholder="Breve biografia..." />
            </div>
            <div>
              <Label>URL da Foto</Label>
              <Input value={newPastor.photo_url} onChange={(e) => setNewPastor({ ...newPastor, photo_url: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <Button onClick={handleAddPastor} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="verse" className="mt-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-semibold">Versículo do Dia</h3>
            </div>
            <div>
              <Label>Texto</Label>
              <Textarea
                value={verse.text}
                onChange={(e) => setVerse({ ...verse, text: e.target.value })}
                className="mt-1"
                placeholder="Porque Deus amou o mundo de tal maneira..."
              />
            </div>
            <div>
              <Label>Referência</Label>
              <Input
                value={verse.reference}
                onChange={(e) => setVerse({ ...verse, reference: e.target.value })}
                className="mt-1"
                placeholder="João 3:16"
              />
            </div>
            <Button onClick={saveVerse} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-4">
          <InfoEditor
            label="WhatsApp"
            icon={<Phone className="w-5 h-5 text-green-600" />}
            value={info.whatsapp?.value || ""}
            onSave={(val) => saveInfo("whatsapp", val)}
            saving={saving}
            placeholder="+5511999999999"
            noImage
          />
          <InfoEditor
            label="Instagram"
            icon={<Instagram className="w-5 h-5 text-pink-600" />}
            value={info.instagram?.value || ""}
            onSave={(val) => saveInfo("instagram", val)}
            saving={saving}
            placeholder="@nossaigreja"
            noImage
          />
        </TabsContent>

        <TabsContent value="location" className="mt-6 space-y-4">
          <InfoEditor label="Endereço" value={info.address?.value || ""} onSave={(val) => saveInfo("address", val)} saving={saving} placeholder="Rua ..." noImage />
          <InfoEditor label="Latitude" value={info.latitude?.value || ""} onSave={(val) => saveInfo("latitude", val)} saving={saving} placeholder="-23.5505" noImage isShort />
          <InfoEditor label="Longitude" value={info.longitude?.value || ""} onSave={(val) => saveInfo("longitude", val)} saving={saving} placeholder="-46.6333" noImage isShort />
        </TabsContent>
      </Tabs>

      <ConfirmDeletePastorModal
        pastor={pastorToDelete}
        onConfirm={handleDeletePastor}
        onCancel={() => setPastorToDelete(null)}
      />
    </div>
  );
}

// Confirmation Modal for Delete Pastor — rendered here so it's always in the DOM
function ConfirmDeletePastorModal({ pastor, onConfirm, onCancel }) {
  return (
    <Dialog open={!!pastor} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="font-heading text-lg">Remover Pastor</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Tem certeza que deseja remover <span className="font-semibold text-foreground">{pastor?.name}</span>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 gap-2">
            <Trash2 className="w-4 h-4" /> Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoEditor({ label, value: initValue, imageUrl: initImage, onSave, saving, icon, placeholder, noImage, isShort }) {
  const [val, setVal] = useState(initValue);
  const [img, setImg] = useState(initImage || "");

  useEffect(() => {
    setVal(initValue);
    setImg(initImage || "");
  }, [initValue, initImage]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading font-semibold">{label}</h3>
      </div>
      {isShort ? (
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} />
      ) : (
        <Textarea value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} className="min-h-[80px]" />
      )}
      {!noImage && (
        <div>
          <Label>URL da Imagem</Label>
          <Input value={img} onChange={(e) => setImg(e.target.value)} className="mt-1" placeholder="https://..." />
        </div>
      )}
      <Button onClick={() => onSave(val, img)} disabled={saving} size="sm" className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar
      </Button>
    </div>
  );
}