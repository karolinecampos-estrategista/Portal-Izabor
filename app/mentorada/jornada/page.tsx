"use client";

import { Trophy, CheckSquare, ChevronDown, ChevronUp, Star, Target } from "lucide-react";
import { useState } from "react";

type Desafio = {
  id: number;
  texto: string;
  feito: boolean;
  pilar: string;
};

type Semana = {
  numero: number;
  titulo: string;
  tema: string;
  cor: string;
  ativa: boolean;
  desafios: Desafio[];
};

const pilarColor: Record<string, string> = {
  "Fé": "#a78bfa",
  "Mentalidade": "#93c5fd",
  "Liderança": "#C9A84C",
  "Emocional": "#f9a8d4",
  "Família": "#86efac",
  "Físico": "#fca5a5",
};

const SEMANAS: Semana[] = [
  {
    numero: 1, titulo: "Semana 1", tema: "Quem você é — Identidade com Deus", cor: "#C9A84C", ativa: false,
    desafios: [
      { id: 1, texto: "Escreva 5 verdades sobre quem você é em Deus", feito: true, pilar: "Fé" },
      { id: 2, texto: "Grave um vídeo de 2 minutos se apresentando com seu propósito", feito: true, pilar: "Mentalidade" },
      { id: 3, texto: "Ore 10 minutos declarando sua identidade em voz alta", feito: true, pilar: "Fé" },
      { id: 4, texto: "Leia Jeremias 29:11 e reflita por escrito", feito: true, pilar: "Fé" },
    ],
  },
  {
    numero: 2, titulo: "Semana 2", tema: "Mentalidade — Destravando crenças", cor: "#a78bfa", ativa: false,
    desafios: [
      { id: 5, texto: "Liste 10 crenças limitantes que te prendem", feito: true, pilar: "Mentalidade" },
      { id: 6, texto: "Para cada crença, escreva a verdade de Deus sobre você", feito: true, pilar: "Fé" },
      { id: 7, texto: "Converse com uma mulher que admira sobre sua jornada", feito: false, pilar: "Liderança" },
      { id: 8, texto: "Faça 30 min de exercício físico focando na mente", feito: true, pilar: "Físico" },
    ],
  },
  {
    numero: 3, titulo: "Semana 3", tema: "Relacionamentos — Amor que edifica", cor: "#f9a8d4", ativa: false,
    desafios: [
      { id: 9, texto: "Escreva uma carta de gratidão para seu marido/família", feito: true, pilar: "Família" },
      { id: 10, texto: "Identifique 3 conflitos recorrentes e suas raízes", feito: false, pilar: "Emocional" },
      { id: 11, texto: "Pratique comunicação não violenta em 1 situação difícil", feito: false, pilar: "Emocional" },
      { id: 12, texto: "Ore cobrindo sua família por 7 dias consecutivos", feito: true, pilar: "Fé" },
    ],
  },
  {
    numero: 8, titulo: "Semana 8 — ATUAL", tema: "Auto-imagem — A mulher que Deus vê", cor: "#86efac", ativa: true,
    desafios: [
      { id: 30, texto: "Faça 30 minutos de criatividade física (dança, yoga, caminhada)", feito: false, pilar: "Físico" },
      { id: 31, texto: "Escreva 3 coisas pelas quais você é grata hoje", feito: true, pilar: "Mentalidade" },
      { id: 32, texto: "Assista pelo menos 1 aula do módulo desta semana", feito: true, pilar: "Mentalidade" },
      { id: 33, texto: "Ore 5 minutos em voz alta declarando sua identidade", feito: false, pilar: "Fé" },
    ],
  },
];

