"use client";

import { useState } from "react";
import {
  FileText, PlayCircle, Calendar, Plus, Trash2, Users, BookOpen,
} from "lucide-react";

type TipoConteudo = "pdf" | "video" | "link";
type TipoEncontro = "ao-vivo" | "gravado";

interface Material {
  id: number; titulo: string; tipo: TipoConteudo; capitulo: string; url: string; liberado: boolean;
}
interface AulaGravada {
  id: number; titulo: string; descricao: string; linkVideo: string; capitulo: string; duracao: string; liberado: boolean;
}
interface Encontro {
  id: number; tema: string; data: string; hora: string; linkReuniao: string; tipo: TipoEncontro; realizado: boolean;
}

const TIPO_CONTEUDO_CONFIG: Record<TipoConteudo, { label: string; cor: string; icone: React.ReactNode }> = {
  pdf:   { label: "PDF",   cor: "#fca5a5", icone: <FileText size={13} /> },
  video: { label: "Vídeo", cor: "#93c5fd", icone: <PlayCircle size={13} /> },
  link:  { label: "Link",  cor: "#a78bfa", icone: <FileText size={13} /> },
};

const MATERIAIS_INICIAL: Material[] = [
  { id: 1, titulo: "Guia de Leitura — Semanas 1 e 2", tipo: "pdf", capitulo: "Caps. 1 e 2", url: "", liberado: true },
  { id: 2, titulo: "Devocional de 7 dias — Identidade", tipo: "pdf", capitulo: "Cap. 1",     url: "", liberado: true },
  { id: 3, titulo: "Perguntas de Reflexão — Cap. 1-3",  tipo: "pdf", capitulo: "Caps. 1-3",  url: "", liberado: true },
  { id: 4, titulo: "Guia de Leitura — Semanas 3 e 4",  tipo: "pdf", capitulo: "Caps. 4 e 5", url: "", liberado: false },
];

const AULAS_INICIAL: AulaGravada[] = [
  { id: 1, titulo: "Identidade — Quem você é antes da performance", descricao: "Aula introdutória sobre identidade em Deus.", linkVideo: "", capitulo: "Cap. 1", duracao: "38 min", liberado: true },
  { id: 2, titulo: "Crenças que te prendem ao ordinário", descricao: "Como identificar e quebrar crenças limitantes.", linkVideo: "", capitulo: "Cap. 3", duracao: "42 min", liberado: false },
];

const ENCONTROS_INICIAL: Encontro[] = [
  { id: 1, tema: "Caps. 1 e 2 — Identidade", data: "2026-06-10", hora: "20:00", linkReuniao: "", tipo: "ao-vivo", realizado: false },
  { id: 2, tema: "Caps. 3 e 4 — Crenças",    data: "2026-06-24", hora: "20:00", linkReuniao: "", tipo: "ao-vivo", realizado: false },
  { id: 3, tema: "Caps. 5 e 6 — Fé",         data: "2026-07-08", hora: "20:00", linkReuniao: "", tipo: "ao-vivo", realizado: false },
];

const MATERIAL_VAZIO: Omit<Material, "id"> = { titulo: "", tipo: "pdf", capitulo: "", url: "", liberado: false };
const AULA_VAZIA: Omit<AulaGravada, "id"> = { titulo: "", descricao: "", linkVideo: "", capitulo: "", duracao: "", liberado: false };
const ENCONTRO_VAZIO: Omit<Encontro, "id"> = { tema: "", data: "", hora: "20:00", linkReuniao: "", tipo: "ao-vivo", realizado: false };

