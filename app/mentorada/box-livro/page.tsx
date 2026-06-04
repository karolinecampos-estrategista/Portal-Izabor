"use client";

import { useState } from "react";
import {
  BookOpen,
  Lock,
  Users,
  Calendar,
  PlayCircle,
  FileText,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CAPITULOS = [
  { num: 1, titulo: "Quem você é antes da performance", liberado: true },
  { num: 2, titulo: "A identidade que Deus te deu", liberado: true },
  { num: 3, titulo: "Crenças que te prendem ao ordinário", liberado: true },
  { num: 4, titulo: "O extraordinário começa na decisão", liberado: false },
  { num: 5, titulo: "Fé como estratégia de vida", liberado: false },
  { num: 6, titulo: "Liderança feminina com propósito", liberado: false },
];

const SESSOES_GRUPO = [
  { data: "10 Jun 2026", hora: "20h", tema: "Caps. 1 e 2 — Identidade" },
  { data: "24 Jun 2026", hora: "20h", tema: "Caps. 3 e 4 — Crenças e Decisão" },
  { data: "08 Jul 2026", hora: "20h", tema: "Caps. 5 e 6 — Fé e Liderança" },
];

const MATERIAIS = [
  { nome: "Guia de Leitura — Semanas 1 e 2", tipo: "PDF", liberado: true },
  { nome: "Devocional de 7 dias — Identidade", tipo: "PDF", liberado: true },
  { nome: "Perguntas de Reflexão — Cap. 1-3", tipo: "PDF", liberado: true },
  { nome: "Guia de Leitura — Semanas 3 e 4", tipo: "PDF", liberado: false },
];

export default function BoxLivroMentorada() {
  const [capAberto, setCapAberto] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <BookOpen size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Box do Livro</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(134,239,172,0.1)", color: "#86efac", border: "1px solid rgba(134,239,172,0.2)", fontWeight: 600 }}>
            ✓ Acesso ao Livro
          </span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mulher Incomum — Acompanhamento</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Sessões em grupo, materiais de apoio e reflexões para aprofundar sua leitura.
        </p>
      </div>

      {/* Capítulos */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <BookOpen size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Guia de Leitura por Capítulo</span>
        </div>
        <div className="flex flex-col gap-2">
          {CAPITULOS.map((cap) => {
            const aberto = capAberto === cap.num;
            const bloqueado = !cap.liberado;
            return (
              <div
                key={cap.num}
                className="card"
                style={{
                  overflow: "hidden",
                  border: `1px solid ${bloqueado ? "var(--border)" : "rgba(201,168,76,0.2)"}`,
                  opacity: bloqueado ? 0.6 : 1,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: bloqueado ? "default" : "pointer" }}
                  onClick={() => !bloqueado && setCapAberto(aberto ? null : cap.num)}
                >
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: bloqueado ? "var(--bg-input)" : "rgba(201,168,76,0.12)",
                      border: `1px solid ${bloqueado ? "var(--border)" : "var(--gold-border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {bloqueado
                      ? <Lock size={13} style={{ color: "var(--text-muted)" }} />
                      : <Heart size={13} style={{ color: "var(--gold)" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, color: bloqueado ? "var(--text-muted)" : "var(--gold)", fontWeight: 600, textTransform: "uppercase" }}>
                      Capítulo {cap.num}
                    </span>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "1px 0 0", color: bloqueado ? "var(--text-muted)" : "var(--text)" }}>
                      {cap.titulo}
                    </p>
                  </div>
                  {!bloqueado && (
                    <div style={{ color: "var(--text-muted)" }}>
                      {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  )}
                  {bloqueado && (
                    <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Em breve</span>
                  )}
                </div>
                {aberto && !bloqueado && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", background: "var(--bg-input)" }}>
                    <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 12px" }}>
                      Perguntas de reflexão, pontos de destaque e declarações de identidade para este capítulo estão disponíveis no material em PDF.
                    </p>
                    <button
                      className="btn-gold"
                      style={{ fontSize: 12, padding: "7px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <FileText size={13} /> Baixar material do capítulo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sessões em grupo */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <Users size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sessões em Grupo com a Izabor</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>2x por mês · ao vivo</span>
        </div>
        <div className="flex flex-col gap-3">
          {SESSOES_GRUPO.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderRadius: 10,
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: "rgba(147,197,253,0.1)",
                  border: "1px solid rgba(147,197,253,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <PlayCircle size={18} style={{ color: "#93c5fd" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{s.tema}</p>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Calendar size={10} /> {s.data} às {s.hora}
                </span>
              </div>
              <button className="btn-gold" style={{ fontSize: 11, padding: "6px 14px", flexShrink: 0 }}>
                Participar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Materiais */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <FileText size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Materiais de Apoio</span>
        </div>
        <div className="flex flex-col gap-2">
          {MATERIAIS.map((m, i) => {
            const bloqueado = !m.liberado;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: bloqueado ? "var(--bg-input)" : "rgba(201,168,76,0.04)",
                  border: bloqueado ? "1px solid var(--border)" : "1px solid rgba(201,168,76,0.15)",
                  opacity: bloqueado ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                    background: bloqueado ? "var(--bg)" : "rgba(201,168,76,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {bloqueado
                    ? <Lock size={13} style={{ color: "var(--text-muted)" }} />
                    : <FileText size={13} style={{ color: "var(--gold)" }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: bloqueado ? "var(--text-muted)" : "var(--text)" }}>{m.nome}</p>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.tipo}</span>
                </div>
                {bloqueado ? (
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Em breve</span>
                ) : (
                  <button
                    style={{
                      fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                      border: "1px solid var(--gold-border)",
                      background: "rgba(201,168,76,0.08)",
                      color: "var(--gold)",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Baixar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
