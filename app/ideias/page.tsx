"use client";

import { useState, useRef } from "react";
import { Lightbulb, Plus, Mic, MicOff, Instagram, Youtube, Trash2, X, Clock, Tag } from "lucide-react";

type Canal = "Instagram" | "YouTube";
type TipoIdeia = "texto" | "audio";
type Pilar = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia";

interface Ideia {
  id: number;
  canal: Canal;
  tipo: TipoIdeia;
  texto: string;
  pilar: Pilar;
  data: string;
  hora: string;
  formato?: string;
}

const IDEIAS_INICIAL: Ideia[] = [
  { id: 1, canal: "Instagram", tipo: "texto", texto: "Reels sobre a diferenca entre ter fe e ter certeza — a fe caminha sem ver, mas continua caminhando.", pilar: "Fe", data: "24 Mai 2026", hora: "09:14", formato: "Reels" },
  { id: 2, canal: "YouTube", tipo: "texto", texto: "Video mais longo sobre a mulher que para de pedir desculpa por ser intensa, apaixonada, espiritual. Titulo provisorio: 'A mulher que o mundo nao sabe o que fazer'.", pilar: "Lideranca", data: "23 Mai 2026", hora: "21:40", formato: "Video" },
  { id: 3, canal: "Instagram", tipo: "texto", texto: "Carrossel: 7 sinais de que Deus esta te preparando, nao te abandonando. Usar versiculos reais.", pilar: "Fe", data: "22 Mai 2026", hora: "07:55", formato: "Carrossel" },
  { id: 4, canal: "Instagram", tipo: "texto", texto: "Ideia de serie no Reels: 'Mulher que ora antes de responder' — mostrar situacoes cotidianas de inteligencia emocional + fe.", pilar: "Emocional", data: "21 Mai 2026", hora: "14:30", formato: "Reels" },
  { id: 5, canal: "YouTube", tipo: "texto", texto: "Devocional em video sobre Proverbios 31 — a mulher virtuosa nao e perfeita, ela e proposital.", pilar: "Mentalidade", data: "20 Mai 2026", hora: "08:00", formato: "Video" },
];

const canalConfig: Record<Canal, { icon: React.ReactNode; color: string; bg: string }> = {
  Instagram: { icon: <Instagram size={14} />, color: "#f9a8d4", bg: "rgba(236,72,153,0.1)" },
  YouTube:   { icon: <Youtube size={14} />,   color: "#fca5a5", bg: "rgba(252,165,165,0.1)" },
};

const catColor: Record<Pilar, string> = {
  Fe: "tag-fe", Mentalidade: "tag-mentalidade", Lideranca: "tag-lideranca",
  Emocional: "tag-emocional", Familia: "tag-familia",
};

const PILARES: Pilar[] = ["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia"];

