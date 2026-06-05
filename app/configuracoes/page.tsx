"use client";

import { useState, useEffect } from "react";
import { Settings, Mail, Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Configuracoes() {
  const [emailAtual, setEmailAtual] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgEmail, setMsgEmail] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [msgSenha, setMsgSenha] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmailAtual(session.user.email);
        setNovoEmail(session.user.email);
      }
      setCarregando(false);
    });
  }, []);

  async function salvarEmail() {
    if (!novoEmail.trim() || novoEmail === emailAtual || salvandoEmail) return;
    setSalvandoEmail(true);
    setMsgEmail(null);
    const { error } = await supabase.auth.updateUser({ email: novoEmail });
    if (error) {
      setMsgEmail({ tipo: "erro", texto: error.message });
    } else {
      setMsgEmail({ tipo: "ok", texto: "Verifique sua caixa de e-mail para confirmar a troca." });
    }
    setSalvandoEmail(false);
  }

  async function salvarSenha() {
    if (!novaSenha || salvandoSenha) return;
    if (novaSenha.length < 6) {
      setMsgSenha({ tipo: "erro", texto: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: "erro", texto: "As senhas não coincidem." });
      return;
    }
    setSalvandoSenha(true);
    setMsgSenha(null);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      setMsgSenha({ tipo: "erro", texto: error.message });
    } else {
      setMsgSenha({ tipo: "ok", texto: "Senha atualizada com sucesso!" });
      setNovaSenha("");
      setConfirmarSenha("");
    }
    setSalvandoSenha(false);
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Settings size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Conta</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Configurações</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Gerencie seu e-mail e senha de acesso ao painel.</p>
      </div>

      {/* Troca de E-mail */}
      <div className="card" style={{ padding: "24px 24px", marginBottom: 20, border: "1px solid var(--gold-border)" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>E-mail de acesso</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>E-mail atual: <strong style={{ color: "var(--text-soft)" }}>{emailAtual}</strong></p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Novo e-mail</label>
            <input
              type="email"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
              placeholder="novo@email.com"
              style={{ width: "100%", padding: "10px 14px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", outline: "none" }}
            />
          </div>

          {msgEmail && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 8, background: msgEmail.tipo === "ok" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)", border: `1px solid ${msgEmail.tipo === "ok" ? "rgba(134,239,172,0.25)" : "rgba(252,165,165,0.25)"}` }}>
              {msgEmail.tipo === "ok" ? <CheckCircle2 size={14} style={{ color: "#86efac", flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontSize: 12, color: msgEmail.tipo === "ok" ? "#86efac" : "#fca5a5", lineHeight: 1.5 }}>{msgEmail.texto}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-gold"
              onClick={salvarEmail}
              disabled={!novoEmail.trim() || novoEmail === emailAtual || salvandoEmail}
              style={{ fontSize: 13 }}
            >
              {salvandoEmail ? "Salvando..." : "Atualizar E-mail"}
            </button>
          </div>
        </div>
      </div>

      {/* Troca de Senha */}
      <div className="card" style={{ padding: "24px 24px", border: "1px solid var(--gold-border)" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Senha de acesso</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Defina uma nova senha para o painel.</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Nova senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showSenha ? "text" : "password"}
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: "100%", padding: "10px 40px 10px 14px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
              >
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Confirmar nova senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                style={{ width: "100%", padding: "10px 40px 10px 14px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
              >
                {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {msgSenha && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 8, background: msgSenha.tipo === "ok" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)", border: `1px solid ${msgSenha.tipo === "ok" ? "rgba(134,239,172,0.25)" : "rgba(252,165,165,0.25)"}` }}>
              {msgSenha.tipo === "ok" ? <CheckCircle2 size={14} style={{ color: "#86efac", flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontSize: 12, color: msgSenha.tipo === "ok" ? "#86efac" : "#fca5a5", lineHeight: 1.5 }}>{msgSenha.texto}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-gold"
              onClick={salvarSenha}
              disabled={!novaSenha || salvandoSenha}
              style={{ fontSize: 13 }}
            >
              {salvandoSenha ? "Salvando..." : "Atualizar Senha"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
