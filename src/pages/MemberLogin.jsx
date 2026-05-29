import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Chrome, Church, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { loginWithEmail, loginWithGoogle, registerWithEmail } from "@/services/auth";
import toast from "react-hot-toast";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isLoadingAuth, user } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'google_complete'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("Membro");
  const [ministryName, setMinistryName] = useState("");

  // Redireciona se já autenticado ou vai para google_complete
  useEffect(() => {
    if (isLoadingAuth) return;
    
    // Fallback: Se for o admin, vai direto pro dashboard independente do userProfile estar null temporariamente
    const currentUserEmail = userProfile?.Email || user?.email;
    if (isAuthenticated && currentUserEmail === 'vinicius.w.ferreira@aluno.senai.br') {
      navigate("/dashboard");
      return;
    }

    if (isAuthenticated) {
      if (userProfile) {
        navigate("/dashboard");
      } else {
        setMode("google_complete");
      }
    }
  }, [isAuthenticated, userProfile, isLoadingAuth, navigate, user]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) { toast.error("Informe seu nome completo."); return; }
        await registerWithEmail(email, password, name, role, role === "Lider" ? ministryName : null);
        toast.success("Cadastro realizado! O login prosseguirá automaticamente.");
        // O onAuthStateChanged vai rodar e recarregar o perfil
      } else {
        await loginWithEmail(email, password);
        // Redirecionamento feito pelo useEffect acima
      }
    } catch (err) {
      // Mensagens amigáveis para erros do Firebase
      const msg = err.code === "auth/user-not-found"      ? "E-mail não encontrado."
                : err.code === "auth/wrong-password"       ? "Senha incorreta."
                : err.code === "auth/email-already-in-use" ? "Este e-mail já está cadastrado."
                : err.code === "auth/weak-password"        ? "A senha deve ter pelo menos 6 caracteres."
                : err.code === "auth/invalid-credential"   ? "E-mail ou senha inválidos."
                : err.message || "Ocorreu um erro.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name.trim()) { toast.error("Informe seu nome completo."); return; }
      const { completeRegistration } = await import("@/services/auth");
      await completeRegistration(name, role, role === "Lider" ? ministryName : null);
      toast.success("Cadastro finalizado!");
      window.location.reload(); // Recarrega para o AuthContext pegar o novo perfil
    } catch (err) {
      toast.error(err.message || "Erro ao concluir cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // AuthContext detecta o usuário e cria o perfil automaticamente se necessário
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Erro no login com Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Painel Esquerdo — Identidade Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center"
        >
          <img src="/logo.png" alt="IECP SBC" className="h-24 w-auto object-contain mx-auto mb-8 drop-shadow-xl" />
          <h1 className="font-heading text-4xl font-bold mb-2">IECP SBC</h1>
          <p className="text-white/70 text-sm uppercase tracking-widest font-medium mb-6">
            Igreja Evangélica Cristã Presbiteriana
          </p>
          <p className="text-white/60 text-base leading-relaxed max-w-xs mx-auto">
            Portal exclusivo para membros. Acesse escalas, ministérios e avisos internos da nossa congregação.
          </p>
        </motion.div>

        {/* Quote */}
        <div className="absolute bottom-10 left-12 right-12 text-center">
          <p className="text-white/40 text-xs italic">
            "Para mim o viver é Cristo..." — Fp 1:21
          </p>
        </div>
      </div>

      {/* Painel Direito — Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Voltar para o site */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </Link>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="IECP SBC" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-heading font-bold text-base">IECP SBC</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Portal do Membro</p>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold mb-1">
            {mode === "login" ? "Entrar" : mode === "google_complete" ? "Completar Cadastro" : "Criar Conta"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login"
              ? "Acesse o portal interno da IECP SBC."
              : mode === "google_complete" 
              ? "Falta pouco! Preencha os dados abaixo para finalizar."
              : "Solicite seu acesso ao portal de membros."}
          </p>

          {/* Formulário */}
          <form onSubmit={mode === "google_complete" ? handleGoogleComplete : handleEmailAuth} className="space-y-4">
            {(mode === "register" || mode === "google_complete") && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full pl-3 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    required
                  >
                    <option value="Membro">Sou Membro</option>
                    <option value="Lider">Sou Líder de Ministério</option>
                    <option value="Pastor">Sou Pastor</option>
                  </select>
                </div>
                {role === "Lider" && (
                  <div className="relative mt-4">
                    <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Nome do Ministério que lidera"
                      value={ministryName}
                      onChange={e => setMinistryName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {mode !== "google_complete" && (
              <>
                <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm transition-all disabled:opacity-60"
            >
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "google_complete" ? "Concluir Cadastro" : "Solicitar Acesso"}
            </motion.button>
          </form>

          {mode !== "google_complete" && (
            <>
              {/* Divisor */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </motion.button>

          {/* Alternar modo */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Ainda não é membro? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setPassword(""); }}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Solicite o cadastro" : "Faça login"}
            </button>
          </p>

              {mode === "register" && (
                <p className="text-center text-xs text-muted-foreground mt-3 leading-relaxed">
                  Líderes e Pastores precisarão de aprovação antes de acessar o portal.
                </p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}