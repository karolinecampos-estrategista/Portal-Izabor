"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Loader2, Plus, X, Trash2, ArrowDownLeft, ArrowUpRight,
  SlidersHorizontal, Pencil, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";

type TipoLanc = "entrada" | "saida";
type Categoria = "seja_incomum" | "livro" | "club_bw" | "evento" | "outro";

interface LancAluna {
  id: string; nome: string; email: string; cor: string;
  valor_negociado: number | null; total_parcelas: number | null;
  forma_pagamento: string | null; anotacoes_negociacao: string | null;
}

interface Lancamento {
  id: string; tipo: TipoLanc; valor: number; descricao: string;
  data: string; categoria: Categoria; observacoes: string | null;
  mentorada_id: string | null; numero_parcela: number | null;
  mentorada?: LancAluna | null;
}

interface Mentoranda {
  id: string; nome: string; email: string; cor: string;
  acesso: string | null; valor_negociado: number | null;
  total_parcelas: number | null; forma_pagamento: string | null;
  anotacoes_negociacao: string | null;
}

const CATEGORIAS: { value: Categoria; label: string; cor: string }[] = [
  { value: "seja_incomum", label: "Seja Incomum", cor: "#C9A84C" },
  { value: "livro",        label: "Livro",         cor: "#86efac" },
  { value: "club_bw",      label: "Club BW",       cor: "#a78bfa" },
  { value: "evento",       label: "Evento",        cor: "#fca5a5" },
  { value: "outro",        label: "Outro",         cor: "#6b7280" },
];

const FORMAS = [
  { value: "cartao",    label: "Cartão" },
  { value: "pix",       label: "PIX" },
  { value: "boleto",    label: "Boleto" },
  { value: "dinheiro",  label: "Dinheiro" },
  { value: "parcelado", label: "Parcelado" },
];

function catLabel(c: Categoria) { return CATEGORIAS.find(x => x.value === c)?.label ?? c; }
function catCor(c: Categoria)   { return CATEGORIAS.find(x => x.value === c)?.cor ?? "#6b7280"; }
function categoriaDeAcesso(acesso: string | null): Categoria {
  const m: Record<string, Categoria> = { mentoria: "club_bw", livro: "livro", ambos: "seja_incomum", seja_incomum: "seja_incomum", club_bw: "club_bw" };
  return (acesso && m[acesso]) ? m[acesso] : "outro";
}
function iniciais(nome: string) { return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(); }
function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}
function fmtBRL(n: number) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); }

const FORM_VAZIO = {
  tipo: "entrada" as TipoLanc,
  valor: "",
  descricao: "",
  data: new Date().toISOString().split("T")[0],
  categoria: "outro" as Categoria,
  observacoes: "",
  mentorada_id: null as string | null,
  numero_parcela: "",
  valor_negociado: "",
  total_parcelas_neg: "",
  forma_pagamento_neg: "pix",
  anotacoes_negociacao: "",
  atualizar_negociacao: false,
};

