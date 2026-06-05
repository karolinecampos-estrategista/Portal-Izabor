"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays, Plus, Clock, Video, CheckCircle2, AlertCircle, X,
  Loader2, Circle, Users, CalendarPlus, Trash2,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CallStatus = "agendada" | "confirmada" | "realizada" | "cancelada";
type TipoCall   = "sessao" | "triagem" | "alinhamento" | "encerramento" | "extra";
type TipoEvento = "reuniao" | "conteudo" | "pessoal" | "lembrete" | "outro";

interface Sessao {
  id: string;
  mentorada_nome: string;
  data: string;
  horario: string | null;
  duracao: string;
  status: CallStatus;
  tipo: TipoCall | null;
  link_meet: string | null;
  resumo: string | null;
}

interface EventoAgenda {
  id: string;
  titulo: string;
  data: string;
  horario: string | null;
  duracao: string | null;
  descricao: string | null;
  tipo: TipoEvento;
  cor: string;
}

interface Mentorada { id: string; nome: string; cor: string }

// ─── Config ──────────────────────────────────────────────────────────────────

const TIPO_CALL: Record<TipoCall, string> = {
  sessao:       "Sessão de Acompanhamento",
  triagem:      "Triagem",
  alinhamento:  "Alinhamento de Jornada",
  encerramento: "Encerramento",
  extra:        "Call Extra",
};

const STATUS_CFG: Record<CallStatus, { label: string; cor: string; bg: string; Icon: typeof Circle }> = {
  agendada:   { label: "Agendada",   cor: "#93c5fd", bg: "rgba(147,197,253,0.12)", Icon: Clock },
  confirmada: { label: "Confirmada", cor: "#C9A84C", bg: "rgba(201,168,76,0.12)",  Icon: CheckCircle2 },
  realizada:  { label: "Realizada",  cor: "#86efac", bg: "rgba(134,239,172,0.12)", Icon: CheckCircle2 },
  cancelada:  { label: "Cancelada",  cor: "#f87171", bg: "rgba(248,113,113,0.12)", Icon: AlertCircle },
};