export default function Jornada() {
  const [semanas, setSemanas] = useState(SEMANAS);
  const [abertas, setAbertas] = useState<number[]>([8]);

  function toggleSemana(n: number) {
    setAbertas((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);
  }

  function toggleDesafio(semanaNum: number, desafioId: number) {
    setSemanas((prev) =>
      prev.map((s) =>
        s.numero === semanaNum
          ? { ...s, desafios: s.desafios.map((d) => d.id === desafioId ? { ...d, feito: !d.feito } : d) }
          : s
      )
    );
  }

  const totalDesafios = semanas.flatMap((s) => s.desafios).length;
  const totalFeitos = semanas.flatMap((s) => s.desafios).filter((d) => d.feito).length;
  const progGeral = Math.round((totalFeitos / totalDesafios) * 100);

  const semanaAtual = semanas.find((s) => s.ativa);
  const feitosAtual = semanaAtual?.desafios.filter((d) => d.feito).length ?? 0;
  const totalAtual = semanaAtual?.desafios.length ?? 0;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Trophy size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Minha Jornada</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Jornada & Desafios</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Sua transformação semana a semana. Cada check é um passo no extraordinário.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--gold)", margin: 0 }}>{progGeral}%</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>📊 Progresso Geral</p>
        </div>
        <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#86efac", margin: 0 }}>{totalFeitos}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>✅ Desafios Feitos</p>
        </div>
        <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa", margin: 0 }}>8/24</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>📅 Semanas</p>
        </div>
      </div>

      {/* Semana atual destaque */}
      {semanaAtual && (
        <div
          className="card glow-gold"
          style={{
            padding: "20px 22px",
            marginBottom: 20,
            background: "linear-gradient(135deg, #111111 0%, #161208 100%)",
            border: "1px solid var(--gold-border)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Semana Atual</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>{feitosAtual}/{totalAtual} feitos</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{semanaAtual.titulo}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px" }}>{semanaAtual.tema}</p>
          <div className="progress-bar" style={{ height: 6, marginBottom: 14 }}>
            <div className="progress-fill" style={{ width: `${(feitosAtual / totalAtual) * 100}%`, background: semanaAtual.cor }} />
          </div>
          <div className="flex flex-col gap-2">
            {semanaAtual.desafios.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDesafio(semanaAtual.numero, d.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: d.feito ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.04)",
                  border: d.feito ? "1px solid rgba(134,239,172,0.2)" : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <CheckSquare size={15} style={{ color: d.feito ? "#86efac" : "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: d.feito ? "var(--text-soft)" : "var(--text)", textDecoration: d.feito ? "line-through" : "none", lineHeight: 1.4 }}>
                    {d.texto}
                  </span>
                  <span style={{ display: "inline-block", marginTop: 4, padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: pilarColor[d.pilar] + "20", color: pilarColor[d.pilar] }}>
                    {d.pilar}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de semanas */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <Target size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Histórico de Semanas</span>
        </div>
        <div className="flex flex-col gap-3">
          {semanas.filter((s) => !s.ativa).map((semana) => {
            const feitos = semana.desafios.filter((d) => d.feito).length;
            const total = semana.desafios.length;
            const prog = Math.round((feitos / total) * 100);
            const aberta = abertas.includes(semana.numero);

            return (
              <div key={semana.numero} className="card" style={{ padding: 0, border: "1px solid var(--border)", overflow: "hidden" }}>
                <button
                  onClick={() => toggleSemana(semana.numero)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: semana.cor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--text)" }}>{semana.titulo}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{semana.tema}</p>
                  </div>
                  <div style={{ textAlign: "right", marginRight: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? "#86efac" : semana.cor }}>{feitos}/{total}</span>
                  </div>
                  {aberta ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                </button>

                {aberta && (
                  <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border)" }}>
                    <div className="progress-bar" style={{ height: 4, margin: "12px 0 12px" }}>
                      <div className="progress-fill" style={{ width: `${prog}%`, background: semana.cor }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      {semana.desafios.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => toggleDesafio(semana.numero, d.id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: d.feito ? "rgba(134,239,172,0.06)" : "var(--bg-input)",
                            border: d.feito ? "1px solid rgba(134,239,172,0.15)" : "1px solid var(--border)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            transition: "all 0.15s",
                          }}
                        >
                          <CheckSquare size={14} style={{ color: d.feito ? "#86efac" : "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 12, color: d.feito ? "var(--text-muted)" : "var(--text-soft)", textDecoration: d.feito ? "line-through" : "none", lineHeight: 1.4 }}>
                            {d.texto}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
