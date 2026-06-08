"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart, Plus, X, MessageCircle, Instagram, Trash2,
  CheckCircle2, ChevronDown, ChevronUp, Pencil, Loader2, Mail,
  Sunrise, Upload, ImageIcon, Video, ListChecks, CheckSquare,
} from "lucide-react";
import ProdutosAcesso from "@/components/ProdutosAcesso";
import { supabase } from "@/lib/supabase";

type StatusAcesso = "ativo" | "encerrado" | "cancelado";
type AbaCard = "info" | "sessoes" | "plano" | "tarefas" | "inicio";

interface SessaoItem { id: string; data: string; horario: string | null; duracao: string; status: string; link_meet: string | null; }
interface MarcoItem  { id: string; texto: string; feito: boolean; semana: string; }
interface PlanoItem  { id: string; mentorada_nome: string; mentorada_id: string | null; marcos: MarcoItem[]; }
interface TarefaItem { id: string; titulo: string; tipo: string | null; status: string; descricao: string | null; data_entrega: string | null; }
interface CardDados  { sessoes?: SessaoItem[]; plano?: PlanoItem | null; tarefas?: TarefaItem[]; carregandoAba: "sessoes" | "plano" | "tarefas" | null; }

interface Compradora {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  data_compra: string;
  status_acesso: StatusAcesso;
  mes_inicio: string | null;
  mes_fim: string | null;
  notas: string | null;
  status_pagamento: string;
  valor: number | null;
  forma_pagamento: string | null;
}

