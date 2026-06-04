"use client";

import { Heart, Plus, Star, Image, Video, MessageSquare, X, Send } from "lucide-react";
import { useState } from "react";

type TipoDepoimento = "texto" | "imagem" | "video";

type Depoimento = {
  id: number;
  nome: string;
  programa: string;
  tipo: TipoDepoimento;
  conteudo: string;
  emoji: string;
  cor: string;
  data: string;
  destaque?: boolean;
};

const DEPOIMENTOS: Depoimento[] = [
  {
    id: 1, nome: "Fernanda Lima", programa: "Club BW", tipo: "texto",
    conteudo: "Entrei na mentoria sem acreditar em mim mesma. Hoje lidero um time de 8 pessoas e triplicamos o faturamento da minha empresa em 4 meses. A Izabor mudou a forma como eu me vejo.",
    emoji: "🏆", cor: "#C9A84C", data: "Mar 2026", destaque: true,
  },
  {
    id: 2, nome: "Camila Souza", programa: "Mentoria Individual", tipo: "texto",
    conteudo: "A mentoria com a Iza não é sobre negócios. É sobre quem você se torna quando para de se esconder. Sou uma mulher diferente — mais livre, mais intencional, mais grata.",
    emoji: "💜", cor: "#a78bfa", data: "Abr 2026",
  },
  {
    id: 3, nome: "Patricia Alves", programa: "Club BW", tipo: "imagem",
    conteudo: "Minha transformação em 3 meses: do medo de aparecer para liderar um evento com 200 mulheres. Deus faz coisas impossíveis quando você se rende.",
    emoji: "📸", cor: "#f9a8d4", data: "Mai 2026",
  },
  {
    id: 4, nome: "Renata Costa", programa: "Imersão BW", tipo: "texto",
    conteudo: "Saí da imersão com clareza de propósito que nunca tive. Em 6 meses faturei o que antes faturava em 2 anos. Mas mais do que isso — encontrei minha identidade em Deus.",
    emoji: "🌟", cor: "#86efac", data: "Fev 2026", destaque: true,
  },
  {
    id: 5, nome: "Juliana Matos", programa: "Mentoria Individual", tipo: "video",
    conteudo: "Gravei este vídeo porque preciso que outras mulheres saibam: existe saída. A Izabor me ajudou a sair de um casamento de aparências para um casamento de verdade.",
    emoji: "🎥", cor: "#93c5fd", data: "Mai 2026",
  },
  {
    id: 6, nome: "Ana Beatriz", programa: "Club BW", tipo: "texto",
    conteudo: "3 meses na mentoria e minha extensão de cílios triplicou o faturamento. Mas o maior resultado foi interno: parei de me sabotar e comecei a agir como a empresária que sempre quis ser.",
    emoji: "💅", cor: "#fca5a5", data: "Jan 2026",
  },
];

