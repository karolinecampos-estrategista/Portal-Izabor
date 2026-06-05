"use client";

import { useState, useRef } from "react";
import { BookOpen, Plus, Mic, MicOff, ChevronDown, ChevronUp, Trash2, Clock, Tag, Star } from "lucide-react";

type Categoria = "Mulheres" | "Homens" | "Profetas" | "Apostolos" | "Livros" | "Temas";
type TipoNota = "texto" | "audio";

interface Nota {
  id: number;
  tipo: TipoNota;
  conteudo: string;
  data: string;
  hora: string;
}

interface Estudo {
  id: number;
  titulo: string;
  personagem: string;
  categoria: Categoria;
  versiculo: string;
  notas: Nota[];
  data: string;
  destaque: boolean;
}

const ESTUDOS_INICIAL: Estudo[] = [
  {
    id: 1, titulo: "Rute — A mulher que escolheu permanecer", personagem: "Rute",
    categoria: "Mulheres", versiculo: "Rute 1:16",
    notas: [{ id: 1, tipo: "texto", conteudo: "Rute escolhe ficar com Noemi mesmo sem obrigacao. A lealdade dela transcende o sangue — e uma escolha de carater. O que nos prende nao e o contrato, e o comprometimento do coracao.", data: "24 Mai 2026", hora: "08:30" }],
    data: "24 Mai 2026", destaque: true,
  },
  {
    id: 2, titulo: "Ester — A mulher que nao se calou", personagem: "Ester",
    categoria: "Mulheres", versiculo: "Ester 4:14",
    notas: [{ id: 1, tipo: "texto", conteudo: "Para um momento como este — a coragem de Ester e proposital. Ela foi preparada para aquele tempo. A mulher INCOMUM entende que seus dons nao sao seus, sao para servir.", data: "22 Mai 2026", hora: "09:00" }],
    data: "22 Mai 2026", destaque: true,
  },
  {
    id: 3, titulo: "Debora — A mulher que liderou sem pedir licenca", personagem: "Debora",
    categoria: "Mulheres", versiculo: "Juizes 4:4",
    notas: [],
    data: "20 Mai 2026", destaque: false,
  },
  {
    id: 4, titulo: "Maria de Betania — A mulher que escolheu o melhor", personagem: "Maria de Betania",
    categoria: "Mulheres", versiculo: "Lucas 10:42",
    notas: [],
    data: "18 Mai 2026", destaque: false,
  },
  {
    id: 5, titulo: "Davi — O coracao que buscava a Deus", personagem: "Davi",
    categoria: "Homens", versiculo: "Salmos 23:1",
    notas: [],
    data: "15 Mai 2026", destaque: false,
  },
  {
    id: 6, titulo: "Sara — A promessa que exigiu espera", personagem: "Sara",
    categoria: "Mulheres", versiculo: "Hebreus 11:11",
    notas: [],
    data: "12 Mai 2026", destaque: false,
  },
];

const CATEGORIAS: Categoria[] = ["Mulheres", "Homens", "Profetas", "Apostolos", "Livros", "Temas"];

const catCor: Record<Categoria, string> = {
  "Mulheres":  "tag-emocional",
  "Homens":    "tag-lideranca",
  "Profetas":  "tag-fe",
  "Apostolos": "tag-mentalidade",
  "Livros":    "tag-familia",
  "Temas":     "tag-geral",
};

function dataAtual() {
  const d = new Date();
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}
function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const FORM_VAZIO = { titulo: "", personagem: "", categoria: "Mulheres" as Categoria, versiculo: "" };

