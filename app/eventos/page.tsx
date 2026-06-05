"use client";

import { useState, useEffect } from "react";
import {
  CalendarPlus, Plus, X, Pencil, Trash2, Loader2,
  Mail, Phone, ChevronDown, ChevronUp, Search,
} from "lucide-react";

type StatusIngresso  = "confirmado" | "pendente" | "cancelado";
type TipoIngresso    = "normal" | "vip" | "cortesia";

interface Ingresso {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  evento_nome: string | null;
  tipo_ingresso: TipoIngresso;
  status: StatusIngresso;
  data_ingresso: string;
  notas: string | null;
}

type FormData = {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  eventoNome: string;
  tipoIngresso: TipoIngresso;
  status: StatusIngresso;
  dataIngresso: string;
  notas: string;
};

const FORM_VAZIO: FormData = {
  nome: "", email: "", telefone: "", whatsapp: "",
  eventoNome: "", tipoIngresso: "normal", status: "confirmado",
  dataIngresso: new Date().toISOString().split("T")[0], notas: "",
};

const statusCfg: Record<StatusIngresso, { label: string; cor: string; bg: string }> = {
  confirmado: { label: "Confirmado", cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
  pendente:   { label: "Pendente",   cor: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  cancelado:  { label: "Cancelado",  cor: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const tipoCfg: Record<TipoIngresso, { label: string; cor: string }> = {
  normal:    { label: "Normal",    cor: "var(--text-muted)" },
  vip:       { label: "VIP",       cor: "#C9A84C" },
  cortesia:  { label: "Cortesia",  cor: "#a78bfa" },
};

function fmtData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function EventosPage() {
  const [ingressos, setIngressos]   = useState<Ingresso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState<FormData>(FORM_VAZIO);
  const [editando, setEditando]     = useState<string | null>(null);
  const [expandido, setExpandido]   = useState<string | null>(null);
  const [salvando, setSalvando]     = useState(false);
  const [busca, setBusca]           = useState("");
  const [filtroEvento, setFiltroEvento] = useState("");

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/evento-ingressos");
    if (res.ok) setIngressos(await res.json());
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    if (!form.nome.trim()) return;
    setSalvando(true);
    const payload = {
      nome: form.nome, email: form.email || null,
      telefone: form.telefone || null, whatsapp: form.whatsapp || null,
      eventoNome: form.eventoNome || null,
      tipoIngresso: form.tipoIngresso, status: form.status,
      dataIngresso: form.dataIngresso, notas: form.notas || null,
    };
    const res = editando
      ? await fetch("/api/evento-ingressos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editando, ...payload }) })
      : await fetch("/api/evento-ingressos", { method: "POST",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { setShowForm(false); setEditando(null); setForm(FORM_VAZIO); await carregar(); }
    setSalvando(false);
  }

  function iniciarEdicao(i: Ingresso) {
    setForm({
      nome: i.nome, email: i.email ?? "", telefone: i.telefone ?? "",
      whatsapp: i.whatsapp ?? "", eventoNome: i.evento_nome ?? "",
      tipoIngresso: i.tipo_ingresso, status: i.status,
      dataIngresso: i.data_ingresso, notas: i.notas ?? "",
    });
    setEditando(i.id);
    setShowForm(true);
    setExpandido(null);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este ingresso?")) return;
    await fetch(`/api/evento-ingressos?id=${id}`, { method: "DELETE" });
    await carregar();
  }

  const eventos = Array.from(new Set(ingressos.map(i => i.evento_nome).filter(Boolean))) as string[];

  const lista = ingressos.filter(i => {
    const q = busca.toLowerCase();
    const matchBusca = !q || i.nome.toLowerCase().includes(q) || (i.email ?? "").toLowerCase().includes(q) || (i.telefone ?? "").includes(q);
    const matchEvento = !filtroEvento || i.evento_nome === filtroEvento;
    return matchBusca && matchEvento;
  });

  const confirmados = ingressos.filter(i => i.status === "confirmado").length;
  const pendentes   = ingressos.filter(i => i.status === "pendente").length;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <CalendarPlus size={20} color="var(--gold)" />
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Eventos — Ingressos</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
            {confirmados} confirmado{confirmados !== 1 ? "s" : ""} · {pendentes} pendente{pendentes !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn-gold flex items-center gap-2"
          onClick={() => { setShowForm(!showForm); setEditando(null); setForm(FORM_VAZIO); }}
        >
          <Plus size={14} /> Novo Ingresso
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",       value: ingressos.length, cor: "var(--gold)" },
          { label: "Confirmados", value: confirmados,      cor: "#86efac" },
          { label: "Pendentes",   value: pendentes,        cor: "#fbbf24" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.cor, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: "1px solid var(--gold-border)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{editando ? "Editar Ingresso" : "Novo Ingresso"}</h3>
            <button onClick={() => { setShowForm(false); setEditando(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {/* Nome */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome *</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>

            {/* E-mail */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>

            {/* Telefone */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>

            {/* Evento */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Evento</label>
              <input value={form.eventoNome} onChange={e => setForm({ ...form, eventoNome: e.target.value })} placeholder="Nome do evento" list="eventos-lista" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
              <datalist id="eventos-lista">
                {eventos.map(e => <option key={e} value={e} />)}
              </datalist>
            </div>

            {/* Tipo ingresso */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo de ingresso</label>
              <select value={form.tipoIngresso} onChange={e => setForm({ ...form, tipoIngresso: e.target.value as TipoIngresso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="normal">Normal</option>
                <option value="vip">VIP</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StatusIngresso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Data */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data do ingresso</label>
              <input type="date" value={form.dataIngresso} onChange={e => setForm({ ...form, dataIngresso: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>

            {/* Notas */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} placeholder="Observações…" style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn-gold flex items-center gap-2" onClick={salvar} disabled={salvando || !form.nome.trim()}>
              {salvando ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {editando ? "Salvar alterações" : "Cadastrar ingresso"}
            </button>
            <button onClick={() => { setShowForm(false); setEditando(null); }} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone…"
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        {eventos.length > 0 && (
          <select
            value={filtroEvento}
            onChange={e => setFiltroEvento(e.target.value)}
            style={{ padding: "8px 12px", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", cursor: "pointer" }}
          >
            <option value="">Todos os eventos</option>
            {eventos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        )}
      </div>

      {/* Lista */}
      {carregando ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Carregando ingressos…</p>
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <CalendarPlus size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Nenhum ingresso cadastrado ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lista.map(i => {
            const aberto = expandido === i.id;
            const scfg = statusCfg[i.status];
            const tcfg = tipoCfg[i.tipo_ingresso];

            return (
              <div key={i.id} className="card" style={{ overflow: "hidden" }}>
                {/* Row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
                  onClick={() => setExpandido(aberto ? null : i.id)}
                >
                  {/* Avatar */}
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>
                    {i.nome[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{i.nome}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: scfg.bg, color: scfg.cor, letterSpacing: "0.05em" }}>
                        {scfg.label}
                      </span>
                      {i.tipo_ingresso !== "normal" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: tcfg.cor, letterSpacing: "0.05em" }}>
                          {tcfg.label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {i.evento_nome ?? "Sem evento"} · {fmtData(i.data_ingresso)}
                    </p>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {i.email && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{i.email}</p>}
                    {i.telefone && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{i.telefone}</p>}
                  </div>

                  <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expandido */}
                {aberto && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
                      {[
                        { label: "E-mail",   valor: i.email    ? <a href={`mailto:${i.email}`} style={{ color: "var(--gold)", textDecoration: "none" }}>{i.email}</a> : "—" },
                        { label: "Telefone", valor: i.telefone ?? "—" },
                        { label: "WhatsApp", valor: i.whatsapp ?? "—" },
                        { label: "Evento",   valor: i.evento_nome ?? "—" },
                        { label: "Tipo",     valor: tcfg.label },
                        { label: "Data",     valor: fmtData(i.data_ingresso) },
                      ].map(f => (
                        <div key={f.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px" }}>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{f.label}</p>
                          <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>{f.valor}</p>
                        </div>
                      ))}
                    </div>

                    {i.notas && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", margin: "0 0 14px" }}>
                        {i.notas}
                      </p>
                    )}

                    {/* Ações rápidas de status */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {(["confirmado","pendente","cancelado"] as StatusIngresso[]).map(s => (
                        <button
                          key={s}
                          onClick={() => fetch("/api/evento-ingressos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: i.id, status: s }) }).then(carregar)}
                          style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: i.status === s ? "default" : "pointer", border: "1px solid",
                            background: i.status === s ? statusCfg[s].bg : "transparent",
                            color: i.status === s ? statusCfg[s].cor : "var(--text-muted)",
                            borderColor: i.status === s ? statusCfg[s].cor : "var(--border)",
                          }}
                        >
                          {statusCfg[s].label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => iniciarEdicao(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button onClick={() => excluir(i.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid rgba(248,113,113,0.3)", background: "transparent", color: "#f87171" }}>
                        <Trash2 size={12} /> Excluir
                      </button>
                      {i.email && (
                        <a href={`mailto:${i.email}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", textDecoration: "none" }}>
                          <Mail size={12} /> E-mail
                        </a>
                      )}
                      {i.telefone && (
                        <a href={`tel:${i.telefone}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", textDecoration: "none" }}>
                          <Phone size={12} /> Ligar
                        </a>
                      )}
                    </div>
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
