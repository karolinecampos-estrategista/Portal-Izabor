"use client";

import { useState } from "react";
import {
  CalendarDays, Plus, Clock, Users, Mic, BookHeart, Star,
  ChevronLeft, ChevronRight, X, Video, Link2, CheckCircle2,
  AlertCircle, Phone, Circle,
} from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

type EventoTipo = "mentoria" | "club" | "imersao" | "live" | "devocional" | "pessoal";
type CallStatus = "agendada" | "confirmada" | "realizada" | "cancelada";
type TipoCall = "sessao" | "triagem" | "alinhamento" | "encerramento" | "extra";

interface Evento {
  id: number;
  titulo: string;
  tipo: EventoTipo;
  data: string;
  hora: string;
  duracao: string;
  descricao: string;
  aluna?: string;
}

interface CallMentoria {
  id: number;
  mentorandaNome: string;
  tipo: TipoCall;
  data: string;
  hora: string;
  duracao: string;
  link: string;
  notas: string;
  status: CallStatus;
}

const MENTORANDAS_LISTA = [
  "Ana Paula Ferreira",
  "Camila Rocha",
  "Fernanda Lima",
  "Juliana Costa",
  "Letícia Mendes",
  "Mariana Torres",
];

const TIPO_CALL: Record<TipoCall, string> = {
  sessao:       "Sessão de Acompanhamento",
  triagem:      "Triagem",
  alinhamento:  "Alinhamento de Jornada",
  encerramento: "Encerramento",
  extra:        "Call Extra",
};

const STATUS_CALL: Record<CallStatus, { label: string; cor: string; bg: string; icon: typeof Circle }> = {
  agendada:   { label: "Agendada",   cor: "#93c5fd", bg: "rgba(147,197,253,0.12)", icon: Clock },
  confirmada: { label: "Confirmada", cor: "#C9A84C", bg: "rgba(201,168,76,0.12)",  icon: CheckCircle2 },
  realizada:  { label: "Realizada",  cor: "#86efac", bg: "rgba(134,239,172,0.12)", icon: CheckCircle2 },
  cancelada:  { label: "Cancelada",  cor: "#f87171", bg: "rgba(248,113,113,0.12)", icon: AlertCircle },
};

const CALLS_INICIAL: CallMentoria[] = [
  { id: 1, mentorandaNome: "Ana Paula Ferreira", tipo: "sessao",       data: "2026-06-03", hora: "10:00", duracao: "1h",    link: "https://meet.google.com/abc-defg-hij", notas: "Sessão 8 de 10. Foco: identidade e propósito.",        status: "confirmada" },
  { id: 2, mentorandaNome: "Camila Rocha",        tipo: "alinhamento", data: "2026-06-05", hora: "14:00", duracao: "45min", link: "https://meet.google.com/xyz-uvwx-yz1", notas: "Revisão dos desafios da semana.",                        status: "agendada" },
  { id: 3, mentorandaNome: "Fernanda Lima",        tipo: "sessao",      data: "2026-06-10", hora: "11:00", duracao: "1h",    link: "https://meet.google.com/lmn-opqr-stu", notas: "Sessão 4 de 8.",                                        status: "agendada" },
  { id: 4, mentorandaNome: "Juliana Costa",        tipo: "sessao",      data: "2026-06-12", hora: "15:00", duracao: "1h",    link: "https://meet.google.com/vwx-yz12-345", notas: "",                                                      status: "agendada" },
  { id: 5, mentorandaNome: "Ana Paula Ferreira",  tipo: "encerramento", data: "2026-07-01", hora: "10:00", duracao: "1h30", link: "https://meet.google.com/enc-erra-mnt", notas: "Sessão final. Preparar celebração + foto do depois.",   status: "agendada" },
  { id: 6, mentorandaNome: "Letícia Mendes",      tipo: "triagem",     data: "2026-05-20", hora: "09:00", duracao: "30min", link: "https://meet.google.com/tri-age-m12", notas: "Triagem inicial — prospect qualificada pelo Instagram.", status: "realizada" },
];

