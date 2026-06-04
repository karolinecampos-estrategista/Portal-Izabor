"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, Plus, X, Loader2 } from "lucide-react";

type Marco = { id: string; texto: string; feito: boolean; semana: string; ordem: number };
type Plano = { id: string; mentorada_nome: string; cor: string; programa: string; marcos: Marco[] };

const PROGRAMAS = ["Mentoria BW", "Mentoria Individual", "Club BW", "Imersão BW"];

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [mentoradas, setMentoradas] = useState<{ id: string; nome: string; cor: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [marcoInput, setMarcoInput] = useState("");
  const [marcoSemana, setMarcoSemana] = useState("");

  const [form, setForm] = useState({
    mentorada_nome: "",
    programa: "Mentoria BW",
    marcos: [] as { texto: string; semana: string }[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/planos").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([planosData, mentData]) => {
      setPlanos(Array.isArray(planosData) ? planosData : []);
      setMentoradas(Array.isArray(mentData) ? mentData : []);
      setCarregando(false);
    });
  }, []);

  function abrirModal() {
    setForm({ mentorada_nome: "", programa: "Mentoria BW", marcos: [] });
    setMarcoInput("");
    setMarcoSemana("");
    setModalAberto(true);
  }

  function adicionarMarco() {
    if (!marcoInput.trim()) return;
    setForm((f) => ({ ...f, marcos: [...f.marcos, { texto: marcoInput.trim(), semana: marcoSemana || "A definir" }] }));
    setMarcoInput("");
    setMarcoSemana("");
  }

  function removerMarco(i: number) {
    setForm((f) => ({ ...f, marcos: f.marcos.filter((_, idx) => idx !== i) }));
  }

  async function salvar() {
    if (!form.mentorada_nome || form.marcos.length === 0) return;
    setSalvando(true);
    const mentorada = mentoradas.find((m) => m.nome === form.mentorada_nome);
    const res = await fetch("/api/planos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_nome: form.mentorada_nome,
        cor: mentorada?.cor ?? "#C9A84C",
        programa: form.programa,
        marcos: form.marcos.map((m, i) => ({ texto: m.texto, semana: m.semana, ordem: i })),
      }),
    });
    const raw = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setPlanos((prev) => [raw, ...prev]);
    setModalAberto(false);
  }

  async function toggleMarco(planoId: string, marcoId: string, feitoAtual: boolean) {
    // Otimista
    setPlanos((prev) => prev.map((p) => p.id === planoId ? {
      ...p,
      marcos: p.marcos.map((m) => m.id === marcoId ? { ...m, feito: !feitoAtual } : m),
    } : p));
    await fetch("/api/planos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marco_id: marcoId, feito: !feitoAtual }),
    });
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando planos...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FileText size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Mentoradas</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Planos de Ação</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Os marcos individuais de cada mentorada na jornada.</p>
        </div>
        <button onClick={abrirModal} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "var(--gold)", border: "none", cursor: "pointer", color: "#000", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Novo Plano
        </button>
      </div>

      {planos.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum plano de ação criado ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Novo Plano&quot; para começar.</p>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {planos.map((p) => {
          const marcosOrdenados = [...(p.marcos ?? [])].sort((a, b) => a.ordem - b.ordem);
          const feitos = marcosOrdenados.filter((m) => m.feito).length;
          const prog = marcosOrdenados.length > 0 ? Math.round((feitos / marcosOrdenados.length) * 100) : 0;
          return (
            <div key={p.id} className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: p.cor + "20", border: `1px solid ${p.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: p.cor, fontWeight: 700, flexShrink: 0 }}>
                  {p.mentorada_nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{p.mentorada_nome}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{p.programa}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: p.cor, margin: 0 }}>{prog}%</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{feitos}/{marcosOrdenados.length} marcos</p>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ height: 5, background: "var(--bg-input)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${prog}%`, background: p.cor, borderRadius: 999, transition: "width 0.4s" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {marcosOrdenados.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMarco(p.id, m.id, m.feito)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: m.feito ? p.cor + "0D" : "var(--bg-input)", border: `1px solid ${m.feito ? p.cor + "30" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                  >
                    {m.feito
                      ? <CheckCircle size={15} style={{ color: p.cor, flexShrink: 0 }} />
                      : <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid var(--border)", flexShrink: 0 }} />
                    }
                    <span style={{ flex: 1, fontSize: 12, color: m.feito ? "var(--text-soft)" : "var(--text)", textDecoration: m.feito ? "line-through" : "none" }}>{m.texto}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{m.semana}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={16} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Novo Plano de Ação</span>
              </div>
              <button onClick={() => setModalAberto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><X size={18} /></button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Mentorada *</label>
                <select value={form.mentorada_nome} onChange={(e) => setForm((f) => ({ ...f, mentorada_nome: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: form.mentorada_nome ? "var(--text)" : "var(--text-muted)", fontSize: 13, outline: "none" }}>
                  <option value="">Selecione a mentorada</option>
                  {mentoradas.map((m) => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Programa</label>
                <select value={form.programa} onChange={(e) => setForm((f) => ({ ...f, programa: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}>
                  {PROGRAMAS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Marcos da Jornada * <span style={{ fontWeight: 400 }}>(pelo menos 1)</span></label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="text" value={marcoInput} onChange={(e) => setMarcoInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarMarco(); } }} placeholder="Descreva o marco a conquistar" style={{ flex: 1, padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
                  <input type="text" value={marcoSemana} onChange={(e) => setMarcoSemana(e.target.value)} placeholder="Semana" style={{ width: 90, padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
                  <button onClick={adicionarMarco} style={{ padding: "9px 14px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 8, cursor: "pointer", color: "var(--gold)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>+ Add</button>
                </div>
                {form.marcos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {form.marcos.map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid var(--border)", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: "var(--text-soft)" }}>{m.texto}</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.semana}</span>
                        <button onClick={() => removerMarco(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => setModalAberto(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
                <button onClick={salvar} disabled={!form.mentorada_nome || form.marcos.length === 0 || salvando} style={{ flex: 2, padding: "12px", borderRadius: 10, background: !form.mentorada_nome || form.marcos.length === 0 ? "rgba(201,168,76,0.3)" : "var(--gold)", border: "none", cursor: !form.mentorada_nome || form.marcos.length === 0 ? "not-allowed" : "pointer", color: "#000", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {salvando ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : "Salvar Plano"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
