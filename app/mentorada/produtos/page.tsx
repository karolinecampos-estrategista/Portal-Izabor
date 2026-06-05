"use client";

import { useState, useEffect } from "react";
import { Gift, CheckCircle2, ExternalLink, Calendar, Loader2, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Acesso = "mentoria" | "livro" | "ambos";
type ProdutosAtivos = Record<string, boolean>;

const PRODUTOS = [
  {
    id: "seja-incomum",
    nome: "Seja Incomum",
    tipo: "Programa de Mentoria",
    emoji: "👑",
    cor: "#C9A84C",
    descricao: "Mentoria individual intensiva — transformação profunda em identidade, fé e liderança com a Izabor Cruz.",
    detalhes: [
      "Encontros individuais personalizados",
      "Portal exclusivo com aulas, devocional e plano de ação",
      "Desafios semanais e acompanhamento contínuo",
      "Grupo exclusivo Build Woman",
      "Encontro presencial de encerramento",
    ],
    link: "https://izaborcruz.com.br/sejaincomum/",
    lancamento: null,
    acessoNecessario: "mentoria" as Acesso,
  },
  {
    id: "livro",
    nome: "Livro — Mulher Incomum",
    tipo: "Lançamento",
    emoji: "📖",
    cor: "#86efac",
    descricao: "O livro da Izabor Cruz com acompanhamento mensal, sessões em grupo e material exclusivo de reflexão.",
    detalhes: [
      "Acompanhamento mensal do livro",
      "2 sessões em grupo por mês com a Izabor",
      "Material de apoio exclusivo por capítulo",
      "Debate ao vivo com reflexão profunda",
      "Acesso ao portal de conteúdo do livro",
    ],
    link: null,
    lancamento: "Lançamento dia 10/10 · No evento presencial",
    acessoNecessario: "livro" as Acesso,
  },
  {
    id: "club-bw",
    nome: "Club BW",
    tipo: "Assinatura Mensal",
    emoji: "💜",
    cor: "#a78bfa",
    descricao: "Comunidade mensal de mulheres extraordinárias com encontros ao vivo, estudos e suporte contínuo.",
    detalhes: [
      "1 encontro ao vivo por mês com a Izabor",
      "Acesso ao grupo exclusivo BW",
      "Materiais mensais de estudo e reflexão",
      "Acervo de conteúdos anteriores",
      "Convites para eventos presenciais",
    ],
    link: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G",
    lancamento: null,
    acessoNecessario: "livro" as Acesso,
  },
  {
    id: "evento",
    nome: "Evento — Simplesmente Seja",
    tipo: "Evento Presencial",
    emoji: "🔥",
    cor: "#fca5a5",
    descricao: "Evento presencial de imersão e transformação. Um encontro único para viver o extraordinário ao vivo.",
    detalhes: [
      "Imersão presencial intensa",
      "Dinâmicas e workshops ao vivo",
      "Conexão com outras mulheres extraordinárias",
      "Experiência transformadora com a Izabor",
      "Conteúdo exclusivo do evento",
    ],
    link: "https://simplesmenteseja.izaborcruz.com.br",
    lancamento: null,
    acessoNecessario: null,
  },
];

export default function Produtos() {
  const [acesso, setAcesso] = useState<Acesso>("mentoria");
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutosAtivos>({});
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }
      const res = await fetch("/api/perfil", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const p = await res.json();
        setAcesso(p.acesso ?? "mentoria");
        setProdutosAtivos(p.produtosAtivos ?? {});
      }
      setCarregando(false);
    });
  }, []);

  function temAcesso(p: typeof PRODUTOS[0]) {
    // Tem acesso se: produto está ativo individualmente OU tem acesso de portal compatível
    if (produtosAtivos[p.id.replace("-", "_")]) return true;
    if (!p.acessoNecessario) return false;
    return acesso === p.acessoNecessario || acesso === "ambos";
  }

  const ativos = PRODUTOS.filter(p => temAcesso(p));
  const disponiveis = PRODUTOS.filter(p => !temAcesso(p));

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  const produtoAberto = PRODUTOS.find(p => p.id === aberto);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Gift size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meus Produtos</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Programas & Produtos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Tudo o que você tem acesso e o que ainda pode descobrir.</p>
      </div>

      {/* Ativos */}
      {ativos.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <CheckCircle2 size={14} style={{ color: "#86efac" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#86efac" }}>Você já tem acesso</span>
          </div>
          <div className="grid-cols-2">
            {ativos.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ padding: "20px 22px", border: `1px solid ${p.cor}40`, background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)", cursor: "pointer" }}
                onClick={() => setAberto(p.id)}
              >
                <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 36 }}>{p.emoji}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(134,239,172,0.12)", color: "#86efac", border: "1px solid rgba(134,239,172,0.2)" }}>
                    <CheckCircle2 size={10} /> Ativo
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: p.cor }}>{p.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px" }}>{p.tipo}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>{p.descricao}</p>
                <span style={{ fontSize: 11, color: p.cor }}>Ver detalhes →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disponíveis */}
      {disponiveis.length > 0 && (
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <Crown size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Conheça também</span>
          </div>
          <div className="grid-cols-2">
            {disponiveis.map(p => (
              <div
                key={p.id}
                className="card card-hover"
                style={{ padding: "20px 22px", border: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => setAberto(p.id)}
              >
                <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 32, opacity: 0.85 }}>{p.emoji}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: p.cor + "15", color: p.cor, border: `1px solid ${p.cor}30` }}>
                    {p.lancamento ? "Em breve" : "Disponível"}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{p.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>{p.tipo}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>{p.descricao}</p>
                {p.lancamento && (
                  <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                    <Calendar size={11} style={{ color: "#fbbf24" }} />
                    <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>{p.lancamento}</span>
                  </div>
                )}
                <span style={{ fontSize: 11, color: p.cor }}>Saber mais →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {produtoAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setAberto(null)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: 28, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 32 }}>{produtoAberto.emoji}</span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: produtoAberto.cor }}>{produtoAberto.nome}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{produtoAberto.tipo}</p>
                </div>
              </div>
              <button onClick={() => setAberto(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 16 }}>{produtoAberto.descricao}</p>

            {produtoAberto.lancamento && (
              <div className="flex items-center gap-2" style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(251,191,36,0.08)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.25)" }}>
                <Calendar size={14} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600 }}>{produtoAberto.lancamento}</span>
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 600, color: produtoAberto.cor, marginBottom: 10 }}>O que está incluído:</p>
            <div className="flex flex-col gap-2" style={{ marginBottom: 20 }}>
              {produtoAberto.detalhes.map((d, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "8px 12px", background: produtoAberto.cor + "10", borderRadius: 8, border: `1px solid ${produtoAberto.cor}20` }}>
                  <CheckCircle2 size={12} style={{ color: produtoAberto.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{d}</span>
                </div>
              ))}
            </div>

            {temAcesso(produtoAberto) ? (
              <div style={{ padding: "14px 16px", background: "rgba(134,239,172,0.1)", borderRadius: 10, border: "1px solid rgba(134,239,172,0.2)", textAlign: "center" }}>
                <CheckCircle2 size={18} style={{ color: "#86efac", marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: "#86efac", fontWeight: 600, margin: 0 }}>Você já tem acesso a este programa ✨</p>
              </div>
            ) : produtoAberto.link ? (
              <a
                href={produtoAberto.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: "var(--gold)", color: "#000", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                <ExternalLink size={14} /> Quero participar
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
