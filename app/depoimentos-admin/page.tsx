"use client";

import { useState } from "react";
import { Heart, CheckCircle2, X, Clock, Star, Eye, MessageSquare } from "lucide-react";

type StatusDepoimento = "pendente" | "aprovado" | "rejeitado";

interface DepoimentoPendente {
  id: number;
  nomeMentorada: string;
  programa: string;
  conteudo: string;
  enviadoEm: string;
  status: StatusDepoimento;
}

const PENDENTES_INICIAL: DepoimentoPendente[] = [
  {
    id: 1,
    nomeMentorada: "Ana Paula Ferreira",
    programa: "Imersão BW",
    conteudo: "Quando entrei na mentoria, eu mal conseguia olhar para mim mesma no espelho. Hoje, 4 meses depois, sou a fundadora de um negócio que fatura 3x mais e uma mulher que conhece sua identidade em Deus. A Izabor não me ensinou estratégias — ela me ensinou a ser quem Deus sempre disse que eu era.",
    enviadoEm: "28 Mai 2026",
    status: "pendente",
  },
  {
    id: 2,
    nomeMentorada: "Juliana Matos",
    programa: "Mentoria Individual",
    conteudo: "Nunca pensei que em 3 meses eu pudesse sair de um relacionamento de aparências para construir um casamento de verdade. A Izabor me deu ferramentas que nenhum livro me deu. Obrigada por me ver quando eu não conseguia me ver.",
    enviadoEm: "26 Mai 2026",
    status: "pendente",
  },
  {
    id: 3,
    nomeMentorada: "Patricia Alves",
    programa: "Club BW",
    conteudo: "O Club BW mudou minha forma de liderar. Eu era chefe. Hoje sou líder. Aprendi que autoridade não vem de cargo, vem de caráter. Minha equipe sentiu a diferença antes de mim.",
    enviadoEm: "22 Mai 2026",
    status: "pendente",
  },
];

const APROVADOS_INICIAL: DepoimentoPendente[] = [
  {
    id: 10,
    nomeMentorada: "Fernanda Lima",
    programa: "Club BW",
    conteudo: "Entrei na mentoria sem acreditar em mim mesma. Hoje lidero um time de 8 pessoas e triplicamos o faturamento da minha empresa em 4 meses.",
    enviadoEm: "10 Mar 2026",
    status: "aprovado",
  },
  {
    id: 11,
    nomeMentorada: "Renata Costa",
    programa: "Imersão BW",
    conteudo: "Saí da imersão com clareza de propósito que nunca tive. Em 6 meses faturei o que antes faturava em 2 anos. Mas mais do que isso — encontrei minha identidade em Deus.",
    enviadoEm: "14 Fev 2026",
    status: "aprovado",
  },
];

const programaCor: Record<string, string> = {
  "Imersão BW": "#C9A84C",
  "Mentoria Individual": "#a78bfa",
  "Club BW": "#86efac",
};

export default function DepoimentosAdmin() {
  const [pendentes, setPendentes] = useState<DepoimentoPendente[]>([]);
  const [aprovados, setAprovados] = useState<DepoimentoPendente[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);

  function aprovar(id: number) {
    const dep = pendentes.find((d) => d.id === id);
    if (!dep) return;
    setPendentes((prev) => prev.filter((d) => d.id !== id));
    setAprovados((prev) => [{ ...dep, status: "aprovado" }, ...prev]);
  }

  function rejeitar(id: number) {
    setPendentes((prev) => prev.filter((d) => d.id !== id));
  }

  function revogar(id: number) {
    const dep = aprovados.find((d) => d.id === id);
    if (!dep) return;
    setAprovados((prev) => prev.filter((d) => d.id !== id));
    setPendentes((prev) => [{ ...dep, status: "pendente" }, ...prev]);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Heart size={20} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Depoimentos</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Aprove ou rejeite os depoimentos antes de aparecerem para todas as alunas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-cols-3" style={{ marginBottom: 28 }}>
        {[
          { label: "Aguardando aprovação", valor: pendentes.length, cor: "#fbbf24", icon: Clock },
          { label: "Aprovados", valor: aprovados.length, cor: "#86efac", icon: CheckCircle2 },
          { label: "Total recebidos", valor: pendentes.length + aprovados.length, cor: "var(--gold)", icon: MessageSquare },
        ].map(({ label, valor, cor, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon size={14} style={{ color: cor }} />
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: cor, margin: 0, lineHeight: 1 }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* ── AGUARDANDO APROVAÇÃO ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Clock size={14} style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
            Aguardando Aprovação
          </span>
          {pendentes.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 999, background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
              {pendentes.length} novo{pendentes.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {pendentes.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum depoimento aguardando aprovação.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendentes.map((d) => {
              const cor = programaCor[d.programa] ?? "var(--gold)";
              const aberto = expandido === d.id;
              return (
                <div key={d.id} className="card" style={{ padding: "18px 20px", borderLeft: "3px solid #fbbf24" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: cor + "20", color: cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {d.nomeMentorada.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{d.nomeMentorada}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: cor + "18", color: cor }}>{d.programa}</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.enviadoEm}</span>
                      </div>
                      <p style={{
                        fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: aberto ? "unset" : "2",
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}>
                        "{d.conteudo}"
                      </p>
                      {!aberto && d.conteudo.length > 120 && (
                        <button
                          onClick={() => setExpandido(d.id)}
                          style={{ fontSize: 11, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", padding: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <Eye size={11} /> Ver completo
                        </button>
                      )}
                      {aberto && (
                        <button
                          onClick={() => setExpandido(null)}
                          style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 0 0" }}
                        >
                          Recolher
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => rejeitar(d.id)}
                        style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)", color: "#f87171", cursor: "pointer" }}
                      >
                        <X size={12} /> Rejeitar
                      </button>
                      <button
                        onClick={() => aprovar(d.id)}
                        style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(134,239,172,0.4)", background: "rgba(134,239,172,0.1)", color: "#86efac", cursor: "pointer", fontWeight: 600 }}
                      >
                        <CheckCircle2 size={12} /> Aprovar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── APROVADOS ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Star size={14} style={{ color: "#86efac" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#86efac" }}>Publicados</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{aprovados.length} depoimentos</span>
        </div>

        {aprovados.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum depoimento publicado ainda.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aprovados.map((d) => {
              const cor = programaCor[d.programa] ?? "var(--gold)";
              return (
                <div key={d.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, opacity: 0.9, borderLeft: "3px solid #86efac" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{d.nomeMentorada}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: cor + "18", color: cor }}>{d.programa}</span>
                      <span style={{ fontSize: 10, color: "#86efac", fontWeight: 600 }}>✓ Publicado</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      "{d.conteudo}"
                    </p>
                  </div>
                  <button
                    onClick={() => revogar(d.id)}
                    title="Remover da publicação"
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}
                  >
                    Despublicar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
