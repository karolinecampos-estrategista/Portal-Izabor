"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search, Star, MessageCircle, CheckCircle2, Clock, X, Pencil, Trash2, ChevronRight, CreditCard, MapPin, Calendar, DollarSign, Phone, Instagram, BookHeart, Send, Mail, KeyRound, LogIn, Video, Target, Heart as HeartIcon, NotebookPen, UserCheck, UserX, RotateCcw, Check } from "lucide-react";

interface Sessao {
  id: number;
  data: string;
  duracao: string;
  resumo: string;
  proximosPassos: string;
  linkGravacao: string;
  presenca: "realizada" | "faltou" | "remarcada";
}

interface MarcoAcao {
  id: number;
  titulo: string;
  prazo: string;
  concluido: boolean;
  pilar: string;
}

interface OracaoPedido {
  id: number;
  pedido: string;
  data: string;
  respondida: boolean;
}

const SESSAO_VAZIA = { data: "", duracao: "60 min", resumo: "", proximosPassos: "", linkGravacao: "", presenca: "realizada" as const };
const MARCO_VAZIO = { titulo: "", prazo: "", concluido: false, pilar: "Fe" };
const ORACAO_VAZIA = { pedido: "", data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }), respondida: false };

const presencaCfg = {
  realizada:  { label: "Realizada",  cor: "#86efac", icon: UserCheck },
  faltou:     { label: "Faltou",     cor: "#fca5a5", icon: UserX },
  remarcada:  { label: "Remarcada",  cor: "#fbbf24", icon: RotateCcw },
};

type Programa = "Imersao BW" | "Mentoria Individual" | "Club BW";
type StatusAluna = "ativo" | "concluido" | "pausado";
type Pilar = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia";
type FormaPagamento = "cartao" | "boleto" | "outra-plataforma" | "parcelado";

interface Mentoranda {
  id: number;
  nome: string;
  email: string;
  programa: Programa;
  inicio: string;
  sessoes: number;
  totalSessoes: number;
  status: StatusAluna;
  notas: string;
  proxima: string;
  pilares: Pilar[];
  cor: string;
  origem: string;
  valorNegociado: number;
  formaPagamento: FormaPagamento;
  totalParcelas: number;
  anotacoesNegociacao: string;
  aniversario: string;
  whatsapp: string;
  instagram: string;
  loginCriado: boolean;
  acesso: "mentoria" | "livro" | "ambos";
  mostrarFinanceiro: boolean;
  produtosAtivos: Record<string, boolean>;
}

const CORES = ["#C9A84C", "#a78bfa", "#86efac", "#93c5fd", "#f9a8d4", "#fca5a5"];


const catColor: Record<Pilar, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia",
};
const programaCor: Record<Programa, string> = {
  "Imersao BW": "#C9A84C", "Mentoria Individual": "#a78bfa", "Club BW": "#86efac",
};
const PROGRAMAS: Programa[] = ["Imersao BW", "Mentoria Individual", "Club BW"];
const PILARES: Pilar[] = ["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia"];
const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: "cartao", label: "Cartão de Crédito" },
  { value: "boleto", label: "Boleto Bancário" },
  { value: "parcelado", label: "Parcelado (outro)" },
  { value: "outra-plataforma", label: "Outra Plataforma" },
];
const FORM_VAZIO: Omit<Mentoranda, "id"> = { nome: "", email: "", programa: "Mentoria Individual", inicio: "", sessoes: 0, totalSessoes: 6, status: "ativo", notas: "", proxima: "", pilares: ["Fe"], cor: "#C9A84C", origem: "", valorNegociado: 0, formaPagamento: "cartao", totalParcelas: 1, anotacoesNegociacao: "", aniversario: "", whatsapp: "", instagram: "", loginCriado: false, acesso: "mentoria" as "mentoria" | "livro" | "ambos", mostrarFinanceiro: false, produtosAtivos: {} };

const PRODUTOS_IZA = [
  { id: "seja_incomum", label: "Seja Incomum",     cor: "#C9A84C", emoji: "👑" },
  { id: "livro",        label: "Livro",            cor: "#86efac", emoji: "📖" },
  { id: "club_bw",      label: "Club BW",          cor: "#a78bfa", emoji: "💜" },
  { id: "evento",       label: "Evento · Simplesmente Seja", cor: "#fca5a5", emoji: "🔥" },
];


