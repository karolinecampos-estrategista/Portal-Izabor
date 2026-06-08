"use client";

import { useState, useEffect } from "react";
import { Heart, CheckCircle2, X, Clock, Pencil, Trash2, Loader2, Send, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type StatusDepoimento = "pendente" | "aprovado" | "rejeitado";

interface MentoradaInfo {
  id: string;
  nome: string;
  email: string;
  acesso: string;
  cor: string | null;
}

interface Depoimento {
  id: string;
  mentorada_id: string | null;
  mentorada: MentoradaInfo | null;
  nome: string;
  programa: string | null;
  conteudo: string;
  conteudo_editado: string | null;
  tipo: string;
  status: StatusDepoimento;
  criado_em: string;
  aprovado_em: string | null;
}

function formatData(iso: string) {
  const d = new Date(iso);
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_CFG = {
  pendente:  { label: "Pendente",  cor: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  aprovado:  { label: "Aprovado",  cor: "#86efac", bg: "rgba(134,239,172,0.1)" },
  rejeitado: { label: "Rejeitado", cor: "#fca5a5", bg: "rgba(252,165,165,0.1)" },
};

const ACESSO_LABEL: Record<string, string> = {
  mentoria: "Mentoria Individual",
  livro: "Livro",
  ambos: "Mentoria + Livro",
};

export default function DepoimentosAdmin() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<StatusDepoimento | "todos">("pendente");
  const [editando, setEditando] = useState<Depoimento | null>(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }
      setToken(session.access_token);

      const res = await fetch("/api/depoimentos", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-admin": "true",
        },
      });
      if (res.ok) setDepoimentos(await res.json());
      setCarregando(false);
    });
  }, []);

  async function mudarStatus(id: string, status: StatusDepoimento, textoEditadoLocal?: string) {
    if (!token) return;
    setSalvando(true);
    const body: Record<string, unknown> = { id, status };
    if (textoEditadoLocal !== undefined) body.conteudo_editado = textoEditadoLocal || null;

    const res = await fetch("/api/depoimentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const atualizado = await res.json();
      setDepoimentos(prev => prev.map(d => d.id === id ? { ...atualizado, mentorada: d.mentorada } : d));
    }
    setEditando(null);
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!token || !confirm("Remover este depoimento?")) return;
    await fetch(`/api/depoimentos?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDepoimentos(prev => prev.filter(d => d.id !== id));
  }

  const filtrados = filtro === "todos" ? depoimentos : depoimentos.filter(d => d.status === filtro);
  const pendentesCount = depoimentos.filter(d => d.status === "pendente").length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Heart size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Moderação</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Depoimentos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Revise, refine e aprove os depoimentos antes de publicar para o grupo.
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["pendente","aprovado","rejeitado","todos"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: filtro === f ? "1px solid var(--gold)" : "1px solid var(--border)",
              background: filtro === f ? "var(--gold-light)" : "transparent",
              color: filtro === f ? "var(--gold)" : "var(--text-muted)" }}>
            {f === "todos" ? "Todos" : STATUS_CFG[f].label}
            {f === "pendente" && pendentesCount > 0 && (
              <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 999, background: "rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: 10 }}>
                {pendentesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {carregando ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", height: 160, justifyContent: "center" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          <Heart size={28} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>Nenhum depoimento {filtro !== "todos" ? STATUS_CFG[filtro as StatusDepoimento].label.toLowerCase() : ""} ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtrados.map(dep => (
            <div key={dep.id} className="card" style={{ padding: "20px 22px", border: `1px solid ${STATUS_CFG[dep.status].cor}30` }}>

              {/* Cabeçalho: status + data */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {/* Avatar da aluna */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: dep.mentorada?.cor ? dep.mentorada.cor + "22" : "rgba(201,168,76,0.12)",
                    border: `1.5px solid ${dep.mentorada?.cor ?? "var(--gold-border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700,
                    color: dep.mentorada?.cor ?? "var(--gold)",
                  }}>
                    {dep.nome ? dep.nome.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>{dep.nome}</p>
                    {dep.mentorada && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 1px" }}>
                        {ACESSO_LABEL[dep.mentorada.acesso] ?? dep.mentorada.acesso} · {dep.mentorada.email}
                      </p>
                    )}
                    {dep.programa && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{dep.programa}</p>}
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>Enviado em {formatData(dep.criado_em)}</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: STATUS_CFG[dep.status].cor, background: STATUS_CFG[dep.status].bg }}>
                    {dep.status === "pendente" ? <Clock size={10} /> : dep.status === "aprovado" ? <CheckCircle2 size={10} /> : <X size={10} />}
                    {STATUS_CFG[dep.status].label}
                  </span>
                  {dep.aprovado_em && (
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Aprovado em {formatData(dep.aprovado_em)}</span>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              {editando?.id === dep.id ? (
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Texto editado (aparecerá no lugar do original):</p>
                  <textarea
                    value={textoEditado}
                    onChange={e => setTextoEditado(e.target.value)}
                    rows={5}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, resize: "vertical", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    <button className="btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
                    <button
                      onClick={() => mudarStatus(dep.id, "aprovado", textoEditado)}
                      disabled={salvando}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#86efac20", border: "1px solid #86efac40", color: "#86efac", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Send size={12} /> Aprovar com edição
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {dep.conteudo_editado && (
                    <p style={{ fontSize: 11, color: "var(--gold)", marginBottom: 4, fontWeight: 600 }}>Versão editada:</p>
                  )}
                  <p style={{ fontSize: 13, color: dep.conteudo_editado ? "var(--text)" : "var(--text-soft)", lineHeight: 1.7, margin: "0 0 14px", fontStyle: dep.conteudo_editado ? "normal" : "italic" }}>
                    &ldquo;{dep.conteudo_editado ?? dep.conteudo}&rdquo;
                  </p>
                  {dep.conteudo_editado && (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>Original: &ldquo;{dep.conteudo}&rdquo;</p>
                  )}

                  {/* Ações */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {dep.status !== "aprovado" && (
                      <button
                        onClick={() => mudarStatus(dep.id, "aprovado")}
                        disabled={salvando}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#86efac20", border: "1px solid #86efac40", color: "#86efac", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        <CheckCircle2 size={12} /> Aprovar
                      </button>
                    )}
                    <button
                      onClick={() => { setEditando(dep); setTextoEditado(dep.conteudo_editado ?? dep.conteudo); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Pencil size={12} /> Refinar e aprovar
                    </button>
                    {dep.status !== "rejeitado" && (
                      <button
                        onClick={() => mudarStatus(dep.id, "rejeitado")}
                        disabled={salvando}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.2)", color: "#fca5a5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        <X size={12} /> Rejeitar
                      </button>
                    )}
                    {dep.status === "aprovado" && (
                      <button
                        onClick={() => mudarStatus(dep.id, "pendente")}
                        disabled={salvando}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        <Clock size={12} /> Despublicar
                      </button>
                    )}
                    <button
                      onClick={() => excluir(dep.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", marginLeft: "auto" }}
                    >
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
