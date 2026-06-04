"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, Clock, Tag, CalendarPlus, CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type Prioridade = "Alta" | "Media" | "Baixa";
type Status = "Pendente" | "Em andamento" | "Concluida";
type Pilar = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia" | "Geral";

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  pilar: Pilar;
  prioridade: Prioridade;
  status: Status;
  data: string;
  hora: string;
  prazo?: string;
  naAgenda: boolean;
}

const TAREFAS_INICIAL: Tarefa[] = [
  { id: 1, titulo: "Preparar material da Imersao BW — modulo de fe", descricao: "Revisar slides e exercicios praticos para o modulo de identidade espiritual", pilar: "Fe", prioridade: "Alta", status: "Em andamento", data: "24 Mai 2026", hora: "09:00", prazo: "2026-05-28", naAgenda: true },
  { id: 2, titulo: "Gravar devocional semanal para YouTube", descricao: "Tema: Mulher que ora antes de reagir — Proverbios 31", pilar: "Fe", prioridade: "Alta", status: "Pendente", data: "24 Mai 2026", hora: "10:30", prazo: "2026-05-26", naAgenda: false },
  { id: 3, titulo: "Responder mensagens das mentorandas no grupo", descricao: "Verificar grupo do Club BW e dar feedbacks pendentes", pilar: "Lideranca", prioridade: "Media", status: "Pendente", data: "23 Mai 2026", hora: "14:00", prazo: "", naAgenda: false },
  { id: 4, titulo: "Criar pauta do proximo encontro do Club BW", descricao: "Definir tema, dinamica e leitura base para o mes de junho", pilar: "Mentalidade", prioridade: "Media", status: "Pendente", data: "22 Mai 2026", hora: "11:00", prazo: "2026-05-30", naAgenda: true },
  { id: 5, titulo: "Revisar contrato de mentoria individual", descricao: "Atualizar clausulas de sessoes e entregaveis para novas alunas", pilar: "Geral", prioridade: "Baixa", status: "Concluida", data: "21 Mai 2026", hora: "16:00", prazo: "", naAgenda: false },
];

const pilarCor: Record<Pilar, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia", Geral: "tag-geral",
};

const prioridadeCor: Record<Prioridade, { bg: string; color: string }> = {
  Alta:  { bg: "rgba(252,165,165,0.12)", color: "#fca5a5" },
  Media: { bg: "rgba(253,224,71,0.12)",  color: "#fde047" },
  Baixa: { bg: "rgba(134,239,172,0.12)", color: "#86efac" },
};

const PILARES: Pilar[] = ["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia", "Geral"];

const FORM_VAZIO = {
  titulo: "", descricao: "", pilar: "Geral" as Pilar,
  prioridade: "Media" as Prioridade, prazo: "", naAgenda: false,
};

