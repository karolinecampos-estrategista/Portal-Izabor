"use client";

import { useState, useEffect } from "react";
import { Gift, CheckCircle2, ExternalLink, Calendar, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PRODUTOS = [
  {
    chave: "seja_incomum",
    nome: "Seja Incomum",
    tipo: "Video Aulas",
    emoji: "👑",
    cor: "#C9A84C",
    descricao: "Programa de video aulas com a Izabor Cruz — transformação profunda em identidade, fé e liderança. Conteúdo exclusivo no portal com plano de ação personalizado e acompanhamento contínuo.",
    detalhes: [
      "Video aulas exclusivas no portal",
      "Plano de ação personalizado",
      "Devocional e jornada de transformação",
      "Desafios semanais e acompanhamento contínuo",
      "Grupo exclusivo Build Woman",
    ],
    link: "https://izaborcruz.com.br/sejaincomum/",
    lancamento: null,
  },
  {
    chave: "club_bw",
    nome: "Club BW",
    tipo: "Mentoria",
    emoji: "💜",
    cor: "#a78bfa",
    descricao: "Mentoria com a Izabor Cruz — encontros ao vivo, sessões de mentoria agendadas, estudos e suporte contínuo para mulheres extraordinárias.",
    detalhes: [
      "1 encontro ao vivo por mês com a Izabor",
      "Sessões de mentoria agendadas",
      "Acesso ao grupo exclusivo BW",
      "Materiais mensais de estudo e reflexão",
      "Convites para eventos presenciais",
    ],
    link: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G",
    lancamento: null,
  },
  {
    chave: "box_livro",
    nome: "Box do Livro — Mulher Incomum",
    tipo: "Lançamento · Livro + Material",
    emoji: "📖",
    cor: "#86efac",
    descricao: "O livro da Izabor Cruz com acompanhamento mensal, sessões em grupo e material exclusivo de reflexão. Uma imersão no seu processo de se tornar incomum.",
    detalhes: [
      "Livro físico + material exclusivo",
      "Acompanhamento mensal do livro",
      "2 sessões em grupo por mês com a Izabor",
      "Material de apoio por capítulo",
      "Debate ao vivo com reflexão profunda",
    ],
    link: null,
    lancamento: "Lançamento em breve",
  },
  {
    chave: "evento",
    nome: "Simplesmente Seja",
    tipo: "Evento Presencial",
    emoji: "🔥",
    cor: "#fb923c",
    descricao: "Evento presencial de imersão e transformação com a Izabor Cruz. Um encontro único para viver o extraordinário ao vivo com outras mulheres incomuns.",
    detalhes: [
      "Imersão presencial intensa",
      "Dinâmicas e workshops ao vivo",
      "Conexão com outras mulheres extraordinárias",
      "Experiência transformadora com a Izabor",
      "Conteúdo exclusivo do evento",
    ],
    link: "https://simplesmenteseja.izaborcruz.com.br",
    lancamento: null,
  },
];

type ProdutoId = (typeof PRODUTOS)[number]["chave"];

export default function MeusProdutos() {
  const [produtosAtivos, setProdutosAtivos] = useState<Record<string, boolean>>({});
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<ProdutoId | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }
      const res = await fetch("/api/perfil", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) {
        const p = await res.json();
        setProdutosAtivos(p.produtosAtivos ?? {});
      }
      setCarregando(false);
    });
  }, []);

  const temAcesso = (chave: string) => !!produtosAtivos[chave];

  const ativos      = PRODUTOS.filter(p => temAcesso(p.chave));
  const disponiveis = PRODUTOS.filter(p => !temAcesso(p.chave));
  const produtoAberto = PRODUTOS.find(p => p.chave === aberto) ?? null;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Gift size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Minha Área</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meus Programas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Seus programas ativos e o que você ainda pode adquirir da Izabor Cruz.
        </p>
      </div>

      {/* Ativos */}
      {ativos.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={14} style={{ color: "#86efac" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#86efac" }}>Você já tem acesso</span>
          </div>
          <div className="grid-cols-2">
            {ativos.map(p => (
              <div
                key={p.chave}
                className="card"
                style={{ padding: "22px 24px", border: `1px solid ${p.cor}40`, background: `linear-gradient(135deg, var(--bg-card) 0%, ${p.cor}08 100%)`, cursor: "pointer" }}
                onClick={() => setAberto(p.chave)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 36 }}>{p.emoji}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(134,239,172,0.12)", color: "#86efac", border: "1px solid rgba(134,239,172,0.2)" }}>
                    <CheckCircle2 size={10} /> Ativo
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: p.cor }}>{p.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>{p.tipo}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>{p.descricao}</p>
                <span style={{ fontSize: 11, color: p.cor }}>Ver detalhes →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disponíveis para adquirir */}
      {disponiveis.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Conheça também</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>— programas que você ainda pode adquirir</span>
          </div>
          <div className="grid-cols-2">
            {disponiveis.map(p => (
              <div
                key={p.chave}
                className="card card-hover"
                style={{ padding: "22px 24px", border: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => setAberto(p.chave)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, opacity: 0.85 }}>{p.emoji}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: p.cor + "18", color: p.cor, border: `1px solid ${p.cor}35` }}>
                    {p.lancamento ? "Em breve" : "Disponível"}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{p.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>{p.tipo}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>{p.descricao}</p>
                {p.lancamento && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Calendar size={11} style={{ color: "#fbbf24" }} />
                    <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>{p.lancamento}</span>
                  </div>
                )}
                {p.link && !p.lancamento && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: p.cor, fontWeight: 600 }}>
                    <ExternalLink size={10} /> Quero adquirir →
                  </span>
                )}
                {!p.link && !p.lancamento && (
                  <span style={{ fontSize: 11, color: p.cor }}>Saber mais →</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalhe */}
      {produtoAberto && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setAberto(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 520, width: "100%", padding: 28, maxHeight: "88vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 32 }}>{produtoAberto.emoji}</span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: produtoAberto.cor }}>{produtoAberto.nome}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{produtoAberto.tipo}</p>
                </div>
              </div>
              <button onClick={() => setAberto(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 18 }}>{produtoAberto.descricao}</p>

            {produtoAberto.lancamento && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, padding: "10px 14px", background: "rgba(251,191,36,0.08)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.25)" }}>
                <Calendar size={14} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600 }}>{produtoAberto.lancamento}</span>
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 600, color: produtoAberto.cor, marginBottom: 10 }}>O que está incluído:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
              {produtoAberto.detalhes.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: produtoAberto.cor + "10", borderRadius: 8, border: `1px solid ${produtoAberto.cor}20` }}>
                  <CheckCircle2 size={12} style={{ color: produtoAberto.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{d}</span>
                </div>
              ))}
            </div>

            {temAcesso(produtoAberto.chave) ? (
              <div style={{ padding: "14px 16px", background: "rgba(134,239,172,0.1)", borderRadius: 10, border: "1px solid rgba(134,239,172,0.2)", textAlign: "center" }}>
                <CheckCircle2 size={18} style={{ color: "#86efac", marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: "#86efac", fontWeight: 600, margin: 0 }}>Você já tem acesso a este programa ✨</p>
              </div>
            ) : produtoAberto.link ? (
              <a
                href={produtoAberto.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: produtoAberto.cor, color: "#000", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                <ExternalLink size={14} /> Quero adquirir agora
              </a>
            ) : (
              <div style={{ padding: "14px 16px", background: "rgba(251,191,36,0.08)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.25)", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600, margin: 0 }}>🗓️ Em breve — aguarde o lançamento!</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