function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function dataAtual() {
  const d = new Date();
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Ideias() {
  const [ideias, setIdeias] = useState<Ideia[]>(IDEIAS_INICIAL);
  const [canalAtivo, setCanalAtivo] = useState<Canal | "Todos">("Todos");
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form rapido inline
  const [formCanal, setFormCanal] = useState<Canal>("Instagram");
  const [formTexto, setFormTexto] = useState("");
  const [formPilar, setFormPilar] = useState<Pilar>("Fe");
  const [formFormato, setFormFormato] = useState("Reels");

  const filtradas = ideias.filter((i) => canalAtivo === "Todos" || i.canal === canalAtivo);
  const insta = filtradas.filter((i) => i.canal === "Instagram");
  const yt = filtradas.filter((i) => i.canal === "YouTube");

  function salvarIdeia() {
    if (!formTexto.trim()) return;
    const nova: Ideia = {
      id: Date.now(),
      canal: formCanal,
      tipo: "texto",
      texto: formTexto,
      pilar: formPilar,
      data: dataAtual(),
      hora: horaAtual(),
      formato: formFormato,
    };
    setIdeias((prev) => [nova, ...prev]);
    setFormTexto("");
  }

  function deletar(id: number) {
    setIdeias((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleGravacao() {
    if (gravando) {
      setGravando(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Adiciona ideia simulada de audio
      const novaAudio: Ideia = {
        id: Date.now(),
        canal: formCanal,
        tipo: "audio",
        texto: `[Nota de voz — ${segundos}s] Ideia gravada em ${dataAtual()} as ${horaAtual()}`,
        pilar: formPilar,
        data: dataAtual(),
        hora: horaAtual(),
      };
      setIdeias((prev) => [novaAudio, ...prev]);
      setSegundos(0);
    } else {
      setGravando(true);
      setSegundos(0);
      timerRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    }
  }

  function renderLista(lista: Ideia[], canal: Canal) {
    if (lista.length === 0) return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
        Nenhuma ideia ainda para {canal}. Adicione uma acima!
      </div>
    );
    return (
      <div className="flex flex-col gap-2">
        {lista.map((i) => {
          const cfg = canalConfig[i.canal];
          return (
            <div key={i.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${cfg.color}` }}>
              <div className="flex items-start gap-3">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                    {i.tipo === "audio" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 999 }}>
                        <Mic size={9} /> Audio
                      </span>
                    )}
                    <span className={`tag ${catColor[i.pilar]}`} style={{ fontSize: 10 }}><Tag size={9} /> {i.pilar}</span>
                    {i.formato && <span style={{ fontSize: 10, color: "var(--text-muted)", padding: "1px 7px", borderRadius: 999, background: "var(--bg-input)", border: "1px solid var(--border)" }}>{i.formato}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{i.texto}</p>
                  <div className="flex items-center gap-1" style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
                    <Clock size={9} /> {i.data} as {i.hora}
                  </div>
                </div>
                <button onClick={() => deletar(i.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0, padding: "2px" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Lightbulb size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ideias</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Ideias de Conteudo</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Capture a ideia na hora — por escrito ou por voz.</p>
      </div>

      {/* Caixa de captura rapida */}
      <div className="card" style={{ padding: "20px", marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Capturar Ideia Agora</p>

        {/* Selecao de canal */}
        <div className="flex items-center gap-2 capture-row" style={{ marginBottom: 12 }}>
          {(["Instagram", "YouTube"] as Canal[]).map((c) => {
            const cfg = canalConfig[c];
            return (
              <button key={c} onClick={() => { setFormCanal(c); setFormFormato(c === "Instagram" ? "Reels" : "Video"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: formCanal === c ? `1px solid ${cfg.color}` : "1px solid var(--border)", background: formCanal === c ? cfg.bg : "transparent", color: formCanal === c ? cfg.color : "var(--text-muted)", transition: "all 0.15s", fontWeight: formCanal === c ? 600 : 400 }}>
                {cfg.icon} {c}
              </button>
            );
          })}
          <div className="capture-selects" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <select value={formPilar} onChange={(e) => setFormPilar(e.target.value as Pilar)} style={{ padding: "7px 10px", fontSize: 12, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}>
              {PILARES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={formFormato} onChange={(e) => setFormFormato(e.target.value)} style={{ padding: "7px 10px", fontSize: 12, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 }}>
              {formCanal === "Instagram"
                ? ["Reels", "Carrossel", "Stories", "Post", "Live"].map((f) => <option key={f}>{f}</option>)
                : ["Video", "Shorts", "Live"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={formTexto}
          onChange={(e) => setFormTexto(e.target.value)}
          style={{ padding: "12px", width: "100%", fontSize: 13, minHeight: 80, resize: "vertical", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", marginBottom: 12 }}
          placeholder={`Descreva sua ideia para ${formCanal}... (tema, angulo, gancho, referencia)`}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) salvarIdeia(); }}
        />

        {/* Botoes */}
        <div className="flex items-center gap-3">
          <button className="btn-gold flex items-center gap-2" onClick={salvarIdeia} disabled={!formTexto.trim()}>
            <Plus size={14} /> Salvar Ideia
          </button>
          <button
            onClick={toggleGravacao}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              fontSize: 13, cursor: "pointer", fontWeight: 500,
              background: gravando ? "rgba(239,68,68,0.15)" : "var(--bg-input)",
              border: gravando ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
              color: gravando ? "#fca5a5" : "var(--text-muted)", transition: "all 0.2s",
            }}
          >
            {gravando ? <><MicOff size={14} /> Parar ({segundos}s)</> : <><Mic size={14} /> Gravar Voz</>}
          </button>
          {gravando && (
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fca5a5", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>Gravando...</span>
            </div>
          )}
          <span className="hide-mobile" style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>Cmd+Enter para salvar</span>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        {(["Todos", "Instagram", "YouTube"] as const).map((c) => {
          const cfg = c !== "Todos" ? canalConfig[c as Canal] : null;
          return (
            <button key={c} onClick={() => setCanalAtivo(c)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer",
              border: canalAtivo === c ? (cfg ? `1px solid ${cfg.color}30` : "1px solid var(--gold-border)") : "1px solid var(--border)",
              background: canalAtivo === c ? (cfg ? cfg.bg : "var(--gold-light)") : "transparent",
              color: canalAtivo === c ? (cfg ? cfg.color : "var(--gold)") : "var(--text-muted)", transition: "all 0.15s",
            }}>
              {cfg?.icon} {c}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{filtradas.length} ideia{filtradas.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Se "Todos", mostra as duas secoes separadas */}
      {canalAtivo === "Todos" ? (
        <div className="grid-cols-2" style={{ gap: 24 }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ color: canalConfig.Instagram.color }}>{canalConfig.Instagram.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: canalConfig.Instagram.color }}>Instagram</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{insta.length}</span>
            </div>
            {renderLista(insta, "Instagram")}
          </div>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ color: canalConfig.YouTube.color }}>{canalConfig.YouTube.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: canalConfig.YouTube.color }}>YouTube</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{yt.length}</span>
            </div>
            {renderLista(yt, "YouTube")}
          </div>
        </div>
      ) : (
        renderLista(filtradas, canalAtivo as Canal)
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  );
}
