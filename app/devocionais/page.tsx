"use client";

import { useState, useEffect } from "react";
import {
  BookHeart, Plus, Search, Play, Tag, Flame, X, Pencil,
  Trash2, Send, CheckCircle2, Users, User, FileText, Video,
  LinkIcon, Loader2,
} from "lucide-react";

type Categoria = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia";
type TipoDevocional = "texto" | "video";
type DestinoDevocional = "todas-bw" | "individual";

interface Mentorada { id: string; nome: string; }

interface Devocional {
  id: string;
  titulo: string;
  data: string;
  categoria: Categoria;
  texto: string;
  versiculo: string;
  tipo: TipoDevocional;
  linkVideo: string;
  destino: DestinoDevocional;
  mentoradaId: string;
  mentoradaNome: string;
  publicado: boolean;
  destaque: boolean;
}

const CATEGORIAS: Categoria[] = ["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia"];

const catColor: Record<Categoria, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia",
};

const FORM_VAZIO: Omit<Devocional, "id" | "data"> = {
  titulo: "", categoria: "Fe", texto: "", versiculo: "",
  tipo: "texto", linkVideo: "", destino: "todas-bw",
  mentoradaId: "", mentoradaNome: "",
  publicado: false, destaque: false,
};

function formatarData(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function mapDevocional(d: Record<string, unknown>): Devocional {
  return {
    id:           d.id           as string,
    titulo:       d.titulo       as string,
    data:         formatarData(d.criado_em as string),
    categoria:    (d.categoria   ?? "Fe")      as Categoria,
    texto:        (d.conteudo    ?? "")        as string,
    versiculo:    (d.versiculo   ?? "")        as string,
    tipo:         (d.tipo        ?? "texto")   as TipoDevocional,
    linkVideo:    (d.link_video  ?? "")        as string,
    destino:      (d.destino     ?? "todas-bw") as DestinoDevocional,
    mentoradaId:  (d.mentorada_id  ?? "")      as string,
    mentoradaNome:(d.mentorada_nome ?? "")     as string,
    publicado:    (d.publicado   ?? false)     as boolean,
    destaque:     (d.destaque    ?? false)     as boolean,
  };
}

export default function Devocionais() {
  const [devs, setDevs] = useState<Devocional[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [detalhe, setDetalhe] = useState<Devocional | null>(null);
  const [editando, setEditando] = useState<Devocional | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [form, setForm] = useState<Omit<Devocional, "id" | "data">>(FORM_VAZIO);

  useEffect(() => {
    Promise.all([
      fetch("/api/devocionais").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([devData, mentData]) => {
      setDevs(Array.isArray(devData) ? devData.map(mapDevocional) : []);
      setMentoradas(Array.isArray(mentData) ? mentData.map((m: Mentorada) => ({ id: m.id, nome: m.nome })) : []);
      setCarregando(false);
    });
  }, []);

  const filtrados = devs.filter((d) => {
    const matchBusca = d.titulo.toLowerCase().includes(busca.toLowerCase()) || d.texto.toLowerCase().includes(busca.toLowerCase());
    const matchCat = catAtiva === "Todos" || d.categoria === catAtiva;
    return matchBusca && matchCat;
  });

  const destaques = filtrados.filter((d) => d.destaque);
  const outros = filtrados.filter((d) => !d.destaque);

  async function togglePublicar(id: string) {
    const dev = devs.find((d) => d.id === id);
    if (!dev) return;
    const novoStatus = !dev.publicado;
    setDevs((prev) => prev.map((d) => d.id === id ? { ...d, publicado: novoStatus } : d));
    await fetch("/api/devocionais", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, publicado: novoStatus }),
    });
  }

  async function salvarNovo() {
    if (!form.titulo.trim()) return;
    const res = await fetch("/api/devocionais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo:         form.titulo,
        tipo:           form.tipo,
        conteudo:       form.texto,
        versiculo:      form.versiculo,
        categoria:      form.categoria,
        link_video:     form.linkVideo,
        publicado:      form.publicado,
        destaque:       form.destaque,
        destino:        form.destino,
        mentorada_id:   form.destino === "individual" ? form.mentoradaId   || null : null,
        mentorada_nome: form.destino === "individual" ? form.mentoradaNome || null : null,
      }),
    });
    const raw = await res.json();
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setDevs((prev) => [mapDevocional(raw), ...prev]);
    setNovoAberto(false);
    setForm(FORM_VAZIO);
  }

  async function salvarEdicao() {
    if (!editando) return;
    const res = await fetch("/api/devocionais", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:             editando.id,
        titulo:         editando.titulo,
        tipo:           editando.tipo,
        conteudo:       editando.texto,
        versiculo:      editando.versiculo,
        categoria:      editando.categoria,
        link_video:     editando.linkVideo,
        publicado:      editando.publicado,
        destaque:       editando.destaque,
        destino:        editando.destino,
        mentorada_id:   editando.destino === "individual" ? editando.mentoradaId   || null : null,
        mentorada_nome: editando.destino === "individual" ? editando.mentoradaNome || null : null,
      }),
    });
    const raw = await res.json();
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setDevs((prev) => prev.map((d) => d.id === editando.id ? mapDevocional(raw) : d));
    setEditando(null);
    setDetalhe(null);
  }

  async function deletar(id: string) {
    if (!confirm("Excluir este devocional?")) return;
    const res = await fetch(`/api/devocionais?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setDevs((prev) => prev.filter((d) => d.id !== id));
    setDetalhe(null);
  }

  function abrirEdicao(d: Devocional, e?: React.MouseEvent) {
    e?.stopPropagation();
    setEditando({ ...d });
    setDetalhe(null);
  }

  function DestinoTag({ dev }: { dev: Devocional }) {
    return dev.destino === "todas-bw" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.12)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
        <Users size={9} /> Todas as BW
      </span>
    ) : (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(147,197,253,0.1)", color: "#93c5fd", border: "1px solid rgba(147,197,253,0.2)" }}>
        <User size={9} /> {dev.mentoradaNome.split(" ")[0]}
      </span>
    );
  }

  function StatusTag({ dev }: { dev: Devocional }) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: dev.publicado ? "rgba(134,239,172,0.1)" : "rgba(107,114,128,0.12)", color: dev.publicado ? "#86efac" : "var(--text-muted)", border: `1px solid ${dev.publicado ? "rgba(134,239,172,0.2)" : "var(--border)"}` }}>
        {dev.publicado ? <><CheckCircle2 size={9} /> Publicado</> : "Rascunho"}
      </span>
    );
  }

  function TipoTag({ tipo }: { tipo: TipoDevocional }) {
    return tipo === "video" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.15)" }}>
        <Play size={9} /> Vídeo
      </span>
    ) : (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.08)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
        <FileText size={9} /> Texto
      </span>
    );
  }

  function FormDevocional({ values, onChange, onSave, onCancel, titulo }: {
    values: Omit<Devocional, "id" | "data">;
    onChange: (v: Omit<Devocional, "id" | "data">) => void;
    onSave: () => void;
    onCancel: () => void;
    titulo: string;
  }) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onCancel}>
        <div className="card" style={{ maxWidth: 540, width: "100%", padding: "24px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{titulo}</h2>
            <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Título *</label>
              <input value={values.titulo} onChange={(e) => onChange({ ...values, titulo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Título do devocional..." />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Formato</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["texto", "video"] as TipoDevocional[]).map((t) => (
                  <button key={t} type="button" onClick={() => onChange({ ...values, tipo: t })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: values.tipo === t ? 600 : 400, border: `1px solid ${values.tipo === t ? "var(--gold-border)" : "var(--border)"}`, background: values.tipo === t ? "rgba(201,168,76,0.12)" : "var(--bg-input)", color: values.tipo === t ? "var(--gold)" : "var(--text-muted)" }}>
                    {t === "texto" ? <><FileText size={14} /> Texto</> : <><Video size={14} /> Vídeo</>}
                  </button>
                ))}
              </div>
            </div>

            {values.tipo === "video" && (
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Link do vídeo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "0 12px" }}>
                  <LinkIcon size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <input value={values.linkVideo} onChange={(e) => onChange({ ...values, linkVideo: e.target.value })} style={{ background: "none", border: "none", flex: 1, fontSize: 13, padding: "10px 0", color: "var(--text)", outline: "none" }} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{values.tipo === "video" ? "Descrição / introdução" : "Mensagem *"}</label>
              <textarea value={values.texto} onChange={(e) => onChange({ ...values, texto: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 110, resize: "vertical" }} placeholder={values.tipo === "video" ? "Breve descrição do vídeo..." : "Escreva sua mensagem..."} />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Versículo de referência</label>
              <input value={values.versiculo} onChange={(e) => onChange({ ...values, versiculo: e.target.value })} style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Ex: Salmos 37:5..." />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Categoria</label>
              <select value={values.categoria} onChange={(e) => onChange({ ...values, categoria: e.target.value as Categoria })} style={{ padding: "10px 12px", fontSize: 13, width: "100%" }}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Enviar para</label>
              <div style={{ display: "flex", gap: 8, marginBottom: values.destino === "individual" ? 8 : 0 }}>
                {(["todas-bw", "individual"] as DestinoDevocional[]).map((dest) => (
                  <button key={dest} type="button" onClick={() => onChange({ ...values, destino: dest, mentoradaId: "", mentoradaNome: "" })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: values.destino === dest ? 600 : 400, border: `1px solid ${values.destino === dest ? "var(--gold-border)" : "var(--border)"}`, background: values.destino === dest ? "rgba(201,168,76,0.12)" : "var(--bg-input)", color: values.destino === dest ? "var(--gold)" : "var(--text-muted)" }}>
                    {dest === "todas-bw" ? <><Users size={14} /> Todas as BW</> : <><User size={14} /> Mentorada específica</>}
                  </button>
                ))}
              </div>
              {values.destino === "individual" && (
                <select
                  value={values.mentoradaId}
                  onChange={(e) => {
                    const m = mentoradas.find((x) => x.id === e.target.value);
                    onChange({ ...values, mentoradaId: e.target.value, mentoradaNome: m?.nome ?? "" });
                  }}
                  style={{ padding: "10px 12px", fontSize: 13, width: "100%" }}
                >
                  <option value="">Selecionar mentorada...</option>
                  {mentoradas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              )}
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-soft)", cursor: "pointer" }}>
                <input type="checkbox" checked={values.destaque} onChange={(e) => onChange({ ...values, destaque: e.target.checked })} />
                Destacar no topo
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-soft)", cursor: "pointer" }}>
                <input type="checkbox" checked={values.publicado} onChange={(e) => onChange({ ...values, publicado: e.target.checked })} />
                Publicar para as mentoradas agora
              </label>
            </div>

            <div className="flex gap-2 justify-end" style={{ marginTop: 4 }}>
              <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
              <button className="btn-gold" onClick={onSave} disabled={!values.titulo.trim() || (values.destino === "individual" && !values.mentoradaId)}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando devocionais...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <BookHeart size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Devocionais</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Suas Mensagens</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Palavras que constroem Mulheres INCOMUNS — texto ou vídeo, para todas ou para uma.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setNovoAberto(true)}>
          <Plus size={14} /> Novo Devocional
        </button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2" style={{ marginBottom: 12, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input style={{ background: "none", border: "none", flex: 1, fontSize: 13, color: "var(--text)", outline: "none" }} placeholder="Buscar devocional..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {/* Categorias */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {["Todos", ...CATEGORIAS].map((c) => (
          <button key={c} onClick={() => setCatAtiva(c)} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: catAtiva === c ? "1px solid var(--gold-border)" : "1px solid var(--border)", background: catAtiva === c ? "var(--gold-light)" : "transparent", color: catAtiva === c ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s" }}>
            {c}
          </button>
        ))}
      </div>

      {devs.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <BookHeart size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum devocional criado ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Novo Devocional&quot; para começar.</p>
        </div>
      )}

      {/* Destaques */}
      {destaques.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Em destaque</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {destaques.map((d) => (
              <div key={d.id} className="card card-hover" style={{ padding: "18px 20px", border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 10, flexWrap: "wrap" }}>
                  <span className={`tag ${catColor[d.categoria]}`}><Tag size={10} /> {d.categoria}</span>
                  <TipoTag tipo={d.tipo} />
                  <DestinoTag dev={d} />
                  <StatusTag dev={d} />
                  {/* Botão editar direto no card destaque */}
                  <button onClick={(e) => abrirEdicao(d, e)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                    <Pencil size={13} />
                  </button>
                </div>
                <div onClick={() => setDetalhe(d)} style={{ cursor: "pointer" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>{d.titulo}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.texto}</p>
                  {d.versiculo && <div className="verse-block" style={{ fontSize: 11 }}>{d.versiculo}</div>}
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>{d.data}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePublicar(d.id); }}
                  style={{ marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: d.publicado ? "rgba(134,239,172,0.12)" : "var(--gold-light)", color: d.publicado ? "#86efac" : "var(--gold)" }}
                >
                  {d.publicado ? <><CheckCircle2 size={13} /> Publicado — clique para despublicar</> : <><Send size={13} /> Publicar para mentoradas</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {outros.map((d) => (
          <div key={d.id} className="card card-hover" style={{ padding: "13px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--gold-border)", cursor: "pointer" }} onClick={() => setDetalhe(d)}>
                {d.tipo === "video" ? <Play size={15} style={{ color: "var(--gold)" }} /> : <Flame size={15} style={{ color: "var(--gold)" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setDetalhe(d)}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{d.titulo}</h3>
                  <span className={`tag ${catColor[d.categoria]}`} style={{ flexShrink: 0, fontSize: 10 }}>{d.categoria}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{d.texto}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <TipoTag tipo={d.tipo} />
                  <DestinoTag dev={d} />
                  <StatusTag dev={d} />
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.data}</span>
                </div>
              </div>
              <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                <button
                  onClick={() => togglePublicar(d.id)}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: d.publicado ? "rgba(134,239,172,0.12)" : "rgba(201,168,76,0.1)", color: d.publicado ? "#86efac" : "var(--gold)" }}
                >
                  {d.publicado ? <><CheckCircle2 size={11} /> Publicado</> : <><Send size={11} /> Publicar</>}
                </button>
                {/* Botão editar direto na linha */}
                <button onClick={(e) => abrirEdicao(d, e)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "5px 6px" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deletar(d.id); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "5px 6px", opacity: 0.5 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setDetalhe(null)}>
          <div className="card" style={{ maxWidth: 560, width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className={`tag ${catColor[detalhe.categoria]}`}>{detalhe.categoria}</span>
                <TipoTag tipo={detalhe.tipo} />
                <DestinoTag dev={detalhe} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => abrirEdicao(detalhe)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><Pencil size={15} /></button>
                <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
              </div>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{detalhe.titulo}</h2>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>{detalhe.data}</p>

            {detalhe.tipo === "video" && detalhe.linkVideo && (
              <a href={detalhe.linkVideo} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, textDecoration: "none", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={16} style={{ color: "#93c5fd" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#93c5fd", fontWeight: 600, margin: 0 }}>Assistir vídeo</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{detalhe.linkVideo}</p>
                </div>
              </a>
            )}

            <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.8, marginBottom: 16 }}>{detalhe.texto}</p>
            {detalhe.versiculo && <div className="verse-block">{detalhe.versiculo}</div>}

            <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
              <button
                onClick={() => { togglePublicar(detalhe.id); setDetalhe((d) => d ? { ...d, publicado: !d.publicado } : null); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: detalhe.publicado ? "rgba(134,239,172,0.12)" : "var(--gold-light)", color: detalhe.publicado ? "#86efac" : "var(--gold)", borderWidth: 1, borderStyle: "solid", borderColor: detalhe.publicado ? "rgba(134,239,172,0.25)" : "var(--gold-border)" }}
              >
                {detalhe.publicado ? <><CheckCircle2 size={14} /> Publicado para mentoradas</> : <><Send size={14} /> Publicar para mentoradas</>}
              </button>
              <button onClick={() => deletar(detalhe.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#fca5a5", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <FormDevocional
          values={editando}
          onChange={(v) => setEditando({ ...editando, ...v })}
          onSave={salvarEdicao}
          onCancel={() => setEditando(null)}
          titulo="Editar Devocional"
        />
      )}

      {/* Modal novo */}
      {novoAberto && (
        <FormDevocional
          values={form}
          onChange={setForm}
          onSave={salvarNovo}
          onCancel={() => { setNovoAberto(false); setForm(FORM_VAZIO); }}
          titulo="Novo Devocional"
        />
      )}
    </div>
  );
}
