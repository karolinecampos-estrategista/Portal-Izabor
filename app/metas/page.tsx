"use client";

import { useState } from "react";
import { Target, Plus, CheckCircle2, Circle, TrendingUp, Star, Flame, ChevronDown, X, Pencil, Trash2 } from "lucide-react";

type MetaStatus = "em_andamento" | "concluida" | "pausada";
type MetaArea = "Negocio" | "Conteudo" | "Espiritualidade" | "Pessoal" | "Financeiro";

interface Subtarefa { texto: string; feita: boolean }
interface Meta {
  id: number;
  titulo: string;
  descricao: string;
  area: MetaArea;
  prazo: string;
  status: MetaStatus;
  subtarefas: Subtarefa[];
}

const METAS_INICIAL: Meta[] = [
  {
    id: 1,
    titulo: "Lancar Imersao BW Junho",
    descricao: "Abrir inscricoes, confirmar 12 alunas e preparar todo o material da imersao de junho.",
    area: "Negocio",
    prazo: "01 Jun 2026",
    status: "em_andamento",
    subtarefas: [
      { texto: "Criar pagina de vendas da imersao", feita: true },
      { texto: "Gravar video de divulgacao", feita: true },
      { texto: "Confirmar 12 alunas", feita: true },
      { texto: "Preparar material fisico", feita: false },
      { texto: "Enviar guia de boas-vindas", feita: false },
    ],
  },
  {
    id: 2,
    titulo: "Consistencia no YouTube — 4 videos/mes",
    descricao: "Manter cadencia de publicacao no YouTube com pelo menos 4 videos mensais.",
    area: "Conteudo",
    prazo: "31 Mai 2026",
    status: "em_andamento",
    subtarefas: [
      { texto: "Ep. 1 — publicado", feita: true },
      { texto: "Ep. 2 — publicado", feita: true },
      { texto: "Ep. 3 — gravar", feita: false },
      { texto: "Ep. 4 — roteiro pronto", feita: false },
    ],
  },
  {
    id: 3,
    titulo: "Devocional diario por 30 dias",
    descricao: "Manter pratica de devocional escrito todos os dias por 30 dias consecutivos — texto + versiculo.",
    area: "Espiritualidade",
    prazo: "30 Jun 2026",
    status: "em_andamento",
    subtarefas: [
      { texto: "Semana 1 completa (7 dias)", feita: true },
      { texto: "Semana 2 completa (7 dias)", feita: false },
      { texto: "Semana 3 completa (7 dias)", feita: false },
      { texto: "Semana 4 completa (7 dias)", feita: false },
      { texto: "Dias extras para completar 30", feita: false },
    ],
  },
  {
    id: 4,
    titulo: "Atingir meta de faturamento mensal",
    descricao: "Atingir meta mensal combinando mentorias individuais, Club BW e Imersao.",
    area: "Financeiro",
    prazo: "31 Mai 2026",
    status: "em_andamento",
    subtarefas: [
      { texto: "Mentorias individuais — fechar contratos", feita: true },
      { texto: "Club BW — renovacoes do mes", feita: true },
      { texto: "Imersao BW — inscricoes abertas", feita: true },
      { texto: "Upsell e novas captacoes", feita: false },
    ],
  },
  {
    id: 5,
    titulo: "Lancar Club BW Trimestral",
    descricao: "Criar versao trimestral do Club BW com novo formato e materiais exclusivos.",
    area: "Negocio",
    prazo: "01 Jul 2026",
    status: "em_andamento",
    subtarefas: [
      { texto: "Definir estrutura e entregas", feita: true },
      { texto: "Criar pagina de vendas", feita: false },
      { texto: "Produzir materiais do mes 1", feita: false },
      { texto: "Abrir inscricoes para turma atual", feita: false },
    ],
  },
  {
    id: 6,
    titulo: "Retiro espiritual pessoal",
    descricao: "Reservar um final de semana so para silencio, oracao e renovacao espiritual.",
    area: "Pessoal",
    prazo: "30 Jun 2026",
    status: "pausada",
    subtarefas: [
      { texto: "Escolher local e data", feita: false },
      { texto: "Reservar acomodacao", feita: false },
      { texto: "Preparar guia de leituras", feita: false },
    ],
  },
];

const areaConfig: Record<MetaArea, { color: string; bg: string; emoji: string }> = {
  Negocio:         { color: "#C9A84C", bg: "rgba(201,168,76,0.12)",   emoji: "👑" },
  Conteudo:        { color: "#93c5fd", bg: "rgba(59,130,246,0.12)",   emoji: "🎬" },
  Espiritualidade: { color: "#a78bfa", bg: "rgba(139,92,246,0.12)",   emoji: "✝️" },
  Pessoal:         { color: "#f9a8d4", bg: "rgba(236,72,153,0.12)",   emoji: "🌸" },
  Financeiro:      { color: "#86efac", bg: "rgba(134,239,172,0.12)",  emoji: "💰" },
};

