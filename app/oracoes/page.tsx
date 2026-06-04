"use client";

import { useState } from "react";
import { Heart, Plus, Trash2, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp, HandHeart } from "lucide-react";

type StatusOracao = "Em Oracao" | "Respondida" | "Agradecimento";

interface Oracao {
  id: number;
  titulo: string;
  proposito: string;
  texto: string;
  data: string;
  status: StatusOracao;
  dataResposta?: string;
}

const ORACOES_INICIAL: Oracao[] = [
  {
    id: 1, titulo: "Visao do Ministerio",
    proposito: "Clareza e discernimento sobre os proximos passos do ministerio",
    texto: "Senhor, abre meus olhos para enxergar o que Tu ja preparaste. Que eu nao corra na frente da Tua voz, mas que eu caminhe no Teu tempo. Que cada mulher que eu tocar seja transformada nao por mim, mas pelo Teu Espirito.",
    data: "24 Mai 2026", status: "Em Oracao",
  },
  {
    id: 2, titulo: "Pelas Mentorandas",
    proposito: "Protecao, foco e avanco de cada mulher no programa",
    texto: "Senhor, cada mulher que confiou a mim um pedaco da sua historia, cobre com Tua graca. Que elas nao desistam quando o processo for duro. Que o que planto em cada sessao caia em terra boa e produza fruto.",
    data: "22 Mai 2026", status: "Em Oracao",
  },
  {
    id: 3, titulo: "Provisao para o Club BW",
    proposito: "Recursos e abertura de portas para o crescimento do ministerio",
    texto: "Pai, o que foi colocado no meu coracao e maior do que eu consigo carregar sozinha. Preciso da Tua provisao — de pessoas, de recursos, de abertura de portas que so Tu podes abrir.",
    data: "18 Mai 2026", status: "Respondida", dataResposta: "23 Mai 2026",
  },
  {
    id: 4, titulo: "Sabedoria nas palavras",
    proposito: "Que cada palavra falada em mentoria e conteudo seja ungida e precisa",
    texto: "Que a minha boca fale o que Tu queres que seja dito. Que eu saiba quando falar e quando ficar quieta. Que eu nao fale da minha sabedoria, mas da Tua.",
    data: "15 Mai 2026", status: "Em Oracao",
  },
  {
    id: 5, titulo: "Gratidao pela Imersao BW",
    proposito: "Agradecimento pelo fruto da ultima imersao",
    texto: "Obrigada, Senhor, por cada mulher que apareceu. Cada lagrima que caiu foi semente. Cada palavra que saiu era mais Tua do que minha. A gloria e Tua.",
    data: "10 Mai 2026", status: "Agradecimento",
  },
];

const statusCfg: Record<StatusOracao, { label: string; color: string; bg: string }> = {
  "Em Oracao":    { label: "Em Oracao",    color: "#93c5fd", bg: "rgba(147,197,253,0.1)" },
  "Respondida":   { label: "Respondida",   color: "#86efac", bg: "rgba(134,239,172,0.1)" },
  "Agradecimento":{ label: "Agradecimento",color: "var(--gold)", bg: "var(--gold-light)" },
};