export default function Estudos() {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | "Todos">("Todos");
  const [expandido, setExpandido] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [notaTexto, setNotaTexto] = useState<Record<number, string>>({});
  const [gravando, setGravando] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtrados = estudos.filter(e => filtroCategoria === "Todos" || e.categoria === filtroCategoria);
  const destaques = estudos.filter(e => e.destaque).length;
  const totalNotas = estudos.reduce((acc, e) => acc + e.notas.length, 0);

  function adicionarEstudo() {
    if (!form.titulo.trim()) return;
    const novo: Estudo = {
      id: Date.now(), titulo: form.titulo, personagem: form.personagem,
      categoria: form.categoria, versiculo: form.versiculo,
      notas: [], data: dataAtual(), destaque: false,
    };
    setEstudos(prev => [novo, ...prev]);
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  function adicionarNota(estudoId: number) {
    const texto = notaTexto[estudoId]?.trim();
    if (!texto) return;
    const nota: Nota = { id: Date.now(), tipo: "texto", conteudo: texto, data: dataAtual(), hora: horaAtual() };
    setEstudos(prev => prev.map(e => e.id === estudoId ? { ...e, notas: [...e.notas, nota] } : e));
    setNotaTexto(prev => ({ ...prev, [estudoId]: "" }));
  }

  function toggleGravacao(estudoId: number) {
    if (gravando === estudoId) {
      setGravando(null);
      if (timerRef.current) clearInterval(timerRef.current);
      const nota: Nota = {
        id: Date.now(), tipo: "audio",
        conteudo: `[Nota de voz — ${segundos}s] Gravada em ${dataAtual()} as ${horaAtual()}`,
        data: dataAtual(), hora: horaAtual(),
      };
      setEstudos(prev => prev.map(e => e.id === estudoId ? { ...e, notas: [...e.notas, nota] } : e));
      setSegundos(0);
    } else {
      setGravando(estudoId);
      setSegundos(0);
      timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
    }
  }

  function deletarNota(estudoId: number, notaId: number) {
    setEstudos(prev => prev.map(e => e.id === estudoId ? { ...e, notas: e.notas.filter(n => n.id !== notaId) } : e));
  }

  function deletarEstudo(id: number) {
    setEstudos(prev => prev.filter(e => e.id !== id));
  }

  function toggleDestaque(id: number) {
    setEstudos(prev => prev.map(e => e.id === id ? { ...e, destaque: !e.destaque } : e));
  }

  const inputStyle = { padding: "8px 12px", fontSize: 13, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", width: "100%" };
  const labelStyle = { fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" as const };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <BookOpen size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Estudos</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Estudos Biblicos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Heroinas, herois e temas — registre suas revelacoes por escrito ou em voz.</p>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Estudos", value: estudos.length, color: "var(--text)" },
          { label: "Em Destaque", value: destaques, color: "var(--gold)" },
          { label: "Notas Registradas", value: totalNotas, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {(["Todos", ...CATEGORIAS] as const).map(c => (
          <button key={c} onClick={() => setFiltroCategoria(c as Categoria | "Todos")} style={{
            padding: "5px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer",
            border: filtroCategoria === c ? "1px solid var(--gold-border)" : "1px solid var(--border)",
            background: filtroCategoria === c ? "var(--gold-light)" : "transparent",
            color: filtroCategoria === c ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s",
          }}>{c}</button>
        ))}
        <button className="btn-gold flex items-center gap-2" onClick={() => setMostrarForm(!mostrarForm)} style={{ fontSize: 12, marginLeft: "auto" }}>
          <Plus size={13} /> Novo Estudo
        </button>
      </div>

      {/* Form novo estudo */}
      {mostrarForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Novo Estudo</p>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={labelStyle}>Titulo *</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Ex: Rute — A mulher que escolheu permanecer" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Personagem / Tema</label>
                <input value={form.personagem} onChange={e => setForm({ ...form, personagem: e.target.value })} style={inputStyle} placeholder="Ex: Rute, Fe, Proposito..." />
              </div>
              <div>
                <label style={labelStyle}>Categoria</label>
                <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value as Categoria })} style={inputStyle}>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Versiculo base</label>
              <input value={form.versiculo} onChange={e => setForm({ ...form, versiculo: e.target.value })} style={inputStyle} placeholder="Ex: Rute 1:16" />
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
            <button className="btn-gold flex items-center gap-2" onClick={adicionarEstudo} disabled={!form.titulo.trim()}>
              <Plus size={13} /> Criar Estudo
            </button>
            <button onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
          Nenhum estudo nessa categoria ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(e => {
            const aberto = expandido === e.id;
            return (
              <div key={e.id} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid ${e.destaque ? "var(--gold)" : "var(--border)"}` }}>
                <div className="flex items-start gap-3">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                      <span className={`tag ${catCor[e.categoria]}`} style={{ fontSize: 10 }}><Tag size={9} /> {e.categoria}</span>
                      {e.versiculo && <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border)" }}>{e.versiculo}</span>}
                      {e.notas.length > 0 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{e.notas.length} nota{e.notas.length !== 1 ? "s" : ""}</span>}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{e.titulo}</p>
                    <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
                      <Clock size={9} style={{ display: "inline", marginRight: 3 }} />{e.data}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                    <button onClick={() => toggleDestaque(e.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: e.destaque ? "var(--gold)" : "var(--text-muted)" }}>
                      <Star size={14} fill={e.destaque ? "var(--gold)" : "none"} />
                    </button>
                    <button onClick={() => setExpandido(aberto ? null : e.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "var(--text-muted)" }}>
                      {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => deletarEstudo(e.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "var(--text-muted)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {aberto && (
                  <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    {e.notas.length > 0 && (
                      <div className="flex flex-col gap-2" style={{ marginBottom: 14 }}>
                        {e.notas.map(n => (
                          <div key={n.id} style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            {n.tipo === "audio" && (
                              <span style={{ fontSize: 10, color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                                <Mic size={9} /> Audio
                              </span>
                            )}
                            <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, lineHeight: 1.6 }}>{n.conteudo}</p>
                            <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{n.data} as {n.hora}</span>
                              <button onClick={() => deletarNota(e.id, n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 8, padding: 14 }}>
                      <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Adicionar Nota</p>
                      <textarea
                        value={notaTexto[e.id] || ""}
                        onChange={ev => setNotaTexto(prev => ({ ...prev, [e.id]: ev.target.value }))}
                        style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 72, resize: "vertical", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", marginBottom: 10 }}
                        placeholder="Escreva sua reflexao, revelacao ou insight..."
                      />
                      <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                        <button className="btn-gold flex items-center gap-2" onClick={() => adicionarNota(e.id)} disabled={!notaTexto[e.id]?.trim()} style={{ fontSize: 12 }}>
                          <Plus size={12} /> Salvar Nota
                        </button>
                        <button
                          onClick={() => toggleGravacao(e.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500,
                            background: gravando === e.id ? "rgba(239,68,68,0.15)" : "var(--bg-input)",
                            border: gravando === e.id ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
                            color: gravando === e.id ? "#fca5a5" : "var(--text-muted)", transition: "all 0.2s",
                          }}
                        >
                          {gravando === e.id ? <><MicOff size={12} /> Parar ({segundos}s)</> : <><Mic size={12} /> Gravar Voz</>}
                        </button>
                        {gravando === e.id && (
                          <div className="flex items-center gap-2">
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fca5a5", animation: "pulse 1s infinite" }} />
                            <span style={{ fontSize: 11, color: "#fca5a5" }}>Gravando...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
