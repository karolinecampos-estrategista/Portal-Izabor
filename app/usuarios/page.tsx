"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Clock,
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  KeyRound,
  Loader2,
} from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  tipo: string;
  acesso: "mentoria" | "livro" | "ambos" | null;
  produtos_ativos: Record<string, unknown>;
  bloqueado: boolean;
  ultimo_acesso: string | null;
  criado_em: string;
}

const acessoCfg: Record<string, { label: string; cor: string }> = {
  mentoria: { label: "SI",          cor: "#C9A84C" },
  livro:    { label: "Livro",       cor: "#93c5fd" },
  ambos:    { label: "SI + Livro",  cor: "#86efac" },
};

function fmtData(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDataHora(iso: string | null) {
  if (!iso) return "Nunca acessou";
  const d = new Date(iso);
  const hoje = new Date();
  const diffMs = hoje.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffH / 24);

  if (diffH < 1) return "Agora há pouco";
  if (diffH < 24) return `Há ${diffH}h`;
  if (diffD === 1) return "Ontem";
  if (diffD < 7) return `Há ${diffD} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "ativo" | "bloqueado">("todos");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [acao, setAcao] = useState<{ id: string; tipo: string } | null>(null);
  const [msg, setMsg] = useState<{ id: string; texto: string; ok: boolean } | null>(null);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/usuarios-admin");
    if (res.ok) setUsuarios(await res.json());
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  const lista = usuarios.filter((u) => {
    const q = busca.toLowerCase();
    const matchBusca = !q || (u.nome ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFiltro =
      filtro === "todos" ? true :
      filtro === "ativo" ? !u.bloqueado :
      u.bloqueado;
    return matchBusca && matchFiltro;
  });

  async function executarAcao(id: string, tipo: string, extra?: Record<string, unknown>) {
    setAcao({ id, tipo });
    setMsg(null);
    const res = await fetch("/api/usuarios-admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, acao: tipo, ...extra }),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg({ id, texto: tipo === "resetar_senha" ? "E-mail de redefinição enviado!" : "Atualizado com sucesso.", ok: true });
      await carregar();
    } else {
      setMsg({ id, texto: json.error ?? "Erro ao executar ação.", ok: false });
    }
    setAcao(null);
  }

  const ativos = usuarios.filter((u) => !u.bloqueado).length;
  const bloqueados = usuarios.filter((u) => u.bloqueado).length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Users size={22} color="var(--gold)" />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            Gestão de Acessos — Extraordinárias
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Visualize, controle e gerencie os acessos de todas as alunas ao portal.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total de alunas", valor: usuarios.length, cor: "var(--gold)" },
          { label: "Com acesso ativo",  valor: ativos,    cor: "#86efac" },
          { label: "Bloqueadas",        valor: bloqueados, cor: "#f87171" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.cor, margin: "0 0 2px" }}>{s.valor}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "ativo", "bloqueado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                background: filtro === f ? "var(--gold)" : "transparent",
                color: filtro === f ? "#000" : "var(--text-muted)",
                borderColor: filtro === f ? "var(--gold)" : "var(--border)",
              }}
            >
              {f === "todos" ? "Todas" : f === "ativo" ? "Ativas" : "Bloqueadas"}
            </button>
          ))}
        </div>
        <button
          onClick={carregar}
          style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}
          title="Atualizar lista"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Lista */}
      {carregando ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Carregando alunas…</p>
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <Users size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Nenhuma aluna encontrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lista.map((u) => {
            const aberto = expandido === u.id;
            const executando = acao?.id === u.id;
            const msgU = msg?.id === u.id ? msg : null;

            return (
              <div
                key={u.id}
                style={{ background: "var(--card-bg)", border: `1px solid ${u.bloqueado ? "rgba(248,113,113,0.3)" : "var(--border)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" }}
              >
                {/* Row principal */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
                  onClick={() => setExpandido(aberto ? null : u.id)}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.bloqueado ? "rgba(248,113,113,0.15)" : "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: u.bloqueado ? "#f87171" : "var(--gold)" }}>
                    {(u.nome ?? u.email)[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {u.nome ?? "—"}
                      </span>
                      {u.bloqueado ? (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(248,113,113,0.15)", color: "#f87171", letterSpacing: "0.05em" }}>BLOQUEADA</span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(134,239,172,0.12)", color: "#86efac", letterSpacing: "0.05em" }}>ATIVA</span>
                      )}
                      {u.acesso && acessoCfg[u.acesso] && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(201,168,76,0.1)", color: acessoCfg[u.acesso].cor, letterSpacing: "0.05em" }}>
                          {acessoCfg[u.acesso].label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </p>
                  </div>

                  {/* Último acesso */}
                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 11 }}>
                      <Clock size={11} />
                      {fmtDataHora(u.ultimo_acesso)}
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(201,168,76,0.5)" }}>
                      desde {fmtData(u.criado_em)}
                    </span>
                  </div>

                  <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expandido */}
                {aberto && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px" }}>
                    {/* Info detalhada */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>E-mail</p>
                        <p style={{ fontSize: 12, color: "var(--text)", margin: 0, wordBreak: "break-all" }}>{u.email}</p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Tipo de acesso</p>
                        <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>
                          {u.acesso ? (acessoCfg[u.acesso]?.label ?? u.acesso) : "Sem acesso definido"}
                        </p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Último acesso</p>
                        <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>
                          {u.ultimo_acesso
                            ? new Date(u.ultimo_acesso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Nunca acessou"}
                        </p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Cadastrada em</p>
                        <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>{fmtData(u.criado_em)}</p>
                      </div>
                    </div>

                    {/* Alterar tipo de acesso */}
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Alterar tipo de acesso</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(["mentoria", "livro", "ambos"] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() => executarAcao(u.id, "atualizar_acesso", { acesso: a })}
                            disabled={executando || u.acesso === a}
                            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: u.acesso === a ? "default" : "pointer", border: "1px solid", transition: "all 0.15s",
                              background: u.acesso === a ? (acessoCfg[a]?.cor ?? "var(--gold)") : "transparent",
                              color: u.acesso === a ? "#000" : "var(--text-muted)",
                              borderColor: u.acesso === a ? (acessoCfg[a]?.cor ?? "var(--gold)") : "var(--border)",
                              opacity: executando ? 0.6 : 1,
                            }}
                          >
                            {u.acesso === a && <CheckCircle2 size={11} style={{ display: "inline", marginRight: 4 }} />}
                            {acessoCfg[a].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {u.bloqueado ? (
                        <button
                          onClick={() => executarAcao(u.id, "desbloquear")}
                          disabled={executando}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(134,239,172,0.4)", background: "rgba(134,239,172,0.08)", color: "#86efac", opacity: executando ? 0.6 : 1 }}
                        >
                          {executando && acao?.tipo === "desbloquear" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Shield size={13} />}
                          Liberar acesso
                        </button>
                      ) : (
                        <button
                          onClick={() => executarAcao(u.id, "bloquear")}
                          disabled={executando}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.08)", color: "#f87171", opacity: executando ? 0.6 : 1 }}
                        >
                          {executando && acao?.tipo === "bloquear" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <ShieldOff size={13} />}
                          Bloquear acesso
                        </button>
                      )}

                      <button
                        onClick={() => executarAcao(u.id, "resetar_senha")}
                        disabled={executando}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", opacity: executando ? 0.6 : 1 }}
                      >
                        {executando && acao?.tipo === "resetar_senha" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={13} />}
                        Enviar reset de senha
                      </button>

                      <a
                        href={`mailto:${u.email}`}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", textDecoration: "none" }}
                      >
                        <Mail size={13} />
                        Enviar e-mail
                      </a>
                    </div>

                    {/* Feedback */}
                    {msgU && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: msgU.ok ? "#86efac" : "#f87171" }}>
                        {msgU.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {msgU.texto}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
