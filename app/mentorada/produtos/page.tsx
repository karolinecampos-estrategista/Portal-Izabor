"use client";

import { Gift, CheckCircle2, Lock, Crown, Star, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  detalhes: string[];
  emoji: string;
  cor: string;
  possuido: boolean;
  preco?: string;
  badge?: string;
};

const PRODUTOS: Produto[] = [
  {
    id: "mentoria-bw",
    nome: "Mentoria BW",
    descricao: "Seu programa principal — 24 semanas de transformação individual com a Izabor Cruz.",
    detalhes: [
      "24 encontros individuais (60 min cada)",
      "Acesso ao portal e aulas gravadas",
      "Desafios semanais personalizados",
      "Grupo exclusivo BW",
      "Encontro presencial de encerramento",
    ],
    emoji: "👑",
    cor: "#C9A84C",
    possuido: true,
    badge: "Ativo",
  },
  {
    id: "club-bw",
    nome: "Club BW",
    descricao: "Comunidade mensal de mulheres extraordinárias. Encontros ao vivo, estudos e suporte contínuo.",
    detalhes: [
      "1 encontro ao vivo por mês",
      "Acesso ao grupo exclusivo",
      "Materiais mensais de estudo",
      "Acesso ao acervo de conteúdos",
      "Convites para eventos presenciais",
    ],
    emoji: "💜",
    cor: "#a78bfa",
    possuido: true,
    badge: "Ativo",
  },
  {
    id: "box-livro",
    nome: "Box do Livro",
    descricao: "Acompanhamento mensal do livro de Izabor Cruz com sessões de grupo e reflexão profunda.",
    detalhes: [
      "Acesso ao grupo de leitura",
      "2 sessões em grupo por mês",
      "Material de apoio exclusivo",
      "Debate ao vivo com a Izabor",
      "Certificado de conclusão",
    ],
    emoji: "📚",
    cor: "#86efac",
    possuido: false,
    preco: "R$ 97,00/mês",
    badge: "Disponível",
  },
  {
    id: "imersao-bw",
    nome: "Imersão BW",
    descricao: "Evento presencial de 3 dias de imersão total. Transformação acelerada com outras mulheres extraordinárias.",
    detalhes: [
      "3 dias de imersão presencial",
      "Dinâmicas e workshops ao vivo",
      "Networking com outras alunas",
      "Kit exclusivo da imersão",
      "Próxima turma: Outubro 2026",
    ],
    emoji: "🔥",
    cor: "#fca5a5",
    possuido: false,
    preco: "R$ 1.497,00",
    badge: "Em breve",
  },
];

export default function Produtos() {
  const [produtoAberto, setProdutoAberto] = useState<Produto | null>(null);

  const possuidos = PRODUTOS.filter((p) => p.possuido);
  const disponiveis = PRODUTOS.filter((p) => !p.possuido);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Gift size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meus Produtos</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Programas & Produtos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Tudo o que você possui e o que ainda pode desbloquear.</p>
      </div>

      {/* O que você tem */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <CheckCircle2 size={14} style={{ color: "#86efac" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#86efac" }}>O que você já tem</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{possuidos.length} programas ativos</span>
        </div>

        <div className="grid-cols-2">
          {possuidos.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: "20px 22px",
                border: `1px solid ${p.cor}40`,
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)",
                cursor: "pointer",
              }}
              onClick={() => setProdutoAberto(p)}
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 36 }}>{p.emoji}</div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "rgba(134,239,172,0.12)",
                  color: "#86efac",
                  border: "1px solid rgba(134,239,172,0.2)",
                }}>
                  <CheckCircle2 size={10} /> {p.badge}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: p.cor }}>{p.nome}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>{p.descricao}</p>
              <div className="flex flex-col gap-2">
                {p.detalhes.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Sparkles size={10} style={{ color: p.cor, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--text-soft)" }}>{d}</span>
                  </div>
                ))}
                {p.detalhes.length > 3 && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>+ {p.detalhes.length - 3} benefícios</p>
                )}
              </div>
              <div className="flex items-center gap-1" style={{ marginTop: 14, color: p.cor, fontSize: 11 }}>
                <span>Ver detalhes</span>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* O que você pode desbloquear */}
      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <Lock size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Desbloquear mais</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>Expanda sua jornada</span>
        </div>

        <div className="grid-cols-2">
          {disponiveis.map((p) => (
            <div
              key={p.id}
              className="card card-hover"
              style={{
                padding: "20px 22px",
                border: "1px solid var(--border)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Badge */}
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  background: p.cor + "15",
                  color: p.cor,
                  border: `1px solid ${p.cor}30`,
                }}>
                  {p.badge}
                </span>
              </div>

              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.8 }}>{p.emoji}</div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{p.nome}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>{p.descricao}</p>

              <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
                {p.detalhes.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Star size={10} style={{ color: p.cor, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: 16, fontWeight: 700, color: p.cor }}>{p.preco}</span>
                <button
                  className="btn-gold"
                  style={{ fontSize: 12, padding: "7px 16px" }}
                  onClick={() => setProdutoAberto(p)}
                >
                  Quero esse!
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal detalhe */}
      {produtoAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setProdutoAberto(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: 28, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 32 }}>{produtoAberto.emoji}</span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: produtoAberto.cor }}>{produtoAberto.nome}</p>
                  {produtoAberto.preco && <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>{produtoAberto.preco}</p>}
                </div>
              </div>
              <button onClick={() => setProdutoAberto(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 20 }}>{produtoAberto.descricao}</p>

            <p style={{ fontSize: 12, fontWeight: 600, color: produtoAberto.cor, marginBottom: 10 }}>O que está incluído:</p>
            <div className="flex flex-col gap-2" style={{ marginBottom: 20 }}>
              {produtoAberto.detalhes.map((d, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "8px 12px", background: produtoAberto.cor + "10", borderRadius: 8, border: `1px solid ${produtoAberto.cor}20` }}>
                  <Crown size={12} style={{ color: produtoAberto.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{d}</span>
                </div>
              ))}
            </div>

            {produtoAberto.possuido ? (
              <div style={{ padding: "14px 16px", background: "rgba(134,239,172,0.1)", borderRadius: 10, border: "1px solid rgba(134,239,172,0.2)", textAlign: "center" }}>
                <CheckCircle2 size={18} style={{ color: "#86efac", marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: "#86efac", fontWeight: 600, margin: 0 }}>Você já possui este programa ✨</p>
              </div>
            ) : (
              <div>
                <a
                  href="https://izaborcruz.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", width: "100%", marginBottom: 10 }}
                >
                  <ExternalLink size={14} /> Quero me inscrever
                </a>
                <Link href="/mentorada/chat" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>
                  Tirar dúvidas no chat
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
