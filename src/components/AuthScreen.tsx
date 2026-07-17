import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Car, Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AuthScreenProps {
  onAuthSuccess: (userId: string, isDemo: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user.uid, false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user.uid, false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está sendo utilizado.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Ocorreu um erro ao autenticar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    onAuthSuccess("demo-user", true);
  };

  return (
    <div id="auth-screen-container" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-neutral-900">
      
      {/* Background visual styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Top visual neon bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500" />
        
        {/* Logo and title */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl mb-4 text-cyan-400 group relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Car className="w-8 h-8 relative animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center justify-center gap-1.5 font-sans">
            DRIVE<span className="text-cyan-400 font-mono">ANALYTICS</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-[280px] mx-auto">
            O painel de telemetria e controle de lucro real definitivo para pilotos de app.
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                id="email-input"
                type="email"
                required
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 text-neutral-900 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/10 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-neutral-900" />
                <span>{isRegister ? "Iniciar Cadastro" : "Iniciar Ignição"}</span>
              </>
            )}
          </button>
        </form>

        {/* Change Mode Toggle */}
        <div className="mt-5 text-center">
          <button
            type="button"
            id="toggle-auth-mode-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isRegister ? "Já possui conta? Faça Login" : "Não tem uma conta? Cadastre-se"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-3 text-neutral-500 font-mono tracking-wider">OU</span>
          </div>
        </div>

        {/* Demo Mode Action */}
        <button
          type="button"
          id="demo-mode-btn"
          onClick={handleDemoMode}
          className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Modo de Demonstração (Sem Login)</span>
        </button>

        <p className="text-[10px] text-center text-neutral-600 mt-6 font-mono">
          Os dados no modo demonstração são salvos localmente.
        </p>
      </motion.div>
    </div>
  );
}