const EVENTOS: Evento[] = [
  { id: 1,  titulo: "Mentoria — Ana Paula",       tipo: "mentoria",   data: "2026-05-26", hora: "10:00", duracao: "1h",   descricao: "Sessão 8 de 10 — Foco: Identidade e Propósito de Vida",               aluna: "Ana Paula Ferreira" },
  { id: 2,  titulo: "Club BW — Encontro Mensal",  tipo: "club",       data: "2026-05-27", hora: "19:30", duracao: "2h",   descricao: "Tema: Liderança Feminina com Fé — todas as alunas do Club BW" },
  { id: 3,  titulo: "Gravação — Série YouTube",   tipo: "devocional", data: "2026-05-28", hora: "09:00", duracao: "3h",   descricao: "Gravar episódio 4 da série para YouTube" },
  { id: 4,  titulo: "Mentoria — Camila Rocha",    tipo: "mentoria",   data: "2026-06-05", hora: "14:00", duracao: "1h",   descricao: "Alinhamento de Jornada",                                               aluna: "Camila Rocha" },
  { id: 5,  titulo: "Live Instagram",             tipo: "live",       data: "2026-05-29", hora: "20:00", duracao: "1h30", descricao: "Live sobre inteligência emocional para mulheres líderes" },
  { id: 6,  titulo: "Mentoria — Juliana Costa",   tipo: "mentoria",   data: "2026-06-12", hora: "15:00", duracao: "1h",   descricao: "Sessão 3 de 6 — Foco: Cura Emocional",                                aluna: "Juliana Costa" },
  { id: 7,  titulo: "Imersão BW — Abertura",      tipo: "imersao",    data: "2026-06-02", hora: "09:00", duracao: "8h",   descricao: "Início da Imersão BW — Turma Junho 2026" },
  { id: 8,  titulo: "Mentoria — Ana Paula",       tipo: "mentoria",   data: "2026-06-03", hora: "10:00", duracao: "1h",   descricao: "Sessão 8 de 10 — Foco: Identidade",                                   aluna: "Ana Paula Ferreira" },
  { id: 9,  titulo: "Gravação Devocional",        tipo: "devocional", data: "2026-05-31", hora: "08:00", duracao: "2h",   descricao: "Gravar 3 devocionais curtos para Stories" },
  { id: 10, titulo: "Mentoria — Fernanda Lima",   tipo: "mentoria",   data: "2026-06-10", hora: "11:00", duracao: "1h",   descricao: "Sessão 4 de 8",                                                       aluna: "Fernanda Lima" },
];

const tipoConfig: Record<EventoTipo, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  mentoria:   { label: "Mentoria",   color: "#C9A84C", bg: "rgba(201,168,76,0.15)",  icon: <Users size={12} /> },
  club:       { label: "Club BW",    color: "#a78bfa", bg: "rgba(139,92,246,0.15)",  icon: <Star size={12} /> },
  imersao:    { label: "Imersão BW", color: "#f9a8d4", bg: "rgba(236,72,153,0.15)", icon: <Star size={12} /> },
  live:       { label: "Live",       color: "#93c5fd", bg: "rgba(59,130,246,0.15)",  icon: <Mic size={12} /> },
  devocional: { label: "Devocional", color: "#86efac", bg: "rgba(134,239,172,0.15)", icon: <BookHeart size={12} /> },
  pessoal:    { label: "Pessoal",    color: "var(--text-muted)", bg: "var(--bg-input)", icon: <Clock size={12} /> },
};

