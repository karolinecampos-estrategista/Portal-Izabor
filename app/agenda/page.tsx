"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Plus, Clock, Video, CheckCircle2, AlertCircle, X, Loader2, Circle } from "lucide-react";

type CallStatus = "agendada" | "confirmada" | "realizada" | "cancelada";
type TipoCall = "sessao" | "triagem" | "alinhamento" | "encerramento" | "extra";

interface Sessao {
  id: string;
  mentorada_nome: string;
  data: string;
  duracao: string;
  status: CallStatus;
  tipo: TipoCall | null;
  link: string | null;
  observacoes: string | null;
}

interface Mentorada { id: string; nome: string; cor: string }

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

const FORM_VAZIO = { mentorada_nome: "", data: "", hora: "10:00", duracao: "1h", tipo: "sessao" as TipoCall, link: "", observacoes: "" };

function formatData(iso: string) {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m, d] = iso.split("-");
  return `${d} ${meses[parseInt(m)-1]} ${y}`;
}

function diasAte(iso: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const alvo = new Date(iso + "T12:00:00"); alvo.setHours(0,0,0,0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export default function AgendaAdmin() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | CallStatus>("todas");

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      fetch("/api/sessoes").then(r => r.json()),
      fetch("/api/mentoradas").then(r => r.json()),
    ]).then(([s, m]) => {
      setSessoes(Array.isArray(s) ? s : []);
      setMentoradas(Array.isArray(m) ? m : []);
      setCarregando(false);
    });
  }, []);

  async function criarSessao() {
    if (!form.mentorada_nome || !form.data) return;
    setSalvando(true);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_nome: form.mentorada_nome,
        data: form.data,
        duracao: form.duracao,
        tipo: form.tipo,
        link: form.link || null,
        observacoes: form.observacoes || null,
        status: "agendada",
      }),
    });
    const nova = await res.json();
    if (nova?.id) setSessoes(prev => [nova, ...prev]);
    setForm(FORM_VAZIO);
    setFormAberto(false);
    setSalvando(false);
  }

  async function atualizarStatus(id: string, status: CallStatus) {
    setSessoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    await fetch("/api/sessoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  const filtradas = sessoes.filter(s => filtro === "todas" || s.status === filtro)
    .sort((a, b) => a.data.localeCompare(b.data));

  const proximas = sessoes.filter(s => s.status !== "realizada" && s.status !== "cancelada" && s.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));

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
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Agenda de Sessões</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{sessoes.length} sessão{sessoes.length !== 1 ? "ões" : ""} registrada{sessoes.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setFormAberto(true)}>
          <Plus size={14} /> Nova Sessão
        </button>
      </div>

      {/* Próximas em destaque */}
      {proximas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12, marginBottom: 24 }}>
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
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>{s.mentorada_nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px" }}>{formatData(s.data)} · {s.duracao}</p>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "none" }}>
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
        {(["todas", "agendada", "confirmada", "realizada", "cancelada"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
            border: filtro === f ? `1px solid ${f === "todas" ? "var(--gold)" : STATUS_CFG[f as CallStatus]?.cor ?? "var(--gold)"}` : "1px solid var(--border)",
            background: filtro === f ? (f === "todas" ? "var(--gold-light)" : STATUS_CFG[f as CallStatus]?.bg ?? "var(--gold-light)") : "transparent",
            color: filtro === f ? (f === "todas" ? "var(--gold)" : STATUS_CFG[f as CallStatus]?.cor ?? "var(--gold)") : "var(--text-muted)",
            fontWeight: filtro === f ? 700 : 400,
          }}>
            {f === "todas" ? "Todas" : STATUS_CFG[f].label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <CalendarDays size={28} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhuma sessão encontrada</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Clique em "Nova Sessão" para começar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(s => {
            const cfg = STATUS_CFG[s.status];
            const Icon = cfg.Icon;
            return (
              <div key={s.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ minWidth: 50, textAlign: "center", background: "rgba(201,168,76,0.1)", borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{s.data.split("-")[2]}</p>
                  <p style={{ fontSize: 9, color: "var(--gold)", margin: 0, fontWeight: 700 }}>
                    {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(s.data.split("-")[1])-1]}
                  </p>
                </div>

                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px" }}>{s.mentorada_nome}</p>
                  <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                    <div className="flex items-center gap-1">
                      <Clock size={10} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duracao}</span>
                    </div>
                    {s.tipo && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{TIPO_CALL[s.tipo]}</span>}
                  </div>
                  {s.observacoes && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>{s.observacoes}</p>}
                </div>

                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    <Video size={11} /> Link
                  </a>
                )}

                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, color: cfg.cor, background: cfg.bg, border: `1px solid ${cfg.cor}30`, flexShrink: 0 }}>
                  <Icon size={11} /> {cfg.label}
                </span>

                {s.status === "agendada" && (
                  <select
                    onChange={e => atualizarStatus(s.id, e.target.value as CallStatus)}
                    defaultValue=""
                    style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <option value="" disabled>Atualizar</option>
                    <option value="confirmada">Confirmar</option>
                    <option value="realizada">Marcar realizada</option>
                    <option value="cancelada">Cancelar</option>
                  </select>
                )}
                {s.status === "confirmada" && (
                  <select
                    onChange={e => atualizarStatus(s.id, e.target.value as CallStatus)}
                    defaultValue=""
                    style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <option value="" disabled>Atualizar</option>
                    <option value="realizada">Marcar realizada</option>
                    <option value="cancelada">Cancelar</option>
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal novo */}
      {formAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setFormAberto(false)}>
          <div className="card" style={{ maxWidth: 480, width: "100%", padding: 24 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nova Sessão</h2>
              <button onClick={() => setFormAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Mentorada *</p>
                <select value={form.mentorada_nome} onChange={e => setForm({ ...form, mentorada_nome: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                  <option value="">Selecionar mentorada...</option>
                  {mentoradas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data *</p>
                  <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Duração</p>
                  <select value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                    {["30min","45min","1h","1h30","2h"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Tipo</p>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoCall })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                  {(Object.entries(TIPO_CALL) as [TipoCall, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Link da call</p>
                <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://meet.google.com/..." style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Observações</p>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end" style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="btn-gold" onClick={criarSessao} disabled={!form.mentorada_nome || !form.data || salvando}>
                {salvando ? "Salvando..." : "Criar sessão"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
