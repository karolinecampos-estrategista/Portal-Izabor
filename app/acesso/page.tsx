"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

export default function LoginMentoradaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos. Verifique o e-mail de convite e tente novamente.");
      return;
    }

    router.replace("/mentorada");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/logo-bw.jpeg"
            alt="Build Woman"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 16, display: "block", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", marginBottom: 8 }}>
            <Sparkles size={12} style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.08em" }}>LOGIN DAS EXTRAORDINÁRIAS</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
            Bem-vinda ao seu espaço exclusivo
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{ width: "100%", padding: "11px 14px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "11px 40px 11px 14px", background: "var(--bg-input)", border: `1px solid ${erro ? "#fca5a5" : "var(--border)"}`, borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none" }}
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.2)", borderRadius: 8 }}>
              <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{erro}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando || !email || !senha}
            style={{ padding: "13px", borderRadius: 10, background: carregando || !email || !senha ? "rgba(201,168,76,0.25)" : "var(--gold)", border: "none", cursor: carregando || !email || !senha ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700, marginTop: 4 }}
          >
            {carregando ? "Entrando..." : "Entrar no portal"}
          </button>
        </form>

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 32 }}>
          Acesso exclusivo · Portal das Extraordinárias
        </p>
      </div>
    </div>
  );
}
