"use client";

import { useState } from "react";
import { PenLine, Plus, Instagram, Youtube, Flame, Star, X, Pencil, Trash2 } from "lucide-react";

type Canal = "Instagram" | "YouTube";
type Formato = "Reels" | "Carrossel" | "Stories" | "Post" | "Video" | "Shorts" | "Live";
type StatusConteudo = "publicado" | "agendado" | "rascunho" | "ideia";
type Pilar = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia";

interface Conteudo {
  id: number;
  titulo: string;
  formato: Formato;
  canal: Canal;
  pilar: Pilar;
  hora: string;
  data: string;
  status: StatusConteudo;
  gancho: string;
  cta: string;
}

const CONTEUDOS_INICIAL: Conteudo[] = [
  { id: 1, titulo: "A mulher que larga o controle e descansa em Deus", formato: "Reels", canal: "Instagram", pilar: "Fe", hora: "08:00", data: "2026-05-26", status: "agendado", gancho: "Voce tem tentado controlar o que so Deus pode resolver?", cta: "Me siga para mais mensagens como essa" },
  { id: 2, titulo: "Casamento e alianca, nao campo de batalha", formato: "Carrossel", canal: "Instagram", pilar: "Familia", hora: "19:00", data: "2026-05-29", status: "agendado", gancho: "Casamento nao e quem tem razao. E quem escolhe ficar.", cta: "Me segue se voce acredita em casamento e familia" },
  { id: 3, titulo: "5 sinais de cansaco emocional que voce ignora", formato: "Carrossel", canal: "Instagram", pilar: "Emocional", hora: "12:00", data: "2026-05-28", status: "ideia", gancho: "Voce nao esta cansada — esta sobrecarregada emocionalmente.", cta: "Salva esse post e compartilha com uma amiga que precisa ver isso." },
  { id: 4, titulo: "LIVE: Inteligencia Emocional para Mulheres Lideres", formato: "Live", canal: "Instagram", pilar: "Emocional", hora: "20:00", data: "2026-05-29", status: "agendado", gancho: "Vou falar sobre como parar de explodir nas situacoes erradas.", cta: "Ativa o lembrete da live!" },
  { id: 5, titulo: "O segredo que sustenta o publico", formato: "Video", canal: "YouTube", pilar: "Fe", hora: "10:00", data: "2026-05-26", status: "publicado", gancho: "O que voce gera no secreto com Deus e o que te sustenta em publico.", cta: "Se inscreve no canal e ativa o sino" },
  { id: 6, titulo: "Serie A Mulher que o Mundo Esta Criando — Ep. 3", formato: "Video", canal: "YouTube", pilar: "Lideranca", hora: "17:00", data: "2026-05-27", status: "rascunho", gancho: "Que tipo de mulher o mundo moderno esta moldando?", cta: "Comenta aqui: voce se identifica com esse padrao?" },
  { id: 7, titulo: "Lideranca feminina nao e dominar — e elevar", formato: "Video", canal: "YouTube", pilar: "Lideranca", hora: "15:00", data: "2026-06-03", status: "ideia", gancho: "A mulher que lidera com fe nao precisa gritar para ser ouvida.", cta: "Curte o video se isso te tocou" },
];

const statusConfig: Record<StatusConteudo, { label: string; color: string; bg: string }> = {
  publicado: { label: "Publicado", color: "#86efac", bg: "rgba(134,239,172,0.1)" },
  agendado:  { label: "Agendado",  color: "#C9A84C", bg: "rgba(201,168,76,0.1)" },
  rascunho:  { label: "Rascunho",  color: "#93c5fd", bg: "rgba(147,197,253,0.1)" },
  ideia:     { label: "Ideia",     color: "var(--text-muted)", bg: "var(--bg-input)" },
};

const canalConfig: Record<Canal, { icon: React.ReactNode; color: string; bg: string }> = {
  Instagram: { icon: <Instagram size={13} />, color: "#f9a8d4", bg: "rgba(236,72,153,0.1)" },
  YouTube:   { icon: <Youtube size={13} />,   color: "#fca5a5", bg: "rgba(252,165,165,0.1)" },
};

const catColor: Record<Pilar, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia",
};