const CALL_FORM_VAZIO: Omit<CallMentoria, "id"> = {
  mentorandaNome: "",
  tipo: "sessao",
  data: new Date().toISOString().split("T")[0],
  hora: "10:00",
  duracao: "1h",
  link: "",
  notas: "",
  status: "agendada",
};

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function Agenda() {
  const [ano, setAno] = useState(2026);
  const [mes, setMes] = useState(4);
  const [selecionado, setSelecionado] = useState<Evento | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [aba, setAba] = useState<"calendario" | "calls">("calendario");

  const [calls, setCalls] = useState<CallMentoria[]>(CALLS_INICIAL);
  const [callForm, setCallForm] = useState<Omit<CallMentoria, "id">>(CALL_FORM_VAZIO);
  const [showCallForm, setShowCallForm] = useState(false);
  const [filtroCall, setFiltroCall] = useState<CallStatus | "todas">("todas");

  const nextCallId = Math.max(...calls.map((c) => c.id)) + 1;

  function salvarCall() {
    if (!callForm.mentorandaNome || !callForm.data) return;
    setCalls((prev) => [...prev, { ...callForm, id: nextCallId }].sort((a, b) => a.data.localeCompare(b.data)));
    setCallForm(CALL_FORM_VAZIO);
    setShowCallForm(false);
  }

  function atualizarStatusCall(id: number, status: CallStatus) {
    setCalls((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  const diasNoMes = getDaysInMonth(ano, mes);
  const primeiroDia = getFirstDayOfMonth(ano, mes);
  const offset = primeiroDia === 0 ? 6 : primeiroDia - 1;
  const mesAtual = `${ano}-${String(mes + 1).padStart(2, "0")}`;

  // Merge calls "mentoria" events into calendar events
  const todosEventos = [
    ...EVENTOS,
    ...calls
      .filter((c) => c.status !== "cancelada")
      .map((c, i) => ({
        id: 1000 + c.id,
        titulo: `Call — ${c.mentorandaNome.split(" ")[0]}`,
        tipo: "mentoria" as EventoTipo,
        data: c.data,
        hora: c.hora,
        duracao: c.duracao,
        descricao: TIPO_CALL[c.tipo],
        aluna: c.mentorandaNome,
      })),
  ];

  const eventosDoMes = todosEventos.filter((e) => e.data.startsWith(mesAtual));
  const getEventosDoDia = (dia: number) => {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return todosEventos.filter((e) => e.data === dateStr);
  };

  const avancarMes = () => { if (mes === 11) { setMes(0); setAno(ano + 1); } else { setMes(mes + 1); } };
  const voltarMes  = () => { if (mes === 0) { setMes(11); setAno(ano - 1); } else { setMes(mes - 1); } };
  const ehHoje = (dia: number) => {
    const d = new Date();
    return dia === d.getDate() && mes === d.getMonth() && ano === d.getFullYear();
  };

  const proximosEventos = todosEventos
    .filter((e) => e.data >= today())
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 5);

  const callsFiltradas = calls.filter((c) => filtroCall === "todas" || c.status === filtroCall);
  const callsProximas = calls.filter((c) => c.data >= today() && c.status !== "cancelada").sort((a, b) => a.data.localeCompare(b.data));
  const callsRealizadas = calls.filter((c) => c.status === "realizada");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <CalendarDays size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Agenda</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Sua Agenda</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Mentorias, imersões, lives e criação.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {aba === "calls" && (
            <button
              className="btn-gold"
              onClick={() => { setShowCallForm(!showCallForm); setCallForm(CALL_FORM_VAZIO); }}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
            >
              <Phone size={14} /> Agendar Call
            </button>
          )}
          {aba === "calendario" && (
            <button className="btn-gold flex items-center gap-2" onClick={() => setNovoAberto(true)} style={{ fontSize: 13 }}>
              <Plus size={14} /> Novo Evento
            </button>
          )}
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {(["calendario", "calls"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            style={{
              fontSize: 13, fontWeight: aba === tab ? 700 : 400,
              color: aba === tab ? "var(--gold)" : "var(--text-muted)",
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px",
              borderBottom: aba === tab ? "2px solid var(--gold)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab === "calendario" ? "Calendário" : `Calls de Mentoria (${callsProximas.length} próximas)`}
          </button>
        ))}
      </div>

      {/* ABA: Calendário */}
      {aba === "calendario" && (
        <div className="agenda-grid">
          <div className="card" style={{ padding: "20px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <button onClick={voltarMes} style={{ background: "none", border: "none", color: "var(--text-soft)", cursor: "pointer", padding: 4 }}>
                <ChevronLeft size={18} />
              </button>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{MESES[mes]} {ano}</h2>
              <button onClick={avancarMes} style={{ background: "none", border: "none", color: "var(--text-soft)", cursor: "pointer", padding: 4 }}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
              {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1;
                const eventos = getEventosDoDia(dia);
                const isHoje = ehHoje(dia);
                return (
                  <div
                    key={dia}
                    style={{
                      minHeight: 52, padding: "5px 4px", borderRadius: 7,
                      background: isHoje ? "var(--gold-light)" : "transparent",
                      border: isHoje ? "1px solid var(--gold-border)" : "1px solid transparent",
                      cursor: eventos.length > 0 ? "pointer" : "default",
                    }}
                    onClick={() => eventos.length > 0 && setSelecionado(eventos[0])}
                  >
                    <p style={{ fontSize: 12, fontWeight: isHoje ? 700 : 400, color: isHoje ? "var(--gold)" : "var(--text)", margin: "0 0 3px", textAlign: "center" }}>{dia}</p>
                    <div className="flex flex-col gap-1">
                      {eventos.slice(0, 2).map((ev) => (
                        <div key={ev.id} style={{ height: 4, borderRadius: 2, background: tipoConfig[ev.tipo].color }} />
                      ))}
                      {eventos.length > 2 && <span style={{ fontSize: 8, color: "var(--text-muted)", textAlign: "center" }}>+{eventos.length - 2}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4" style={{ marginTop: 16, flexWrap: "wrap" }}>
              {Object.entries(tipoConfig).map(([tipo, cfg]) => (
                <div key={tipo} className="flex items-center gap-1">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color }} />
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card" style={{ padding: "16px 18px" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                <Clock size={13} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Próximos Eventos</span>
              </div>
              <div className="flex flex-col gap-2">
                {proximosEventos.map((e) => {
                  const cfg = tipoConfig[e.tipo];
                  const dateParts = e.data.split("-");
                  return (
                    <div
                      key={e.id}
                      className="card-hover"
                      style={{ padding: "10px 12px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => setSelecionado(e)}
                    >
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.titulo}</p>
                      </div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{dateParts[2]}/{dateParts[1]} às {e.hora} · {e.duracao}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: "16px 18px" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <Star size={13} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{MESES[mes]}</span>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(tipoConfig).map(([tipo, cfg]) => {
                  const count = eventosDoMes.filter((e) => e.tipo === tipo).length;
                  if (count === 0) return null;
                  return (
                    <div key={tipo} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: Calls de Mentoria */}
      {aba === "calls" && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {([
              { label: "Próximas", valor: callsProximas.length, cor: "#93c5fd" },
              { label: "Confirmadas", valor: calls.filter(c => c.status === "confirmada").length, cor: "#C9A84C" },
              { label: "Realizadas", valor: callsRealizadas.length, cor: "#86efac" },
              { label: "Canceladas", valor: calls.filter(c => c.status === "cancelada").length, cor: "#f87171" },
            ] as const).map(({ label, valor, cor }) => (
              <div key={label} className="card" style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: cor, margin: 0, lineHeight: 1 }}>{valor}</p>
              </div>
            ))}
          </div>

          {/* Formulário nova call */}
          {showCallForm && (
            <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--gold-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>Agendar Call de Mentoria</h3>
                <button onClick={() => setShowCallForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Mentorada *</label>
                  <select className="input" value={callForm.mentorandaNome} onChange={(e) => setCallForm((p) => ({ ...p, mentorandaNome: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {MENTORANDAS_LISTA.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo de Call</label>
                  <select className="input" value={callForm.tipo} onChange={(e) => setCallForm((p) => ({ ...p, tipo: e.target.value as TipoCall }))}>
                    {Object.entries(TIPO_CALL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data *</label>
                  <input className="input" type="date" value={callForm.data} onChange={(e) => setCallForm((p) => ({ ...p, data: e.target.value }))} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Horário</label>
                    <input className="input" type="time" value={callForm.hora} onChange={(e) => setCallForm((p) => ({ ...p, hora: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label>
                    <input className="input" value={callForm.duracao} onChange={(e) => setCallForm((p) => ({ ...p, duracao: e.target.value }))} placeholder="1h" />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link da Call (Google Meet / Zoom)</label>
                  <input className="input" value={callForm.link} onChange={(e) => setCallForm((p) => ({ ...p, link: e.target.value }))} placeholder="https://meet.google.com/..." />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
                  <select className="input" value={callForm.status} onChange={(e) => setCallForm((p) => ({ ...p, status: e.target.value as CallStatus }))}>
                    {Object.entries(STATUS_CALL).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas internas</label>
                  <input className="input" value={callForm.notas} onChange={(e) => setCallForm((p) => ({ ...p, notas: e.target.value }))} placeholder="Observações, foco da sessão..." />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button className="btn-ghost" onClick={() => setShowCallForm(false)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarCall} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Video size={14} /> Salvar & Notificar Mentorada
                </button>
              </div>
            </div>
          )}

          {/* Filtro status */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {(["todas", "agendada", "confirmada", "realizada", "cancelada"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltroCall(f)}
                style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 6,
                  border: `1px solid ${filtroCall === f ? (f === "todas" ? "var(--gold)" : STATUS_CALL[f]?.cor ?? "var(--gold)") : "var(--border)"}`,
                  background: filtroCall === f ? (f === "todas" ? "var(--gold-light)" : STATUS_CALL[f]?.bg ?? "var(--gold-light)") : "transparent",
                  color: filtroCall === f ? (f === "todas" ? "var(--gold)" : STATUS_CALL[f]?.cor ?? "var(--gold)") : "var(--text-muted)",
                  cursor: "pointer", fontWeight: filtroCall === f ? 700 : 400,
                }}
              >
                {f === "todas" ? "Todas" : STATUS_CALL[f].label}
              </button>
            ))}
          </div>

          {/* Lista de calls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {callsFiltradas.length === 0 && (
              <div className="card" style={{ padding: 28, textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma call encontrada.</p>
              </div>
            )}
            {callsFiltradas.map((c) => {
              const stCfg = STATUS_CALL[c.status];
              const StIcon = stCfg.icon;
              const dateParts = c.data.split("-");
              const passada = c.data < today();

              return (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: "16px 20px",
                    opacity: c.status === "cancelada" ? 0.6 : 1,
                    borderLeft: `3px solid ${stCfg.cor}`,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 16, alignItems: "start" }}>
                    {/* Data box */}
                    <div style={{ textAlign: "center", background: stCfg.bg, borderRadius: 8, padding: "6px 4px" }}>
                      <p style={{ fontSize: 20, fontWeight: 800, color: stCfg.cor, margin: 0, lineHeight: 1 }}>{dateParts[2]}</p>
                      <p style={{ fontSize: 9, color: stCfg.cor, margin: 0, fontWeight: 700 }}>
                        {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(dateParts[1]) - 1]}
                      </p>
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{c.mentorandaNome}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                          {TIPO_CALL[c.tipo]}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: stCfg.bg, color: stCfg.cor }}>
                          <StIcon size={10} /> {stCfg.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} /> {c.hora} · {c.duracao}
                        </span>
                        {c.link && (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#93c5fd", textDecoration: "none" }}
                          >
                            <Link2 size={11} /> Link da call
                          </a>
                        )}
                        {c.notas && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{c.notas}</span>
                        )}
                      </div>
                    </div>

                    {/* Ações rápidas de status */}
                    {c.status !== "cancelada" && c.status !== "realizada" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {c.status === "agendada" && (
                          <button
                            onClick={() => atualizarStatusCall(c.id, "confirmada")}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", cursor: "pointer" }}
                          >
                            Confirmar
                          </button>
                        )}
                        {passada && (
                          <button
                            onClick={() => atualizarStatusCall(c.id, "realizada")}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(134,239,172,0.4)", background: "rgba(134,239,172,0.08)", color: "#86efac", cursor: "pointer" }}
                          >
                            Marcar realizada
                          </button>
                        )}
                        <button
                          onClick={() => atualizarStatusCall(c.id, "cancelada")}
                          style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "transparent", color: "#f87171", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal detalhe evento (calendário) */}
      {selecionado && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setSelecionado(null)}>
          <div className="card" style={{ maxWidth: 480, width: "100%", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2 badge" style={{ background: tipoConfig[selecionado.tipo].bg, color: tipoConfig[selecionado.tipo].color }}>
                {tipoConfig[selecionado.tipo].icon}
                {tipoConfig[selecionado.tipo].label}
              </div>
              <button onClick={() => setSelecionado(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{selecionado.titulo}</h2>
            <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <CalendarDays size={12} /> {selecionado.data.split("-").reverse().join("/")}
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <Clock size={12} /> {selecionado.hora} · {selecionado.duracao}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, padding: "12px", background: "var(--bg-input)", borderRadius: 8, margin: 0 }}>
              {selecionado.descricao}
            </p>
            {selecionado.aluna && (
              <div className="flex items-center gap-2" style={{ marginTop: 12, padding: "8px 12px", background: "var(--gold-light)", borderRadius: 8, border: "1px solid var(--gold-border)" }}>
                <Users size={13} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 12, color: "var(--gold)" }}>{selecionado.aluna}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal novo evento genérico */}
      {novoAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setNovoAberto(false)}>
          <div className="card" style={{ maxWidth: 480, width: "100%", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Novo Evento</h2>
              <button onClick={() => setNovoAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input className="input" placeholder="Título do evento..." />
              <select className="input">
                <option value="mentoria">Mentoria</option>
                <option value="club">Club BW</option>
                <option value="imersao">Imersão BW</option>
                <option value="live">Live</option>
                <option value="devocional">Devocional / Gravação</option>
                <option value="pessoal">Pessoal</option>
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <input className="input" type="date" />
                <input className="input" type="time" />
                <input className="input" placeholder="Duração" />
              </div>
              <textarea className="input" placeholder="Descrição..." rows={3} style={{ resize: "vertical" }} />
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setNovoAberto(false)}>Cancelar</button>
                <button className="btn-gold" onClick={() => setNovoAberto(false)}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
