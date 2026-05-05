import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Church, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { loginWithEmail, loginWithGoogle, registerWithEmail } from "@/services/auth";
import toast from "react-hot-toast";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, authError } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (userProfile?.Status === 'Pendente') {
        toast.error("Sua conta está aguardando aprovação pastoral.");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, userProfile, navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
        toast.success("Conta criada! Aguarde a aprovação pastoral.");
        setIsRegistering(false);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error(err.message || "Erro no login com Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
              <Church className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Área do Membro</h1>
            <p className="text-muted-foreground text-sm">
              {isRegistering ? "Crie sua conta para acessar o portal" : "Acesse escalas, avisos e projetos do seu ministério"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {isRegistering && (
              <div>
                <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 gap-2 h-11"
            >
              {loading ? "Aguarde..." : (isRegistering ? "Criar Conta" : "Entrar")}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            type="button"
            className="w-full gap-2 h-11"
          >
            <Chrome className="w-4 h-4" /> Google
          </Button>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            {isRegistering ? "Já tem uma conta? " : "Ainda não é membro? "}
            <button 
              type="button" 
              className="text-primary font-semibold underline"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Faça login" : "Cadastre-se"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}