function dataAtual() {
  const d = new Date();
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}
function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function formatarPrazo(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)]}`;
}
function prazoVencido(iso: string) {
  if (!iso) return false;
  return new Date(iso) < new Date(new Date().toISOString().split("T")[0]);
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_INICIAL);
  const [filtroStatus, setFiltroStatus] = useState<Status | "Todas">("Todas");
  const [filtroPilar, setFiltroPilar] = useState<Pilar | "Todos">("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [expandida, setExpandida] = useState<number | null>(null);

  const filtradas = tarefas.filter((t) => {
    const passaStatus = filtroStatus === "Todas" || t.status === filtroStatus;
    const passaPilar = filtroPilar === "Todos" || t.pilar === filtroPilar;
    return passaStatus && passaPilar;
  });

  const pendentes = tarefas.filter((t) => t.status === "Pendente").length;
  const emAndamento = tarefas.filter((t) => t.status === "Em andamento").length;
  const concluidas = tarefas.filter((t) => t.status === "Concluida").length;
  const naAgendaCount = tarefas.filter((t) => t.naAgenda).length;

  function salvar() {
    if (!form.titulo.trim()) return;
    const nova: Tarefa = {
      id: Date.now(),
      titulo: form.titulo,
      descricao: form.descricao,
      pilar: form.pilar,
      prioridade: form.prioridade,
      status: "Pendente",
      data: dataAtual(),
      hora: horaAtual(),
      prazo: form.prazo,
      naAgenda: form.naAgenda,
    };
    setTarefas((prev) => [nova, ...prev]);
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  function salvarEdicao() {
    if (!editando || !editando.titulo.trim()) return;
    setTarefas((prev) => prev.map((t) => t.id === editando.id ? editando : t));
    setEditando(null);
  }

  function deletar(id: number) {
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }

  function ciclarStatus(id: number) {
    setTarefas((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const ciclo: Status[] = ["Pendente", "Em andamento", "Concluida"];
      const atual = ciclo.indexOf(t.status);
      return { ...t, status: ciclo[(atual + 1) % 3] };
    }));
  }

  function StatusIcon({ status }: { status: Status }) {
    if (status === "Concluida") return <CheckCircle2 size={16} style={{ color: "#86efac" }} />;
    if (status === "Em andamento") return <AlertCircle size={16} style={{ color: "#fde047" }} />;
    return <Circle size={16} style={{ color: "var(--text-muted)" }} />;
  }

  const inputStyle = {
    padding: "8px 12px", fontSize: 13, background: "var(--bg-input)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", width: "100%",
  };

  const labelStyle = { fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" as const };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <CheckSquare size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tarefas</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Gerenciamento de Tarefas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Organize o que precisa ser feito — e inclua na agenda quando necessario.</p>
      </div>

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Pendentes", value: pendentes, color: "var(--text-muted)" },
          { label: "Em Andamento", value: emAndamento, color: "#fde047" },
          { label: "Concluidas", value: concluidas, color: "#86efac" },
          { label: "Na Agenda", value: naAgendaCount, color: "var(--gold)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros + Adicionar */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div className="flex items-center gap-1">
          {(["Todas", "Pendente", "Em andamento", "Concluida"] as const).map((s) => (
            <button key={s} onClick={() => setFiltroStatus(s)} style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer",
              border: filtroStatus === s ? "1px solid var(--gold-border)" : "1px solid var(--border)",
              background: filtroStatus === s ? "var(--gold-light)" : "transparent",
              color: filtroStatus === s ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
            }}>{s}</button>
          ))}
        </div>
        <select value={filtroPilar} onChange={(e) => setFiltroPilar(e.target.value as Pilar | "Todos")} style={{ ...inputStyle, width: "auto", fontSize: 11, padding: "5px 10px" }}>
          <option value="Todos">Todos os pilares</option>
          {PILARES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{filtradas.length} tarefa{filtradas.length !== 1 ? "s" : ""}</span>
        <button className="btn-gold flex items-center gap-2" onClick={() => setMostrarForm(!mostrarForm)} style={{ fontSize: 12 }}>
          <Plus size={13} /> Nova Tarefa
        </button>
      </div>

      {/* Form nova tarefa */}
      {mostrarForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nova Tarefa</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Titulo *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="O que precisa ser feito?" />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Descricao</label>
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Detalhes opcionais..." />
            </div>
            <div>
              <label style={labelStyle}>Pilar</label>
              <select value={form.pilar} onChange={(e) => setForm({ ...form, pilar: e.target.value as Pilar })} style={inputStyle}>
                {PILARES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value as Prioridade })} style={inputStyle}>
                {(["Alta", "Media", "Baixa"] as Prioridade[]).map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prazo (opcional)</label>
              <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} style={inputStyle} />
            </div>
            <div className="flex items-center" style={{ gap: 10, paddingTop: 20 }}>
              <button
                onClick={() => setForm({ ...form, naAgenda: !form.naAgenda })}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8,
                  fontSize: 12, cursor: "pointer", fontWeight: form.naAgenda ? 600 : 400,
                  border: form.naAgenda ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                  background: form.naAgenda ? "var(--gold-light)" : "transparent",
                  color: form.naAgenda ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
                }}
              >
                <CalendarPlus size={13} />
                {form.naAgenda ? "Incluir na Agenda ✓" : "Incluir na Agenda"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-gold flex items-center gap-2" onClick={salvar} disabled={!form.titulo.trim()}>
              <Plus size={13} /> Salvar Tarefa
            </button>
            <button onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de tarefas */}
      {filtradas.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
          Nenhuma tarefa encontrada com esses filtros.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((t) => {
            const prio = prioridadeCor[t.prioridade];
            const vencido = t.prazo && prazoVencido(t.prazo) && t.status !== "Concluida";
            const aberta = expandida === t.id;

            return (
              <div key={t.id} className="card" style={{
                padding: "14px 16px",
                borderLeft: `3px solid ${t.status === "Concluida" ? "#86efac30" : t.prioridade === "Alta" ? "#fca5a530" : "var(--border)"}`,
                opacity: t.status === "Concluida" ? 0.65 : 1,
                transition: "opacity 0.2s",
              }}>
                <div className="flex items-start gap-3">
                  {/* Status toggle */}
                  <button onClick={() => ciclarStatus(t.id)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, paddingTop: 2 }} title="Clique para avancar o status">
                    <StatusIcon status={t.status} />
                  </button>

                  {/* Conteudo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                      <span className={`tag ${pilarCor[t.pilar]}`} style={{ fontSize: 10 }}><Tag size={9} /> {t.pilar}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: prio.bg, color: prio.color, fontWeight: 500 }}>
                        {t.prioridade}
                      </span>
                      {t.naAgenda && (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--gold-light)", color: "var(--gold)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", gap: 4 }}>
                          <CalendarPlus size={9} /> Agenda
                        </span>
                      )}
                      {vencido && (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(252,165,165,0.12)", color: "#fca5a5" }}>
                          Vencida
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 13, fontWeight: 500, color: t.status === "Concluida" ? "var(--text-muted)" : "var(--text)",
                      margin: 0, textDecoration: t.status === "Concluida" ? "line-through" : "none",
                    }}>
                      {t.titulo}
                    </p>

                    {t.descricao && aberta && (
                      <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 6, lineHeight: 1.6 }}>{t.descricao}</p>
                    )}

                    <div className="flex items-center gap-3" style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1"><Clock size={9} /> {t.data} {t.hora}</span>
                      {t.prazo && (
                        <span style={{ color: vencido ? "#fca5a5" : "var(--text-muted)" }}>
                          Prazo: {formatarPrazo(t.prazo)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acoes */}
                  <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                    {t.descricao && (
                      <button onClick={() => setExpandida(aberta ? null : t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}>
                        {aberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    <button onClick={() => setEditando({ ...t })} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", fontSize: 11 }}>
                      Editar
                    </button>
                    <button onClick={() => deletar(t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edicao */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Editar Tarefa</p>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Titulo</label>
                <input value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descricao</label>
                <textarea value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Pilar</label>
                  <select value={editando.pilar} onChange={(e) => setEditando({ ...editando, pilar: e.target.value as Pilar })} style={inputStyle}>
                    {PILARES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Prioridade</label>
                  <select value={editando.prioridade} onChange={(e) => setEditando({ ...editando, prioridade: e.target.value as Prioridade })} style={inputStyle}>
                    {(["Alta", "Media", "Baixa"] as Prioridade[]).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as Status })} style={inputStyle}>
                    {(["Pendente", "Em andamento", "Concluida"] as Status[]).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Prazo</label>
                  <input type="date" value={editando.prazo || ""} onChange={(e) => setEditando({ ...editando, prazo: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <button
                  onClick={() => setEditando({ ...editando, naAgenda: !editando.naAgenda })}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8,
                    fontSize: 12, cursor: "pointer", fontWeight: editando.naAgenda ? 600 : 400,
                    border: editando.naAgenda ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                    background: editando.naAgenda ? "var(--gold-light)" : "transparent",
                    color: editando.naAgenda ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
                  }}
                >
                  <CalendarPlus size={13} />
                  {editando.naAgenda ? "Incluir na Agenda ✓" : "Incluir na Agenda"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3" style={{ marginTop: 20 }}>
              <button className="btn-gold" onClick={salvarEdicao}>Salvar</button>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
