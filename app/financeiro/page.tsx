"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, DollarSign, CreditCard, Users, Loader2,
  Plus, X, Trash2, ArrowDownLeft, ArrowUpRight, SlidersHorizontal,
} from "lucide-react";

type TipoLanc = "entrada" | "saida";
type Categoria = "seja_incomum" | "livro" | "club_bw" | "evento" | "outro";

interface Lancamento {
  id: string;
  tipo: TipoLanc;
  valor: number;
  descricao: string;
  data: string;
  categoria: Categoria;
  observacoes: string | null;
}

interface Mentoranda {
  id: string;
  nome: string;
  programa: string;
  cor: string;
  status: string;
  valor_negociado: number | null;
  forma_pagamento: string | null;
  total_parcelas: number | null;
}

const CATEGORIAS: { value: Categoria; label: string; cor: string }[] = [
  { value: "seja_incomum", label: "Seja Incomum",  cor: "#C9A84C" },
  { value: "livro",        label: "Livro",          cor: "#86efac" },
  { value: "club_bw",      label: "Club BW",        cor: "#a78bfa" },
  { value: "evento",       label: "Evento",         cor: "#fca5a5" },
  { value: "outro",        label: "Outro",          cor: "#6b7280" },
];

function catLabel(c: Categoria) { return CATEGORIAS.find(x => x.value === c)?.label ?? c; }
function catCor(c: Categoria)   { return CATEGORIAS.find(x => x.value === c)?.cor ?? "#6b7280"; }