function dbParaFrontend(d: Record<string, unknown>): Mentoranda {
  return {
    id: d.id as unknown as number,
    nome: (d.nome as string) ?? "",
    email: (d.email as string) ?? "",
    whatsapp: (d.whatsapp as string) ?? "",
    instagram: (d.instagram as string) ?? "",
    aniversario: (d.aniversario as string) ?? "",
    programa: (d.programa as Programa) ?? "Mentoria Individual",
    inicio: (d.inicio as string) ?? "",
    status: (d.status as "ativo" | "concluido" | "pausado") ?? "ativo",
    sessoes: (d.sessoes_feitas as number) ?? 0,
    totalSessoes: (d.total_sessoes as number) ?? 6,
    proxima: (d.proxima_sessao as string) ?? "",
    notas: (d.notas as string) ?? "",
    pilares: (d.pilares as Pilar[]) ?? [],
    origem: (d.origem as string) ?? "",
    valorNegociado: (d.valor_negociado as number) ?? 0,
    formaPagamento: (d.forma_pagamento as "cartao" | "boleto" | "outra-plataforma" | "parcelado") ?? "cartao",
    totalParcelas: (d.total_parcelas as number) ?? 1,
    anotacoesNegociacao: (d.anotacoes_negociacao as string) ?? "",
    cor: (d.cor as string) ?? "#C9A84C",
    loginCriado: (d.login_criado as boolean) ?? false,
    acesso: ((d.acesso as string) ?? "mentoria") as "mentoria" | "livro" | "ambos",
    mostrarFinanceiro: (d.mostrar_financeiro as boolean) ?? false,
    produtosAtivos: (d.produtos_ativos as Record<string, boolean>) ?? {},
  };
}