export default function Depoimentos() {
  const [depoimentos, setDepoimentos] = useState(DEPOIMENTOS);
  const [filtro, setFiltro] = useState<"todos" | TipoDepoimento>("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [tipoForm, setTipoForm] = useState<TipoDepoimento>("texto");
  const [textoForm, setTextoForm] = useState("");
  const [enviado, setEnviado] = useState(false);

  const filtrados = depoimentos.filter((d) => filtro === "todos" || d.tipo === filtro);
  const destaques = depoimentos.filter((d) => d.destaque);

  function enviarDepoimento() {
    if (!textoForm.trim()) return;
    setTextoForm("");
    setFormAberto(false);
    setEnviado(true);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Heart size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Depoimentos</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Histórias de Transformação</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Você também é parte desta história. Compartilhe sua jornada.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setFormAberto(true)}>
          <Plus size={14} /> Meu Depoimento
        </button>
      </div>

      {/* Depoimento enviado — aguardando aprovação */}
      {enviado && (
        <div style={{ padding: "18px 20px", background: "rgba(201,168,76,0.08)", border: "1px solid var(--gold-border)", borderRadius: 12, marginBottom: 20 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🙏</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Depoimento enviado!</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>Aguardando aprovação da Izabor para aparecer para todo o grupo.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(251,191,36,0.08)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.2)" }}>
            <span style={{ fontSize: 11, color: "#fbbf24" }}>⏳</span>
            <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>Em análise — a Izabor vai revisar e publicar em breve</span>
          </div>
        </div>
      )}

      {/* Destaques */}
      {destaques.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <Star size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Destaques</span>
          </div>
          <div className="grid-cols-2">
            {destaques.map((d) => (
              <div
                key={d.id}
                className="card"
                style={{
                  padding: "20px 22px",
                  background: "linear-gradient(135deg, #111 0%, #161208 100%)",
                  border: "1px solid var(--gold-border)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, fontSize: 60, opacity: 0.06 }}>{d.emoji}</div>
                <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                  <div className="avatar" style={{ width: 32, height: 32, background: d.cor + "20", color: d.cor, fontSize: 12 }}>
                    {d.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: "var(--text)" }}>{d.nome}</p>
                    <p style={{ fontSize: 10, color: d.cor, margin: 0 }}>{d.programa}</p>
                  </div>
                  <Star size={12} style={{ color: "var(--gold)", marginLeft: "auto" }} />
                </div>
                <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 10px" }}>
                  "{d.conteudo}"
                </p>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.data}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        {([
          { key: "todos", label: "Todos", icon: null },
          { key: "texto", label: "Texto", icon: MessageSquare },
          { key: "imagem", label: "Imagem", icon: Image },
          { key: "video", label: "Vídeo", icon: Video },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
              border: filtro === f.key ? "1px solid var(--gold-border)" : "1px solid var(--border)",
              background: filtro === f.key ? "var(--gold-light)" : "transparent",
              color: filtro === f.key ? "var(--gold)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {f.icon && <f.icon size={11} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de depoimentos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtrados.map((d) => (
          <div key={d.id} className="card card-hover" style={{ padding: "18px 20px" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <div className="avatar" style={{ width: 36, height: 36, background: d.cor + "20", color: d.cor, fontSize: 12 }}>
                {d.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{d.nome}</p>
                <p style={{ fontSize: 10, color: d.cor, margin: 0 }}>{d.programa}</p>
              </div>
              <span style={{ fontSize: 16 }}>{d.emoji}</span>
            </div>

            {/* Badge tipo */}
            <div style={{ marginBottom: 10 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 999, fontSize: 10,
                background: d.tipo === "texto" ? "rgba(201,168,76,0.1)" : d.tipo === "imagem" ? "rgba(236,72,153,0.1)" : "rgba(59,130,246,0.1)",
                color: d.tipo === "texto" ? "#C9A84C" : d.tipo === "imagem" ? "#f9a8d4" : "#93c5fd",
              }}>
                {d.tipo === "texto" ? <MessageSquare size={9} /> : d.tipo === "imagem" ? <Image size={9} /> : <Video size={9} />}
                {d.tipo === "texto" ? "Texto" : d.tipo === "imagem" ? "Imagem" : "Vídeo"}
              </span>
            </div>

            {/* Conteúdo */}
            {d.tipo === "imagem" ? (
              <div style={{ width: "100%", height: 120, background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 32 }}>
                {d.emoji}
              </div>
            ) : d.tipo === "video" ? (
              <div style={{ width: "100%", height: 100, background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, cursor: "pointer" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                    <Video size={16} style={{ color: "#93c5fd" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Ver vídeo</p>
                </div>
              </div>
            ) : null}

            <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
              "{d.conteudo}"
            </p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{d.data}</p>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {formAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setFormAberto(false)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Compartilhar minha história ✨</h2>
              <button onClick={() => setFormAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {/* Tipo */}
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Tipo de depoimento</p>
            <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
              {(["texto", "imagem", "video"] as TipoDepoimento[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoForm(t)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 0", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    border: tipoForm === t ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                    background: tipoForm === t ? "var(--gold-light)" : "transparent",
                    color: tipoForm === t ? "var(--gold)" : "var(--text-muted)",
                  }}
                >
                  {t === "texto" ? <MessageSquare size={13} /> : t === "imagem" ? <Image size={13} /> : <Video size={13} />}
                  {t === "texto" ? "Texto" : t === "imagem" ? "Imagem" : "Vídeo"}
                </button>
              ))}
            </div>

            <textarea
              value={textoForm}
              onChange={(e) => setTextoForm(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", fontSize: 13, minHeight: 120, resize: "vertical", borderRadius: 8 }}
              placeholder="Conte sua transformação... O que mudou na sua vida desde que entrou na mentoria?"
            />

            {tipoForm !== "texto" && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  {tipoForm === "imagem" ? "📸 Upload de imagem disponível em breve" : "🎥 Envio de vídeo disponível em breve"}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end" style={{ marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="btn-gold flex items-center gap-2" onClick={enviarDepoimento} disabled={!textoForm.trim()}>
                <Send size={13} /> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
