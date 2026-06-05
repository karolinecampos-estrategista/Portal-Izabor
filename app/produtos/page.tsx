"use client";

import { useState, useEffect } from "react";
import { Package, ExternalLink, Users, PlaySquare, BookOpen, Star, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

const PRODUTOS = [
  {
    id: "seja-incomum",
    nome: "Seja Incomum",
    tipo: "Programa de Mentoria",
    emoji: "👑",
    cor: "#C9A84C",
    descricao: "Mentoria individual intensiva para mulheres que querem viver o extraordinário. Transformação profunda em identidade, fé e liderança.",
    link: "https://izaborcruz.com.br/sejaincomum/",
    status: "ativo",
    badge: "Ativo",
    acesso: "mentoria",
  },
  {
    id: "livro",
    nome: "Livro — Mulher Incomum",
    tipo: "Lançamento",
    emoji: "📖",
    cor: "#86efac",
    descricao: "O livro da Izabor Cruz chega no dia 10/10 no evento presencial. Acompanhamento mensal com sessões em grupo e material exclusivo.",
    link: null,
    status: "em-breve",
    badge: "Lançamento 10/10",
    acesso: "livro",
    lancamento: "10 de outubro · No evento presencial",
  },
  {
    id: "club-bw",
    nome: "Club BW",
    tipo: "Mentoria · 6 meses",
    emoji: "💜",
    cor: "#a78bfa",
    descricao: "Mentoria em grupo de 6 meses de acompanhamento. Encontros ao vivo, estudos bíblicos, desafios e suporte contínuo com a Izabor e as extraordinárias.",
    link: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G",
    status: "ativo",
    badge: "Disponível",
    acesso: "livro",
  },
  {
    id: "evento",
    nome: "Evento — Simplesmente Seja",
    tipo: "Evento Presencial",
    emoji: "🔥",
    cor: "#fca5a5",
    descricao: "Evento presencial de imersão e transformação. Encontro único para mulheres que querem viver o extraordinário presencialmente.",
    link: "https://simplesmenteseja.izaborcruz.com.br",
    status: "ativo",
    badge: "Inscrições abertas",
    acesso: null,
  },
];

const statusCfg: Record<string, { cor: string; bg: string }> = {
  "ativo":    { cor: "#86efac", bg: "rgba(134,239,172,0.1)" },
  "em-breve": { cor: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
};

export default function ProdutosAdmin() {
  const [mentoradas, setMentoradas] = useState<{ acesso: string }[]>([]);

  useEffect(() => {
    fetch("/api/mentoradas")
      .then(r => r.json())
      .then(d => setMentoradas(Array.isArray(d) ? d : []));
  }, []);

  const countAcesso = (tipo: string | null) => {
    if (!tipo) return null;
    return mentoradas.filter(m =>
      m.acesso === tipo || m.acesso === "ambos"
    ).length;
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Package size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Produtos</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Produtos & Programas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Visão geral do ecossistema de produtos da Izabor Cruz.
        </p>
      </div>

      {/* Cards dos produtos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PRODUTOS.map((p) => {
          const cfg = statusCfg[p.status];
          const count = countAcesso(p.acesso);
          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: "22px 24px",
                border: `1px solid ${p.cor}30`,
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                {/* Ícone */}
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: p.cor + "18", border: `1px solid ${p.cor}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>
                  {p.emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: p.cor }}>{p.nome}</h2>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 999,
                      background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.cor}40`,
                    }}>
                      {p.badge}
                    </span>
                    <span style={{
                      fontSize: 10, padding: "2px 9px", borderRadius: 999,
                      background: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border)",
                    }}>
                      {p.tipo}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
                    {p.descricao}
                  </p>

                  {/* Lançamento especial */}
                  {"lancamento" in p && (
                    <div className="flex items-center gap-2" style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(251,191,36,0.08)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.25)", width: "fit-content" }}>
                      <Calendar size={13} style={{ color: "#fbbf24" }} />
                      <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>{p.lancamento as string}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
                    {/* Alunas com acesso */}
                    {count !== null && (
                      <div className="flex items-center gap-1" style={{ padding: "5px 11px", borderRadius: 8, background: p.cor + "10", border: `1px solid ${p.cor}25` }}>
                        <Users size={12} style={{ color: p.cor }} />
                        <span style={{ fontSize: 12, color: p.cor, fontWeight: 600 }}>{count} aluna{count !== 1 ? "s" : ""} com acesso</span>
                      </div>
                    )}

                    {/* Link externo */}
                    {p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", borderRadius: 8,
                          background: "var(--gold-light)", border: "1px solid var(--gold-border)",
                          color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={12} /> Acessar página
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                        Página disponível no lançamento
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seja Incomum — Gerenciar Aulas */}
      <div className="card" style={{ padding: "20px 24px", marginTop: 24, border: "1px solid rgba(201,168,76,0.35)", background: "linear-gradient(135deg, #111 0%, #161208 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlaySquare size={22} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Seja Incomum — Aulas Gravadas</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>
                Gerencie os módulos e aulas do curso. As extraordinárias com acesso ao produto visualizam aqui.
              </p>
            </div>
          </div>
          <Link
            href="/aulas-bw"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}
          >
            Gerenciar Aulas <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Info acesso */}
      <div className="card" style={{ padding: "18px 20px", marginTop: 24, background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Star size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Como funciona o acesso das alunas</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { tipo: "mentoria", label: "Mentoria", desc: "Acesso ao portal completo — Seja Incomum", cor: "#C9A84C" },
            { tipo: "livro", label: "Só o Livro", desc: "Acesso ao Box do Livro, Club BW, Produtos e Cupons", cor: "#93c5fd" },
            { tipo: "ambos", label: "Mentoria + Livro", desc: "Acesso total a todos os produtos", cor: "#86efac" },
          ].map(a => {
            const n = mentoradas.filter(m => m.acesso === a.tipo).length;
            return (
              <div key={a.tipo} className="flex items-center gap-10" style={{ padding: "8px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
                <div className="flex items-center gap-6" style={{ flex: 1, gap: 8 }}>
                  <CheckCircle2 size={13} style={{ color: a.cor, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: a.cor }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{a.desc}</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: a.cor }}>{n} aluna{n !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
