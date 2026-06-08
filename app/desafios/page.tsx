"use client";

import { useState, useEffect } from "react";
import { Trophy, Plus, X, Users, Clock, Send, Flame, Tag, ChevronDown, ChevronUp, Trash2, Loader2, User, Pencil } from "lucide-react";

type Pilar = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia";
type Destino = "todas-bw" | "individual";

interface Mentorada { id: string; nome: string; }

interface Desafio {
  id: string;
  titulo: string;
  descricao: string | null;
  pilar: Pilar;
  prazo: string | null;
  destino: Destino;
  mentorada_id: string | null;
  mentorada_nome: string | null;
  criado_em: string;
}

const pilarCor: Record<Pilar, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia",
};

const FORM_VAZIO = {
  titulo: "", descricao: "", pilar: "Fe" as Pilar,
  prazo: "", destino: "todas-bw" as Destino, mentorada_id: "",
};

function formatarData(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)]}`;
}

function formatarEnvio(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Desafios() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEdicao, setFormEdicao] = useState(FORM_VAZIO);

  useEffect(() => {
    Promise.all([
      fetch("/api/desafios").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([desafData, mentData]) => {
      setDesafios(Array.isArray(desafData) ? desafData : []);
      setMentoradas(Array.isArray(mentData) ? mentData.map((m: Mentorada) => ({ id: m.id, nome: m.nome })) : []);
      setCarregando(false);
    });
  }, []);

  async function enviar() {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    const res = await fetch("/api/desafios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo:       form.titulo,
        descricao:    form.descricao    || null,
        pilar:        form.pilar,
        prazo:        form.prazo        || null,
        destino:      form.destino,
        mentorada_id: form.destino === "individual" ? form.mentorada_id || null : null,
      }),
    });
    const raw = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setDesafios((prev) => [raw, ...prev]);
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  function abrirEdicao(d: Desafio) {
    setFormEdicao({
      titulo:       d.titulo,
      descricao:    d.descricao    ?? "",
      pilar:        d.pilar,
      prazo:        d.prazo        ?? "",
      destino:      d.destino,
      mentorada_id: d.mentorada_id ?? "",
    });
    setEditandoId(d.id);
  }

  async function salvarEdicao() {
    if (!editandoId || !formEdicao.titulo.trim()) return;
    setSalvando(true);
    const res = await fetch("/api/desafios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:           editandoId,
        titulo:       formEdicao.titulo,
        descricao:    formEdicao.descricao    || null,
        pilar:        formEdicao.pilar,
        prazo:        formEdicao.prazo        || null,
        destino:      formEdicao.destino,
        mentorada_id: formEdicao.destino === "individual" ? formEdicao.mentorada_id || null : null,
        mentorada_nome: formEdicao.destino !== "individual" ? null : undefined,
      }),
    });
    const raw = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setDesafios((prev) => prev.map((d) => d.id === editandoId ? raw : d));
    setEditandoId(null);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este desafio?")) return;
    await fetch(`/api/desafios?id=${id}`, { method: "DELETE" });
    setDesafios((prev) => prev.filter((d) => d.id !== id));
  }

  function DesafioForm({
    f, setF, onSalvar, onCancelar, labelSalvar,
  }: {
    f: typeof FORM_VAZIO;
    setF: (v: typeof FORM_VAZIO) => void;
    onSalvar: () => void;
    onCancelar: () => void;
    labelSalvar: string;
  }) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} style={{ padding: "10px 12px", fontSize: 13, width: "100%" }} placeholder="Título do desafio..." />
        <textarea value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} style={{ padding: "10px 12px", fontSize: 13, width: "100%", minHeight: 80, resize: "vertical" }} placeholder="Descreva o desafio — o que a mentorada deve fazer?" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Pilar</p>
            <select value={f.pilar} onChange={(e) => setF({ ...f, pilar: e.target.value as Pilar })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
              {(["Fe","Mentalidade","Lideranca","Emocional","Familia"] as Pilar[]).map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Prazo</p>
            <input type="date" value={f.prazo} onChange={(e) => setF({ ...f, prazo: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "auto" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Enviar para</p>
            <select value={f.destino} onChange={(e) => setF({ ...f, destino: e.target.value as Destino, mentorada_id: "" })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
              <option value="todas-bw">Todas as BW</option>
              <option value="individual">Mentorada específica</option>
            </select>
          </div>
        </div>
        {f.destino === "individual" && (
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Mentorada</p>
            <select value={f.mentorada_id} onChange={(e) => setF({ ...f, mentorada_id: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
              <option value="">Selecionar...</option>
              {mentoradas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button className="btn-gold flex items-center gap-2" onClick={onSalvar} disabled={salvando || !f.titulo.trim() || (f.destino === "individual" && !f.mentorada_id)}>
            {salvando ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
            {salvando ? "Salvando..." : labelSalvar}
          </button>
          <button onClick={onCancelar} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando desafios...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Trophy size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Desafios</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Lançar Desafios</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Crie e envie desafios para todas as BW ou para uma mentorada específica.
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); }}>
          <Plus size={14} /> Novo Desafio
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total",      value: desafios.length,                                              color: "var(--gold)" },
          { label: "Para todas", value: desafios.filter((d) => d.destino === "todas-bw").length,      color: "#a78bfa" },
          { label: "Individuais",value: desafios.filter((d) => d.destino === "individual").length,    color: "#93c5fd" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form novo */}
      {mostrarForm && (
        <div className="card" style={{ padding: "20px 22px", marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Novo Desafio</p>
            <button onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <DesafioForm f={form} setF={setForm} onSalvar={enviar} onCancelar={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} labelSalvar="Enviar Desafio" />
        </div>
      )}

      {desafios.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Trophy size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum desafio criado ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Novo Desafio&quot; para começar.</p>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {desafios.map((d) => {
          const aberto = expandido === d.id;
          const editando = editandoId === d.id;
          return (
            <div key={d.id} className="card" style={{ padding: "16px 18px" }}>
              {editando ? (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Editar Desafio</p>
                  <DesafioForm f={formEdicao} setF={setFormEdicao} onSalvar={salvarEdicao} onCancelar={() => setEditandoId(null)} labelSalvar="Salvar alterações" />
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Flame size={16} style={{ color: "var(--gold)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{d.titulo}</p>
                        <span className={`tag ${pilarCor[d.pilar]}`} style={{ fontSize: 10 }}><Tag size={9} /> {d.pilar}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: d.destino === "todas-bw" ? "rgba(201,168,76,0.12)" : "rgba(147,197,253,0.1)", color: d.destino === "todas-bw" ? "var(--gold)" : "#93c5fd", border: `1px solid ${d.destino === "todas-bw" ? "var(--gold-border)" : "rgba(147,197,253,0.2)"}` }}>
                          {d.destino === "todas-bw" ? <><Users size={9} /> Todas as BW</> : <><User size={9} /> {d.mentorada_nome?.split(" ")[0]}</>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3" style={{ fontSize: 10, color: "var(--text-muted)", flexWrap: "wrap" }}>
                        <span className="flex items-center gap-1"><Clock size={9} /> {formatarEnvio(d.criado_em)}</span>
                        {d.prazo && <span>Prazo: {formatarData(d.prazo)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {d.descricao && (
                        <button onClick={() => setExpandido(aberto ? null : d.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                          {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      <button onClick={() => abrirEdicao(d)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => excluir(d.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, opacity: 0.5 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {aberto && d.descricao && (
                    <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 12 }}>
                      <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.7, margin: 0 }}>{d.descricao}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
