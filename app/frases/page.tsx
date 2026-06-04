"use client";

import { useState } from "react";
import { Quote, Plus, Copy, Search, Instagram, Youtube, Heart, Sparkles, X, CheckCircle2 } from "lucide-react";

type FraseCategoria = "Fe" | "Mentalidade" | "Lideranca" | "Emocional" | "Familia" | "Casamento";

interface Frase {
  id: number;
  texto: string;
  categoria: FraseCategoria;
  versiculo?: string;
  usarEm: string[];
  favorita: boolean;
}

const FRASES: Frase[] = [
  {
    id: 1,
    texto: "O lugar mais seguro que existe e no lugar de dependencia total de Deus.",
    categoria: "Fe",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
  {
    id: 2,
    texto: "O que voce gera no secreto com Deus e o que te sustenta em publico.",
    categoria: "Fe",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
  {
    id: 3,
    texto: "Desacelerar nao e fraqueza. E sabedoria.",
    categoria: "Emocional",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 4,
    texto: "Casamento nao e disputa de ego. E escolha diaria.",
    categoria: "Casamento",
    usarEm: ["Instagram"],
    favorita: true,
  },
  {
    id: 5,
    texto: "Mulher INCOMUM nao e aquela que nao sente medo — e aquela que avanca mesmo com medo.",
    categoria: "Lideranca",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
  {
    id: 6,
    texto: "Forca e feminilidade nao sao opostos — sao complementares.",
    categoria: "Mentalidade",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 7,
    texto: "Sua identidade esta ancorада em algo que ninguem pode tirar de voce.",
    categoria: "Fe",
    usarEm: ["Instagram", "YouTube"],
    favorita: false,
  },
  {
    id: 8,
    texto: "Amor verdadeiro nao e so sentimento... e alianca diante de Deus.",
    categoria: "Casamento",
    versiculo: "Efesios 5:31",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 9,
    texto: "Quando um fortakece o outro, a familia permanece firme.",
    categoria: "Familia",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 10,
    texto: "E decidir cuidar, proteger e permanecer — mesmo quando nao e facil.",
    categoria: "Casamento",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 11,
    texto: "Voce nao precisa escolher entre ser forte e ser delicada. Voce e as duas coisas, no momento certo.",
    categoria: "Mentalidade",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
  {
    id: 12,
    texto: "Existe um cansaco emocional que o descanso de uma noite nao cura.",
    categoria: "Emocional",
    usarEm: ["Instagram"],
    favorita: false,
  },
  {
    id: 13,
    texto: "A mulher que tem uma vida secreta solida com Deus nao precisa de aprovacao humana.",
    categoria: "Fe",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
  {
    id: 14,
    texto: "Lideranca feminina nao e sobre dominar — e sobre elevar.",
    categoria: "Lideranca",
    usarEm: ["Instagram", "YouTube"],
    favorita: false,
  },
  {
    id: 15,
    texto: "Deus nao te deu esse sonho para te torturar. Ele te deu para te movimentar.",
    categoria: "Fe",
    versiculo: "Jeremias 29:11",
    usarEm: ["Instagram", "YouTube"],
    favorita: true,
  },
];

const catConfig: Record<FraseCategoria, { color: string; bg: string; tag: string }> = {
  Fe:          { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", tag: "tag-fe" },
  Mentalidade: { color: "#93c5fd", bg: "rgba(59,130,246,0.12)", tag: "tag-mentalidade" },
  Lideranca:   { color: "#C9A84C", bg: "rgba(201,168,76,0.12)", tag: "tag-lideranca" },
  Emocional:   { color: "#f9a8d4", bg: "rgba(236,72,153,0.12)", tag: "tag-emocional" },
  Familia:     { color: "#86efac", bg: "rgba(134,239,172,0.12)", tag: "tag-familia" },
  Casamento:   { color: "#fca5a5", bg: "rgba(252,165,165,0.12)", tag: "" },
};

const CATEGORIAS = ["Todas", "Fe", "Mentalidade", "Lideranca", "Emocional", "Familia", "Casamento"];

export default function Frases() {
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("Todas");
  const [soFavoritas, setSoFavoritas] = useState(false);
  const [copiadoId, setCopiadoId] = useState<number | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);

  const filtradas = FRASES.filter((f) => {
    const matchBusca = f.texto.toLowerCase().includes(busca.toLowerCase());
    const matchCat = catAtiva === "Todas" || f.categoria === catAtiva;
    const matchFav = soFavoritas ? f.favorita : true;
    return matchBusca && matchCat && matchFav;
  });

  const favoritas = FRASES.filter((f) => f.favorita);

  function copiar(frase: Frase) {
    const texto = frase.versiculo
      ? `"${frase.texto}"\n— ${frase.versiculo}`
      : `"${frase.texto}"`;
    navigator.clipboard.writeText(texto).catch(() => {});
    setCopiadoId(frase.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Quote size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Banco de Frases
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Suas Frases</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Palavras que voce ja disse — prontas para usar no conteudo.
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setNovaAberta(true)}>
          <Plus size={14} /> Nova Frase
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total de Frases", value: FRASES.length, color: "var(--gold)" },
          { label: "Favoritas", value: favoritas.length, color: "#f9a8d4" },
          { label: "Para Instagram", value: FRASES.filter((f) => f.usarEm.includes("Instagram")).length, color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Busca e filtros */}
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2" style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            style={{ background: "none", border: "none", flex: 1, fontSize: 13, color: "var(--text)", outline: "none" }}
            placeholder="Buscar frase..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSoFavoritas(!soFavoritas)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8, fontSize: 12,
            cursor: "pointer",
            border: soFavoritas ? "1px solid #f9a8d4" : "1px solid var(--border)",
            background: soFavoritas ? "rgba(236,72,153,0.12)" : "transparent",
            color: soFavoritas ? "#f9a8d4" : "var(--text-muted)",
            transition: "all 0.15s",
          }}
        >
          <Heart size={13} fill={soFavoritas ? "#f9a8d4" : "none"} />
          Favoritas
        </button>
      </div>

      {/* Categorias */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {CATEGORIAS.map((c) => {
          const cfg = catConfig[c as FraseCategoria];
          return (
            <button
              key={c}
              onClick={() => setCatAtiva(c)}
              style={{
                padding: "4px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                border: catAtiva === c ? `1px solid ${cfg?.color ?? "var(--gold-border)"}` : "1px solid var(--border)",
                background: catAtiva === c ? (cfg?.bg ?? "var(--gold-light)") : "transparent",
                color: catAtiva === c ? (cfg?.color ?? "var(--gold)") : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Grid de frases */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {filtradas.map((f) => {
          const cfg = catConfig[f.categoria];
          const copiado = copiadoId === f.id;
          return (
            <div
              key={f.id}
              className="card"
              style={{
                padding: "16px 18px",
                border: f.favorita ? `1px solid ${cfg.color}30` : "1px solid var(--border)",
                background: f.favorita ? cfg.bg : "var(--bg-card)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Categoria + favorita */}
              <div className="flex items-center justify-between">
                <span className={`tag ${cfg.tag}`} style={{ fontSize: 10 }}>{f.categoria}</span>
                <div className="flex items-center gap-2">
                  {f.favorita && <Heart size={12} fill="#f9a8d4" style={{ color: "#f9a8d4" }} />}
                </div>
              </div>

              {/* Texto */}
              <p style={{
                fontSize: 13,
                fontStyle: "italic",
                color: "var(--text-soft)",
                lineHeight: 1.7,
                flex: 1,
                margin: 0,
              }}>
                "{f.texto}"
              </p>

              {/* Versiculo se tiver */}
              {f.versiculo && (
                <p style={{ fontSize: 10, color: cfg.color, fontWeight: 600, margin: 0 }}>
                  {f.versiculo}
                </p>
              )}

              {/* Footer: canais + copiar */}
              <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                <div className="flex items-center gap-2">
                  {f.usarEm.includes("Instagram") && (
                    <div style={{ fontSize: 10, color: "#f9a8d4", display: "flex", alignItems: "center", gap: 3 }}>
                      <Instagram size={10} /> Insta
                    </div>
                  )}
                  {f.usarEm.includes("YouTube") && (
                    <div style={{ fontSize: 10, color: "#fca5a5", display: "flex", alignItems: "center", gap: 3 }}>
                      <Youtube size={10} /> YT
                    </div>
                  )}
                </div>
                <button
                  onClick={() => copiar(f)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, cursor: "pointer",
                    background: copiado ? "rgba(134,239,172,0.12)" : "var(--bg-input)",
                    color: copiado ? "#86efac" : "var(--text-muted)",
                    border: copiado ? "1px solid rgba(134,239,172,0.2)" : "1px solid var(--border)",
                    borderRadius: 6, padding: "4px 10px",
                    transition: "all 0.2s",
                  }}
                >
                  {copiado ? <><CheckCircle2 size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Sparkles size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma frase encontrada.</p>
        </div>
      )}

      {/* Modal nova frase */}
      {novaAberta && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setNovaAberta(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 480, width: "100%", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div className="flex items-center gap-2">
                <Quote size={15} style={{ color: "var(--gold)" }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nova Frase</h2>
              </div>
              <button onClick={() => setNovaAberta(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <textarea
                style={{ padding: "10px 12px", width: "100%", fontSize: 13, minHeight: 100, resize: "vertical" }}
                placeholder="Digite a frase..."
              />
              <input style={{ padding: "10px 12px", width: "100%", fontSize: 13 }} placeholder="Versiculo (opcional)..." />
              <select style={{ padding: "10px 12px", width: "100%", fontSize: 13 }}>
                {["Fe", "Mentalidade", "Lideranca", "Emocional", "Familia", "Casamento"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--text-soft)", cursor: "pointer" }}>
                  <input type="checkbox" /> Usar no Instagram
                </label>
                <label className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--text-soft)", cursor: "pointer" }}>
                  <input type="checkbox" /> Usar no YouTube
                </label>
              </div>
              <label className="flex items-center gap-2" style={{ fontSize: 13, color: "#f9a8d4", cursor: "pointer" }}>
                <input type="checkbox" /> <Heart size={13} /> Marcar como favorita
              </label>
              <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={() => setNovaAberta(false)}>Cancelar</button>
                <button className="btn-gold">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