export default function FinanceiroAdmin() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [mentoradas,  setMentoradas]  = useState<Mentoranda[]>([]);
  const [carregando,  setCarregando]  = useState(true);
  const [formAberto,  setFormAberto]  = useState(false);
  const [editandoId,  setEditandoId]  = useState<string | null>(null);
  const [form,        setForm]        = useState(FORM_VAZIO);
  const [alunaSel,    setAlunaSel]    = useState<Mentoranda | null>(null);
  const [buscaAluna,  setBuscaAluna]  = useState("");
  const [dropdown,    setDropdown]    = useState(false);
  const [salvando,    setSalvando]    = useState(false);
  const [erro,        setErro]        = useState<string | null>(null);
  const [filtroTipo,  setFiltroTipo]  = useState<"todos" | TipoLanc>("todos");
  const [filtroCat,   setFiltroCat]   = useState<Categoria | "todas">("todas");
  const [filtroAluna, setFiltroAluna] = useState<string>("todas");
  const [resumoAberto,setResumoAberto]= useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function abrirForm(l?: Lancamento) {
    setErro(null);
    if (l) {
      setEditandoId(l.id);
      const m = l.mentorada ?? null;
      setAlunaSel(m ? {
        id: m.id, nome: m.nome, email: m.email, cor: m.cor || "#C9A84C",
        acesso: null, valor_negociado: m.valor_negociado, total_parcelas: m.total_parcelas,
        forma_pagamento: m.forma_pagamento, anotacoes_negociacao: m.anotacoes_negociacao,
      } : null);
      setBuscaAluna("");
      setForm({
        tipo: l.tipo, valor: String(l.valor), descricao: l.descricao,
        data: l.data, categoria: l.categoria, observacoes: l.observacoes ?? "",
        mentorada_id: l.mentorada_id,
        numero_parcela: l.numero_parcela != null ? String(l.numero_parcela) : "",
        valor_negociado: m?.valor_negociado ? String(m.valor_negociado) : "",
        total_parcelas_neg: m?.total_parcelas ? String(m.total_parcelas) : "",
        forma_pagamento_neg: m?.forma_pagamento ?? "pix",
        anotacoes_negociacao: m?.anotacoes_negociacao ?? "",
        atualizar_negociacao: false,
      });
    } else {
      setEditandoId(null);
      setAlunaSel(null);
      setBuscaAluna("");
      setForm(FORM_VAZIO);
    }
    setDropdown(false);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEditandoId(null);
    setAlunaSel(null);
    setBuscaAluna("");
    setErro(null);
  }

  function selecionarAluna(m: Mentoranda) {
    setAlunaSel(m);
    setBuscaAluna("");
    setDropdown(false);
    const jaTemNeg = !!(m.valor_negociado);
    setForm(f => ({
      ...f,
      mentorada_id: m.id,
      categoria: categoriaDeAcesso(m.acesso),
      valor_negociado: m.valor_negociado ? String(m.valor_negociado) : "",
      total_parcelas_neg: m.total_parcelas ? String(m.total_parcelas) : "",
      forma_pagamento_neg: m.forma_pagamento ?? "pix",
      anotacoes_negociacao: m.anotacoes_negociacao ?? "",
      atualizar_negociacao: !jaTemNeg,
      descricao: f.descricao || `Pagamento — ${m.nome}`,
    }));
  }

  function limparAluna() {
    setAlunaSel(null);
    setBuscaAluna("");
    setForm(f => ({ ...f, mentorada_id: null, numero_parcela: "", valor_negociado: "", total_parcelas_neg: "", atualizar_negociacao: false }));
  }

  async function salvar() {
    if (!form.descricao.trim() || !form.valor) { setErro("Preencha descrição e valor."); return; }
    setSalvando(true);
    setErro(null);

    const payload = {
      tipo: form.tipo,
      valor: parseFloat(String(form.valor).replace(",", ".")),
      descricao: form.descricao,
      data: form.data,
      categoria: form.categoria,
      observacoes: form.observacoes || null,
      mentorada_id: form.mentorada_id,
      numero_parcela: form.numero_parcela ? parseInt(form.numero_parcela) : null,
      atualizar_negociacao: form.atualizar_negociacao,
      valor_negociado: form.valor_negociado ? parseFloat(String(form.valor_negociado).replace(",", ".")) : null,
      total_parcelas: form.total_parcelas_neg ? parseInt(form.total_parcelas_neg) : null,
      forma_pagamento: form.forma_pagamento_neg || null,
      anotacoes_negociacao: form.anotacoes_negociacao || null,
    };

    const url    = "/api/financeiro";
    const method = editandoId ? "PATCH" : "POST";
    const body   = editandoId ? { id: editandoId, ...payload } : payload;

    const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();

    if (data?.error) { setErro(data.error); setSalvando(false); return; }

    // Reload to get enriched data
    const updated = await fetch("/api/financeiro").then(r => r.json());
    setLancamentos(Array.isArray(updated) ? updated : []);

    // Refresh mentoradas (negotiation may have changed)
    if (form.atualizar_negociacao) {
      const ments = await fetch("/api/mentoradas").then(r => r.json());
      setMentoradas(Array.isArray(ments) ? ments : []);
    }

    fecharForm();
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    await fetch(`/api/financeiro?id=${id}`, { method: "DELETE" });
    setLancamentos(prev => prev.filter(l => l.id !== id));
  }

  // Filter
  const filtrados = lancamentos.filter(l => {
    if (filtroTipo  !== "todos"  && l.tipo      !== filtroTipo)  return false;
    if (filtroCat   !== "todas"  && l.categoria !== filtroCat)   return false;
    if (filtroAluna !== "todas"  && l.mentorada_id !== filtroAluna) return false;
    return true;
  });

  // Stats
  const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((s, l) => s + l.valor, 0);
  const totalSaidas   = lancamentos.filter(l => l.tipo === "saida").reduce((s, l) => s + l.valor, 0);
  const saldo         = totalEntradas - totalSaidas;

  // Resumo por aluna
  const resumoPorAluna = (() => {
    const map = new Map<string, { aluna: LancAluna; recebido: number; contagem: number }>();
    lancamentos.forEach(l => {
      if (!l.mentorada_id || !l.mentorada) return;
      const cur = map.get(l.mentorada_id);
      if (!cur) {
        map.set(l.mentorada_id, { aluna: l.mentorada, recebido: l.tipo === "entrada" ? l.valor : 0, contagem: l.tipo === "entrada" ? 1 : 0 });
      } else {
        if (l.tipo === "entrada") { cur.recebido += l.valor; cur.contagem += 1; }
      }
    });
    return [...map.values()].sort((a, b) => b.recebido - a.recebido);
  })();

  // Alunas com lançamentos (for filter dropdown)
  const alunasFiltro = resumoPorAluna.map(r => r.aluna);

  // Student search options
  const alunasBusca = mentoradas
    .filter(m => m.nome.toLowerCase().includes(buscaAluna.toLowerCase()))
    .slice(0, 8);

  const totalParcelas = alunaSel?.total_parcelas ?? (form.total_parcelas_neg ? parseInt(form.total_parcelas_neg) : 0);
  const mostrarParcela = totalParcelas > 1;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando financeiro...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <TrendingUp size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Visão Financeira</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Entradas, saídas e negociações — vinculadas ao cadastro de cada aluna.</p>
        </div>
        <button className="btn-gold" onClick={() => abrirForm()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Novo Lançamento
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Saldo",           value: saldo,        cor: saldo >= 0 ? "#86efac" : "#fca5a5", icon: <TrendingUp size={13} /> },
          { label: "Total Entradas",  value: totalEntradas,cor: "#86efac",                          icon: <ArrowDownLeft size={13} /> },
          { label: "Total Saídas",    value: totalSaidas,  cor: "#fca5a5",                          icon: <ArrowUpRight size={13} /> },
          { label: "Alunas vinculadas", value: resumoPorAluna.length, cor: "var(--gold)", isCount: true, icon: <span style={{ fontSize: 13 }}>👤</span> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <span style={{ color: s.cor }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.cor, margin: 0 }}>
              {(s as { isCount?: boolean }).isCount ? s.value : `R$ ${fmtBRL(s.value as number)}`}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["todos", "entrada", "saida"] as const).map(f => (
            <button key={f} onClick={() => setFiltroTipo(f)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroTipo === f ? "var(--gold-border)" : "var(--border)"}`, background: filtroTipo === f ? "var(--gold-light)" : "transparent", color: filtroTipo === f ? "var(--gold)" : "var(--text-muted)", fontWeight: filtroTipo === f ? 700 : 400 }}>
              {f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setFiltroCat("todas")} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroCat === "todas" ? "var(--gold-border)" : "var(--border)"}`, background: filtroCat === "todas" ? "var(--gold-light)" : "transparent", color: filtroCat === "todas" ? "var(--gold)" : "var(--text-muted)", fontWeight: filtroCat === "todas" ? 700 : 400 }}>
            Todos produtos
          </button>
          {CATEGORIAS.map(c => (
            <button key={c.value} onClick={() => setFiltroCat(c.value)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtroCat === c.value ? c.cor + "80" : "var(--border)"}`, background: filtroCat === c.value ? c.cor + "18" : "transparent", color: filtroCat === c.value ? c.cor : "var(--text-muted)", fontWeight: filtroCat === c.value ? 700 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
        {alunasFiltro.length > 0 && (
          <select value={filtroAluna} onChange={e => setFiltroAluna(e.target.value)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${filtroAluna !== "todas" ? "var(--gold-border)" : "var(--border)"}`, background: filtroAluna !== "todas" ? "var(--gold-light)" : "var(--bg-input)", color: filtroAluna !== "todas" ? "var(--gold)" : "var(--text-muted)", cursor: "pointer" }}>
            <option value="todas">Todas as alunas</option>
            {alunasFiltro.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        )}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <SlidersHorizontal size={28} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhum lançamento</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Clique em "Novo Lançamento" para começar.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 56px 120px 68px 60px", gap: 10, padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
            {["Data", "Aluna · Descrição", "Produto", "Nº", "Valor", "Tipo", ""].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {filtrados.map((l, i) => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 56px 120px 68px 60px", gap: 10, padding: "13px 18px", alignItems: "center", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-input)", borderBottom: i < filtrados.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatData(l.data)}</span>
              <div style={{ minWidth: 0 }}>
                {l.mentorada && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: (l.mentorada.cor || "#C9A84C") + "25", color: l.mentorada.cor || "#C9A84C", fontSize: 7, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {iniciais(l.mentorada.nome)}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: l.mentorada.cor || "var(--gold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.mentorada.nome}</span>
                  </div>
                )}
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.descricao}</p>
                {l.observacoes && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.observacoes}</p>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: catCor(l.categoria) + "18", color: catCor(l.categoria), whiteSpace: "nowrap" }}>
                {catLabel(l.categoria)}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                {l.numero_parcela != null
                  ? <span style={{ fontWeight: 700, color: "var(--text)" }}>{l.numero_parcela}{l.mentorada?.total_parcelas ? `/${l.mentorada.total_parcelas}` : ""}</span>
                  : <span style={{ opacity: 0.3 }}>—</span>
                }
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: l.tipo === "entrada" ? "#86efac" : "#fca5a5" }}>
                {l.tipo === "entrada" ? "+" : "−"} R$ {fmtBRL(l.valor)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: l.tipo === "entrada" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)", color: l.tipo === "entrada" ? "#86efac" : "#fca5a5", whiteSpace: "nowrap" }}>
                {l.tipo === "entrada" ? <ArrowDownLeft size={9} /> : <ArrowUpRight size={9} />}
                {l.tipo === "entrada" ? "Entrada" : "Saída"}
              </span>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <button onClick={() => abrirForm(l)} title="Editar" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => excluir(l.id)} title="Excluir" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumo por aluna */}
      {resumoPorAluna.length > 0 && (
        <div className="card" style={{ padding: "18px 20px", marginTop: 20 }}>
          <button onClick={() => setResumoAberto(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>💳</span> Negociações por Aluna
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>({resumoPorAluna.length} alunas)</span>
            </span>
            {resumoAberto ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
          </button>
          {resumoAberto && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {resumoPorAluna.map(({ aluna, recebido, contagem }) => {
                const negociado = aluna.valor_negociado ?? 0;
                const pct = negociado > 0 ? Math.min(100, (recebido / negociado) * 100) : 0;
                const parcTotal = aluna.total_parcelas ?? 0;
                return (
                  <div key={aluna.id} style={{ padding: "12px 16px", background: "var(--bg-input)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: negociado > 0 ? 10 : 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: (aluna.cor || "#C9A84C") + "25", color: aluna.cor || "#C9A84C", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {iniciais(aluna.nome)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{aluna.nome}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{aluna.email}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: "#86efac", margin: 0 }}>R$ {fmtBRL(recebido)}</p>
                        {negociado > 0 && (
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                            de R$ {fmtBRL(negociado)} negociado
                          </p>
                        )}
                        {parcTotal > 1 && (
                          <p style={{ fontSize: 11, color: "var(--gold)", margin: "2px 0 0", fontWeight: 700 }}>
                            {contagem}/{parcTotal} parcelas pagas
                          </p>
                        )}
                        {parcTotal <= 1 && contagem > 0 && (
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                            {contagem} pagamento{contagem > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    {negociado > 0 && (
                      <div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#86efac" : "var(--gold)", borderRadius: 99, transition: "width 0.4s" }} />
                        </div>
                        {aluna.anotacoes_negociacao && (
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0", fontStyle: "italic" }}>
                            {aluna.anotacoes_negociacao}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {formAberto && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16, background: "rgba(0,0,0,0.85)", overflowY: "auto" }} onClick={fecharForm}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: 24, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {editandoId ? "Editar Lançamento" : "Novo Lançamento"}
              </h2>
              <button onClick={fecharForm} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Tipo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["entrada", "saida"] as TipoLanc[]).map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })} style={{ padding: 10, borderRadius: 8, cursor: "pointer", border: `1px solid ${form.tipo === t ? (t === "entrada" ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)") : "var(--border)"}`, background: form.tipo === t ? (t === "entrada" ? "rgba(134,239,172,0.1)" : "rgba(252,165,165,0.1)") : "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: form.tipo === t ? 700 : 400, color: form.tipo === t ? (t === "entrada" ? "#86efac" : "#fca5a5") : "var(--text-muted)" }}>
                    {t === "entrada" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    {t === "entrada" ? "Entrada" : "Saída"}
                  </button>
                ))}
              </div>

              {/* Vincular aluna */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Aluna (opcional)</label>
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  {alunaSel ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg-input)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: (alunaSel.cor || "#C9A84C") + "25", color: alunaSel.cor || "#C9A84C", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {iniciais(alunaSel.nome)}
                      </div>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{alunaSel.nome}</span>
                      <button type="button" onClick={limparAluna} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={14} /></button>
                    </div>
                  ) : (
                    <input
                      value={buscaAluna}
                      onChange={e => { setBuscaAluna(e.target.value); setDropdown(true); }}
                      onFocus={() => setDropdown(true)}
                      placeholder="Buscar pelo nome da aluna..."
                      style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}
                    />
                  )}
                  {dropdown && !alunaSel && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, zIndex: 100, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                      {alunasBusca.length === 0 ? (
                        <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Nenhuma aluna encontrada</p>
                      ) : alunasBusca.map(m => (
                        <button key={m.id} type="button" onClick={() => selecionarAluna(m)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: (m.cor || "#C9A84C") + "25", color: m.cor || "#C9A84C", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {iniciais(m.nome)}
                          </div>
                          <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--text)" }}>{m.nome}</p>
                            <p style={{ fontSize: 11, margin: 0, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
                          </div>
                          {(m.valor_negociado ?? 0) > 0 && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>R$ {fmtBRL(m.valor_negociado!)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Negociação (quando aluna selecionada) */}
              {alunaSel && (
                <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Negociação</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>
                      <input type="checkbox" checked={form.atualizar_negociacao} onChange={e => setForm({ ...form, atualizar_negociacao: e.target.checked })} />
                      Atualizar cadastro da aluna
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Valor total negociado (R$)</label>
                      <input value={form.valor_negociado} onChange={e => setForm({ ...form, valor_negociado: e.target.value })} placeholder="0,00" style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Nº parcelas</label>
                      <input value={form.total_parcelas_neg} onChange={e => setForm({ ...form, total_parcelas_neg: e.target.value })} placeholder="1" type="number" min="1" style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Forma de pagamento</label>
                      <select value={form.forma_pagamento_neg} onChange={e => setForm({ ...form, forma_pagamento_neg: e.target.value })} style={{ width: "100%", padding: "7px 10px", fontSize: 12, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)" }}>
                        {FORMAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {mostrarParcela && (
                    <div style={{ marginTop: 8 }}>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                        Esta é a parcela nº (de {alunaSel.total_parcelas ?? form.total_parcelas_neg})
                      </label>
                      <input value={form.numero_parcela} onChange={e => setForm({ ...form, numero_parcela: e.target.value })} placeholder={`1 a ${alunaSel.total_parcelas ?? form.total_parcelas_neg}`} type="number" min="1" style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} />
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Anotações da negociação</label>
                    <textarea value={form.anotacoes_negociacao} onChange={e => setForm({ ...form, anotacoes_negociacao: e.target.value })} rows={2} placeholder="Acordos especiais, condições, etc." style={{ width: "100%", padding: "7px 10px", fontSize: 12, resize: "vertical" }} />
                  </div>
                </div>
              )}

              {/* Descrição */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição *</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Pagamento Club BW — Ana Paula" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
              </div>

              {/* Valor + Data */}
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

              {/* Categoria */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Produto / Categoria</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIAS.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, categoria: c.value })} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${form.categoria === c.value ? c.cor + "80" : "var(--border)"}`, background: form.categoria === c.value ? c.cor + "18" : "transparent", color: form.categoria === c.value ? c.cor : "var(--text-muted)", fontWeight: form.categoria === c.value ? 700 : 400 }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} placeholder="Opcional..." style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
              </div>

              {/* Erro */}
              {erro && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", background: "rgba(252,165,165,0.1)", border: "1px solid rgba(252,165,165,0.25)", borderRadius: 8 }}>
                  <AlertCircle size={13} style={{ color: "#fca5a5", flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "#fca5a5", margin: 0 }}>{erro}</p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn-ghost" onClick={fecharForm}>Cancelar</button>
              <button className="btn-gold" onClick={salvar} disabled={!form.descricao || !form.valor || salvando}>
                {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
