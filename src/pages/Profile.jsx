import { useState, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { User, Lock, Upload, Save, Church, AtSign, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { updateProfile, updatePassword as updateAuthPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
// Note: Requires Firebase Storage to be initialized in firebase.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const [name, setName] = useState(userProfile?.Nome_Exibicao || user?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.Telefone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }

    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firebase Auth
      await updateProfile(user, { photoURL: downloadURL });
      
      // Update Firestore Profile
      await updateDoc(doc(db, "Usuarios", user.uid), { Avatar_URL: downloadURL });
      
      refreshProfile();
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("O nome de exibição é obrigatório.");
      return;
    }

    setIsSaving(true);
    try {
      // Update Firebase Auth Name
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // Update Firestore Profile
      await updateDoc(doc(db, "Usuarios", user.uid), { 
        Nome_Exibicao: name,
        Telefone: phone 
      });

      refreshProfile();
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password) {
      toast.error("Digite a nova senha.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await updateAuthPassword(user, password);
      toast.success("Senha atualizada com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error("Por segurança, saia e faça login novamente para trocar a senha.");
      } else {
        toast.error("Erro ao atualizar a senha.");
      }
    }
  };

  const role = userProfile?.Nivel_Acesso || "Membro";
  const avatarUrl = user?.photoURL || userProfile?.Avatar_URL;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações e preferências.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card do Avatar e Cargo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-muted" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-accent/10 flex items-center justify-center border-4 border-muted">
                  <User className="w-12 h-12 text-accent" />
                </div>
              )}
              
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-white" />
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>

            <h2 className="font-heading font-semibold text-lg">{name || "Membro"}</h2>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1 mb-4">
              <Church className="w-3.5 h-3.5" />
              {role}
            </div>
            
            <div className="w-full pt-4 border-t border-border/50 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AtSign className="w-4 h-4" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulário Principal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-2 space-y-6"
        >
          {/* Informações Pessoais */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados Pessoais
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome de Exibição</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Como deseja ser chamado"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone (WhatsApp)</Label>
                  <Input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </Button>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" /> Segurança
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nova Senha</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirmar Nova Senha</Label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
              <Button onClick={handleUpdatePassword} variant="outline" className="gap-2 border-accent text-accent hover:bg-accent/10">
                <Lock className="w-4 h-4" /> Atualizar Senha
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