const statusCfg: Record<StatusAcesso, { label: string; cor: string; bg: string }> = {
  ativo:     { label: "Ativa",     cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
  encerrado: { label: "Encerrada", cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  cancelado: { label: "Cancelada", cor: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

const PG_CFG: Record<string, { label: string; cor: string; bg: string }> = {
  pago:     { label: "Pago",     cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
  parcial:  { label: "Parcial",  cor: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  pendente: { label: "Pendente", cor: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  isento:   { label: "Isento",   cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

function PgBadge({ status, valor }: { status: string; valor: number | null }) {
  const pg = PG_CFG[status] ?? PG_CFG.pendente;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700, color: pg.cor, background: pg.bg, flexShrink: 0, whiteSpace: "nowrap" }}>
      {pg.label}{valor != null ? ` · R$${Number(valor).toFixed(0)}` : ""}
    </span>
  );
}

function formatData(iso: string | null) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)-1]}`;
}

const FORM_VAZIO: Omit<Compradora, "id"> = {
  nome: "", email: null, whatsapp: null, instagram: null,
  data_compra: new Date().toISOString().split("T")[0],
  status_acesso: "ativo",
  mes_inicio: null, mes_fim: null, notas: null,
  status_pagamento: "pendente", valor: null, forma_pagamento: null,
};

const PRODUTOS_OPCOES = [
  { key: "seja_incomum", label: "Seja Incomum",      cor: "#C9A84C" },
  { key: "club_bw",      label: "Club BW",           cor: "#a78bfa" },
  { key: "box_livro",    label: "Box do Livro",       cor: "#86efac" },
  { key: "evento",       label: "Simplesmente Seja",  cor: "#fb923c" },
] as const;

type AvisoAcesso = { nome: string; email: string; conviteEnviado: boolean; mensagem: string; linkAcesso?: string; slug?: string };

interface MeuInicioData {
  foto_inicio: string | null;
  foto_atual: string | null;
  mensagem: string | null;
}

export default function ClubBWCompradores() {
  const [compradoras, setCompradoras] = useState<Compradora[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Omit<Compradora, "id">>(FORM_VAZIO);
  const [formProdutos, setFormProdutos] = useState<string[]>(["club_bw"]);
  const [showForm, setShowForm] = useState(false);
  const [detalhe, setDetalhe] = useState<Compradora | null>(null);
  const [editando, setEditando] = useState<Compradora | null>(null);
  const [filtro, setFiltro] = useState<StatusAcesso | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [avisoAcesso, setAvisoAcesso] = useState<AvisoAcesso | null>(null);

  // Meu Começo
  const [meuInicio, setMeuInicio] = useState<Record<string, MeuInicioData>>({});
  const [editandoInicio, setEditandoInicio] = useState<string | null>(null);
  const [inicioForm, setInicioForm] = useState<MeuInicioData>({ foto_inicio: null, foto_atual: null, mensagem: null });
  const [uploadandoInicio, setUploadandoInicio] = useState(false);
  const [salvandoInicio, setSalvandoInicio] = useState(false);
  const fileInicioRef = useRef<HTMLInputElement>(null);
  const fileAtualRef = useRef<HTMLInputElement>(null);
  const [tokenAdmin, setTokenAdmin] = useState<string | null>(null);

  // Abas por card + cache de dados
  const [abaCard, setAbaCard] = useState<AbaCard>("info");
  const [cardDados, setCardDados] = useState<Record<string, CardDados>>({});

  // Ações Rápidas
  const [acaoAberta, setAcaoAberta] = useState<{ id: string; tipo: "sessao" | "plano" | "tarefa" } | null>(null);
  const [sessaoForm, setSessaoForm] = useState({ data: "", horario: "", duracao: "60 min", link_meet: "" });
  const [tarefaForm, setTarefaForm] = useState({ titulo: "", tipo: "acao", descricao: "", data_entrega: "" });
  const [salvandoAcao, setSalvandoAcao] = useState(false);
  const [feedbackAcao, setFeedbackAcao] = useState<string | null>(null);

  useEffect(() => { setAbaCard("info"); setAcaoAberta(null); }, [detalhe?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setTokenAdmin(session.access_token);
    });
    fetch("/api/club-bw")
      .then(r => r.json())
      .then(d => { setCompradoras(Array.isArray(d) ? d : []); setCarregando(false); });
  }, []);

  async function carregarMeuInicio(mentoradaId: string) {
    if (meuInicio[mentoradaId] !== undefined) return;
    if (!tokenAdmin) return;
    const res = await fetch(`/api/meu-inicio?mentorada_id=${mentoradaId}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const data = res.ok ? await res.json() : null;
    setMeuInicio(prev => ({ ...prev, [mentoradaId]: data ?? { foto_inicio: null, foto_atual: null, mensagem: null } }));
  }

  async function uploadFoto(file: File, campo: "foto_inicio" | "foto_atual") {
    if (!tokenAdmin) return;
    setUploadandoInicio(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("pasta", "fotos");
    const res = await fetch("/api/upload-foto", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: fd,
    });
    setUploadandoInicio(false);
    if (!res.ok) return;
    const { url } = await res.json();
    setInicioForm(prev => ({ ...prev, [campo]: url }));
  }

  async function salvarMeuInicio(mentoradaId: string) {
    if (!tokenAdmin) return;
    setSalvandoInicio(true);
    const res = await fetch("/api/meu-inicio", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ mentorada_id: mentoradaId, ...inicioForm }),
    });
    if (res.ok) {
      const data = await res.json();
      setMeuInicio(prev => ({ ...prev, [mentoradaId]: data }));
    }
    setEditandoInicio(null);
    setSalvandoInicio(false);
  }

  async function carregarAba(c: Compradora, aba: "sessoes" | "plano" | "tarefas") {
    const existing = cardDados[c.id];
    if (existing?.carregandoAba === aba) return;
    if (aba === "sessoes" && existing?.sessoes !== undefined) return;
    if (aba === "plano" && existing && "plano" in existing) return;
    if (aba === "tarefas" && existing?.tarefas !== undefined) return;
    setCardDados(prev => ({ ...prev, [c.id]: { ...(prev[c.id] ?? { carregandoAba: null }), carregandoAba: aba } }));
    try {
      if (aba === "sessoes") {
        const url = c.email ? `/api/sessoes?email=${encodeURIComponent(c.email)}` : `/api/sessoes`;
        const res = await fetch(url);
        const sessoes: SessaoItem[] = res.ok ? await res.json() : [];
        setCardDados(prev => ({ ...prev, [c.id]: { ...(prev[c.id] ?? { carregandoAba: null }), sessoes, carregandoAba: null } }));
      } else if (aba === "plano") {
        const res = await fetch(`/api/planos?mentorada_nome=${encodeURIComponent(c.nome)}`);
        const planos: PlanoItem[] = res.ok ? await res.json() : [];
        setCardDados(prev => ({ ...prev, [c.id]: { ...(prev[c.id] ?? { carregandoAba: null }), plano: planos[0] ?? null, carregandoAba: null } }));
      } else {
        const res = await fetch(`/api/tarefas?mentorada_nome=${encodeURIComponent(c.nome)}`);
        const tarefas: TarefaItem[] = res.ok ? await res.json() : [];
        setCardDados(prev => ({ ...prev, [c.id]: { ...(prev[c.id] ?? { carregandoAba: null }), tarefas, carregandoAba: null } }));
      }
    } catch {
      setCardDados(prev => ({ ...prev, [c.id]: { ...(prev[c.id] ?? { carregandoAba: null }), carregandoAba: null } }));
    }
  }

  async function criarSessao(c: Compradora) {
    if (!sessaoForm.data || salvandoAcao) return;
    setSalvandoAcao(true);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_nome: c.nome,
        email: c.email ?? undefined,
        data: sessaoForm.data,
        horario: sessaoForm.horario || null,
        duracao: sessaoForm.duracao,
        link_meet: sessaoForm.link_meet || null,
        status: "agendada",
        cor: "#a78bfa",
      }),
    });
    const nova: SessaoItem = res.ok ? await res.json() : null;
    setSalvandoAcao(false);
    setAcaoAberta(null);
    setSessaoForm({ data: "", horario: "", duracao: "60 min", link_meet: "" });
    if (nova?.id) setCardDados(prev => { const cur = prev[c.id] ?? { carregandoAba: null }; return { ...prev, [c.id]: { ...cur, sessoes: [nova, ...(cur.sessoes ?? [])] } }; });
    setFeedbackAcao(`Sessão criada para ${c.nome}!`);
    setTimeout(() => setFeedbackAcao(null), 4000);
  }

  async function criarPlano(c: Compradora) {
    if (salvandoAcao) return;
    setSalvandoAcao(true);
    const res = await fetch("/api/planos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorada_nome: c.nome, email: c.email ?? undefined, marcos: [] }),
    });
    const novo: PlanoItem = res.ok ? await res.json() : null;
    setSalvandoAcao(false);
    setAcaoAberta(null);
    if (novo?.id) setCardDados(prev => { const cur = prev[c.id] ?? { carregandoAba: null }; return { ...prev, [c.id]: { ...cur, plano: novo } }; });
    setFeedbackAcao(`Plano de ação criado para ${c.nome}!`);
    setTimeout(() => setFeedbackAcao(null), 4000);
  }

  async function criarTarefa(c: Compradora) {
    if (!tarefaForm.titulo.trim() || salvandoAcao) return;
    setSalvandoAcao(true);
    const res = await fetch("/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_nome: c.nome,
        email: c.email ?? undefined,
        titulo: tarefaForm.titulo.trim(),
        tipo: tarefaForm.tipo,
        descricao: tarefaForm.descricao || null,
        data_entrega: tarefaForm.data_entrega || null,
      }),
    });
    const nova: TarefaItem = res.ok ? await res.json() : null;
    setSalvandoAcao(false);
    setAcaoAberta(null);
    setTarefaForm({ titulo: "", tipo: "acao", descricao: "", data_entrega: "" });
    if (nova?.id) setCardDados(prev => { const cur = prev[c.id] ?? { carregandoAba: null }; return { ...prev, [c.id]: { ...cur, tarefas: [nova, ...(cur.tarefas ?? [])] } }; });
    setFeedbackAcao(`Tarefa criada para ${c.nome}!`);
    setTimeout(() => setFeedbackAcao(null), 4000);
  }

  function toggleProduto(key: string) {
    setFormProdutos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  async function adicionar() {
    if (!form.nome.trim() || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/club-bw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dataCompra: form.data_compra,
        statusAcesso: form.status_acesso,
        mesInicio: form.mes_inicio,
        mesFim: form.mes_fim,
        statusPagamento: form.status_pagamento,
        formaPagamento: form.forma_pagamento,
        produtos: formProdutos,
      }),
    });
    const nova = await res.json();
    if (nova?.id) {
      setCompradoras(prev => [nova, ...prev]);
      if (form.email) {
        setAvisoAcesso({
          nome: form.nome,
          email: form.email,
          conviteEnviado: nova._acesso?.conviteEnviado ?? false,
          mensagem: nova._acesso?.mensagem ?? "",
          linkAcesso: nova._acesso?.linkAcesso,
          slug: nova._acesso?.slug,
        });
      }
    }
    setForm(FORM_VAZIO);
    setFormProdutos(["club_bw"]);
    setShowForm(false);
    setSalvando(false);
  }

  async function salvarEdicao() {
    if (!editando || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/club-bw", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editando,
        dataCompra: editando.data_compra,
        statusAcesso: editando.status_acesso,
        mesInicio: editando.mes_inicio,
        mesFim: editando.mes_fim,
        statusPagamento: editando.status_pagamento,
        formaPagamento: editando.forma_pagamento,
      }),
    });
    const at = await res.json();
    if (at?.id) {
      setCompradoras(prev => prev.map(c => c.id === at.id ? at : c));
      if (detalhe?.id === at.id) setDetalhe(at);
    }
    setEditando(null);
    setSalvando(false);
  }

  async function atualizarStatus(id: string, status_acesso: StatusAcesso) {
    setCompradoras(prev => prev.map(c => c.id === id ? { ...c, status_acesso } : c));
    if (detalhe?.id === id) setDetalhe(d => d ? { ...d, status_acesso } : d);
    await fetch("/api/club-bw", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, statusAcesso: status_acesso }),
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta mentorada?")) return;
    await fetch(`/api/club-bw?id=${id}`, { method: "DELETE" });
    setCompradoras(prev => prev.filter(c => c.id !== id));
    setDetalhe(null);
  }

  const termo = busca.toLowerCase().trim();
  const filtradas = compradoras.filter(c =>
    (filtro === "todas" || c.status_acesso === filtro) &&
    (!termo || c.nome.toLowerCase().includes(termo) || c.email?.toLowerCase().includes(termo) || c.whatsapp?.includes(termo))
  );
  const ativas = compradoras.filter(c => c.status_acesso === "ativo").length;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Heart size={16} style={{ color: "#a78bfa" }} />
            <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Club BW</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Club BW — Cadastro</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{ativas} mentorada{ativas !== 1 ? "s" : ""} ativa{ativas !== 1 ? "s" : ""} no Club BW.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setShowForm(!showForm); setForm(FORM_VAZIO); }}>
          <Plus size={14} /> Nova Mentorada
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",    value: compradoras.length, cor: "#a78bfa" },
          { label: "Ativas",   value: ativas,             cor: "#86efac" },
          { label: "Encerradas/Canceladas", value: compradoras.filter(c => c.status_acesso === "encerrado" || c.status_acesso === "cancelado").length, cor: "#6b7280" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.cor, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: "1px solid rgba(167,139,250,0.3)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nova Mentorada</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome *</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>E-mail</label>
              <input type="email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value || null })} placeholder="email@exemplo.com" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WhatsApp</label>
              <input value={form.whatsapp ?? ""} onChange={e => setForm({ ...form, whatsapp: e.target.value || null })} placeholder="11999999999" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Instagram</label>
              <input value={form.instagram ?? ""} onChange={e => setForm({ ...form, instagram: e.target.value.replace("@","") || null })} placeholder="usuario (sem @)" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data da Compra</label>
              <input type="date" value={form.data_compra} onChange={e => setForm({ ...form, data_compra: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
              <select value={form.status_acesso} onChange={e => setForm({ ...form, status_acesso: e.target.value as StatusAcesso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="ativo">Ativa</option>
                <option value="encerrado">Encerrada</option>
                <option value="cancelado">Cancelada</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Início (mês)</label>
              <input type="month" value={form.mes_inicio ?? ""} onChange={e => setForm({ ...form, mes_inicio: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Fim (mês)</label>
              <input type="month" value={form.mes_fim ?? ""} onChange={e => setForm({ ...form, mes_fim: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status do Pagamento</label>
              <select value={form.status_pagamento} onChange={e => setForm({ ...form, status_pagamento: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="parcial">Parcial</option>
                <option value="isento">Isento</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Forma de Pagamento</label>
              <select value={form.forma_pagamento ?? ""} onChange={e => setForm({ ...form, forma_pagamento: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="">— selecione —</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor (R$)</label>
              <input type="number" min={0} step={0.01} value={form.valor ?? ""} onChange={e => setForm({ ...form, valor: e.target.value ? Number(e.target.value) : null })} placeholder="0,00" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas ?? ""} onChange={e => setForm({ ...form, notas: e.target.value || null })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} placeholder="Observações..." />
            </div>
            {form.email && (
              <div style={{ gridColumn: "1 / -1", padding: "14px 16px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                  Acesso ao portal
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>Club BW</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>será ativado</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, marginBottom: 0 }}>
                  Um convite será enviado automaticamente para <strong style={{ color: "var(--text)" }}>{form.email}</strong>
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end" style={{ marginTop: 14 }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-gold" onClick={adicionar} disabled={!form.nome.trim() || salvando}>
              {salvando ? "Enviando convite..." : "Salvar e enviar convite"}
            </button>
          </div>
        </div>
      )}

      {/* Aviso de acesso criado */}
      {avisoAcesso && (
        <div style={{ marginBottom: 20, padding: "16px 20px", background: "rgba(134,239,172,0.06)", border: "1px solid rgba(134,239,172,0.25)", borderRadius: 12, position: "relative" }}>
          <button onClick={() => setAvisoAcesso(null)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#86efac", margin: "0 0 4px" }}>
                {avisoAcesso.nome} cadastrada com sucesso!
              </p>
              <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 10px" }}>
                {avisoAcesso.conviteEnviado
                  ? `Convite enviado para ${avisoAcesso.email}.`
                  : avisoAcesso.mensagem}
              </p>
              {avisoAcesso.linkAcesso && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ padding: "10px 14px", background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.25)", borderRadius: 8, marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#86efac", margin: "0 0 6px" }}>🔗 Link exclusivo da aluna:</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ flex: 1, fontSize: 11, background: "rgba(0,0,0,0.3)", padding: "5px 10px", borderRadius: 6, color: "var(--text)", wordBreak: "break-all" }}>{avisoAcesso.linkAcesso}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(avisoAcesso.linkAcesso!)}
                        style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 6, background: "rgba(134,239,172,0.15)", border: "1px solid rgba(134,239,172,0.3)", color: "#86efac", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                      >Copiar</button>
                    </div>
                  </div>
                  {avisoAcesso.conviteEnviado ? (
                    <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", margin: "0 0 4px" }}>⚠️ Avise sua aluna:</p>
                      <p style={{ fontSize: 12, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                        Ela receberá um e-mail da <strong>Supabase</strong> (remetente: <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>noreply@mail.app.supabase.io</code>) com o link para definir a senha. Você também pode enviar o link acima diretamente.
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", margin: "0 0 4px" }}>ℹ️ Aluna já cadastrada:</p>
                      <p style={{ fontSize: 12, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                        O e-mail automático não foi reenviado pois ela já possui conta. Copie o link acima e envie direto para ela pelo WhatsApp ou Instagram.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback ação rápida */}
      {feedbackAcao && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 20px", background: "rgba(134,239,172,0.15)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, pointerEvents: "none", backdropFilter: "blur(8px)" }}>
          <CheckCircle2 size={14} style={{ color: "#86efac", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#86efac", whiteSpace: "nowrap" }}>{feedbackAcao}</span>
        </div>
      )}

      {/* Busca + Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
          style={{ flex: "1 1 220px", padding: "8px 12px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
        />
        {(["todas", "ativo", "encerrado", "cancelado"] as const).map(f => {
          const cfg = f === "todas" ? null : statusCfg[f];
          return (
            <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtro === f ? (cfg?.cor ?? "#a78bfa") + "80" : "var(--border)"}`, background: filtro === f ? (cfg?.bg ?? "rgba(167,139,250,0.12)") : "transparent", color: filtro === f ? (cfg?.cor ?? "#a78bfa") : "var(--text-muted)", fontWeight: filtro === f ? 700 : 400 }}>
              {f === "todas" ? "Todas" : cfg!.label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <Heart size={28} style={{ color: "#a78bfa", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>{termo ? "Nenhuma mentorada encontrada para essa pesquisa." : "Nenhuma mentorada cadastrada ainda."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map(c => {
            const cfg = statusCfg[c.status_acesso];
            const aberto = detalhe?.id === c.id;
            return (
              <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }} onClick={() => { const abrindo = !aberto; setDetalhe(abrindo ? c : null); if (abrindo) carregarMeuInicio(c.id); }}>
                  <div className="avatar" style={{ width: 38, height: 38, background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontSize: 13, flexShrink: 0 }}>
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{c.nome}</p>
                    <div className="flex items-center gap-2" style={{ gap: 8 }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatData(c.data_compra)}</span>
                      {c.mes_inicio && c.mes_fim && (
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                          {c.mes_inicio.slice(0,7)} → {c.mes_fim.slice(0,7)}
                        </span>
                      )}
                      {c.email && <span style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{c.email}</span>}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, color: cfg.cor, background: cfg.bg, flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                  <PgBadge status={c.status_pagamento} valor={c.valor} />
                  {aberto ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                </div>

                {aberto && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "18px 20px", background: "var(--bg)" }}>
                    {editando?.id === c.id ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome</label>
                          <input value={editando.nome} onChange={e => setEditando({ ...editando, nome: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>E-mail</label>
                          <input type="email" value={editando.email ?? ""} onChange={e => setEditando({ ...editando, email: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WhatsApp</label>
                          <input value={editando.whatsapp ?? ""} onChange={e => setEditando({ ...editando, whatsapp: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Instagram</label>
                          <input value={editando.instagram ?? ""} onChange={e => setEditando({ ...editando, instagram: e.target.value.replace("@","") || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
                          <select value={editando.status_acesso} onChange={e => setEditando({ ...editando, status_acesso: e.target.value as StatusAcesso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                            <option value="ativo">Ativa</option>
                            <option value="pendente">Pendente</option>
                            <option value="inativo">Inativa</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Início</label>
                          <input type="month" value={editando.mes_inicio ?? ""} onChange={e => setEditando({ ...editando, mes_inicio: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Fim</label>
                          <input type="month" value={editando.mes_fim ?? ""} onChange={e => setEditando({ ...editando, mes_fim: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status do Pagamento</label>
                          <select value={editando.status_pagamento} onChange={e => setEditando({ ...editando, status_pagamento: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="parcial">Parcial</option>
                            <option value="isento">Isento</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Forma de Pagamento</label>
                          <select value={editando.forma_pagamento ?? ""} onChange={e => setEditando({ ...editando, forma_pagamento: e.target.value || null })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                            <option value="">— selecione —</option>
                            <option value="pix">PIX</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="boleto">Boleto</option>
                            <option value="transferencia">Transferência</option>
                            <option value="cortesia">Cortesia</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor (R$)</label>
                          <input type="number" min={0} step={0.01} value={editando.valor ?? ""} onChange={e => setEditando({ ...editando, valor: e.target.value ? Number(e.target.value) : null })} placeholder="0,00" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
                          <textarea value={editando.notas ?? ""} onChange={e => setEditando({ ...editando, notas: e.target.value || null })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditando(null)}>Cancelar</button>
                          <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvarEdicao} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Abas de navegação */}
                        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
                          {([
                            { key: "info" as AbaCard, label: "Perfil", icon: null },
                            { key: "sessoes" as AbaCard, label: "Sessões", icon: <Video size={10} /> },
                            { key: "plano" as AbaCard, label: "Plano", icon: <ListChecks size={10} /> },
                            { key: "tarefas" as AbaCard, label: "Tarefas", icon: <CheckSquare size={10} /> },
                            { key: "inicio" as AbaCard, label: "Meu Começo", icon: <Sunrise size={10} /> },
                          ]).map(({ key, label, icon }) => {
                            const isActive = abaCard === key;
                            const count = key === "sessoes" ? (cardDados[c.id]?.sessoes?.length ?? null) : key === "tarefas" ? (cardDados[c.id]?.tarefas?.length ?? null) : null;
                            const temPlano = key === "plano" && cardDados[c.id]?.plano != null;
                            return (
                              <button key={key}
                                onClick={() => { setAbaCard(key); if (key !== "info" && key !== "inicio") carregarAba(c, key); }}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", fontSize: 11, fontWeight: isActive ? 700 : 500, cursor: "pointer", border: "none", borderBottom: `2px solid ${isActive ? "var(--gold)" : "transparent"}`, background: "transparent", color: isActive ? "var(--gold)" : "var(--text-muted)", marginBottom: -1, whiteSpace: "nowrap" }}
                              >
                                {icon} {label}
                                {count != null && count > 0 && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 999, background: isActive ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.08)", color: isActive ? "var(--gold)" : "var(--text-muted)", fontWeight: 700 }}>{count}</span>}
                                {temPlano && <span style={{ fontSize: 9, color: "#86efac" }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aba: Perfil */}
                        {abaCard === "info" && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
                            <div>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contato</p>
                              <div className="flex flex-col gap-2" style={{ gap: 8 }}>
                                {c.email && <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gold)", textDecoration: "none" }}><Mail size={13} /> {c.email}</a>}
                                {c.whatsapp && <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#86efac", textDecoration: "none" }}><MessageCircle size={13} /> {c.whatsapp}</a>}
                                {c.instagram && <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c084fc", textDecoration: "none" }}><Instagram size={13} /> @{c.instagram}</a>}
                              </div>
                              {(c.mes_inicio || c.mes_fim) && <div style={{ marginTop: 12 }}><p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Período</p><p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0 }}>{c.mes_inicio ?? "—"} → {c.mes_fim ?? "—"}</p></div>}
                              {c.notas && <div style={{ marginTop: 12 }}><p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notas</p><p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{c.notas}</p></div>}
                            </div>
                            <div>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Status</p>
                              <div style={{ display: "flex", gap: 6 }}>
                                {(["ativo","encerrado","cancelado"] as StatusAcesso[]).map(s => {
                                  const sc = statusCfg[s]; const ativo = c.status_acesso === s;
                                  return <button key={s} onClick={() => atualizarStatus(c.id, s)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? sc.cor + "80" : "var(--border)"}`, background: ativo ? sc.bg : "transparent", color: ativo ? sc.cor : "var(--text-muted)", fontWeight: ativo ? 700 : 400 }}>{sc.label}</button>;
                                })}
                              </div>
                            </div>
                            <div>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Pagamento</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                {(() => {
                                  const pgCfg: Record<string, { label: string; cor: string; bg: string }> = { pago: { label: "Pago", cor: "#86efac", bg: "rgba(134,239,172,0.12)" }, parcial: { label: "Parcial", cor: "#fbbf24", bg: "rgba(251,191,36,0.12)" }, pendente: { label: "Pendente", cor: "#6b7280", bg: "rgba(107,114,128,0.12)" }, isento: { label: "Isento", cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" } };
                                  const pg = pgCfg[c.status_pagamento] ?? pgCfg.pendente;
                                  return (<><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: pg.cor, background: pg.bg }}>{pg.label}</span>{c.valor != null && <span style={{ fontSize: 12, color: "var(--text)" }}>R$ {Number(c.valor).toFixed(2).replace(".",",")}</span>}{c.forma_pagamento && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {c.forma_pagamento.replace("_"," ")}</span>}</>);
                                })()}
                              </div>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <ProdutosAcesso email={c.email} nome={c.nome} defaultProduto="club_bw" />
                            </div>
                          </div>
                        )}

                        {/* Aba: Meu Começo */}
                        {abaCard === "inicio" && (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Sunrise size={13} style={{ color: "#a78bfa" }} /><span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Meu Começo</span></div>
                              {editandoInicio !== c.id && (
                                <button onClick={() => { setEditandoInicio(c.id); setInicioForm(meuInicio[c.id] ?? { foto_inicio: null, foto_atual: null, mensagem: null }); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                                  <Pencil size={10} /> {meuInicio[c.id]?.foto_inicio ? "Editar" : "Adicionar"}
                                </button>
                              )}
                            </div>
                            {editandoInicio === c.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                  <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Foto do Começo (antes)</p>
                                    <input ref={fileInicioRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, "foto_inicio"); }} />
                                    <div onClick={() => fileInicioRef.current?.click()} style={{ width: "100%", aspectRatio: "1", borderRadius: 8, border: "1px dashed rgba(167,139,250,0.4)", background: inicioForm.foto_inicio ? "none" : "rgba(167,139,250,0.05)", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                      {inicioForm.foto_inicio ? <img src={inicioForm.foto_inicio} alt="início" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><Upload size={18} style={{ color: "#a78bfa", marginBottom: 4 }} /><p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Clique para subir</p></div>}
                                      {uploadandoInicio && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={20} style={{ color: "#a78bfa", animation: "spin 0.8s linear infinite" }} /></div>}
                                    </div>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Foto Atual (depois)</p>
                                    <input ref={fileAtualRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, "foto_atual"); }} />
                                    <div onClick={() => fileAtualRef.current?.click()} style={{ width: "100%", aspectRatio: "1", borderRadius: 8, border: "1px dashed rgba(167,139,250,0.4)", background: inicioForm.foto_atual ? "none" : "rgba(167,139,250,0.05)", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                      {inicioForm.foto_atual ? <img src={inicioForm.foto_atual} alt="atual" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><Upload size={18} style={{ color: "#a78bfa", marginBottom: 4 }} /><p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Clique para subir</p></div>}
                                      {uploadandoInicio && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={20} style={{ color: "#a78bfa", animation: "spin 0.8s linear infinite" }} /></div>}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>Mensagem para a mentorada</p>
                                  <textarea value={inicioForm.mensagem ?? ""} onChange={e => setInicioForm(prev => ({ ...prev, mensagem: e.target.value || null }))} rows={3} placeholder="Ex: Você entrou em [mês] com [desafio]. Olha até onde você chegou..." style={{ width: "100%", padding: "9px 12px", fontSize: 12, borderRadius: 8, resize: "vertical", background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }} />
                                </div>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setEditandoInicio(null)}>Cancelar</button>
                                  <button onClick={() => salvarMeuInicio(c.id)} disabled={salvandoInicio || uploadandoInicio} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                    {salvandoInicio ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : null} Salvar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              meuInicio[c.id]?.foto_inicio ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                  <div><p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Começo</p><img src={meuInicio[c.id].foto_inicio!} alt="foto início" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} /></div>
                                  <div><p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Atual</p>{meuInicio[c.id].foto_atual ? <img src={meuInicio[c.id].foto_atual!} alt="foto atual" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} /> : <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={18} style={{ color: "var(--text-muted)" }} /></div>}</div>
                                  {meuInicio[c.id].mensagem && <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: 12, color: "var(--text-soft)", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>&ldquo;{meuInicio[c.id].mensagem}&rdquo;</p></div>}
                                </div>
                              ) : <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Nenhuma foto adicionada ainda. Clique em &ldquo;Adicionar&rdquo; para registrar o começo desta mentorada.</p>
                            )}
                          </div>
                        )}

                        {/* Aba: Sessões */}
                        {abaCard === "sessoes" && (
                          <div>
                            {acaoAberta?.id === c.id && acaoAberta.tipo === "sessao" ? (
                              <div style={{ padding: "14px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Nova Sessão</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data *</label><input type="date" value={sessaoForm.data} onChange={e => setSessaoForm(p => ({ ...p, data: e.target.value }))} style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} /></div>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Horário</label><input type="time" value={sessaoForm.horario} onChange={e => setSessaoForm(p => ({ ...p, horario: e.target.value }))} style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} /></div>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label><select value={sessaoForm.duracao} onChange={e => setSessaoForm(p => ({ ...p, duracao: e.target.value }))} style={{ width: "100%", padding: "7px 10px", fontSize: 12 }}><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option><option>120 min</option></select></div>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link da Call</label><input type="url" value={sessaoForm.link_meet} onChange={e => setSessaoForm(p => ({ ...p, link_meet: e.target.value }))} placeholder="meet.google.com/..." style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} /></div>
                                </div>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setAcaoAberta(null)}>Cancelar</button>
                                  <button onClick={() => criarSessao(c)} disabled={!sessaoForm.data || salvandoAcao} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: !sessaoForm.data ? "not-allowed" : "pointer", background: !sessaoForm.data ? "rgba(201,168,76,0.3)" : "var(--gold)", color: "#000" }}>
                                    {salvandoAcao ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <Video size={11} />} Criar Sessão
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                                <button onClick={() => { setAcaoAberta({ id: c.id, tipo: "sessao" }); setSessaoForm({ data: "", horario: "", duracao: "60 min", link_meet: "" }); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                  <Plus size={11} /> Nova Sessão
                                </button>
                              </div>
                            )}
                            {cardDados[c.id]?.carregandoAba === "sessoes" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Carregando sessões...</div>
                            ) : !cardDados[c.id]?.sessoes ? (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Nenhuma sessão ainda. Clique em &ldquo;Nova Sessão&rdquo; para criar.</p>
                            ) : cardDados[c.id].sessoes!.length === 0 ? (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Nenhuma sessão registrada ainda.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {cardDados[c.id].sessoes!.map(s => {
                                  const sc: Record<string, { cor: string; bg: string }> = { agendada: { cor: "#fbbf24", bg: "rgba(251,191,36,0.1)" }, realizada: { cor: "#86efac", bg: "rgba(134,239,172,0.1)" }, cancelada: { cor: "#6b7280", bg: "rgba(107,114,128,0.1)" } };
                                  const st = sc[s.status] ?? sc.agendada;
                                  return (
                                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                                      <Video size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{formatData(s.data)}{s.horario ? ` · ${s.horario}` : ""}</p>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.duracao}{s.link_meet ? ` · ${s.link_meet}` : ""}</p>
                                      </div>
                                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 700, color: st.cor, background: st.bg, flexShrink: 0 }}>{s.status}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Aba: Plano de Ação */}
                        {abaCard === "plano" && (
                          <div>
                            {cardDados[c.id]?.carregandoAba === "plano" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Carregando plano...</div>
                            ) : cardDados[c.id]?.plano === null ? (
                              <div style={{ textAlign: "center", padding: "24px 0" }}>
                                <ListChecks size={24} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: 10 }} />
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Nenhum plano de ação criado ainda.</p>
                                {acaoAberta?.id === c.id && acaoAberta.tipo === "plano" ? (
                                  <div style={{ textAlign: "left", padding: "14px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10 }}>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>Será criado um <strong style={{ color: "var(--text)" }}>Plano de Ação vazio</strong> para <strong style={{ color: "var(--text)" }}>{c.nome}</strong>. Adicione os marcos depois na seção Planos.</p>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                      <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setAcaoAberta(null)}>Cancelar</button>
                                      <button onClick={() => criarPlano(c)} disabled={salvandoAcao} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--gold)", color: "#000" }}>
                                        {salvandoAcao ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <ListChecks size={11} />} Criar Plano
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setAcaoAberta({ id: c.id, tipo: "plano" })} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 7, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    <Plus size={12} /> Criar Plano de Ação
                                  </button>
                                )}
                              </div>
                            ) : cardDados[c.id]?.plano != null ? (
                              <div>
                                <div style={{ marginBottom: 12 }}>
                                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Plano de Ação</p>
                                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{cardDados[c.id]!.plano!.marcos.filter(m => m.feito).length}/{cardDados[c.id]!.plano!.marcos.length} marcos concluídos</p>
                                </div>
                                {cardDados[c.id]!.plano!.marcos.length === 0 ? (
                                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Nenhum marco adicionado. Edite o plano na seção Planos.</p>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {cardDados[c.id]!.plano!.marcos.map(m => (
                                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 7, background: m.feito ? "rgba(134,239,172,0.06)" : "var(--bg-card)", border: `1px solid ${m.feito ? "rgba(134,239,172,0.2)" : "var(--border)"}` }}>
                                        <CheckCircle2 size={13} style={{ color: m.feito ? "#86efac" : "var(--border)", flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <p style={{ fontSize: 12, margin: 0, color: m.feito ? "var(--text-muted)" : "var(--text)", textDecoration: m.feito ? "line-through" : "none" }}>{m.texto}</p>
                                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{m.semana}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Clique na aba &ldquo;Plano&rdquo; para carregar o plano de ação.</p>
                            )}
                          </div>
                        )}

                        {/* Aba: Tarefas */}
                        {abaCard === "tarefas" && (
                          <div>
                            {acaoAberta?.id === c.id && acaoAberta.tipo === "tarefa" ? (
                              <div style={{ padding: "14px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Nova Tarefa</p>
                                <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título *</label><input value={tarefaForm.titulo} onChange={e => setTarefaForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Ler capítulo 1..." style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} /></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo</label><select value={tarefaForm.tipo} onChange={e => setTarefaForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: "100%", padding: "7px 10px", fontSize: 12 }}><option value="acao">⚡ Ação</option><option value="reflexao">💭 Reflexão</option><option value="leitura">📖 Leitura</option><option value="pratica">🎯 Prática</option></select></div>
                                  <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Prazo</label><input type="date" value={tarefaForm.data_entrega} onChange={e => setTarefaForm(p => ({ ...p, data_entrega: e.target.value }))} style={{ width: "100%", padding: "7px 10px", fontSize: 12 }} /></div>
                                </div>
                                <div><label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label><textarea value={tarefaForm.descricao} onChange={e => setTarefaForm(p => ({ ...p, descricao: e.target.value }))} rows={2} placeholder="O que a mentorada deve fazer..." style={{ width: "100%", padding: "7px 10px", fontSize: 12, resize: "vertical" }} /></div>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setAcaoAberta(null)}>Cancelar</button>
                                  <button onClick={() => criarTarefa(c)} disabled={!tarefaForm.titulo.trim() || salvandoAcao} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: !tarefaForm.titulo.trim() ? "not-allowed" : "pointer", background: !tarefaForm.titulo.trim() ? "rgba(201,168,76,0.3)" : "var(--gold)", color: "#000" }}>
                                    {salvandoAcao ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckSquare size={11} />} Criar Tarefa
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                                <button onClick={() => { setAcaoAberta({ id: c.id, tipo: "tarefa" }); setTarefaForm({ titulo: "", tipo: "acao", descricao: "", data_entrega: "" }); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                  <Plus size={11} /> Nova Tarefa
                                </button>
                              </div>
                            )}
                            {cardDados[c.id]?.carregandoAba === "tarefas" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Carregando tarefas...</div>
                            ) : !cardDados[c.id]?.tarefas ? (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Nenhuma tarefa ainda. Clique em &ldquo;Nova Tarefa&rdquo; para criar.</p>
                            ) : cardDados[c.id].tarefas!.length === 0 ? (
                              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Nenhuma tarefa registrada ainda.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {cardDados[c.id].tarefas!.map(t => {
                                  const stc: Record<string, { cor: string; bg: string }> = { "Pendente": { cor: "#94a3b8", bg: "rgba(148,163,184,0.1)" }, "Em Andamento": { cor: "#fbbf24", bg: "rgba(251,191,36,0.1)" }, "Concluída": { cor: "#86efac", bg: "rgba(134,239,172,0.1)" } };
                                  const st = stc[t.status] ?? stc["Pendente"];
                                  const tipoEmoji: Record<string, string> = { acao: "⚡", reflexao: "💭", leitura: "📖", pratica: "🎯" };
                                  return (
                                    <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                                      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{tipoEmoji[t.tipo ?? "acao"] ?? "⚡"}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{t.titulo}</p>
                                        {t.data_entrega && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>Prazo: {formatData(t.data_entrega)}</p>}
                                        {t.descricao && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>{t.descricao}</p>}
                                      </div>
                                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 700, color: st.cor, background: st.bg, flexShrink: 0, whiteSpace: "nowrap" }}>{t.status}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Ações Rápidas — sempre visível independente da aba */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4, flexShrink: 0 }}>Criar rápido:</span>
                          <button
                            onClick={() => { setAbaCard("sessoes"); setAcaoAberta({ id: c.id, tipo: "sessao" }); setSessaoForm({ data: "", horario: "", duracao: "60 min", link_meet: "" }); if (!cardDados[c.id]?.sessoes) carregarAba(c, "sessoes"); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.08)", color: "#a78bfa", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          ><Video size={11} /> Sessão</button>
                          <button
                            onClick={() => { setAbaCard("plano"); if (!("plano" in (cardDados[c.id] ?? {}))) carregarAba(c, "plano"); if (cardDados[c.id]?.plano === null || !cardDados[c.id]) setAcaoAberta({ id: c.id, tipo: "plano" }); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(134,239,172,0.3)", background: "rgba(134,239,172,0.08)", color: "#86efac", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          ><ListChecks size={11} /> Plano</button>
                          <button
                            onClick={() => { setAbaCard("tarefas"); setAcaoAberta({ id: c.id, tipo: "tarefa" }); setTarefaForm({ titulo: "", tipo: "acao", descricao: "", data_entrega: "" }); if (!cardDados[c.id]?.tarefas) carregarAba(c, "tarefas"); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          ><CheckSquare size={11} /> Tarefa</button>
                        </div>

                        {/* Editar / Excluir */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 14, marginTop: 14, borderTop: "1px solid var(--border)" }}>
                          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditando({ ...c })}><Pencil size={12} /> Editar</button>
                          <button style={{ fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }} onClick={() => excluir(c.id)}><Trash2 size={12} /> Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
