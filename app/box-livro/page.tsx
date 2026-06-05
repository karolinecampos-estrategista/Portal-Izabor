"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Plus, X, Package, Truck, CheckCircle2, MessageCircle,
  Instagram, TrendingUp, Star, AlertCircle, FileText,
  ChevronDown, ChevronUp, Users, Loader2, Pencil, Trash2, Mail,
} from "lucide-react";
import ProdutosAcesso from "@/components/ProdutosAcesso";

type VarianteBox = "completo" | "so-livro" | "devocional-30";
type StatusEntrega = "pendente" | "enviado" | "entregue";
type NivelEngajamento = "sem-contato" | "recebeu" | "lendo" | "postou" | "engajada";
type StatusUpsell = "nao-abordada" | "em-conversa" | "convertida";

interface Compradora {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  data_compra: string;
  variante: VarianteBox;
  status_entrega: StatusEntrega;
  nivel_engajamento: NivelEngajamento;
  status_upsell: StatusUpsell;
  tem_acesso_bw: boolean;
  notas: string | null;
}

const VARIANTES: Record<VarianteBox, { label: string; cor: string; bg: string }> = {
  "completo":       { label: "Box Completo",      cor: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  "so-livro":       { label: "Só o Livro",         cor: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  "devocional-30":  { label: "Devocional 30 dias", cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
};

const ENTREGA_CONFIG: Record<StatusEntrega, { label: string; cor: string; bg: string; icon: typeof Package }> = {
  pendente: { label: "Pendente", cor: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: Package },
  enviado:  { label: "Enviado",  cor: "#93c5fd", bg: "rgba(147,197,253,0.12)", icon: Truck },
  entregue: { label: "Entregue", cor: "#86efac", bg: "rgba(134,239,172,0.12)", icon: CheckCircle2 },
};

const ENGAJAMENTO_CONFIG: Record<NivelEngajamento, { label: string; cor: string; pontos: number }> = {
  "sem-contato": { label: "Sem contato", cor: "#6b7280", pontos: 0 },
  "recebeu":     { label: "Recebeu",     cor: "#93c5fd", pontos: 1 },
  "lendo":       { label: "Lendo",       cor: "#a78bfa", pontos: 2 },
  "postou":      { label: "Postou",      cor: "#C9A84C", pontos: 3 },
  "engajada":    { label: "Engajada",    cor: "#86efac", pontos: 4 },
};

const UPSELL_CONFIG: Record<StatusUpsell, { label: string; cor: string; bg: string }> = {
  "nao-abordada": { label: "Não abordada", cor: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  "em-conversa":  { label: "Em conversa",  cor: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  "convertida":   { label: "Convertida",   cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
};

type FormData = {
  nome: string; email: string; whatsapp: string; instagram: string;
  dataCompra: string; variante: VarianteBox;
  statusEntrega: StatusEntrega; nivelEngajamento: NivelEngajamento;
  statusUpsell: StatusUpsell; temAcessoBW: boolean; notas: string;
};

const FORM_VAZIO: FormData = {
  nome: "", email: "", whatsapp: "", instagram: "",
  dataCompra: new Date().toISOString().split("T")[0],
  variante: "completo", statusEntrega: "pendente",
  nivelEngajamento: "sem-contato", statusUpsell: "nao-abordada",
  temAcessoBW: false, notas: "",
};

function EngajamentoBarra({ nivel }: { nivel: NivelEngajamento }) {
  const cfg = ENGAJAMENTO_CONFIG[nivel];
  const pct = (cfg.pontos / 4) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: cfg.cor, fontWeight: 600 }}>{cfg.label}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{cfg.pontos}/4</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: cfg.cor }} />
      </div>
    </div>
  );
}

export default function BoxLivroCompradoras() {
  const [compradoras, setCompradoras] = useState<Compradora[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [showForm, setShowForm] = useState(false);
  const [detalhe, setDetalhe] = useState<Compradora | null>(null);
  const [editando, setEditando] = useState<Compradora | null>(null);
  const [filtroEntrega, setFiltroEntrega] = useState<StatusEntrega | "todas">("todas");
  const [filtroUpsell, setFiltroUpsell] = useState<StatusUpsell | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/box-livro")
      .then(r => r.json())
      .then(d => { setCompradoras(Array.isArray(d) ? d : []); setCarregando(false); });
  }, []);

  async function salvarNova() {
    if (!form.nome.trim() || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/box-livro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const nova = await res.json();
    if (nova?.id) setCompradoras(prev => [nova, ...prev]);
    setForm(FORM_VAZIO);
    setShowForm(false);
    setSalvando(false);
  }

  async function salvarEdicao() {
    if (!editando || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/box-livro", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editando.id,
        nome: editando.nome,
        whatsapp: editando.whatsapp,
        instagram: editando.instagram,
        dataCompra: editando.data_compra,
        variante: editando.variante,
        statusEntrega: editando.status_entrega,
        nivelEngajamento: editando.nivel_engajamento,
        statusUpsell: editando.status_upsell,
        temAcessoBW: editando.tem_acesso_bw,
        notas: editando.notas,
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

  async function atualizarCampo(id: string, campoApi: string, valor: string | boolean) {
    setCompradoras(prev => prev.map(c => {
      if (c.id !== id) return c;
      const mapa: Record<string, keyof Compradora> = {
        statusEntrega: "status_entrega",
        nivelEngajamento: "nivel_engajamento",
        statusUpsell: "status_upsell",
      };
      const campo = mapa[campoApi] ?? campoApi as keyof Compradora;
      return { ...c, [campo]: valor };
    }));
    if (detalhe?.id === id) {
      const mapa: Record<string, keyof Compradora> = {
        statusEntrega: "status_entrega",
        nivelEngajamento: "nivel_engajamento",
        statusUpsell: "status_upsell",
      };
      const campo = mapa[campoApi] ?? campoApi as keyof Compradora;
      setDetalhe(d => d ? { ...d, [campo]: valor } : d);
    }
    await fetch("/api/box-livro", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [campoApi]: valor }),
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta compradora?")) return;
    await fetch(`/api/box-livro?id=${id}`, { method: "DELETE" });
    setCompradoras(prev => prev.filter(c => c.id !== id));
    setDetalhe(null);
  }

  const termo = busca.toLowerCase().trim();
  const filtradas = compradoras.filter((c) => {
    if (filtroEntrega !== "todas" && c.status_entrega !== filtroEntrega) return false;
    if (filtroUpsell !== "todas" && c.status_upsell !== filtroUpsell) return false;
    if (termo && !c.nome.toLowerCase().includes(termo) && !c.email?.toLowerCase().includes(termo) && !c.whatsapp?.includes(termo)) return false;
    return true;
  });

  const totalCompradoras = compradoras.length;
  const aguardandoEntrega = compradoras.filter((c) => c.status_entrega !== "entregue").length;
  const engajadas = compradoras.filter((c) => ["postou", "engajada"].includes(c.nivel_engajamento)).length;
  const convertidas = compradoras.filter((c) => c.status_upsell === "convertida").length;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Users size={20} style={{ color: "var(--gold)" }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Box do Livro — Compradores</h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Gerencie as compradoras, entregas e upsell para a mentoria.
          </p>
        </div>
        <button
          className="btn-gold"
          onClick={() => { setShowForm(!showForm); setForm(FORM_VAZIO); }}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
        >
          <Plus size={15} /> Nova Compradora
        </button>
      </div>

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Compradores", valor: totalCompradoras, cor: "var(--gold)",  icon: BookOpen },
          { label: "Aguard. Entrega",   valor: aguardandoEntrega, cor: "#fbbf24",     icon: Package },
          { label: "Engajadas",         valor: engajadas,          cor: "#86efac",     icon: Star },
          { label: "Convertidas",       valor: convertidas,        cor: "#a78bfa",     icon: TrendingUp },
        ].map(({ label, valor, cor, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Icon size={16} style={{ color: cor }} />
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: cor, margin: 0, lineHeight: 1 }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Formulário Nova Compradora */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--gold-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Nova Compradora</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
          <div className="form-grid-2" style={{ gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome *</label>
              <input className="input" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>E-mail</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WhatsApp</label>
              <input className="input" value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "") }))} placeholder="11999999999" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Instagram</label>
              <input className="input" value={form.instagram} onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value.replace("@", "") }))} placeholder="usuario (sem @)" />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 auto" }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data da Compra</label>
                <input className="input" type="date" value={form.dataCompra} onChange={(e) => setForm((p) => ({ ...p, dataCompra: e.target.value }))} style={{ width: "auto", minWidth: 0 }} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Variante</label>
                <select className="input" value={form.variante} onChange={(e) => setForm((p) => ({ ...p, variante: e.target.value as VarianteBox }))}>
                  {Object.entries(VARIANTES).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status de Entrega</label>
              <select className="input" value={form.statusEntrega} onChange={(e) => setForm((p) => ({ ...p, statusEntrega: e.target.value as StatusEntrega }))}>
                {Object.entries(ENTREGA_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nível de Engajamento</label>
              <select className="input" value={form.nivelEngajamento} onChange={(e) => setForm((p) => ({ ...p, nivelEngajamento: e.target.value as NivelEngajamento }))}>
                {Object.entries(ENGAJAMENTO_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status Upsell</label>
              <select className="input" value={form.statusUpsell} onChange={(e) => setForm((p) => ({ ...p, statusUpsell: e.target.value as StatusUpsell }))}>
                {Object.entries(UPSELL_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Acesso BW</label>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => setForm((p) => ({ ...p, temAcessoBW: v }))}
                    style={{ flex: 1, fontSize: 12, padding: "9px 8px", borderRadius: 8, cursor: "pointer", border: `1px solid ${form.temAcessoBW === v ? (v ? "var(--gold)" : "rgba(252,165,165,0.5)") : "var(--border)"}`, background: form.temAcessoBW === v ? (v ? "rgba(201,168,76,0.15)" : "rgba(252,165,165,0.08)") : "var(--bg-input)", color: form.temAcessoBW === v ? (v ? "var(--gold)" : "#fca5a5") : "var(--text-muted)", fontWeight: form.temAcessoBW === v ? 600 : 400 }}>
                    {v ? "Tem BW" : "Só Livro"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
              <textarea className="input" value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} placeholder="Observações..." rows={3} style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setForm(FORM_VAZIO); }}>Cancelar</button>
            <button className="btn-gold" onClick={salvarNova} disabled={!form.nome.trim() || salvando} style={{ fontSize: 13 }}>
              {salvando ? "Salvando..." : "Salvar Compradora"}
            </button>
          </div>
        </div>
      )}

      {/* Busca + Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
          style={{ flex: "1 1 220px", padding: "8px 12px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 2 }}>Entrega:</span>
          {(["todas", "pendente", "enviado", "entregue"] as const).map((f) => (
            <button key={f} onClick={() => setFiltroEntrega(f)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: filtroEntrega === f ? "var(--gold)" : "var(--bg-card)", color: filtroEntrega === f ? "#000" : "var(--text-soft)", cursor: "pointer", fontWeight: filtroEntrega === f ? 700 : 400 }}>
              {f === "todas" ? "Todas" : ENTREGA_CONFIG[f].label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 2 }}>Upsell:</span>
          {(["todas", "nao-abordada", "em-conversa", "convertida"] as const).map((f) => (
            <button key={f} onClick={() => setFiltroUpsell(f)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: filtroUpsell === f ? "var(--gold)" : "var(--bg-card)", color: filtroUpsell === f ? "#000" : "var(--text-soft)", cursor: "pointer", fontWeight: filtroUpsell === f ? 700 : 400 }}>
              {f === "todas" ? "Todos" : UPSELL_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtradas.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{termo ? "Nenhuma compradora encontrada para essa pesquisa." : "Nenhuma compradora encontrada com esses filtros."}</p>
          </div>
        )}
        {filtradas.map((c) => {
          const varCfg = VARIANTES[c.variante];
          const entregaCfg = ENTREGA_CONFIG[c.status_entrega];
          const upsellCfg = UPSELL_CONFIG[c.status_upsell];
          const EntregaIcon = entregaCfg.icon;
          const isOpen = detalhe?.id === c.id;

          return (
            <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="box-livro-row" onClick={() => setDetalhe(isOpen ? null : c)}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: varCfg.bg, color: varCfg.cor, border: `1px solid ${varCfg.cor}40` }}>
                  {c.nome.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: varCfg.bg, color: varCfg.cor, whiteSpace: "nowrap" }}>{varCfg.label}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(c.data_compra + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                    {c.tem_acesso_bw && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(201,168,76,0.15)", color: "var(--gold)", whiteSpace: "nowrap" }}>BW</span>}
                  </div>
                </div>
                <div className="blr-col" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <EntregaIcon size={14} style={{ color: entregaCfg.cor }} />
                  <span style={{ fontSize: 12, color: entregaCfg.cor, fontWeight: 600 }}>{entregaCfg.label}</span>
                </div>
                <div className="blr-col" style={{ minWidth: 110 }}>
                  <EngajamentoBarra nivel={c.nivel_engajamento} />
                </div>
                <div className="blr-col">
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: upsellCfg.bg, color: upsellCfg.cor, whiteSpace: "nowrap" }}>{upsellCfg.label}</span>
                </div>
                <div style={{ color: "var(--text-muted)", display: "flex", justifyContent: "center" }}>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", background: "var(--bg)" }}>
                  {editando?.id === c.id ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome</label>
                          <input className="input" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>E-mail</label>
                          <input className="input" type="email" value={editando.email ?? ""} onChange={(e) => setEditando({ ...editando, email: e.target.value || null })} placeholder="email@exemplo.com" />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WhatsApp</label>
                          <input className="input" value={editando.whatsapp ?? ""} onChange={(e) => setEditando({ ...editando, whatsapp: e.target.value.replace(/\D/g, "") || null })} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Instagram</label>
                          <input className="input" value={editando.instagram ?? ""} onChange={(e) => setEditando({ ...editando, instagram: e.target.value.replace("@", "") || null })} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status de Entrega</label>
                          <select className="input" value={editando.status_entrega} onChange={(e) => setEditando({ ...editando, status_entrega: e.target.value as StatusEntrega })}>
                            {Object.entries(ENTREGA_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Engajamento</label>
                          <select className="input" value={editando.nivel_engajamento} onChange={(e) => setEditando({ ...editando, nivel_engajamento: e.target.value as NivelEngajamento })}>
                            {Object.entries(ENGAJAMENTO_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Upsell</label>
                          <select className="input" value={editando.status_upsell} onChange={(e) => setEditando({ ...editando, status_upsell: e.target.value as StatusUpsell })}>
                            {Object.entries(UPSELL_CONFIG).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
                          <textarea className="input" value={editando.notas ?? ""} onChange={(e) => setEditando({ ...editando, notas: e.target.value || null })} rows={3} style={{ resize: "vertical" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
                        <button className="btn-gold" style={{ fontSize: 13 }} onClick={salvarEdicao} disabled={salvando}>
                          {salvando ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Contato</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {c.email && <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gold)", textDecoration: "none" }}><Mail size={14} />{c.email}</a>}
                          {c.whatsapp && <a href={`https://wa.me/55${c.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#86efac", textDecoration: "none" }}><MessageCircle size={14} />{c.whatsapp}</a>}
                          {c.instagram && <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c084fc", textDecoration: "none" }}><Instagram size={14} />@{c.instagram}</a>}
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Compra: {new Date(c.data_compra + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                        </div>
                        {c.notas && <div style={{ marginTop: 16 }}><p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notas</p><p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{c.notas}</p></div>}
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status & Acompanhamento</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Entrega</p>
                            <div style={{ display: "flex", gap: 8 }}>
                              {(["pendente", "enviado", "entregue"] as StatusEntrega[]).map((s) => {
                                const cfg = ENTREGA_CONFIG[s]; const ativo = c.status_entrega === s;
                                return <button key={s} onClick={(e) => { e.stopPropagation(); atualizarCampo(c.id, "statusEntrega", s); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? cfg.cor : "var(--border)"}`, background: ativo ? cfg.bg : "transparent", color: ativo ? cfg.cor : "var(--text-muted)", fontWeight: ativo ? 600 : 400 }}>{cfg.label}</button>;
                              })}
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Engajamento</p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {(["sem-contato", "recebeu", "lendo", "postou", "engajada"] as NivelEngajamento[]).map((s) => {
                                const cfg = ENGAJAMENTO_CONFIG[s]; const ativo = c.nivel_engajamento === s;
                                return <button key={s} onClick={(e) => { e.stopPropagation(); atualizarCampo(c.id, "nivelEngajamento", s); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? cfg.cor : "var(--border)"}`, background: ativo ? `${cfg.cor}18` : "transparent", color: ativo ? cfg.cor : "var(--text-muted)", fontWeight: ativo ? 600 : 400 }}>{cfg.label}</button>;
                              })}
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Upsell para Mentoria</p>
                            <div style={{ display: "flex", gap: 8 }}>
                              {(["nao-abordada", "em-conversa", "convertida"] as StatusUpsell[]).map((s) => {
                                const cfg = UPSELL_CONFIG[s]; const ativo = c.status_upsell === s;
                                return <button key={s} onClick={(e) => { e.stopPropagation(); atualizarCampo(c.id, "statusUpsell", s); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? cfg.cor : "var(--border)"}`, background: ativo ? cfg.bg : "transparent", color: ativo ? cfg.cor : "var(--text-muted)", fontWeight: ativo ? 600 : 400 }}>{cfg.label}</button>;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <ProdutosAcesso email={c.email} nome={c.nome} />
                      </div>
                      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setEditando({ ...c }); }}><Pencil size={12} /> Editar dados</button>
                        <button style={{ fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); excluir(c.id); }}><Trash2 size={12} /> Excluir</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alerta: receberam mas sem contato */}
      {compradoras.some((c) => c.status_entrega === "entregue" && c.nivel_engajamento === "sem-contato") && (
        <div className="card" style={{ marginTop: 24, padding: 20, border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <AlertCircle size={16} style={{ color: "#fbbf24" }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", margin: 0 }}>Receberam mas ainda não houve contato</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {compradoras.filter((c) => c.status_entrega === "entregue" && c.nivel_engajamento === "sem-contato").map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: "rgba(251,191,36,0.12)", color: "#fbbf24", flexShrink: 0 }}>{c.nome.charAt(0)}</div>
                <span style={{ fontSize: 13, flex: 1 }}>{c.nome}</span>
                {c.whatsapp && <a href={`https://wa.me/55${c.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#86efac", textDecoration: "none" }}><MessageCircle size={13} />Chamar no WA</a>}
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