const statusConfig: Record<MetaStatus, { label: string; color: string }> = {
  em_andamento: { label: "Em andamento", color: "#C9A84C" },
  concluida:    { label: "Concluida",    color: "#86efac" },
  pausada:      { label: "Pausada",      color: "var(--text-muted)" },
};

const AREAS: MetaArea[] = ["Negocio", "Conteudo", "Espiritualidade", "Financeiro", "Pessoal"];

export default function Metas() {
  const [metas, setMetas] = useState<Meta[]>(METAS_INICIAL);
  const [expandida, setExpandida] = useState<number | null>(1);
  const [filtroArea, setFiltroArea] = useState("Todas");
  const [novaAberta, setNovaAberta] = useState(false);
  const [editando, setEditando] = useState<Meta | null>(null);

  // Form state
  const [form, setForm] = useState({ titulo: "", descricao: "", area: "Negocio" as MetaArea, prazo: "", subtarefas: "" });

  const areas = ["Todas", ...AREAS];
  const filtradas = metas.filter((m) => filtroArea === "Todas" || m.area === filtroArea);
  const totalProgresso = metas.length
    ? Math.round(metas.reduce((acc, m) => {
        const feitas = m.subtarefas.filter((s) => s.feita).length;
        return acc + (m.subtarefas.length ? (feitas / m.subtarefas.length) * 100 : 0);
      }, 0) / metas.length)
    : 0;

  function toggleSubtarefa(metaId: number, idx: number) {
    setMetas((prev) =>
      prev.map((m) =>
        m.id === metaId
          ? { ...m, subtarefas: m.subtarefas.map((s, i) => i === idx ? { ...s, feita: !s.feita } : s) }
          : m
      )
    );
  }

  function salvarNova() {
    const subs = form.subtarefas.split("\n").filter((s) => s.trim()).map((s) => ({ texto: s.trim(), feita: false }));
    const nova: Meta = {
      id: Date.now(),
      titulo: form.titulo,
      descricao: form.descricao,
      area: form.area,
      prazo: form.prazo,
      status: "em_andamento",
      subtarefas: subs,
    };
    setMetas((prev) => [nova, ...prev]);
    setNovaAberta(false);
    setForm({ titulo: "", descricao: "", area: "Negocio", prazo: "", subtarefas: "" });
  }

  function salvarEdicao() {
    if (!editando) return;
    setMetas((prev) => prev.map((m) => m.id === editando.id ? editando : m));
    setEditando(null);
  }

  function deletarMeta(id: number) {
    setMetas((prev) => prev.filter((m) => m.id !== id));
    if (expandida === id) setExpandida(null);
  }

  function calcProg(m: Meta) {
    if (!m.subtarefas.length) return 0;
    return Math.round((m.subtarefas.filter((s) => s.feita).length / m.subtarefas.length) * 100);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Target size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Metas</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Suas Metas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>O que voce esta construindo — com proposito e fe.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setNovaAberta(true)}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {/* Resumo */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 20, background: "linear-gradient(135deg,#111 0%,#130f04 100%)", border: "1px solid var(--gold-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px" }}>Progresso Geral</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)", margin: "0 0 6px" }}>{totalProgresso}%</p>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${totalProgresso}%` }} />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Em Andamento</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0 }}>{metas.filter((m) => m.status === "em_andamento").length}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Concluidas</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#86efac", margin: 0 }}>{metas.filter((m) => m.status === "concluida").length}</p>
          </div>
        </div>
      </div>

      {/* Filtro area */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {areas.map((a) => {
          const cfg = areaConfig[a as MetaArea];
          return (
            <button key={a} onClick={() => setFiltroArea(a)} style={{
              padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer",
              border: filtroArea === a ? `1px solid ${cfg?.color ?? "var(--gold-border)"}` : "1px solid var(--border)",
              background: filtroArea === a ? (cfg?.bg ?? "var(--gold-light)") : "transparent",
              color: filtroArea === a ? (cfg?.color ?? "var(--gold)") : "var(--text-muted)",
              transition: "all 0.15s",
            }}>
              {cfg?.emoji} {a}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtradas.map((meta) => {
          const area = areaConfig[meta.area];
          const status = statusConfig[meta.status];
          const aberta = expandida === meta.id;
          const feitas = meta.subtarefas.filter((s) => s.feita).length;
          const prog = calcProg(meta);

          return (
            <div key={meta.id} className="card" style={{ overflow: "hidden", border: aberta ? "1px solid var(--gold-border)" : "1px solid var(--border)" }}>
              {/* Header */}
              <div className="flex items-center gap-3" style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => setExpandida(aberta ? null : meta.id)}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: area.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {area.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{meta.titulo}</p>
                    <span style={{ fontSize: 10, color: status.color, padding: "1px 7px", borderRadius: 999, background: status.color + "15", flexShrink: 0 }}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 11, color: area.color }}>{meta.area}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>prazo: {meta.prazo}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{feitas}/{meta.subtarefas.length} etapas</span>
                  </div>
                </div>
                <div style={{ minWidth: 72, textAlign: "right" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: area.color, margin: "0 0 4px" }}>{prog}%</p>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${prog}%`, background: area.color }} /></div>
                </div>
                <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0, transition: "transform 0.2s", transform: aberta ? "rotate(180deg)" : "rotate(0)" }} />
              </div>

              {/* Expandido */}
              {aberta && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, margin: "14px 0 16px" }}>{meta.descricao}</p>

                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Etapas — clique para marcar</p>

                  <div className="flex flex-col gap-2" style={{ marginBottom: 14 }}>
                    {meta.subtarefas.map((sub, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3"
                        style={{ cursor: "pointer", padding: "6px 8px", borderRadius: 6, transition: "background 0.15s" }}
                        onClick={(e) => { e.stopPropagation(); toggleSubtarefa(meta.id, i); }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {sub.feita
                          ? <CheckCircle2 size={16} style={{ color: "#86efac", flexShrink: 0 }} />
                          : <Circle size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                        <span style={{ fontSize: 13, color: sub.feita ? "var(--text-muted)" : "var(--text-soft)", textDecoration: sub.feita ? "line-through" : "none" }}>
                          {sub.texto}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Acoes */}
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost flex items-center gap-1"
                      style={{ fontSize: 12, padding: "6px 12px" }}
                      onClick={(e) => { e.stopPropagation(); setEditando({ ...meta }); }}
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletarMeta(meta.id); }}
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#fca5a5", transition: "all 0.15s" }}
                    >
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal nova meta */}
      {novaAberta && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setNovaAberta(false)}>
          <div className="card" style={{ maxWidth: 500, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nova Meta</h2>
              <button onClick={() => setNovaAberta(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Titulo da meta..." />
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 70, resize: "vertical" }} placeholder="Descricao..." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as MetaArea })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
                <input value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} style={{ padding: "10px 12px", fontSize: 13 }} placeholder="Prazo (ex: 30 Jun 2026)" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Etapas — uma por linha</p>
                <textarea value={form.subtarefas} onChange={(e) => setForm({ ...form, subtarefas: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 12, minHeight: 90, resize: "vertical" }} placeholder={"Criar pagina de vendas\nGravar video\nAbrir inscricoes"} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setNovaAberta(false)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarNova} disabled={!form.titulo}>Salvar Meta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setEditando(null)}>
          <div className="card" style={{ maxWidth: 500, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Editar Meta</h2>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Titulo..." />
              <textarea value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 70, resize: "vertical" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <select value={editando.area} onChange={(e) => setEditando({ ...editando, area: e.target.value as MetaArea })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
                <input value={editando.prazo} onChange={(e) => setEditando({ ...editando, prazo: e.target.value })} style={{ padding: "10px 12px", fontSize: 13 }} placeholder="Prazo" />
                <select value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as MetaStatus })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluida</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Etapas</p>
                {editando.subtarefas.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                    <button onClick={() => setEditando({ ...editando, subtarefas: editando.subtarefas.map((s, j) => j === i ? { ...s, feita: !s.feita } : s) })} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                      {sub.feita ? <CheckCircle2 size={15} style={{ color: "#86efac" }} /> : <Circle size={15} style={{ color: "var(--text-muted)" }} />}
                    </button>
                    <input value={sub.texto} onChange={(e) => setEditando({ ...editando, subtarefas: editando.subtarefas.map((s, j) => j === i ? { ...s, texto: e.target.value } : s) })} style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} />
                    <button onClick={() => setEditando({ ...editando, subtarefas: editando.subtarefas.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer" }}><X size={13} /></button>
                  </div>
                ))}
                <button onClick={() => setEditando({ ...editando, subtarefas: [...editando.subtarefas, { texto: "", feita: false }] })} style={{ fontSize: 12, color: "var(--gold)", background: "none", border: "1px dashed var(--gold-border)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", marginTop: 4 }}>
                  + Adicionar etapa
                </button>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarEdicao}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