const PILARES: Pilar[] = ["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia"];
const FORMATOS_INSTA: Formato[] = ["Reels", "Carrossel", "Stories", "Post", "Live"];
const FORMATOS_YT: Formato[] = ["Video", "Shorts", "Live"];
const FORM_VAZIO: Omit<Conteudo, "id"> = { titulo: "", formato: "Reels", canal: "Instagram", pilar: "Fe", hora: "09:00", data: "", status: "rascunho", gancho: "", cta: "" };

export default function Conteudo() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [detalhe, setDetalhe] = useState<Conteudo | null>(null);
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [formCanal, setFormCanal] = useState<Canal>("Instagram");
  const [form, setForm] = useState<Omit<Conteudo, "id">>(FORM_VAZIO);

  function filtrarLista(lista: Conteudo[]) {
    return lista.filter((c) => filtroStatus === "todos" || c.status === filtroStatus);
  }

  function salvarNovo() {
    setConteudos((prev) => [{ ...form, canal: formCanal, id: Date.now() }, ...prev]);
    setNovoAberto(false);
    setForm(FORM_VAZIO);
  }

  function salvarEdicao() {
    if (!editando) return;
    setConteudos((prev) => prev.map((c) => c.id === editando.id ? editando : c));
    setEditando(null);
    setDetalhe(null);
  }

  function deletar(id: number) {
    setConteudos((prev) => prev.filter((c) => c.id !== id));
    setDetalhe(null);
  }

  function renderCanal(canal: Canal) {
    const lista = filtrarLista(conteudos.filter((c) => c.canal === canal));
    const total = conteudos.filter((c) => c.canal === canal);
    const cfg = canalConfig[canal];
    const formatos = canal === "Instagram" ? FORMATOS_INSTA : FORMATOS_YT;

    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
            <span style={{ color: cfg.color }}>{cfg.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{canal}</span>
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            <span>{total.filter((c) => c.status === "publicado").length} publicados</span>
            <span>{total.filter((c) => c.status === "agendado").length} agendados</span>
          </div>
          <button
            className="flex items-center gap-1"
            style={{ marginLeft: "auto", fontSize: 12, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
            onClick={() => { setFormCanal(canal); setForm({ ...FORM_VAZIO, canal, formato: canal === "Instagram" ? "Reels" : "Video" }); setNovoAberto(true); }}
          >
            <Plus size={12} /> Novo {canal}
          </button>
        </div>

        {lista.length === 0 && (
          <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: 13, textAlign: "center", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
            Nenhum conteudo com esse filtro.
          </div>
        )}

        <div className="flex flex-col gap-2">
          {lista.map((c) => {
            const s = statusConfig[c.status];
            return (
              <div key={c.id} className="card card-hover" style={{ padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${cfg.color}` }} onClick={() => setDetalhe(c)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.titulo}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span className={`tag ${catColor[c.pilar]}`} style={{ fontSize: 10 }}>{c.pilar}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c.formato}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{c.data}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const formatos = formCanal === "Instagram" ? FORMATOS_INSTA : FORMATOS_YT;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <PenLine size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Conteudo</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Calendario de Conteudo</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Sua voz que constroi Mulheres INCOMUNS.</p>
        </div>
      </div>

      {/* Filtro status */}
      <div className="flex items-center gap-2" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {["todos", "publicado", "agendado", "rascunho", "ideia"].map((f) => (
          <button key={f} onClick={() => setFiltroStatus(f)} style={{
            padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer",
            border: filtroStatus === f ? "1px solid var(--gold-border)" : "1px solid var(--border)",
            background: filtroStatus === f ? "var(--gold-light)" : "transparent",
            color: filtroStatus === f ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
          }}>
            {f === "todos" ? "Todos" : statusConfig[f as StatusConteudo]?.label}
          </button>
        ))}
      </div>

      {renderCanal("Instagram")}
      {renderCanal("YouTube")}

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setDetalhe(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <span style={{ color: canalConfig[detalhe.canal].color }}>{canalConfig[detalhe.canal].icon}</span>
                <span className={`tag ${catColor[detalhe.pilar]}`}>{detalhe.pilar}</span>
                <span style={{ fontSize: 11, color: statusConfig[detalhe.status].color, padding: "2px 8px", borderRadius: 999, background: statusConfig[detalhe.status].bg }}>{statusConfig[detalhe.status].label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditando({ ...detalhe }); setDetalhe(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><Pencil size={15} /></button>
                <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
              </div>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{detalhe.titulo}</h2>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20 }}>{detalhe.canal} · {detalhe.formato} · {detalhe.data} as {detalhe.hora}</p>
            <div style={{ marginBottom: 14 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}><Flame size={12} style={{ color: "var(--gold)" }} /><span style={{ fontSize: 11, fontWeight: 600 }}>Gancho</span></div>
              <div className="verse-block" style={{ fontStyle: "normal" }}>{detalhe.gancho}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}><Star size={12} style={{ color: "var(--gold)" }} /><span style={{ fontSize: 11, fontWeight: 600 }}>CTA</span></div>
              <p style={{ fontSize: 13, color: "var(--text-soft)", padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8, margin: 0, lineHeight: 1.6 }}>{detalhe.cta}</p>
            </div>
            <button onClick={() => deletar(detalhe.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setEditando(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Editar Conteudo</h2>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <select value={editando.canal} onChange={(e) => setEditando({ ...editando, canal: e.target.value as Canal })} style={{ padding: "10px 10px", fontSize: 12 }}>
                  <option>Instagram</option><option>YouTube</option>
                </select>
                <select value={editando.formato} onChange={(e) => setEditando({ ...editando, formato: e.target.value as Formato })} style={{ padding: "10px 10px", fontSize: 12 }}>
                  {[...FORMATOS_INSTA, ...FORMATOS_YT].filter((v, i, a) => a.indexOf(v) === i).map((f) => <option key={f}>{f}</option>)}
                </select>
                <select value={editando.pilar} onChange={(e) => setEditando({ ...editando, pilar: e.target.value as Pilar })} style={{ padding: "10px 10px", fontSize: 12 }}>
                  {PILARES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <input value={editando.data} onChange={(e) => setEditando({ ...editando, data: e.target.value })} type="date" style={{ padding: "10px", fontSize: 12 }} />
                <input value={editando.hora} onChange={(e) => setEditando({ ...editando, hora: e.target.value })} type="time" style={{ padding: "10px", fontSize: 12 }} />
                <select value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as StatusConteudo })} style={{ padding: "10px", fontSize: 12 }}>
                  <option value="ideia">Ideia</option><option value="rascunho">Rascunho</option><option value="agendado">Agendado</option><option value="publicado">Publicado</option>
                </select>
              </div>
              <textarea value={editando.gancho} onChange={(e) => setEditando({ ...editando, gancho: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 60, resize: "vertical" }} placeholder="Gancho..." />
              <textarea value={editando.cta} onChange={(e) => setEditando({ ...editando, cta: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 50, resize: "vertical" }} placeholder="CTA..." />
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarEdicao}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo */}
      {novoAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setNovoAberto(false)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-3">
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Novo Conteudo</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: canalConfig[formCanal].bg, padding: "4px 10px", borderRadius: 8 }}>
                  <span style={{ color: canalConfig[formCanal].color }}>{canalConfig[formCanal].icon}</span>
                  <span style={{ fontSize: 12, color: canalConfig[formCanal].color, fontWeight: 600 }}>{formCanal}</span>
                </div>
                <button onClick={() => setFormCanal(formCanal === "Instagram" ? "YouTube" : "Instagram")} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>trocar</button>
              </div>
              <button onClick={() => setNovoAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Titulo..." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value as Formato })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  {formatos.map((f) => <option key={f}>{f}</option>)}
                </select>
                <select value={form.pilar} onChange={(e) => setForm({ ...form, pilar: e.target.value as Pilar })} style={{ padding: "10px 12px", fontSize: 13 }}>
                  {PILARES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <textarea value={form.gancho} onChange={(e) => setForm({ ...form, gancho: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 60, resize: "vertical" }} placeholder="Gancho de abertura..." />
              <textarea value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 50, resize: "vertical" }} placeholder="CTA..." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={{ padding: "10px", fontSize: 12 }} />
                <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ padding: "10px", fontSize: 12 }} />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusConteudo })} style={{ padding: "10px", fontSize: 12 }}>
                  <option value="ideia">Ideia</option><option value="rascunho">Rascunho</option><option value="agendado">Agendado</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setNovoAberto(false)}>Cancelar</button>
                <button className="btn-gold" onClick={salvarNovo} disabled={!form.titulo}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
