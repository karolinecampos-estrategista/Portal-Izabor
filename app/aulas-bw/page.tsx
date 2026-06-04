"use client";

import { useState, useEffect } from "react";
import {
  PlaySquare, Plus, X, Crown, Eye, EyeOff,
  CheckCircle2, Clock, Layers, Send, Pencil, Trash2, Loader2,
} from "lucide-react";

type StatusAula = "rascunho" | "publicada";

interface Aula {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  modulo: string;
  ordem: number;
  status: StatusAula;
  link: string;
  thumbnail: string;
  criadaEm: string;
}

const MODULOS = [
  "Módulo 1 — Identidade e Propósito",
  "Módulo 2 — Mentalidade da Mulher INCOMUM",
  "Módulo 3 — Liderança Feminina",
  "Módulo 4 — Relacionamentos e Família",
  "Módulo 5 — Negócios com Fé",
  "Bônus",
];

const THUMBNAILS = ["✝️","🌟","⛓️","👑","🧠","💜","🛡️","🌿","🤝","🏆","🔥","💡","🌸","⚡","📖"];

const FORM_VAZIO: Omit<Aula, "id" | "criadaEm"> = {
  titulo: "", descricao: "", duracao: "", modulo: MODULOS[0],
  ordem: 1, status: "rascunho", link: "", thumbnail: "✝️",
};

function mapAula(d: Record<string, unknown>): Aula {
  return {
    id: d.id as string,
    titulo: d.titulo as string,
    descricao: (d.descricao ?? "") as string,
    duracao: (d.duracao ?? "") as string,
    modulo: (d.modulo ?? "") as string,
    ordem: (d.ordem ?? 1) as number,
    status: (d.status ?? "rascunho") as StatusAula,
    link: (d.link ?? "") as string,
    thumbnail: (d.thumbnail ?? "✝️") as string,
    criadaEm: d.criado_em ? new Date(d.criado_em as string).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "",
  };
}