function formatDate(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)]}`;
}

export default function BoxLivroConteudo() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [aulas, setAulas] = useState<AulaGravada[]>([]);
  const [encontros, setEncontros] = useState<Encontro[]>([]);

  const [formMaterial, setFormMaterial] = useState<Omit<Material, "id">>(MATERIAL_VAZIO);
  const [formAula, setFormAula] = useState<Omit<AulaGravada, "id">>(AULA_VAZIA);
  const [formEncontro, setFormEncontro] = useState<Omit<Encontro, "id">>(ENCONTRO_VAZIO);
  const [showFormMaterial, setShowFormMaterial] = useState(false);
  const [showFormAula, setShowFormAula] = useState(false);
  const [showFormEncontro, setShowFormEncontro] = useState(false);

  // Estados de edição
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [editAula, setEditAula] = useState<AulaGravada | null>(null);
  const [editEncontro, setEditEncontro] = useState<Encontro | null>(null);

  function addMaterial() {
    if (!formMaterial.titulo.trim()) return;
    setMateriais((p) => [...p, { ...formMaterial, id: Date.now() }]);
    setFormMaterial(MATERIAL_VAZIO); setShowFormMaterial(false);
  }
  function addAula() {
    if (!formAula.titulo.trim()) return;
    setAulas((p) => [...p, { ...formAula, id: Date.now() }]);
    setFormAula(AULA_VAZIA); setShowFormAula(false);
  }
  function addEncontro() {
    if (!formEncontro.tema.trim()) return;
    setEncontros((p) => [...p, { ...formEncontro, id: Date.now() }]);
    setFormEncontro(ENCONTRO_VAZIO); setShowFormEncontro(false);
  }

  function salvarEditMaterial() {
    if (!editMaterial) return;
    setMateriais((p) => p.map((x) => x.id === editMaterial.id ? editMaterial : x));
    setEditMaterial(null);
  }
  function salvarEditAula() {
    if (!editAula) return;
    setAulas((p) => p.map((x) => x.id === editAula.id ? editAula : x));
    setEditAula(null);
  }
  function salvarEditEncontro() {
    if (!editEncontro) return;
    setEncontros((p) => p.map((x) => x.id === editEncontro.id ? editEncontro : x));
    setEditEncontro(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <BookOpen size={20} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Box do Livro — Conteúdo</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Materiais, aulas gravadas e encontros ao vivo do acompanhamento do livro.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── MATERIAIS ── */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Materiais</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{materiais.length} arquivos</span>
            </div>
            <button className="btn-gold" style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowFormMaterial(!showFormMaterial)}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {showFormMaterial && (
            <div style={{ background: "var(--bg-input)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid var(--gold-border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título *</label>
                  <input className="input" value={formMaterial.titulo} onChange={(e) => setFormMaterial((p) => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Guia de Leitura — Cap. 1" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo</label>
                  <select className="input" value={formMaterial.tipo} onChange={(e) => setFormMaterial((p) => ({ ...p, tipo: e.target.value as TipoConteudo }))}>
                    <option value="pdf">PDF</option><option value="video">Vídeo</option><option value="link">Link</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Capítulo</label>
                  <input className="input" value={formMaterial.capitulo} onChange={(e) => setFormMaterial((p) => ({ ...p, capitulo: e.target.value }))} placeholder="Ex: Caps. 1 e 2" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link / URL do arquivo</label>
                  <input className="input" value={formMaterial.url} onChange={(e) => setFormMaterial((p) => ({ ...p, url: e.target.value }))} placeholder="https://drive.google.com/..." />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="mat-lib" checked={formMaterial.liberado} onChange={(e) => setFormMaterial((p) => ({ ...p, liberado: e.target.checked }))} />
                  <label htmlFor="mat-lib" style={{ fontSize: 12, color: "var(--text-soft)", cursor: "pointer" }}>Liberado para as mentoradas agora</label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-gold" style={{ fontSize: 12 }} onClick={addMaterial}>Salvar material</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setShowFormMaterial(false); setFormMaterial(MATERIAL_VAZIO); }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {materiais.map((m) => {
              const cfg = TIPO_CONTEUDO_CONFIG[m.tipo];
              const editando = editMaterial?.id === m.id;
              return (
                <div key={m.id} style={{ borderRadius: 8, background: "var(--bg-input)", border: `1px solid ${editando ? "var(--gold-border)" : "var(--border)"}`, overflow: "hidden" }}>
                  {/* Linha do item */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cfg.cor}18`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.cor, flexShrink: 0 }}>{cfg.icone}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{m.titulo}</p>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{cfg.label}{m.capitulo ? ` · ${m.capitulo}` : ""}{m.url ? " · " : ""}{m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd" }}>Ver link</a>}</span>
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: m.liberado ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)", color: m.liberado ? "#86efac" : "#fbbf24", border: `1px solid ${m.liberado ? "rgba(134,239,172,0.2)" : "rgba(251,191,36,0.2)"}`, whiteSpace: "nowrap" }}>
                      {m.liberado ? "Liberado" : "Bloqueado"}
                    </span>
                    <button onClick={() => editando ? setEditMaterial(null) : setEditMaterial({ ...m })} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${editando ? "var(--gold-border)" : "var(--border)"}`, background: editando ? "var(--gold-light)" : "transparent", color: editando ? "var(--gold)" : "var(--text-muted)", cursor: "pointer" }}>
                      {editando ? "Fechar" : "Editar"}
                    </button>
                    <button onClick={() => setMateriais((p) => p.filter((x) => x.id !== m.id))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {/* Painel de edição */}
                  {editando && editMaterial && (
                    <div style={{ borderTop: "1px solid var(--gold-border)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-card)" }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título</label>
                        <input className="input" value={editMaterial.titulo} onChange={(e) => setEditMaterial({ ...editMaterial, titulo: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo</label>
                          <select className="input" value={editMaterial.tipo} onChange={(e) => setEditMaterial({ ...editMaterial, tipo: e.target.value as TipoConteudo })}>
                            <option value="pdf">PDF</option><option value="video">Vídeo</option><option value="link">Link</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Capítulo</label>
                          <input className="input" value={editMaterial.capitulo} onChange={(e) => setEditMaterial({ ...editMaterial, capitulo: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link / URL</label>
                        <input className="input" value={editMaterial.url} onChange={(e) => setEditMaterial({ ...editMaterial, url: e.target.value })} placeholder="https://drive.google.com/..." />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" id={`lib-${m.id}`} checked={editMaterial.liberado} onChange={(e) => setEditMaterial({ ...editMaterial, liberado: e.target.checked })} />
                        <label htmlFor={`lib-${m.id}`} style={{ fontSize: 12, color: "var(--text-soft)", cursor: "pointer" }}>Liberado para as mentoradas</label>
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditMaterial(null)}>Cancelar</button>
                        <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvarEditMaterial}>Salvar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {materiais.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Nenhum material adicionado ainda.</p>}
          </div>
        </div>

        {/* ── AULAS GRAVADAS ── */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PlayCircle size={14} style={{ color: "#93c5fd" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Aulas Gravadas</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{aulas.length} aulas</span>
            </div>
            <button className="btn-gold" style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowFormAula(!showFormAula)}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {showFormAula && (
            <div style={{ background: "var(--bg-input)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid rgba(147,197,253,0.25)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título da aula *</label>
                  <input className="input" value={formAula.titulo} onChange={(e) => setFormAula((p) => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Identidade em Deus" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Capítulo</label>
                  <input className="input" value={formAula.capitulo} onChange={(e) => setFormAula((p) => ({ ...p, capitulo: e.target.value }))} placeholder="Ex: Cap. 1" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label>
                  <input className="input" value={formAula.duracao} onChange={(e) => setFormAula((p) => ({ ...p, duracao: e.target.value }))} placeholder="Ex: 38 min" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link do vídeo</label>
                  <input className="input" value={formAula.linkVideo} onChange={(e) => setFormAula((p) => ({ ...p, linkVideo: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label>
                  <textarea className="input" rows={2} value={formAula.descricao} onChange={(e) => setFormAula((p) => ({ ...p, descricao: e.target.value }))} placeholder="Resumo breve da aula..." style={{ resize: "vertical" }} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="aula-lib" checked={formAula.liberado} onChange={(e) => setFormAula((p) => ({ ...p, liberado: e.target.checked }))} />
                  <label htmlFor="aula-lib" style={{ fontSize: 12, color: "var(--text-soft)", cursor: "pointer" }}>Liberada para as mentoradas agora</label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-gold" style={{ fontSize: 12 }} onClick={addAula}>Salvar aula</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setShowFormAula(false); setFormAula(AULA_VAZIA); }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {aulas.map((a) => {
              const editando = editAula?.id === a.id;
              return (
                <div key={a.id} style={{ borderRadius: 8, background: "var(--bg-input)", border: `1px solid ${editando ? "rgba(147,197,253,0.4)" : "var(--border)"}`, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(147,197,253,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <PlayCircle size={14} style={{ color: "#93c5fd" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{a.titulo}</p>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.capitulo}{a.duracao ? ` · ${a.duracao}` : ""}{a.descricao ? ` · ${a.descricao}` : ""}</span>
                      {a.linkVideo && <a href={a.linkVideo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#93c5fd", display: "block", marginTop: 2 }}>Ver vídeo</a>}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: a.liberado ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)", color: a.liberado ? "#86efac" : "#fbbf24", border: `1px solid ${a.liberado ? "rgba(134,239,172,0.2)" : "rgba(251,191,36,0.2)"}`, whiteSpace: "nowrap" }}>
                      {a.liberado ? "Liberada" : "Bloqueada"}
                    </span>
                    <button onClick={() => editando ? setEditAula(null) : setEditAula({ ...a })} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${editando ? "rgba(147,197,253,0.4)" : "var(--border)"}`, background: editando ? "rgba(147,197,253,0.1)" : "transparent", color: editando ? "#93c5fd" : "var(--text-muted)", cursor: "pointer" }}>
                      {editando ? "Fechar" : "Editar"}
                    </button>
                    <button onClick={() => setAulas((p) => p.filter((x) => x.id !== a.id))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {editando && editAula && (
                    <div style={{ borderTop: "1px solid rgba(147,197,253,0.2)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-card)" }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título</label>
                        <input className="input" value={editAula.titulo} onChange={(e) => setEditAula({ ...editAula, titulo: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Capítulo</label>
                          <input className="input" value={editAula.capitulo} onChange={(e) => setEditAula({ ...editAula, capitulo: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duração</label>
                          <input className="input" value={editAula.duracao} onChange={(e) => setEditAula({ ...editAula, duracao: e.target.value })} placeholder="Ex: 38 min" />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link do vídeo</label>
                        <input className="input" value={editAula.linkVideo} onChange={(e) => setEditAula({ ...editAula, linkVideo: e.target.value })} placeholder="https://youtube.com/..." />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label>
                        <textarea className="input" rows={2} value={editAula.descricao} onChange={(e) => setEditAula({ ...editAula, descricao: e.target.value })} style={{ resize: "vertical" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" id={`aula-lib-${a.id}`} checked={editAula.liberado} onChange={(e) => setEditAula({ ...editAula, liberado: e.target.checked })} />
                        <label htmlFor={`aula-lib-${a.id}`} style={{ fontSize: 12, color: "var(--text-soft)", cursor: "pointer" }}>Liberada para as mentoradas</label>
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditAula(null)}>Cancelar</button>
                        <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvarEditAula}>Salvar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {aulas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Nenhuma aula adicionada ainda.</p>}
          </div>
        </div>

        {/* ── ENCONTROS ── */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={14} style={{ color: "#a78bfa" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Encontros</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{encontros.length} agendados</span>
            </div>
            <button className="btn-gold" style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowFormEncontro(!showFormEncontro)}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {showFormEncontro && (
            <div style={{ background: "var(--bg-input)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid rgba(167,139,250,0.25)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tema do encontro *</label>
                  <input className="input" value={formEncontro.tema} onChange={(e) => setFormEncontro((p) => ({ ...p, tema: e.target.value }))} placeholder="Ex: Caps. 1 e 2 — Identidade" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data</label>
                  <input type="date" className="input" value={formEncontro.data} onChange={(e) => setFormEncontro((p) => ({ ...p, data: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Horário</label>
                  <input className="input" value={formEncontro.hora} onChange={(e) => setFormEncontro((p) => ({ ...p, hora: e.target.value }))} placeholder="20:00" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo</label>
                  <select className="input" value={formEncontro.tipo} onChange={(e) => setFormEncontro((p) => ({ ...p, tipo: e.target.value as TipoEncontro }))}>
                    <option value="ao-vivo">Ao vivo</option><option value="gravado">Gravado</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link da reunião</label>
                  <input className="input" value={formEncontro.linkReuniao} onChange={(e) => setFormEncontro((p) => ({ ...p, linkReuniao: e.target.value }))} placeholder="https://zoom.us/..." />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-gold" style={{ fontSize: 12 }} onClick={addEncontro}>Salvar encontro</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setShowFormEncontro(false); setFormEncontro(ENCONTRO_VAZIO); }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {encontros.map((e) => {
              const editando = editEncontro?.id === e.id;
              return (
                <div key={e.id} style={{ borderRadius: 8, background: "var(--bg-input)", border: `1px solid ${editando ? "rgba(167,139,250,0.4)" : "var(--border)"}`, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(167,139,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {e.tipo === "ao-vivo" ? <Users size={14} style={{ color: "#a78bfa" }} /> : <PlayCircle size={14} style={{ color: "#a78bfa" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{e.tema}</p>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {e.data ? `${formatDate(e.data)} às ${e.hora}` : e.hora} · {e.tipo === "ao-vivo" ? "Ao vivo" : "Gravado"}
                      </span>
                      {e.linkReuniao && <a href={e.linkReuniao} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#a78bfa", display: "block", marginTop: 2 }}>Ver link da reunião</a>}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: e.realizado ? "rgba(134,239,172,0.1)" : "rgba(167,139,250,0.1)", color: e.realizado ? "#86efac" : "#a78bfa", border: `1px solid ${e.realizado ? "rgba(134,239,172,0.2)" : "rgba(167,139,250,0.2)"}`, whiteSpace: "nowrap" }}>
                      {e.realizado ? "Realizado" : "Agendado"}
                    </span>
                    <button onClick={() => editando ? setEditEncontro(null) : setEditEncontro({ ...e })} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${editando ? "rgba(167,139,250,0.4)" : "var(--border)"}`, background: editando ? "rgba(167,139,250,0.1)" : "transparent", color: editando ? "#a78bfa" : "var(--text-muted)", cursor: "pointer" }}>
                      {editando ? "Fechar" : "Editar"}
                    </button>
                    <button onClick={() => setEncontros((p) => p.filter((x) => x.id !== e.id))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {editando && editEncontro && (
                    <div style={{ borderTop: "1px solid rgba(167,139,250,0.2)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-card)" }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tema</label>
                        <input className="input" value={editEncontro.tema} onChange={(e2) => setEditEncontro({ ...editEncontro, tema: e2.target.value })} />
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: "0 0 auto" }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data</label>
                          <input type="date" className="input" value={editEncontro.data} onChange={(e2) => setEditEncontro({ ...editEncontro, data: e2.target.value })} style={{ width: "auto" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 100 }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Horário</label>
                          <input className="input" value={editEncontro.hora} onChange={(e2) => setEditEncontro({ ...editEncontro, hora: e2.target.value })} placeholder="20:00" />
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tipo</label>
                          <select className="input" value={editEncontro.tipo} onChange={(e2) => setEditEncontro({ ...editEncontro, tipo: e2.target.value as TipoEncontro })}>
                            <option value="ao-vivo">Ao vivo</option><option value="gravado">Gravado</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link da reunião</label>
                        <input className="input" value={editEncontro.linkReuniao} onChange={(e2) => setEditEncontro({ ...editEncontro, linkReuniao: e2.target.value })} placeholder="https://zoom.us/..." />
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditEncontro(null)}>Cancelar</button>
                        <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvarEditEncontro}>Salvar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {encontros.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Nenhum encontro agendado ainda.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
