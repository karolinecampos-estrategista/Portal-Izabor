"use client";

import { ShoppingBag, Star, ExternalLink, Ticket } from "lucide-react";

const CUPONS = [
  { codigo: "IZABW15", descricao: "15% OFF em todos os livros Izabor Cruz", validade: "Dez 2026", cor: "#C9A84C" },
  { codigo: "CLUBE10", descricao: "10% OFF na renovação do Club BW", validade: "Jun 2026", cor: "#a78bfa" },
  { codigo: "PARCEIRA20", descricao: "20% OFF — Parceria Canção Nova Digital", validade: "Out 2026", cor: "#86efac" },
];


const PRODUTOS = [
  { id: 1, nome: "Livro — Mulher INCOMUM", descricao: "O guia definitivo para mulheres que querem viver o extraordinário. 256 páginas de transformação.", preco: "R$ 67,00", emoji: "📖", cor: "#C9A84C", destaque: true },
  { id: 2, nome: "Devocional 30 dias", descricao: "30 dias de encontro com Deus. Reflexões e declarações poderosas.", preco: "R$ 47,00", emoji: "🙏", cor: "#a78bfa" },
  { id: 3, nome: "Caneca — Extraordinária", descricao: '"Eu sou feita para o extraordinário" — Cerâmica premium 350ml.', preco: "R$ 59,00", emoji: "☕", cor: "#86efac" },
  { id: 4, nome: "Agenda BW 2026", descricao: "A agenda que une fé, mentalidade e estratégia. Com versículos, metas e reflexões.", preco: "R$ 89,00", emoji: "📓", cor: "#93c5fd", destaque: true },
  { id: 5, nome: "Caderno de Orações", descricao: "Registre suas orações, sonhos e intercessões. Capa dura, 200 páginas.", preco: "R$ 54,00", emoji: "📔", cor: "#f9a8d4" },
  { id: 6, nome: "Box Completo Izabor", descricao: "Livro + Devocional + Caneca + Caderno. O kit da Mulher Extraordinária.", preco: "R$ 197,00", emoji: "🎁", cor: "#C9A84C", destaque: true },
];

export default function Loja() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <ShoppingBag size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Loja</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Loja Izabor Cruz</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Seus cupons, parcerias e produtos exclusivos.</p>
      </div>

      {/* ── MEUS CUPONS ── */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <Ticket size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>Meus Cupons</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>Exclusivos para alunas BW</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {CUPONS.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "16px 18px",
                borderRadius: 12,
                background: `${c.cor}0d`,
                border: `1px dashed ${c.cor}60`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 50, opacity: 0.04 }}>🎫</div>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <code style={{ fontSize: 16, fontWeight: 800, color: c.cor, letterSpacing: "0.05em" }}>{c.codigo}</code>
                <button
                  onClick={() => navigator.clipboard?.writeText(c.codigo)}
                  style={{ fontSize: 10, color: c.cor, background: "none", border: `1px solid ${c.cor}50`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontWeight: 600 }}
                >
                  Copiar
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "0 0 4px" }}>{c.descricao}</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Válido até {c.validade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 0 28px" }} />

      {/* ── LOJA ── */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Produtos da Loja</span>
          </div>
          <a
            href="https://izaborcruz.com.br/loja"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--gold)", textDecoration: "none" }}
          >
            <ExternalLink size={12} /> Ver loja completa
          </a>
        </div>

        {/* Banner cupom */}
        <div
          className="card glow-gold"
          style={{
            padding: "14px 18px",
            marginBottom: 18,
            background: "linear-gradient(135deg, #111 0%, #161208 100%)",
            border: "1px solid var(--gold-border)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 24 }}>🎫</span>
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0, flex: 1 }}>
            Use o cupom <strong style={{ color: "var(--gold)" }}>IZABW15</strong> e ganhe <strong style={{ color: "var(--gold)" }}>15% de desconto</strong> em todos os livros ao finalizar a compra.
          </p>
          <a
            href="https://izaborcruz.com.br/loja"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
            style={{ textDecoration: "none", fontSize: 12, padding: "7px 16px", flexShrink: 0 }}
          >
            Ir para a loja
          </a>
        </div>

        {/* Destaques */}
        <div className="grid-cols-3" style={{ marginBottom: 18 }}>
          {PRODUTOS.filter((p) => p.destaque).map((p) => (
            <div
              key={p.id}
              className="card card-hover"
              style={{
                padding: "20px 18px",
                border: `1px solid ${p.cor}30`,
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 48, opacity: 0.05 }}>{p.emoji}</div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{p.emoji}</div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: p.cor, background: `${p.cor}15`, padding: "2px 7px", borderRadius: 999 }}>
                Destaque
              </span>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "8px 0 5px" }}>{p.nome}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>{p.descricao}</p>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 15, fontWeight: 700, color: p.cor }}>{p.preco}</span>
                <a href="https://izaborcruz.com.br/loja" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ textDecoration: "none", fontSize: 11, padding: "5px 12px" }}>Comprar</a>
              </div>
            </div>
          ))}
        </div>

        {/* Todos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
          {PRODUTOS.map((p) => (
            <div key={p.id} className="card card-hover" style={{ padding: "13px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: `${p.cor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {p.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 3px" }}>{p.nome}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: p.cor, margin: "0 0 5px" }}>{p.preco}</p>
                <a href="https://izaborcruz.com.br/loja" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>
                  Ver produto <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
