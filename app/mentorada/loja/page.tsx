"use client";

import { ShoppingBag, ExternalLink, Calendar, Crown } from "lucide-react";

const PRODUTOS = [
  {
    id: "seja-incomum",
    nome: "Seja Incomum",
    tipo: "Mentoria Individual",
    emoji: "👑",
    cor: "#C9A84C",
    descricao: "Mentoria individual com a Izabor Cruz. Transformação em identidade, fé e liderança — do interior para o extraordinário.",
    link: "https://izaborcruz.com.br/sejaincomum/",
    destaque: true,
    lancamento: null,
  },
  {
    id: "club-bw",
    nome: "Club BW",
    tipo: "Assinatura Mensal",
    emoji: "💜",
    cor: "#a78bfa",
    descricao: "Comunidade mensal com encontros ao vivo, estudos e suporte contínuo com a Izabor e outras mulheres extraordinárias.",
    link: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G",
    destaque: true,
    lancamento: null,
  },
  {
    id: "evento",
    nome: "Evento — Simplesmente Seja",
    tipo: "Evento Presencial",
    emoji: "🔥",
    cor: "#fca5a5",
    descricao: "Evento presencial de imersão e transformação. Um encontro único para viver o extraordinário ao lado de outras mulheres.",
    link: "https://simplesmenteseja.izaborcruz.com.br",
    destaque: true,
    lancamento: null,
  },
  {
    id: "livro",
    nome: "Livro — Mulher Incomum",
    tipo: "Lançamento",
    emoji: "📖",
    cor: "#86efac",
    descricao: "O livro da Izabor Cruz com acompanhamento mensal em grupo. Lançamento dia 10/10 no evento presencial.",
    link: null,
    destaque: false,
    lancamento: "Lançamento 10 de outubro · No evento presencial",
  },
];

export default function Loja() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <ShoppingBag size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Produtos</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Produtos & Programas Izabor Cruz</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Expanda sua jornada com os programas da Izabor.
        </p>
      </div>

      {/* Destaques */}
      <div className="grid-cols-3" style={{ marginBottom: 24 }}>
        {PRODUTOS.filter(p => p.destaque).map(p => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: "22px 20px",
              border: `1px solid ${p.cor}35`,
              background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -12, right: -12, fontSize: 60, opacity: 0.05 }}>{p.emoji}</div>

            <div style={{ fontSize: 32, marginBottom: 12 }}>{p.emoji}</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: p.cor, background: `${p.cor}15`, padding: "2px 8px", borderRadius: 999 }}>
              {p.tipo}
            </span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 6px", color: p.cor }}>{p.nome}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>{p.descricao}</p>

            <a
              href={p.link!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8,
                background: "var(--gold-light)", border: "1px solid var(--gold-border)",
                color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              <ExternalLink size={12} /> Saiba mais
            </a>
          </div>
        ))}
      </div>

      {/* Livro — lançamento em destaque */}
      <div
        className="card glow-gold"
        style={{
          padding: "22px 24px",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 48 }}>📖</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#86efac", margin: 0 }}>Livro — Mulher Incomum</h2>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
              Em breve
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
            {PRODUTOS.find(p => p.id === "livro")!.descricao}
          </p>
          <div className="flex items-center gap-2">
            <Calendar size={13} style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>
              Lançamento 10 de outubro · No evento presencial
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "14px 20px", background: "rgba(134,239,172,0.08)", borderRadius: 12, border: "1px solid rgba(134,239,172,0.2)", flexShrink: 0 }}>
          <Crown size={20} style={{ color: "#86efac", marginBottom: 6 }} />
          <p style={{ fontSize: 11, color: "#86efac", fontWeight: 700, margin: 0 }}>Aguarde o<br/>lançamento!</p>
        </div>
      </div>

      <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 20 }}>
        Portal exclusivo · Izabor Cruz — Ativando Mulheres para viverem o extraordinário ✨
      </p>
    </div>
  );
}
