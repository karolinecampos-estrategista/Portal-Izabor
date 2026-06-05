"use client";

import { useState, useEffect } from "react";
import {
  Heart, Plus, X, MessageCircle, Instagram, Trash2,
  CheckCircle2, ChevronDown, ChevronUp, Pencil, Loader2, Mail,
} from "lucide-react";
import ProdutosAcesso from "@/components/ProdutosAcesso";

type StatusAcesso = "ativo" | "encerrado" | "cancelado";

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

  useEffect(() => {
    fetch("/api/club-bw")
      .then(r => r.json())
      .then(d => { setCompradoras(Array.isArray(d) ? d : []); setCarregando(false); });
  }, []);

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
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }} onClick={() => setDetalhe(aberto ? null : c)}>
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contato</p>
                          <div className="flex flex-col gap-2" style={{ gap: 8 }}>
                            {c.email && (
                              <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
                                <Mail size={13} /> {c.email}
                              </a>
                            )}
                            {c.whatsapp && (
                              <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#86efac", textDecoration: "none" }}>
                                <MessageCircle size={13} /> {c.whatsapp}
                              </a>
                            )}
                            {c.instagram && (
                              <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c084fc", textDecoration: "none" }}>
                                <Instagram size={13} /> @{c.instagram}
                              </a>
                            )}
                          </div>
                          {(c.mes_inicio || c.mes_fim) && (
                            <div style={{ marginTop: 12 }}>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Período</p>
                              <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0 }}>
                                {c.mes_inicio ?? "—"} → {c.mes_fim ?? "—"}
                              </p>
                            </div>
                          )}
                          {c.notas && (
                            <div style={{ marginTop: 12 }}>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notas</p>
                              <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{c.notas}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Status</p>
                          <div style={{ display: "flex", gap: 6 }}>
                            {(["ativo","encerrado","cancelado"] as StatusAcesso[]).map(s => {
                              const sc = statusCfg[s]; const ativo = c.status_acesso === s;
                              return (
                                <button key={s} onClick={() => atualizarStatus(c.id, s)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? sc.cor + "80" : "var(--border)"}`, background: ativo ? sc.bg : "transparent", color: ativo ? sc.cor : "var(--text-muted)", fontWeight: ativo ? 700 : 400 }}>
                                  {sc.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Pagamento</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            {(() => {
                              const pgCfg: Record<string, { label: string; cor: string; bg: string }> = {
                                pago:     { label: "Pago",    cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
                                parcial:  { label: "Parcial", cor: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
                                pendente: { label: "Pendente",cor: "#6b7280", bg: "rgba(107,114,128,0.12)" },
                                isento:   { label: "Isento",  cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
                              };
                              const pg = pgCfg[c.status_pagamento] ?? pgCfg.pendente;
                              return (
                                <>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: pg.cor, background: pg.bg }}>{pg.label}</span>
                                  {c.valor != null && <span style={{ fontSize: 12, color: "var(--text)" }}>R$ {Number(c.valor).toFixed(2).replace(".",",")}</span>}
                                  {c.forma_pagamento && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {c.forma_pagamento.replace("_"," ")}</span>}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <ProdutosAcesso email={c.email} nome={c.nome} defaultProduto="club_bw" />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditando({ ...c })}><Pencil size={12} /> Editar</button>
                          <button style={{ fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }} onClick={() => excluir(c.id)}><Trash2 size={12} /> Excluir</button>
                        </div>
                      </div>
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
