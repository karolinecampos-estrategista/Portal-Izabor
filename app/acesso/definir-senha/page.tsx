"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  // Verifica se há sessão ativa (vinda do link de convite)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Sem sessão — redireciona para login
        router.replace("/acesso");
        return;
      }
      // Pré-preenche o nome se disponível nos metadados
      const nomeMeta = session.user.user_metadata?.nome || session.user.user_metadata?.full_name || "";
      setNome(nomeMeta);
      setVerificandoSessao(false);
    });
  }, [router]);

  async function handleDefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.updateUser({ password: senha });

    setCarregando(false);

    if (error) {
      setErro("Erro ao definir senha. Tente novamente ou peça ao administrador para reenviar o convite.");
      return;
    }

    setSucesso(true);

    // Redireciona para o portal após 2 segundos
    setTimeout(() => {
      router.replace("/mentorada");
    }, 2000);
  }

  if (verificandoSessao) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <CheckCircle2 size={48} style={{ color: "#86efac", marginBottom: 16 }} />
          <h2 style={{ color: "var(--text)", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Senha definida!</h2>
          <p style={{ color: "var(--text-soft)", fontSize: 14, margin: 0 }}>Bem-vinda ao portal. Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/logo-bw.jpeg"
            alt="Build Woman"
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 14, display: "block", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", marginBottom: 10 }}>
            <Sparkles size={12} style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.08em" }}>PRIMEIRO ACESSO</span>
          </div>
          <h1 style={{ color: "var(--text)", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
            {nome ? `Bem-vinda, ${nome.split(" ")[0]}! ✨` : "Bem-vinda! ✨"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
            Defina sua senha para acessar o portal sempre que quiser
          </p>
        </div>

        <form onSubmit={handleDefinirSenha} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
              Nova senha <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(mín. 8 caracteres)</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                style={{ width: "100%", padding: "11px 40px 11px 14px", background: "var(--bg-input)", border: `1px solid ${erro ? "#fca5a5" : "var(--border)"}`, borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none" }}
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Confirmar senha</label>
            <input
              type={mostrarSenha ? "text" : "password"}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "11px 14px", background: "var(--bg-input)", border: `1px solid ${erro && confirmarSenha !== senha ? "#fca5a5" : "var(--border)"}`, borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none" }}
            />
          </div>

          {erro && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.2)", borderRadius: 8 }}>
              <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{erro}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando || !senha || !confirmarSenha}
            style={{ padding: "13px", borderRadius: 10, background: carregando || !senha || !confirmarSenha ? "rgba(201,168,76,0.25)" : "var(--gold)", border: "none", cursor: carregando || !senha || !confirmarSenha ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700, marginTop: 4 }}
          >
            {carregando ? "Salvando..." : "Entrar no portal"}
          </button>
        </form>

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
          Guarde essa senha — você usará e-mail + senha para acessar o portal daqui pra frente
        </p>
      </div>
    </div>
  );
}