export default function Mentorandas() {
  const [mentorandas, setMentorandas] = useState<Mentoranda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/mentoradas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMentorandas(data.map(dbParaFrontend));
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<Mentoranda | null>(null);
  const [editando, setEditando] = useState<Mentoranda | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [form, setForm] = useState<Omit<Mentoranda, "id">>(FORM_VAZIO);
  const [devocionalEnviados, setDevocionalEnviados] = useState<Record<number, number[]>>({});
  const [mostrarDevocional, setMostrarDevocional] = useState(false);
  const [loginEnviado, setLoginEnviado] = useState<number | null>(null);
  const [abaModal, setAbaModal] = useState<"perfil" | "sessoes" | "plano" | "oracoes">("perfil");

  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [devocionais, setDevocionais] = useState<{ id: string; titulo: string; criado_em: string }[]>([]);

  useEffect(() => {
    fetch("/api/devocionais")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDevocionais(d.filter((x: { publicado: boolean }) => x.publicado)); });
  }, []);

  function criarLogin(m: Mentoranda) {
    setMentorandas((prev) => prev.map((x) => x.id === m.id ? { ...x, loginCriado: true } : x));
    setSelecionada((prev) => prev ? { ...prev, loginCriado: true } : prev);
    setLoginEnviado(m.id);
    setTimeout(() => setLoginEnviado(null), 3000);
  }

  async function salvarCampo(id: number, campo: string, valor: unknown) {
    setMentorandas(prev => prev.map(m => m.id === id ? { ...m, [campo]: valor } : m));
    setSelecionada(prev => prev && prev.id === id ? { ...prev, [campo]: valor } : prev);
    await fetch("/api/mentoradas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [campo === "mostrarFinanceiro" ? "mostrarFinanceiro" : campo === "produtosAtivos" ? "produtosAtivos" : campo]: valor }),
    });
  }

  function toggleProduto(id: number, produtoId: string, atual: Record<string, boolean>) {
    const novo = { ...atual, [produtoId]: !atual[produtoId] };
    salvarCampo(id, "produtosAtivos", novo);
  }

  const filtradas = mentorandas.filter((m) => {
    const matchBusca = m.nome.toLowerCase().includes(busca.toLowerCase()) || m.programa.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  function togglePilarForm(p: Pilar) {
    setForm((f) => ({ ...f, pilares: f.pilares.includes(p) ? f.pilares.filter((x) => x !== p) : [...f.pilares, p] }));
  }
  function togglePilarEdit(p: Pilar) {
    if (!editando) return;
    setEditando((e) => e ? ({ ...e, pilares: e.pilares.includes(p) ? e.pilares.filter((x) => x !== p) : [...e.pilares, p] }) : null);
  }

  async function salvarNova() {
    if (salvando) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/mentoradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMentorandas((prev) => [dbParaFrontend(data), ...prev]);
        if (data.loginCriado && form.email) {
          alert(`✅ Mentorada cadastrada! Convite enviado para ${form.email}`);
        }
        setNovaAberta(false);
        setForm(FORM_VAZIO);
      } else {
        alert(`Erro: ${data.error ?? "Não foi possível salvar."}`);
      }
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEdicao() {
    if (!editando) return;
    const res = await fetch("/api/mentoradas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando),
    });
    if (res.ok) {
      setMentorandas((prev) => prev.map((m) => m.id === editando.id ? editando : m));
    }
    setEditando(null);
    setSelecionada(null);
  }

  async function deletar(id: number) {
    if (!confirm("Excluir esta mentorada? Essa ação não pode ser desfeita.")) return;
    setDeletando(true);
    try {
      await fetch(`/api/mentoradas?id=${id}`, { method: "DELETE" });
      setMentorandas((prev) => prev.filter((m) => m.id !== id));
      setSelecionada(null);
    } finally {
      setDeletando(false);
    }
  }

  const ativas = mentorandas.filter((m) => m.status === "ativo").length;
  const concluidas = mentorandas.filter((m) => m.status === "concluido").length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Users size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Mentoradas</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Suas Extraordinárias</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Mulheres INCOMUNS em transformação.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setNovaAberta(true)}>
          <Plus size={14} /> Nova Aluna
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{ label: "Ativas", value: ativas, color: "#C9A84C", emoji: "🔥" }, { label: "Concluidas", value: concluidas, color: "#86efac", emoji: "✅" }, { label: "Total", value: mentorandas.length, color: "var(--text-muted)", emoji: "👑" }].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.emoji} {s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input style={{ background: "none", border: "none", flex: 1, fontSize: 13, color: "var(--text)", outline: "none" }} placeholder="Buscar aluna ou programa..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        {["todos", "ativo", "concluido"].map((f) => (
          <button key={f} onClick={() => setFiltroStatus(f)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: filtroStatus === f ? "1px solid var(--gold-border)" : "1px solid var(--border)", background: filtroStatus === f ? "var(--gold-light)" : "transparent", color: filtroStatus === f ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s" }}>
            {f === "todos" ? "Todas" : f === "ativo" ? "Ativas" : "Concluidas"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtradas.map((m) => {
          const pct = Math.round((m.sessoes / m.totalSessoes) * 100);
          return (
            <div key={m.id} className="card card-hover" style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => setSelecionada(m)}>
              {/* Linha 1: avatar + nome + status + chevron */}
              <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                <div className="avatar" style={{ background: m.cor + "20", color: m.cor, width: 40, height: 40, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {m.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 2, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{m.nome}</p>
                    {m.status === "concluido" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "#86efac", background: "rgba(134,239,172,0.1)", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>
                        <CheckCircle2 size={9} /> Concluída
                      </span>
                    )}
                    {m.loginCriado ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#86efac", background: "rgba(134,239,172,0.08)", padding: "1px 7px", borderRadius: 999, border: "1px solid rgba(134,239,172,0.2)", flexShrink: 0 }}>
                        <LogIn size={8} /> Login ativo
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#fbbf24", background: "rgba(251,191,36,0.08)", padding: "1px 7px", borderRadius: 999, border: "1px solid rgba(251,191,36,0.2)", flexShrink: 0 }}>
                        <KeyRound size={8} /> Sem login
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: programaCor[m.programa] }}>{m.programa}</span>
                  <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 999, fontWeight: 600, background: m.produtosAtivos?.club_bw ? "rgba(167,139,250,0.12)" : "rgba(201,168,76,0.1)", color: m.produtosAtivos?.club_bw ? "#a78bfa" : "var(--gold)", border: `1px solid ${m.produtosAtivos?.club_bw ? "rgba(167,139,250,0.25)" : "var(--gold-border)"}` }}>
                    {m.produtosAtivos?.club_bw ? "Mentorada" : "Aluna"}
                  </span>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </div>

              {/* Linha 2: progresso + próxima sessão */}
              <div style={{ paddingLeft: 52, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.sessoes}/{m.totalSessoes} sessões</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.cor }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: m.cor }} />
                  </div>
                </div>
                {m.proxima && (
                  <div className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                    <Clock size={11} /> {m.proxima}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal detalhe */}
      {selecionada && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setSelecionada(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ background: selecionada.cor + "20", color: selecionada.cor, width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
                  {selecionada.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{selecionada.nome}</p>
                  <p style={{ fontSize: 11, color: programaCor[selecionada.programa], margin: 0 }}>{selecionada.programa}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditando({ ...selecionada }); setSelecionada(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><Pencil size={15} /></button>
                <button onClick={() => setSelecionada(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
              </div>
            </div>
            <div className="card" style={{ padding: "14px 16px", marginBottom: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Progresso</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: selecionada.cor }}>{selecionada.sessoes}/{selecionada.totalSessoes}</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}><div className="progress-fill" style={{ width: `${(selecionada.sessoes / selecionada.totalSessoes) * 100}%`, background: selecionada.cor }} /></div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>Inicio: {selecionada.inicio}</p>
            </div>
            <div className="flex items-center gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
              {selecionada.pilares.map((p) => <span key={p} className={`tag ${catColor[p]}`}><Star size={9} /> {p}</span>)}
            </div>
            {/* Contatos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {selecionada.whatsapp && (
                <a
                  href={`https://wa.me/55${selecionada.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(134,239,172,0.08)", borderRadius: 8, border: "1px solid rgba(134,239,172,0.2)", textDecoration: "none" }}
                >
                  <Phone size={13} style={{ color: "#86efac", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>WhatsApp</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#86efac", margin: 0 }}>{selecionada.whatsapp}</p>
                  </div>
                </a>
              )}
              {selecionada.instagram && (
                <a
                  href={`https://instagram.com/${selecionada.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(236,72,153,0.08)", borderRadius: 8, border: "1px solid rgba(236,72,153,0.2)", textDecoration: "none" }}
                >
                  <Instagram size={13} style={{ color: "#f9a8d4", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Instagram</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#f9a8d4", margin: 0 }}>{selecionada.instagram}</p>
                  </div>
                </a>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}><MessageCircle size={13} style={{ color: "var(--gold)" }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Anotacoes</span></div>
              <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, padding: "12px", background: "var(--bg-input)", borderRadius: 8, margin: 0 }}>{selecionada.notas}</p>
            </div>
            {selecionada.proxima && (
              <div className="flex items-center gap-3" style={{ padding: "10px 14px", background: "var(--gold-light)", borderRadius: 8, border: "1px solid var(--gold-border)", marginBottom: 16 }}>
                <Clock size={14} style={{ color: "var(--gold)" }} />
                <div><p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Proxima Sessao</p><p style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", margin: 0 }}>{selecionada.proxima}</p></div>
              </div>
            )}

            {/* Dados de negociação */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Negociação & Financeiro</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                    <DollarSign size={11} style={{ color: "var(--gold)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Valor Negociado</p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: 0 }}>
                    R$ {selecionada.valorNegociado.toLocaleString("pt-BR")}
                  </p>
                  {selecionada.totalParcelas > 1 && (
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{selecionada.totalParcelas}x parcelas</p>
                  )}
                </div>
                <div style={{ padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                    <CreditCard size={11} style={{ color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Forma de Pagamento</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", margin: 0 }}>
                    {FORMAS_PAGAMENTO.find((f) => f.value === selecionada.formaPagamento)?.label}
                  </p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                    <MapPin size={11} style={{ color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Origem</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", margin: 0 }}>{selecionada.origem || "—"}</p>
                </div>
                {selecionada.aniversario && (
                  <div style={{ padding: "10px 12px", background: "rgba(201,168,76,0.07)", borderRadius: 8, border: "1px solid var(--gold-border)" }}>
                    <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                      <Calendar size={11} style={{ color: "var(--gold)" }} />
                      <p style={{ fontSize: 10, color: "var(--gold)", margin: 0 }}>Aniversário</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", margin: 0 }}>🎂 {selecionada.aniversario}</p>
                  </div>
                )}
              </div>
              {selecionada.anotacoesNegociacao && (
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Anotações de Negociação</p>
                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, margin: 0 }}>{selecionada.anotacoesNegociacao}</p>
                </div>
              )}
            </div>

            {/* Envio de Devocional */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: mostrarDevocional ? 12 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookHeart size={14} style={{ color: "var(--gold)" }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)", margin: 0 }}>Enviar Devocional</p>
                  {devocionalEnviados[selecionada.id]?.length ? (
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 999, background: "rgba(201,168,76,0.12)", color: "var(--gold)", fontWeight: 600 }}>
                      {devocionalEnviados[selecionada.id].length} enviado{devocionalEnviados[selecionada.id].length > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => setMostrarDevocional(!mostrarDevocional)}
                  style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid var(--gold-border)", background: "var(--gold-light)", color: "var(--gold)", cursor: "pointer" }}
                >
                  {mostrarDevocional ? "Fechar" : "Selecionar"}
                </button>
              </div>
              {mostrarDevocional && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {devocionais.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
                      Nenhum devocional publicado ainda. Crie devocionais na seção Devocionais.
                    </p>
                  ) : devocionais.map((d) => {
                    const jaEnviado = devocionalEnviados[selecionada.id]?.includes(d.id as unknown as number);
                    return (
                      <div
                        key={d.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 8,
                          background: jaEnviado ? "rgba(134,239,172,0.06)" : "var(--bg-input)",
                          border: jaEnviado ? "1px solid rgba(134,239,172,0.2)" : "1px solid var(--border)",
                        }}
                      >
                        <BookHeart size={13} style={{ color: jaEnviado ? "#86efac" : "var(--text-muted)", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: jaEnviado ? "#86efac" : "var(--text)" }}>{d.titulo}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
                            {new Date(d.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                        {jaEnviado ? (
                          <span style={{ fontSize: 10, color: "#86efac", fontWeight: 600, flexShrink: 0 }}>Enviado ✓</span>
                        ) : (
                          <button
                            onClick={() => setDevocionalEnviados((prev) => ({
                              ...prev,
                              [selecionada.id]: [...(prev[selecionada.id] ?? []), d.id as unknown as number],
                            }))}
                            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--gold-border)", background: "var(--gold-light)", color: "var(--gold)", cursor: "pointer", flexShrink: 0 }}
                          >
                            <Send size={10} /> Enviar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Email ── */}
            {selecionada.email && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>E-mail</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <Mail size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{selecionada.email}</span>
                </div>
              </div>
            )}

            {/* ── Acesso & Produtos ── */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Produtos & Acesso</p>

              {/* Financeiro */}
              <div className="flex items-center justify-between" style={{ marginBottom: 14, padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>Mostrar Financeiro</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>Exibe a seção de pagamentos no portal</p>
                </div>
                <button onClick={() => salvarCampo(selecionada.id, "mostrarFinanceiro", !selecionada.mostrarFinanceiro)}
                  style={{ width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", background: selecionada.mostrarFinanceiro ? "var(--gold)" : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: selecionada.mostrarFinanceiro ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>

              {/* Produtos */}
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Produtos ativos</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PRODUTOS_IZA.map(p => {
                  const ativo = !!selecionada.produtosAtivos?.[p.id];
                  return (
                    <div key={p.id} className="flex items-center justify-between" style={{ padding: "9px 12px", background: ativo ? p.cor + "10" : "var(--bg-input)", borderRadius: 8, border: `1px solid ${ativo ? p.cor + "40" : "var(--border)"}` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14 }}>{p.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: ativo ? 700 : 400, color: ativo ? p.cor : "var(--text-muted)" }}>{p.label}</span>
                      </div>
                      <button onClick={() => toggleProduto(selecionada.id, p.id, selecionada.produtosAtivos ?? {})}
                        style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: ativo ? p.cor : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                        <span style={{ position: "absolute", top: 2, left: ativo ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Login das Extraordinárias */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <KeyRound size={14} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Login das Extraordinárias</span>
              </div>

              {selecionada.loginCriado ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(134,239,172,0.07)", borderRadius: 10, border: "1px solid rgba(134,239,172,0.2)" }}>
                  <CheckCircle2 size={16} style={{ color: "#86efac", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#86efac", margin: 0 }}>Login criado e enviado</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                      {selecionada.email || "e-mail não cadastrado"}
                    </p>
                  </div>
                  <button
                    onClick={() => criarLogin(selecionada)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Reenviar
                  </button>
                </div>
              ) : (
                <div>
                  {!selecionada.email ? (
                    <div style={{ padding: "12px 14px", background: "rgba(251,191,36,0.06)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.2)" }}>
                      <p style={{ fontSize: 12, color: "#fbbf24", margin: 0 }}>⚠ Cadastre o e-mail da aluna antes de criar o login.</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                        O sistema vai gerar uma senha e enviar para <strong style={{ color: "var(--text-soft)" }}>{selecionada.email}</strong>. A mentorada acessa o portal com esse e-mail.
                      </p>
                      {loginEnviado === selecionada.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(134,239,172,0.1)", borderRadius: 8, border: "1px solid rgba(134,239,172,0.25)" }}>
                          <CheckCircle2 size={14} style={{ color: "#86efac" }} />
                          <span style={{ fontSize: 12, color: "#86efac", fontWeight: 600 }}>Login enviado para o e-mail!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => criarLogin(selecionada)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "var(--gold)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                        >
                          <Mail size={14} /> Criar login e enviar por e-mail
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => deletar(selecionada.id)} disabled={deletando} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "6px 12px", cursor: deletando ? "not-allowed" : "pointer", opacity: deletando ? 0.6 : 1 }}>
              <Trash2 size={12} /> {deletando ? "Excluindo..." : "Excluir aluna"}
            </button>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setEditando(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Editar Aluna</h2>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Nome..." />
              <div style={{ position: "relative" }}>
                <Mail size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="email" value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} style={{ padding: "10px 12px 10px 34px", width: "100%", fontSize: 13 }} placeholder="E-mail da aluna" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select value={editando.programa} onChange={(e) => setEditando({ ...editando, programa: e.target.value as Programa })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  {PROGRAMAS.map((p) => <option key={p}>{p}</option>)}
                </select>
                <select value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as StatusAluna })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  <option value="ativo">Ativo</option><option value="concluido">Concluido</option><option value="pausado">Pausado</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                <input value={editando.inicio} onChange={(e) => setEditando({ ...editando, inicio: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Inicio (ex: 01 Mar 2026)" />
                <input type="number" value={editando.sessoes} onChange={(e) => setEditando({ ...editando, sessoes: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Sessoes feitas" />
                <input type="number" value={editando.totalSessoes} onChange={(e) => setEditando({ ...editando, totalSessoes: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Total sessoes" />
              </div>
              <input value={editando.proxima} onChange={(e) => setEditando({ ...editando, proxima: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Proxima sessao (ex: 26 Mai - 10:00)" />
              <textarea value={editando.notas} onChange={(e) => setEditando({ ...editando, notas: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 80, resize: "vertical" }} placeholder="Anotacoes..." />

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contato & Dados Pessoais</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input value={editando.whatsapp} onChange={(e) => setEditando({ ...editando, whatsapp: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="WhatsApp (ex: (11) 99999-0000)" />
                  <input value={editando.instagram} onChange={(e) => setEditando({ ...editando, instagram: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Instagram (@perfil)" />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, marginTop: 4 }}>Negociação & Financeiro</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input value={editando.origem} onChange={(e) => setEditando({ ...editando, origem: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Origem (ex: Instagram, indicação...)" />
                  <input value={editando.aniversario} onChange={(e) => setEditando({ ...editando, aniversario: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Aniversário (DD/MM) 🎂" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
                  <input type="number" value={editando.valorNegociado} onChange={(e) => setEditando({ ...editando, valorNegociado: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Valor (R$)" />
                  <select value={editando.formaPagamento} onChange={(e) => setEditando({ ...editando, formaPagamento: e.target.value as FormaPagamento })} style={{ padding: "10px", fontSize: 12 }}>
                    {FORMAS_PAGAMENTO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <input type="number" value={editando.totalParcelas} onChange={(e) => setEditando({ ...editando, totalParcelas: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Parcelas" />
                </div>
                <textarea value={editando.anotacoesNegociacao} onChange={(e) => setEditando({ ...editando, anotacoesNegociacao: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 12, minHeight: 60, resize: "vertical" }} placeholder="Anotacoes de negociacao..." />
              </div>

              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Pilares</p>
                <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                  {PILARES.map((p) => (
                    <button key={p} onClick={() => togglePilarEdit(p)} style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer", border: editando.pilares.includes(p) ? "1px solid var(--gold-border)" : "1px solid var(--border)", background: editando.pilares.includes(p) ? "var(--gold-light)" : "transparent", color: editando.pilares.includes(p) ? "var(--gold)" : "var(--text-muted)" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

                            <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarEdicao}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nova */}
      {novaAberta && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setNovaAberta(false)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nova Aluna</h2>
              <button onClick={() => setNovaAberta(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Nome completo..." />
              <div style={{ position: "relative" }}>
                <Mail size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: "10px 12px 10px 34px", width: "100%", fontSize: 13 }} placeholder="E-mail (usado para criar o login)" />
              </div>
              <select value={form.programa} onChange={(e) => setForm({ ...form, programa: e.target.value as Programa })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }}>
                {PROGRAMAS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Inicio (ex: 01 Jun 2026)" />
                <input type="number" value={form.totalSessoes} onChange={(e) => setForm({ ...form, totalSessoes: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Total de sessoes" />
              </div>
              <input value={form.proxima} onChange={(e) => setForm({ ...form, proxima: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Proxima sessao..." />
              <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 70, resize: "vertical" }} placeholder="Primeiras anotacoes..." />

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contato & Dados Pessoais</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="WhatsApp" />
                  <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Instagram (@perfil)" />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, marginTop: 4 }}>Negociação & Financeiro</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Como chegou até você?" />
                  <input value={form.aniversario} onChange={(e) => setForm({ ...form, aniversario: e.target.value })} style={{ padding: "10px", fontSize: 12 }} placeholder="Aniversário (DD/MM) 🎂" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 8 }}>
                  <input type="number" value={form.valorNegociado || ""} onChange={(e) => setForm({ ...form, valorNegociado: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Valor R$" />
                  <select value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })} style={{ padding: "10px", fontSize: 12 }}>
                    {FORMAS_PAGAMENTO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <input type="number" value={form.totalParcelas || ""} onChange={(e) => setForm({ ...form, totalParcelas: Number(e.target.value) })} style={{ padding: "10px", fontSize: 12 }} placeholder="Nº Parcelas" />
                </div>
                <textarea value={form.anotacoesNegociacao} onChange={(e) => setForm({ ...form, anotacoesNegociacao: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 12, minHeight: 55, resize: "vertical" }} placeholder="Anotacoes da negociacao..." />
              </div>

              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Pilares de trabalho</p>
                <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                  {PILARES.map((p) => (
                    <button key={p} onClick={() => togglePilarForm(p)} style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer", border: form.pilares.includes(p) ? "1px solid var(--gold-border)" : "1px solid var(--border)", background: form.pilares.includes(p) ? "var(--gold-light)" : "transparent", color: form.pilares.includes(p) ? "var(--gold)" : "var(--text-muted)" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Cor do avatar</p>
              <div className="flex items-center gap-2">
                {CORES.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, cor: c })} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: form.cor === c ? "2px solid white" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setNovaAberta(false)} disabled={salvando}>Cancelar</button>
                <button className="btn-gold" onClick={salvarNova} disabled={!form.nome || salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
