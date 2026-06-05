"use client";

import { useState, useEffect } from "react";
import {
  Flame, Plus, X, MessageCircle, Instagram, Trash2, Mail,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Pencil, Loader2, Users,
} from "lucide-react";
import ProdutosAcesso from "@/components/ProdutosAcesso";

type StatusAcesso = "confirmado" | "pendente" | "cancelado";
type Presenca = "pendente" | "presente" | "ausente";
type TipoIngresso = "vip" | "geral" | "cortesia";

interface Compradora {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  data_compra: string;
  tipo_ingresso: TipoIngresso;
  status_acesso: StatusAcesso;
  presenca: Presenca;
  notas: string | null;
}

const statusCfg: Record<StatusAcesso, { label: string; cor: string; bg: string }> = {
  confirmado: { label: "Confirmado", cor: "#86efac", bg: "rgba(134,239,172,0.12)" },
  pendente:   { label: "Pendente",   cor: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  cancelado:  { label: "Cancelado",  cor: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
};

const presencaCfg: Record<Presenca, { label: string; cor: string }> = {
  pendente:  { label: "Aguardando", cor: "#6b7280" },
  presente:  { label: "Presente",   cor: "#86efac" },
  ausente:   { label: "Ausente",    cor: "#fca5a5" },
};

const ingressoCfg: Record<TipoIngresso, { label: string; cor: string }> = {
  vip:      { label: "VIP",      cor: "#C9A84C" },
  geral:    { label: "Geral",    cor: "#93c5fd" },
  cortesia: { label: "Cortesia", cor: "#a78bfa" },
};

function formatData(iso: string) {
  const [, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)-1]}`;
}

const FORM_VAZIO: Omit<Compradora, "id"> = {
  nome: "", email: null, whatsapp: null, instagram: null,
  data_compra: new Date().toISOString().split("T")[0],
  tipo_ingresso: "geral", status_acesso: "confirmado", presenca: "pendente", notas: null,
};

export default function EventoCompradores() {
  const [compradoras, setCompradoras] = useState<Compradora[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Omit<Compradora, "id">>(FORM_VAZIO);
  const [showForm, setShowForm] = useState(false);
  const [detalhe, setDetalhe] = useState<Compradora | null>(null);
  const [editando, setEditando] = useState<Compradora | null>(null);
  const [filtro, setFiltro] = useState<StatusAcesso | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/evento")
      .then(r => r.json())
      .then(d => { setCompradoras(Array.isArray(d) ? d : []); setCarregando(false); });
  }, []);

  async function adicionar() {
    if (!form.nome.trim() || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dataCompra: form.data_compra, statusAcesso: form.status_acesso, tipoIngresso: form.tipo_ingresso }),
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
    const res = await fetch("/api/evento", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editando, dataCompra: editando.data_compra, statusAcesso: editando.status_acesso, tipoIngresso: editando.tipo_ingresso }),
    });
    const at = await res.json();
    if (at?.id) {
      setCompradoras(prev => prev.map(c => c.id === at.id ? at : c));
      if (detalhe?.id === at.id) setDetalhe(at);
    }
    setEditando(null);
    setSalvando(false);
  }

  async function atualizarCampo(id: string, campo: string, valor: string) {
    setCompradoras(prev => prev.map(c => c.id === id ? { ...c, [campo]: valor } : c));
    if (detalhe?.id === id) setDetalhe(d => d ? { ...d, [campo]: valor } : d);
    const key = campo === "status_acesso" ? "statusAcesso" : campo === "tipo_ingresso" ? "tipoIngresso" : campo;
    await fetch("/api/evento", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [key]: valor }),
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este participante?")) return;
    await fetch(`/api/evento?id=${id}`, { method: "DELETE" });
    setCompradoras(prev => prev.filter(c => c.id !== id));
    setDetalhe(null);
  }

  const termo = busca.toLowerCase().trim();
  const filtradas = compradoras.filter(c =>
    (filtro === "todas" || c.status_acesso === filtro) &&
    (!termo || c.nome.toLowerCase().includes(termo) || c.email?.toLowerCase().includes(termo) || c.whatsapp?.includes(termo))
  );
  const confirmados = compradoras.filter(c => c.status_acesso === "confirmado").length;
  const presentes   = compradoras.filter(c => c.presenca === "presente").length;

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
            <Flame size={16} style={{ color: "#fca5a5" }} />
            <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Simplesmente Seja · Evento</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Participantes do Evento</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{confirmados} confirmado{confirmados !== 1 ? "s" : ""} · {presentes} presente{presentes !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setShowForm(!showForm); setForm(FORM_VAZIO); }}>
          <Plus size={14} /> Nova Participante
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",         value: compradoras.length, cor: "var(--gold)" },
          { label: "Confirmados",   value: confirmados,        cor: "#86efac" },
          { label: "Presentes",     value: presentes,          cor: "#a78bfa" },
          { label: "VIP",           value: compradoras.filter(c => c.tipo_ingresso === "vip").length, cor: "#C9A84C" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.cor, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: "1px solid rgba(252,165,165,0.3)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nova Participante</h3>
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
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo de Ingresso</label>
              <select value={form.tipo_ingresso} onChange={e => setForm({ ...form, tipo_ingresso: e.target.value as TipoIngresso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="geral">Geral</option>
                <option value="vip">VIP</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
              <select value={form.status_acesso} onChange={e => setForm({ ...form, status_acesso: e.target.value as StatusAcesso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data da Compra</label>
              <input type="date" value={form.data_compra} onChange={e => setForm({ ...form, data_compra: e.target.value })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas ?? ""} onChange={e => setForm({ ...form, notas: e.target.value || null })} rows={2} style={{ width: "100%", padding: "9px 12px", fontSize: 13, resize: "vertical" }} placeholder="Observações..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end" style={{ marginTop: 14 }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-gold" onClick={adicionar} disabled={!form.nome.trim() || salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
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
        {(["todas", "confirmado", "pendente", "cancelado"] as const).map(f => {
          const cfg = f === "todas" ? null : statusCfg[f];
          return (
            <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtro === f ? (cfg?.cor ?? "var(--gold)") + "80" : "var(--border)"}`, background: filtro === f ? (cfg?.bg ?? "var(--gold-light)") : "transparent", color: filtro === f ? (cfg?.cor ?? "var(--gold)") : "var(--text-muted)", fontWeight: filtro === f ? 700 : 400 }}>
              {f === "todas" ? "Todas" : cfg!.label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <Flame size={28} style={{ color: "#fca5a5", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>{termo ? "Nenhuma participante encontrada para essa pesquisa." : "Nenhuma participante cadastrada ainda."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map(c => {
            const sCfg = statusCfg[c.status_acesso];
            const iCfg = ingressoCfg[c.tipo_ingresso];
            const pCfg = presencaCfg[c.presenca];
            const aberto = detalhe?.id === c.id;
            return (
              <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }} onClick={() => setDetalhe(aberto ? null : c)}>
                  <div className="avatar" style={{ width: 38, height: 38, background: "rgba(252,165,165,0.15)", color: "#fca5a5", fontSize: 13, flexShrink: 0 }}>
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{c.nome}</p>
                    <div className="flex items-center gap-2" style={{ flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: iCfg.cor + "18", color: iCfg.cor }}>{iCfg.label}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatData(c.data_compra)}</span>
                      {c.email && <span style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{c.email}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: pCfg.cor, flexShrink: 0 }}>{pCfg.label}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, color: sCfg.cor, background: sCfg.bg, flexShrink: 0 }}>
                    {sCfg.label}
                  </span>
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
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ingresso</label>
                          <select value={editando.tipo_ingresso} onChange={e => setEditando({ ...editando, tipo_ingresso: e.target.value as TipoIngresso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                            <option value="geral">Geral</option><option value="vip">VIP</option><option value="cortesia">Cortesia</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
                          <select value={editando.status_acesso} onChange={e => setEditando({ ...editando, status_acesso: e.target.value as StatusAcesso })} style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                            <option value="confirmado">Confirmado</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option>
                          </select>
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
                            {c.email && <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gold)", textDecoration: "none" }}><Mail size={13} /> {c.email}</a>}
                            {c.whatsapp && <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#86efac", textDecoration: "none" }}><MessageCircle size={13} /> {c.whatsapp}</a>}
                            {c.instagram && <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c084fc", textDecoration: "none" }}><Instagram size={13} /> @{c.instagram}</a>}
                          </div>
                          {c.notas && <div style={{ marginTop: 12 }}><p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notas</p><p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{c.notas}</p></div>}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Presença no Evento</p>
                          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                            {(["pendente","presente","ausente"] as Presenca[]).map(p => {
                              const pc = presencaCfg[p]; const ativo = c.presenca === p;
                              return <button key={p} onClick={() => atualizarCampo(c.id, "presenca", p)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? pc.cor + "80" : "var(--border)"}`, background: ativo ? pc.cor + "18" : "transparent", color: ativo ? pc.cor : "var(--text-muted)", fontWeight: ativo ? 700 : 400 }}>{pc.label}</button>;
                            })}
                          </div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Status do Ingresso</p>
                          <div style={{ display: "flex", gap: 6 }}>
                            {(["confirmado","pendente","cancelado"] as StatusAcesso[]).map(s => {
                              const sc = statusCfg[s]; const ativo = c.status_acesso === s;
                              return <button key={s} onClick={() => atualizarCampo(c.id, "status_acesso", s)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${ativo ? sc.cor + "80" : "var(--border)"}`, background: ativo ? sc.bg : "transparent", color: ativo ? sc.cor : "var(--text-muted)", fontWeight: ativo ? 700 : 400 }}>{sc.label}</button>;
                            })}
                          </div>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <ProdutosAcesso email={c.email} nome={c.nome} />
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