export default function AulasBWAdmin() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Aula, "id" | "criadaEm">>(FORM_VAZIO);
  const [moduloFiltro, setModuloFiltro] = useState<string>("todos");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Aula, "id" | "criadaEm">>(FORM_VAZIO);

  useEffect(() => {
    fetch("/api/aulas")
      .then((r) => r.json())
      .then((data) => {
        setAulas(Array.isArray(data) ? data.map(mapAula) : []);
        setCarregando(false);
      });
  }, []);

  async function salvar() {
    if (!form.titulo.trim()) return;
    const res = await fetch("/api/aulas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const raw = await res.json();
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setAulas((prev) => [...prev, mapAula(raw)]);
    setForm(FORM_VAZIO);
    setShowForm(false);
  }

  async function toggleStatus(id: string) {
    const aula = aulas.find((a) => a.id === id);
    if (!aula) return;
    const novoStatus: StatusAula = aula.status === "publicada" ? "rascunho" : "publicada";
    setAulas((prev) => prev.map((a) => a.id === id ? { ...a, status: novoStatus } : a));
    await fetch("/api/aulas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: novoStatus }),
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta aula?")) return;
    const res = await fetch(`/api/aulas?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setAulas((prev) => prev.filter((a) => a.id !== id));
    setEditandoId(null);
  }

  function abrirEdicao(a: Aula) {
    setEditandoId(a.id);
    setEditForm({ titulo: a.titulo, descricao: a.descricao, duracao: a.duracao, modulo: a.modulo, ordem: a.ordem, status: a.status, link: a.link, thumbnail: a.thumbnail });
  }

  async function salvarEdicao(id: string) {
    const res = await fetch("/api/aulas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    const raw = await res.json();
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setAulas((prev) => prev.map((a) => a.id === id ? mapAula(raw) : a));
    setEditandoId(null);
  }

  const publicadas = aulas.filter((a) => a.status === "publicada").length;
  const rascunhos = aulas.filter((a) => a.status === "rascunho").length;

  const modulos = [...new Set(aulas.map((a) => a.modulo))];
  const aulasFiltradas = moduloFiltro === "todos" ? aulas : aulas.filter((a) => a.modulo === moduloFiltro);
  const porModulo = MODULOS.filter((m) => aulasFiltradas.some((a) => a.modulo === m));

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando aulas...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <PlaySquare size={20} style={{ color: "var(--gold)" }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Aulas BW</h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Gerencie e publique aulas para as mentoradas — elas aparecem no portal de cada uma.
          </p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <Plus size={15} /> Nova Aula
        </button>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Total de aulas", valor: aulas.length, cor: "var(--gold)", icon: Layers },
          { label: "Publicadas", valor: publicadas, cor: "#86efac", icon: CheckCircle2 },
          { label: "Rascunhos", valor: rascunhos, cor: "#fbbf24", icon: Clock },
        ].map(({ label, valor, cor, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon size={14} style={{ color: cor }} />
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: cor, margin: 0, lineHeight: 1 }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Formulário nova aula */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--gold-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>Nova Aula</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título *</label>
              <input className="input" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} placeholder="Título da aula..." />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label>
              <textarea className="input" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} style={{ resize: "vertical" }} placeholder="O que as alunas vão aprender nessa aula?" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Módulo</label>
                <select className="input" value={form.modulo} onChange={(e) => setForm((p) => ({ ...p, modulo: e.target.value }))}>
                  {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label>
                <input className="input" value={form.duracao} onChange={(e) => setForm((p) => ({ ...p, duracao: e.target.value }))} placeholder="Ex: 35 min" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ordem no módulo</label>
                <input className="input" type="number" value={form.ordem} onChange={(e) => setForm((p) => ({ ...p, ordem: Number(e.target.value) }))} min={1} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link do vídeo (YouTube / Vimeo / Drive)</label>
              <input className="input" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="https://..." />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Thumbnail (emoji)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THUMBNAILS.map((t) => (
                  <button key={t} onClick={() => setForm((p) => ({ ...p, thumbnail: t }))} style={{ width: 36, height: 36, borderRadius: 8, fontSize: 20, cursor: "pointer", border: form.thumbnail === t ? "2px solid var(--gold)" : "1px solid var(--border)", background: form.thumbnail === t ? "var(--gold-light)" : "var(--bg-input)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["rascunho", "publicada"] as const).map((s) => (
                  <button key={s} onClick={() => setForm((p) => ({ ...p, status: s }))} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer", border: form.status === s ? (s === "publicada" ? "1px solid rgba(134,239,172,0.4)" : "1px solid rgba(251,191,36,0.4)") : "1px solid var(--border)", background: form.status === s ? (s === "publicada" ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)") : "transparent", color: form.status === s ? (s === "publicada" ? "#86efac" : "#fbbf24") : "var(--text-muted)", fontWeight: form.status === s ? 700 : 400 }}>
                    {s === "publicada" ? "Publicar agora" : "Salvar como rascunho"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setForm(FORM_VAZIO); }}>Cancelar</button>
            <button className="btn-gold" onClick={salvar} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <Send size={14} /> {form.status === "publicada" ? "Publicar para as alunas" : "Salvar rascunho"}
            </button>
          </div>
        </div>
      )}

      {aulas.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <PlaySquare size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma aula cadastrada ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Nova Aula&quot; para começar.</p>
        </div>
      )}

      {/* Filtro de módulo */}
      {aulas.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setModuloFiltro("todos")} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", border: moduloFiltro === "todos" ? "1px solid var(--gold)" : "1px solid var(--border)", background: moduloFiltro === "todos" ? "var(--gold-light)" : "transparent", color: moduloFiltro === "todos" ? "var(--gold)" : "var(--text-muted)", fontWeight: moduloFiltro === "todos" ? 700 : 400 }}>
            Todos os módulos
          </button>
          {modulos.map((m) => (
            <button key={m} onClick={() => setModuloFiltro(m)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", border: moduloFiltro === m ? "1px solid var(--gold)" : "1px solid var(--border)", background: moduloFiltro === m ? "var(--gold-light)" : "transparent", color: moduloFiltro === m ? "var(--gold)" : "var(--text-muted)", fontWeight: moduloFiltro === m ? 700 : 400, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.split(" — ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* Aulas por módulo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {porModulo.map((modulo) => {
          const aulasDoModulo = aulasFiltradas.filter((a) => a.modulo === modulo).sort((a, b) => a.ordem - b.ordem);
          return (
            <div key={modulo}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Crown size={14} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{modulo}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{aulasDoModulo.length} aula{aulasDoModulo.length !== 1 ? "s" : ""}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {aulasDoModulo.map((a) => (
                  <div key={a.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderLeft: `3px solid ${a.status === "publicada" ? "#86efac" : "#fbbf24"}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {a.thumbnail}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.titulo}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: a.status === "publicada" ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)", color: a.status === "publicada" ? "#86efac" : "#fbbf24" }}>
                          {a.status === "publicada" ? "✓ Publicada" : "Rascunho"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Aula {a.ordem} · {a.duracao}</span>
                        {a.descricao && <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{a.descricao}</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => abrirEdicao(a)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-muted)" }}>
                        <Pencil size={11} /> Editar
                      </button>
                      <button onClick={() => toggleStatus(a.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: a.status === "publicada" ? "1px solid rgba(134,239,172,0.3)" : "1px solid rgba(251,191,36,0.3)", background: a.status === "publicada" ? "rgba(134,239,172,0.08)" : "rgba(251,191,36,0.08)", color: a.status === "publicada" ? "#86efac" : "#fbbf24" }}>
                        {a.status === "publicada" ? <><EyeOff size={11} /> Despublicar</> : <><Eye size={11} /> Publicar</>}
                      </button>
                      <button onClick={() => excluir(a.id)} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.2)", background: "transparent", color: "#f87171", cursor: "pointer" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Painel de edição expandido */}
                    {editandoId === a.id && (
                      <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título</label>
                          <input className="input" value={editForm.titulo} onChange={(e) => setEditForm((p) => ({ ...p, titulo: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label>
                          <textarea className="input" value={editForm.descricao} onChange={(e) => setEditForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} style={{ resize: "vertical" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Módulo</label>
                            <select className="input" value={editForm.modulo} onChange={(e) => setEditForm((p) => ({ ...p, modulo: e.target.value }))}>
                              {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label>
                            <input className="input" value={editForm.duracao} onChange={(e) => setEditForm((p) => ({ ...p, duracao: e.target.value }))} placeholder="Ex: 35 min" />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ordem</label>
                            <input className="input" type="number" value={editForm.ordem} onChange={(e) => setEditForm((p) => ({ ...p, ordem: Number(e.target.value) }))} min={1} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link do vídeo</label>
                          <input className="input" value={editForm.link} onChange={(e) => setEditForm((p) => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Thumbnail</label>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {THUMBNAILS.map((t) => (
                              <button key={t} onClick={() => setEditForm((p) => ({ ...p, thumbnail: t }))} style={{ width: 32, height: 32, borderRadius: 6, fontSize: 18, cursor: "pointer", border: editForm.thumbnail === t ? "2px solid var(--gold)" : "1px solid var(--border)", background: editForm.thumbnail === t ? "var(--gold-light)" : "var(--bg-input)" }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Status</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {(["rascunho", "publicada"] as const).map((s) => (
                              <button key={s} onClick={() => setEditForm((p) => ({ ...p, status: s }))} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, cursor: "pointer", border: editForm.status === s ? (s === "publicada" ? "1px solid rgba(134,239,172,0.4)" : "1px solid rgba(251,191,36,0.4)") : "1px solid var(--border)", background: editForm.status === s ? (s === "publicada" ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)") : "transparent", color: editForm.status === s ? (s === "publicada" ? "#86efac" : "#fbbf24") : "var(--text-muted)", fontWeight: editForm.status === s ? 700 : 400 }}>
                                {s === "publicada" ? "Publicada" : "Rascunho"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditandoId(null)}>Cancelar</button>
                          <button className="btn-gold" style={{ fontSize: 12 }} onClick={() => salvarEdicao(a.id)}>Salvar alterações</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div style={{ marginTop: 28, padding: "16px 20px", background: "rgba(201,168,76,0.06)", borderRadius: 12, border: "1px solid var(--gold-border)" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>
          <strong style={{ color: "var(--gold)" }}>Como funciona:</strong> Aulas <strong style={{ color: "#86efac" }}>Publicadas</strong> ficam visíveis no portal de todas as mentoradas. Rascunhos ficam apenas aqui.
        </p>
      </div>
    </div>
  );
}