const TIPO_EVENTO_CFG: Record<TipoEvento, { label: string; cor: string; bg: string }> = {
  reuniao:  { label: "Reunião",          cor: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  conteudo: { label: "Criação Conteúdo", cor: "#f9a8d4", bg: "rgba(249,168,212,0.12)" },
  pessoal:  { label: "Pessoal",          cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  lembrete: { label: "Lembrete",         cor: "#fcd34d", bg: "rgba(252,211,77,0.12)"  },
  outro:    { label: "Outro",            cor: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const FORM_SESSAO_VAZIO = {
  mentorada_nome: "", data: "", hora: "10:00", duracao: "1h",
  tipo: "sessao" as TipoCall, link: "", observacoes: "",
};

const FORM_EVENTO_VAZIO = {
  titulo: "", data: "", hora: "", duracao: "", tipo: "outro" as TipoEvento, descricao: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d} ${MESES[parseInt(m)-1]} ${y}`;
}

function diasAte(iso: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const alvo = new Date(iso + "T12:00:00"); alvo.setHours(0,0,0,0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function AgendaAdmin() {
  const [sessoes,    setSessoes]    = useState<Sessao[]>([]);
  const [eventos,    setEventos]    = useState<EventoAgenda[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalSessao, setModalSessao] = useState(false);
  const [modalEvento, setModalEvento] = useState(false);

  const [formSessao, setFormSessao] = useState(FORM_SESSAO_VAZIO);
  const [formEvento, setFormEvento] = useState(FORM_EVENTO_VAZIO);

  const [salvandoSessao, setSalvandoSessao] = useState(false);
  const [salvandoEvento, setSalvandoEvento] = useState(false);

  const [filtro, setFiltro] = useState<"todos" | "sessao" | "evento">("todos");

  const hoje = new Date().toISOString().split("T")[0];

  // ─── Carga ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch("/api/sessoes").then(r => r.json()),
      fetch("/api/agenda-eventos").then(r => r.json()),
      fetch("/api/mentoradas").then(r => r.json()),
    ]).then(([s, e, m]) => {
      setSessoes(Array.isArray(s) ? s : []);
      setEventos(Array.isArray(e) ? e : []);
      setMentoradas(Array.isArray(m) ? m : []);
      setCarregando(false);
    });
  }, []);

  // ─── Ações ─────────────────────────────────────────────────────────────────

  async function criarSessao() {
    if (!formSessao.mentorada_nome || !formSessao.data) return;
    setSalvandoSessao(true);
    const mentorada = mentoradas.find(m => m.nome === formSessao.mentorada_nome);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_id:   mentorada?.id ?? null,
        mentorada_nome: formSessao.mentorada_nome,
        data:           formSessao.data,
        horario:        formSessao.hora || null,
        duracao:        formSessao.duracao,
        tipo:           formSessao.tipo,
        link_meet:      formSessao.link || null,
        resumo:         formSessao.observacoes || null,
        status:         "agendada",
        cor:            mentorada?.cor ?? "#C9A84C",
      }),
    });
    const nova = await res.json();
    if (nova?.id) setSessoes(prev => [nova, ...prev]);
    setFormSessao(FORM_SESSAO_VAZIO);
    setModalSessao(false);
    setSalvandoSessao(false);
  }

  async function criarEvento() {
    if (!formEvento.titulo || !formEvento.data) return;
    setSalvandoEvento(true);
    const cfg = TIPO_EVENTO_CFG[formEvento.tipo];
    const res = await fetch("/api/agenda-eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo:    formEvento.titulo,
        data:      formEvento.data,
        horario:   formEvento.hora     || null,
        duracao:   formEvento.duracao  || null,
        descricao: formEvento.descricao || null,
        tipo:      formEvento.tipo,
        cor:       cfg.cor,
      }),
    });
    const novo = await res.json();
    if (novo?.id) setEventos(prev => [...prev, novo].sort((a,b) => a.data.localeCompare(b.data)));
    setFormEvento(FORM_EVENTO_VAZIO);
    setModalEvento(false);
    setSalvandoEvento(false);
  }

  async function atualizarStatus(id: string, status: CallStatus) {
    setSessoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    await fetch("/api/sessoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function excluirEvento(id: string) {
    setEventos(prev => prev.filter(e => e.id !== id));
    await fetch(`/api/agenda-eventos?id=${id}`, { method: "DELETE" });
  }

  // ─── Timeline unificada ────────────────────────────────────────────────────

  type ItemUnificado =
    | { kind: "sessao"; d: string; item: Sessao }
    | { kind: "evento"; d: string; item: EventoAgenda };

  const itens: ItemUnificado[] = [
    ...(filtro !== "evento" ? sessoes.map(s => ({ kind: "sessao" as const, d: s.data, item: s })) : []),
    ...(filtro !== "sessao" ? eventos.map(e => ({ kind: "evento" as const, d: e.data, item: e })) : []),
  ].sort((a, b) => a.d.localeCompare(b.d));

  const proximas = sessoes
    .filter(s => s.status !== "realizada" && s.status !== "cancelada" && s.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));

  // ─── Render ────────────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando agenda...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <CalendarDays size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Agenda</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Agenda</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {sessoes.length} sessão{sessoes.length !== 1 ? "ões" : ""} · {eventos.length} evento{eventos.length !== 1 ? "s" : ""} pessoal{eventos.length !== 1 ? "is" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
          <button
            className="flex items-center gap-2"
            onClick={() => setModalSessao(true)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.4)",
              background: "rgba(167,139,250,0.08)", color: "#a78bfa",
              fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Users size={14} /> Adicionar Sessão
          </button>
          <button
            className="btn-gold flex items-center gap-2"
            onClick={() => setModalEvento(true)}
          >
            <CalendarPlus size={14} /> Adicionar Agenda
          </button>
        </div>
      </div>

      {/* Próximas sessões em destaque */}
      {proximas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginBottom: 24 }}>
          {proximas.slice(0,3).map(s => {
            const diff = diasAte(s.data);
            const urgente = diff <= 1;
            return (
              <div key={s.id} className="card" style={{ padding: "16px 18px", border: urgente ? "1px solid rgba(201,168,76,0.5)" : "1px solid var(--border)" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: urgente ? "var(--gold)" : "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    {diff === 0 ? "Hoje" : diff === 1 ? "Amanhã" : `em ${diff} dias`}
                  </span>
                  <Video size={13} style={{ color: "var(--gold)" }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 3px" }}>{s.mentorada_nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px" }}>
                  {formatData(s.data)}{s.horario ? ` · ${s.horario}` : ""} · {s.duracao}
                </p>
                {s.link_meet && (
                  <a href={s.link_meet} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "none" }}>
                    Acessar link →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {([
          { v: "todos",  label: "Todos" },
          { v: "sessao", label: "Sessões" },
          { v: "evento", label: "Agenda Pessoal" },
        ] as const).map(({ v, label }) => (
          <button key={v} onClick={() => setFiltro(v)} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
            border: filtro === v ? "1px solid var(--gold)" : "1px solid var(--border)",
            background: filtro === v ? "var(--gold-light)" : "transparent",
            color: filtro === v ? "var(--gold)" : "var(--text-muted)",
            fontWeight: filtro === v ? 700 : 400,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {itens.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <CalendarDays size={28} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhum item na agenda</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Use os botões acima para adicionar sessões ou eventos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((item) => {
            if (item.kind === "sessao") {
              const s = item.item;
              const cfg = STATUS_CFG[s.status];
              const Icon = cfg.Icon;
              return (
                <div key={`s-${s.id}`} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  {/* Data */}
                  <div style={{ minWidth: 44, textAlign: "center", background: "rgba(167,139,250,0.1)", borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa", margin: 0, lineHeight: 1 }}>{s.data.split("-")[2]}</p>
                    <p style={{ fontSize: 9, color: "#a78bfa", margin: 0, fontWeight: 700 }}>
                      {MESES[parseInt(s.data.split("-")[1])-1]}
                    </p>
                  </div>

                  {/* Badge sessão */}
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: "rgba(167,139,250,0.1)", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.05em" }}>
                      SESSÃO
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px" }}>{s.mentorada_nome}</p>
                    <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {s.horario ? `${s.horario} · ` : ""}{s.duracao}
                        </span>
                      </div>
                      {s.tipo && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{TIPO_CALL[s.tipo]}</span>}
                    </div>
                    {s.resumo && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>{s.resumo}</p>}
                  </div>

                  {s.link_meet && (
                    <a href={s.link_meet} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <Video size={11} /> Link
                    </a>
                  )}

                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, color: cfg.cor, background: cfg.bg, border: `1px solid ${cfg.cor}30`, flexShrink: 0 }}>
                    <Icon size={11} /> {cfg.label}
                  </span>

                  {s.status === "agendada" && (
                    <select onChange={e => atualizarStatus(s.id, e.target.value as CallStatus)} defaultValue="" style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}>
                      <option value="" disabled>Atualizar</option>
                      <option value="confirmada">Confirmar</option>
                      <option value="realizada">Marcar realizada</option>
                      <option value="cancelada">Cancelar</option>
                    </select>
                  )}
                  {s.status === "confirmada" && (
                    <select onChange={e => atualizarStatus(s.id, e.target.value as CallStatus)} defaultValue="" style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}>
                      <option value="" disabled>Atualizar</option>
                      <option value="realizada">Marcar realizada</option>
                      <option value="cancelada">Cancelar</option>
                    </select>
                  )}
                </div>
              );
            }

            // Evento pessoal
            const e = item.item;
            const eCfg = TIPO_EVENTO_CFG[e.tipo] ?? TIPO_EVENTO_CFG.outro;
            return (
              <div key={`e-${e.id}`} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {/* Data */}
                <div style={{ minWidth: 44, textAlign: "center", background: `${eCfg.cor}18`, borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: eCfg.cor, margin: 0, lineHeight: 1 }}>{e.data.split("-")[2]}</p>
                  <p style={{ fontSize: 9, color: eCfg.cor, margin: 0, fontWeight: 700 }}>
                    {MESES[parseInt(e.data.split("-")[1])-1]}
                  </p>
                </div>

                {/* Badge agenda */}
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: `${eCfg.cor}15`, color: eCfg.cor, fontWeight: 700, letterSpacing: "0.05em" }}>
                    AGENDA
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px" }}>{e.titulo}</p>
                  <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                    {(e.horario || e.duracao) && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {e.horario ? `${e.horario}${e.duracao ? ` · ${e.duracao}` : ""}` : e.duracao}
                        </span>
                      </div>
                    )}
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: eCfg.bg, color: eCfg.cor, fontWeight: 600 }}>
                      {eCfg.label}
                    </span>
                  </div>
                  {e.descricao && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>{e.descricao}</p>}
                </div>

                <button
                  onClick={() => excluirEvento(e.id)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, flexShrink: 0, opacity: 0.5 }}
                  title="Excluir evento"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal: Adicionar Sessão ─────────────────────────────────────── */}
      {modalSessao && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setModalSessao(false)}>
          <div className="card" style={{ maxWidth: 480, width: "100%", padding: 24 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Adicionar Sessão</h2>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Sessão com mentorada</p>
              </div>
              <button onClick={() => setModalSessao(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Mentorada *</p>
                <select value={formSessao.mentorada_nome} onChange={e => setFormSessao({ ...formSessao, mentorada_nome: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                  <option value="">Selecionar mentorada...</option>
                  {mentoradas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data *</p>
                  <input type="date" value={formSessao.data} onChange={e => setFormSessao({ ...formSessao, data: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Horário</p>
                  <input type="time" value={formSessao.hora} onChange={e => setFormSessao({ ...formSessao, hora: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Duração</p>
                  <select value={formSessao.duracao} onChange={e => setFormSessao({ ...formSessao, duracao: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                    {["30min","45min","1h","1h30","2h"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Tipo</p>
                <select value={formSessao.tipo} onChange={e => setFormSessao({ ...formSessao, tipo: e.target.value as TipoCall })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                  {(Object.entries(TIPO_CALL) as [TipoCall, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Link da call</p>
                <input value={formSessao.link} onChange={e => setFormSessao({ ...formSessao, link: e.target.value })} placeholder="https://meet.google.com/..." style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Observações</p>
                <textarea value={formSessao.observacoes} onChange={e => setFormSessao({ ...formSessao, observacoes: e.target.value })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end" style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setModalSessao(false)}>Cancelar</button>
              <button
                onClick={criarSessao}
                disabled={!formSessao.mentorada_nome || !formSessao.data || salvandoSessao}
                style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.12)", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {salvandoSessao ? "Salvando..." : "Criar sessão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Adicionar Agenda ─────────────────────────────────────── */}
      {modalEvento && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setModalEvento(false)}>
          <div className="card" style={{ maxWidth: 460, width: "100%", padding: 24 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Adicionar Agenda</h2>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Evento pessoal · reunião · lembrete</p>
              </div>
              <button onClick={() => setModalEvento(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Título *</p>
                <input
                  value={formEvento.titulo}
                  onChange={e => setFormEvento({ ...formEvento, titulo: e.target.value })}
                  placeholder="Ex: Reunião com equipe, Gravação de conteúdo..."
                  style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data *</p>
                  <input type="date" value={formEvento.data} onChange={e => setFormEvento({ ...formEvento, data: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Horário</p>
                  <input type="time" value={formEvento.hora} onChange={e => setFormEvento({ ...formEvento, hora: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Duração</p>
                  <select value={formEvento.duracao} onChange={e => setFormEvento({ ...formEvento, duracao: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                    <option value="">—</option>
                    {["30min","45min","1h","1h30","2h","3h"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Tipo</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {(Object.entries(TIPO_EVENTO_CFG) as [TipoEvento, typeof TIPO_EVENTO_CFG[TipoEvento]][]).map(([k, cfg]) => (
                    <button
                      key={k}
                      onClick={() => setFormEvento({ ...formEvento, tipo: k })}
                      style={{
                        padding: "6px 4px", borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: "pointer",
                        border: formEvento.tipo === k ? `1px solid ${cfg.cor}` : "1px solid var(--border)",
                        background: formEvento.tipo === k ? cfg.bg : "transparent",
                        color: formEvento.tipo === k ? cfg.cor : "var(--text-muted)",
                        textAlign: "center", lineHeight: 1.3,
                      }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Descrição</p>
                <textarea
                  value={formEvento.descricao}
                  onChange={e => setFormEvento({ ...formEvento, descricao: e.target.value })}
                  rows={2}
                  placeholder="Detalhes ou observações..."
                  style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end" style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setModalEvento(false)}>Cancelar</button>
              <button
                className="btn-gold"
                onClick={criarEvento}
                disabled={!formEvento.titulo || !formEvento.data || salvandoEvento}
              >
                {salvandoEvento ? "Salvando..." : "Criar evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
