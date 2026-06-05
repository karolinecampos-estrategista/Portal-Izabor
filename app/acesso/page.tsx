"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, Sparkles, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

const PORTAL_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projeto-iza-nine.vercel.app";

// Componente interno separado para poder usar useSearchParams dentro do Suspense
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [processandoConvite, setProcessandoConvite] = useState(false);

  // Estados de recuperação de senha
  const [mostraRecuperacao, setMostraRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  // Detecta link de convite — suporta PKCE (?code=) e fluxo implícito (#access_token=)
  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // Fluxo PKCE (gerado quando o usuário usa resetPasswordForEmail no mesmo browser)
      setProcessandoConvite(true);
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error || !data.session) {
          setProcessandoConvite(false);
          setErro("Link expirado ou já utilizado. Use a opção abaixo para receber um novo link.");
          return;
        }
        router.replace("/acesso/definir-senha");
      });
      return;
    }

    // Fluxo implícito — links gerados pelo admin SDK chegam com #access_token= no hash
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("access_token")) {
      setProcessandoConvite(true);

      // Usa onAuthStateChange para garantir que o SDK processou o hash antes de verificar
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe();
          router.replace("/acesso/definir-senha");
        }
      });

      // Fallback: se o evento não disparar em 3s, verifica diretamente
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.replace("/acesso/definir-senha");
          } else {
            setProcessandoConvite(false);
            setErro("Link expirado ou já utilizado. Use a opção abaixo para receber um novo link.");
          }
        });
      }, 3000);

      return () => { subscription.unsubscribe(); clearTimeout(timeout); };
    }

    // Sem token — verifica se já tem sessão ativa (mentorada já logada)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/mentorada");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRecuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!emailRecuperacao.trim() || enviandoReset) return;
    setEnviandoReset(true);

    await supabase.auth.resetPasswordForEmail(emailRecuperacao.trim().toLowerCase(), {
      redirectTo: `${PORTAL_URL}/acesso`,
    });

    // Sempre mostra sucesso — não revela se o e-mail existe ou não
    setEnviandoReset(false);
    setResetEnviado(true);
  }

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

  if (processandoConvite) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite", marginBottom: 16 }} />
          <p style={{ color: "var(--text-soft)", fontSize: 14, margin: 0 }}>Verificando seu convite...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  // ── Tela de recuperação de senha ──────────────────────────────────────────
  if (mostraRecuperacao) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <button
            onClick={() => { setMostraRecuperacao(false); setResetEnviado(false); setEmailRecuperacao(""); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0, marginBottom: 28 }}
          >
            <ArrowLeft size={14} /> Voltar para o login
          </button>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <img src="/logo-bw.jpeg" alt="Build Woman" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, display: "block", margin: "0 auto 14px", boxShadow: "0 6px 24px rgba(0,0,0,0.4)" }} />
            <h2 style={{ color: "var(--text)", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Primeiro acesso ou nova senha</h2>
            <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
              Digite seu e-mail e enviaremos um link para definir ou redefinir sua senha.
            </p>
          </div>

          {resetEnviado ? (
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <CheckCircle2 size={40} style={{ color: "#86efac", marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, margin: "0 0 6px" }}>Link enviado!</p>
              <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 20px", lineHeight: 1.5 }}>
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>
              <button
                onClick={() => { setMostraRecuperacao(false); setResetEnviado(false); setEmailRecuperacao(""); }}
                style={{ fontSize: 13, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecuperarSenha} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Seu e-mail cadastrado</label>
                <input
                  type="email"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  style={{ width: "100%", padding: "11px 14px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none" }}
                />
              </div>
              <button
                type="submit"
                disabled={enviandoReset || !emailRecuperacao}
                style={{ padding: "13px", borderRadius: 10, background: enviandoReset || !emailRecuperacao ? "rgba(201,168,76,0.25)" : "var(--gold)", border: "none", cursor: enviandoReset || !emailRecuperacao ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700 }}
              >
                {enviandoReset ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Tela de login normal ───────────────────────────────────────────────────
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Senha</label>
              <button
                type="button"
                onClick={() => { setMostraRecuperacao(true); setEmailRecuperacao(email); }}
                style={{ fontSize: 11, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Esqueceu a senha?
              </button>
            </div>
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

        {/* Primeiro acesso */}
        <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
          <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "0 0 8px", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--gold)" }}>Primeiro acesso?</strong> Ou esqueceu sua senha?
          </p>
          <button
            type="button"
            onClick={() => { setMostraRecuperacao(true); setEmailRecuperacao(email); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%", justifyContent: "center" }}
          >
            Definir / recuperar minha senha →
          </button>
        </div>

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 20 }}>
          Acesso exclusivo · Portal das Extraordinárias
        </p>
      </div>
    </div>
  );
}

export default function LoginMentoradaPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.3)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