function dataAtual() {
  const d = new Date();
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

const FORM_VAZIO = { titulo: "", proposito: "", texto: "", status: "Em Oracao" as StatusOracao };

export default function Oracoes() {
  const [oracoes, setOracoes] = useState<Oracao[]>(ORACOES_INICIAL);
  const [filtroStatus, setFiltroStatus] = useState<StatusOracao | "Todas">("Todas");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState<Oracao | null>(null);

  const filtradas = oracoes.filter(o => filtroStatus === "Todas" || o.status === filtroStatus);
  const emOracao = oracoes.filter(o => o.status === "Em Oracao").length;
  const respondidas = oracoes.filter(o => o.status === "Respondida").length;
  const agradecimentos = oracoes.filter(o => o.status === "Agradecimento").length;

  function salvar() {
    if (!form.titulo.trim() || !form.texto.trim()) return;
    const nova: Oracao = { id: Date.now(), titulo: form.titulo, proposito: form.proposito, texto: form.texto, data: dataAtual(), status: form.status };
    setOracoes(prev => [nova, ...prev]);
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  function salvarEdicao() {
    if (!editando) return;
    setOracoes(prev => prev.map(o => o.id === editando.id ? editando : o));
    setEditando(null);
  }

  function marcarRespondida(id: number) {
    setOracoes(prev => prev.map(o => o.id === id ? { ...o, status: "Respondida", dataResposta: dataAtual() } : o));
  }

  function deletar(id: number) {
    setOracoes(prev => prev.filter(o => o.id !== id));
  }

  const inputStyle = { padding: "8px 12px", fontSize: 13, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", width: "100%" };
  const labelStyle = { fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" as const };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Heart size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Oracoes</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Minhas Oracoes</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Registre suas oracoes, o proposito de cada uma e acompanhe as respostas de Deus.</p>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Em Oracao", value: emOracao, color: "#93c5fd" },
          { label: "Respondidas", value: respondidas, color: "#86efac" },
          { label: "Agradecimentos", value: agradecimentos, color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros + botao */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {(["Todas", "Em Oracao", "Respondida", "Agradecimento"] as const).map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} style={{
            padding: "5px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer",
            border: filtroStatus === s ? "1px solid var(--gold-border)" : "1px solid var(--border)",
            background: filtroStatus === s ? "var(--gold-light)" : "transparent",
            color: filtroStatus === s ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
          }}>{s}</button>
        ))}
        <button className="btn-gold flex items-center gap-2" onClick={() => setMostrarForm(!mostrarForm)} style={{ fontSize: 12, marginLeft: "auto" }}>
          <Plus size={13} /> Nova Oracao
        </button>
      </div>

      {/* Form nova oracao */}
      {mostrarForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nova Oracao</p>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={labelStyle}>Titulo *</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Ex: Visao do ministerio, Pelas mentorandas..." />
            </div>
            <div>
              <label style={labelStyle}>Proposito desta oracao</label>
              <input value={form.proposito} onChange={e => setForm({ ...form, proposito: e.target.value })} style={inputStyle} placeholder="O que voce esta pedindo ou agradecendo?" />
            </div>
            <div>
              <label style={labelStyle}>Oracao *</label>
              <textarea value={form.texto} onChange={e => setForm({ ...form, texto: e.target.value })} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Escreva sua oracao..." />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StatusOracao })} style={inputStyle}>
                {(["Em Oracao", "Respondida", "Agradecimento"] as StatusOracao[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
            <button className="btn-gold flex items-center gap-2" onClick={salvar} disabled={!form.titulo.trim() || !form.texto.trim()}>
              <Heart size={13} /> Salvar Oracao
            </button>
            <button onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
          Nenhuma oracao aqui ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(o => {
            const cfg = statusCfg[o.status];
            const aberta = expandida === o.id;
            return (
              <div key={o.id} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid ${cfg.color}30` }}>
                <div className="flex items-start gap-3">
                  <div style={{ paddingTop: 2, flexShrink: 0, color: cfg.color }}>
                    {o.status === "Respondida" ? <CheckCircle2 size={16} /> : o.status === "Agradecimento" ? <HandHeart size={16} /> : <Circle size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{o.titulo}</p>
                    {o.proposito && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{o.proposito}</p>}
                    <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span><Clock size={9} style={{ display: "inline", marginRight: 2 }} />{o.data}</span>
                      {o.dataResposta && <span style={{ color: "#86efac" }}>Respondida em {o.dataResposta}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                    <button onClick={() => setExpandida(aberta ? null : o.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "var(--text-muted)" }}>
                      {aberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => deletar(o.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "var(--text-muted)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {aberta && (
                  <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <div className="verse-block" style={{ marginBottom: 14 }}>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--text-soft)" }}>{o.texto}</p>
                    </div>
                    <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                      {o.status === "Em Oracao" && (
                        <button onClick={() => marcarRespondida(o.id)} style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", color: "#86efac", fontWeight: 500,
                        }}>
                          <CheckCircle2 size={13} /> Marcar como Respondida
                        </button>
                      )}
                      <button onClick={() => setEditando({ ...o })} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                        background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)",
                      }}>
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edicao */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Editar Oracao</p>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Titulo</label>
                <input value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Proposito</label>
                <input value={editando.proposito} onChange={e => setEditando({ ...editando, proposito: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Oracao</label>
                <textarea value={editando.texto} onChange={e => setEditando({ ...editando, texto: e.target.value })} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={editando.status} onChange={e => setEditando({ ...editando, status: e.target.value as StatusOracao })} style={inputStyle}>
                  {(["Em Oracao", "Respondida", "Agradecimento"] as StatusOracao[]).map(s => <option key={s}>{s}</option>)}
                </select>
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