function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d} ${meses[parseInt(m)-1]} ${y}`;
}

const FORM_VAZIO = { tipo: "entrada" as TipoLanc, valor: "", descricao: "", data: new Date().toISOString().split("T")[0], categoria: "outro" as Categoria, observacoes: "" };

export default function FinanceiroAdmin() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentoranda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoLanc>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | "todas">("todas");

  useEffect(() => {
    Promise.all([
      fetch("/api/financeiro").then(r => r.json()),
      fetch("/api/mentoradas").then(r => r.json()),
    ]).then(([lanc, ment]) => {
      setLancamentos(Array.isArray(lanc) ? lanc : []);
      setMentoradas(Array.isArray(ment) ? ment : []);
      setCarregando(false);
    });
  }, []);

  async function adicionar() {
    if (!form.descricao.trim() || !form.valor) return;
    setSalvando(true);
    const res = await fetch("/api/financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: parseFloat(String(form.valor).replace(",", ".")) }),
    });
    const novo = await res.json();
    if (novo?.id) setLancamentos(prev => [novo, ...prev]);
    setForm(FORM_VAZIO);
    setFormAberto(false);
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    await fetch(`/api/financeiro?id=${id}`, { method: "DELETE" });
    setLancamentos(prev => prev.filter(l => l.id !== id));
  }

  const filtrados = lancamentos.filter(l => {
    if (filtroTipo !== "todos" && l.tipo !== filtroTipo) return false;
    if (filtroCategoria !== "todas" && l.categoria !== filtroCategoria) return false;
    return true;
  });

  const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((s, l) => s + l.valor, 0);
  const totalSaidas   = lancamentos.filter(l => l.tipo === "saida").reduce((s, l) => s + l.valor, 0);
  const saldo         = totalEntradas - totalSaidas;

  // Receita estimada de contratos das alunas
  const receitaContratos = mentoradas.reduce((s, m) => s + (m.valor_negociado ?? 0), 0);

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando financeiro...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <TrendingUp size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Visão Financeira</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Lançamentos de entradas e saídas do negócio.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setFormAberto(true)}>
          <Plus size={14} /> Novo Lançamento
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Saldo",              value: saldo,            cor: saldo >= 0 ? "#86efac" : "#fca5a5", Icon: TrendingUp },
          { label: "Total Entradas",     value: totalEntradas,    cor: "#86efac",  Icon: ArrowDownLeft },
          { label: "Total Saídas",       value: totalSaidas,      cor: "#fca5a5",  Icon: ArrowUpRight },
          { label: "Receita Contratos",  value: receitaContratos, cor: "var(--gold)", Icon: Users },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <s.Icon size={14} style={{ color: s.cor }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.cor, margin: 0 }}>
              R$ {s.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["todos", "entrada", "saida"] as const).map(f => (
            <button key={f} onClick={() => setFiltroTipo(f)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroTipo === f ? "var(--gold-border)" : "var(--border)"}`, background: filtroTipo === f ? "var(--gold-light)" : "transparent", color: filtroTipo === f ? "var(--gold)" : "var(--text-muted)", fontWeight: filtroTipo === f ? 700 : 400 }}>
              {f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setFiltroCategoria("todas")} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroCategoria === "todas" ? "var(--gold-border)" : "var(--border)"}`, background: filtroCategoria === "todas" ? "var(--gold-light)" : "transparent", color: filtroCategoria === "todas" ? "var(--gold)" : "var(--text-muted)", fontWeight: filtroCategoria === "todas" ? 700 : 400 }}>
            Todas
          </button>
          {CATEGORIAS.map(c => (
            <button key={c.value} onClick={() => setFiltroCategoria(c.value)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroCategoria === c.value ? c.cor + "80" : "var(--border)"}`, background: filtroCategoria === c.value ? c.cor + "18" : "transparent", color: filtroCategoria === c.value ? c.cor : "var(--text-muted)", fontWeight: filtroCategoria === c.value ? 700 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de lançamentos */}
      {filtrados.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <SlidersHorizontal size={28} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhum lançamento ainda</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Clique em "Novo Lançamento" para começar.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Cabeçalho */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 130px 80px 36px", gap: 12, padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
            {["Data","Descrição","Categoria","Valor","Tipo",""].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {filtrados.map((l, i) => (
            <div
              key={l.id}
              style={{
                display: "grid", gridTemplateColumns: "80px 1fr 120px 130px 80px 36px", gap: 12,
                padding: "13px 18px", alignItems: "center",
                background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-input)",
                borderBottom: i < filtrados.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatData(l.data)}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{l.descricao}</p>
                {l.observacoes && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{l.observacoes}</p>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: catCor(l.categoria) + "18", color: catCor(l.categoria) }}>
                {catLabel(l.categoria)}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: l.tipo === "entrada" ? "#86efac" : "#fca5a5" }}>
                {l.tipo === "entrada" ? "+" : "-"} R$ {l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: l.tipo === "entrada" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)", color: l.tipo === "entrada" ? "#86efac" : "#fca5a5" }}>
                {l.tipo === "entrada" ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                {l.tipo === "entrada" ? "Entrada" : "Saída"}
              </span>
              <button onClick={() => excluir(l.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contratos das alunas */}
      {mentoradas.filter(m => (m.valor_negociado ?? 0) > 0).length > 0 && (
        <div className="card" style={{ padding: "18px 20px", marginTop: 20 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <CreditCard size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Contratos Ativos</span>
          </div>
          <div className="flex flex-col gap-2">
            {mentoradas.filter(m => (m.valor_negociado ?? 0) > 0).map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div className="avatar" style={{ width: 30, height: 30, background: m.cor + "20", color: m.cor, fontSize: 10 }}>
                  {m.nome.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <span style={{ flex: 1, fontSize: 13 }}>{m.nome}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.programa}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>
                  R$ {(m.valor_negociado!).toLocaleString("pt-BR")}
                </span>
                {m.forma_pagamento && m.total_parcelas && m.total_parcelas > 1 && (
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.total_parcelas}x</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal novo lançamento */}
      {formAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setFormAberto(false)}>
          <div className="card" style={{ maxWidth: 480, width: "100%", padding: 24 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Novo Lançamento</h2>
              <button onClick={() => setFormAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-12" style={{ gap: 14 }}>
              {/* Tipo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["entrada", "saida"] as TipoLanc[]).map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })} style={{ padding: "10px", borderRadius: 8, cursor: "pointer", border: `1px solid ${form.tipo === t ? (t === "entrada" ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)") : "var(--border)"}`, background: form.tipo === t ? (t === "entrada" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)") : "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: form.tipo === t ? 700 : 400, color: form.tipo === t ? (t === "entrada" ? "#86efac" : "#fca5a5") : "var(--text-muted)" }}>
                    {t === "entrada" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    {t === "entrada" ? "Entrada" : "Saída"}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição *</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Pagamento Seja Incomum — Ana Paula" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor (R$) *</label>
                  <input value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data</label>
                  <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Categoria</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIAS.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, categoria: c.value })} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${form.categoria === c.value ? c.cor + "80" : "var(--border)"}`, background: form.categoria === c.value ? c.cor + "18" : "transparent", color: form.categoria === c.value ? c.cor : "var(--text-muted)", fontWeight: form.categoria === c.value ? 700 : 400 }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} placeholder="Opcional..." />
              </div>
            </div>

            <div className="flex gap-2 justify-end" style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="btn-gold" onClick={adicionar} disabled={!form.descricao || !form.valor || salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
