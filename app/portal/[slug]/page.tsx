"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, AlertCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

const PORTAL_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projeto-iza-nine.vercel.app";

function PortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [processandoConvite, setProcessandoConvite] = useState(false);
  const [nomeExtraordinaria, setNomeExtraordinaria] = useState("");

  // Busca o nome da extraordinária pelo slug para personalizar a tela
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal-slug?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => { if (d?.nome) setNomeExtraordinaria(d.nome); })
      .catch(() => {});
  }, [slug]);

  // Detecta link de convite — PKCE (?code=) e fluxo implícito (#access_token=)
  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      setProcessandoConvite(true);
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error || !data.session) {
          setProcessandoConvite(false);
          setErro("Link de convite inválido ou expirado. Entre em contato com a Izabor.");
          return;
        }
        router.replace("/acesso/definir-senha");
      });
      return;
    }

    // Fluxo implícito via hash
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("access_token") || hash.includes("type=invite") || hash.includes("type=recovery")) {
      setProcessandoConvite(true);
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.replace("/acesso/definir-senha");
          } else {
            setProcessandoConvite(false);
            setErro("Link de convite inválido ou expirado. Entre em contato com a Izabor.");
          }
        });
      }, 800);
      return;
    }

    // Verifica sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/mentorada");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
      return;
    }
    router.replace("/mentorada");
  }

  const primeiroNome = nomeExtraordinaria.split(" ")[0] ?? "";

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/logo-bw.jpeg"
            alt="Build Woman"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 16, display: "block", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", marginBottom: 8 }}>
            <Sparkles size={12} style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.08em" }}>PORTAL DAS EXTRAORDINÁRIAS</span>
          </div>
          <p style={{ fontSize: 15, color: "var(--text)", margin: "0 0 4px", fontWeight: 600 }}>
            {primeiroNome ? `Bem-vinda, ${primeiroNome}!` : "Bem-vinda ao seu portal exclusivo"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
            Este é o seu link pessoal de acesso.
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
              autoFocus
              style={{ width: "100%", padding: "11px 14px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
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
                style={{ width: "100%", padding: "11px 40px 11px 14px", background: "var(--bg-input)", border: `1px solid ${erro ? "#fca5a5" : "var(--border)"}`, borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
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

export default function PortalSlugPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.3)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}
