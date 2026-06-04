"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Crown, User, AlertCircle } from "lucide-react";

type Tela = "escolha" | "entrar";

export default function LoginPage() {
  const router = useRouter();
  const [tela, setTela] = useState<Tela>("escolha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      setCarregando(false);
      return;
    }

    // Verifica o tipo do usuário no banco
    const { data: perfil } = await supabase
      .from("perfis")
      .select("tipo")
      .eq("id", data.user.id)
      .single();

    setCarregando(false);

    if (perfil?.tipo === "admin") {
      router.replace("/");
    } else {
      router.replace("/mentorada");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div
        style={{
          position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ margin: "0 auto 16px", display: "inline-block" }}>
            <img
              src="/logo-bw.jpeg"
              alt="Build Woman"
              style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 16, display: "block", boxShadow: "0 8px 32px rgba(13,59,44,0.4)" }}
            />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.08em", margin: "0 0 6px" }}>
            IZABOR CRUZ
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Ativando Mulheres para viverem o extraordinário ✨
          </p>
        </div>

        {/* TELA: Escolha */}
        {tela === "escolha" && (
          <div>
            <p style={{ fontSize: 14, color: "var(--text-soft)", textAlign: "center", marginBottom: 24 }}>
              Selecione seu acesso
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => setTela("entrar")}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 12, background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Crown size={20} style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Sou a Izabor</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>Acesso de administradora</p>
                </div>
              </button>

              <button
                onClick={() => setTela("entrar")}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={20} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Sou Mentorada</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>Acesso ao meu portal</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TELA: Login */}
        {tela === "entrar" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Entrar no portal</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Use o e-mail e senha que você recebeu
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
                style={{ padding: "13px", borderRadius: 10, background: carregando || !email || !senha ? "rgba(201,168,76,0.3)" : "var(--gold)", border: "none", cursor: carregando || !email || !senha ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700, transition: "all 0.2s" }}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              <button type="button" onClick={() => { setTela("escolha"); setErro(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: "4px 0" }}>
                ← Voltar
              </button>
            </form>
          </div>
        )}

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 40 }}>
          Portal exclusivo · Izabor Cruz — Fé · Mentalidade · Liderança
        </p>
      </div>
    </div>
  );
}
