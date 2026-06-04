"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

const PERGUNTAS = [
  {
    id: "origem",
    titulo: "De onde você está chegando?",
    subtitulo: "Me conta um pouco sobre você e seu momento atual",
    placeholder: "Ex: Sou mãe de dois filhos, trabalho com...",
  },
  {
    id: "dor",
    titulo: "Qual é a sua maior dor hoje?",
    subtitulo: "O que te trouxe até aqui? Pode ser honesta, este espaço é seguro.",
    placeholder: "Ex: Me sinto perdida em...",
  },
  {
    id: "expectativa",
    titulo: "O que você espera desta mentoria?",
    subtitulo: "Quais resultados ou transformações você deseja alcançar?",
    placeholder: "Ex: Quero aprender a...",
  },
  {
    id: "sonho",
    titulo: "Qual é o sonho que você tem medo de dizer em voz alta?",
    subtitulo: "Aquela visão que parece grande demais... Este é o momento de escrever.",
    placeholder: "Ex: Meu sonho é...",
  },
];

export default function AcolhimentoPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [concluido, setConcluido] = useState(false);

  const totalPassos = PERGUNTAS.length;
  const perguntaAtual = PERGUNTAS[passo];
  const respostaAtual = respostas[perguntaAtual?.id] || "";

  function avancar() {
    if (passo < totalPassos - 1) {
      setPasso((p) => p + 1);
    } else {
      setConcluido(true);
    }
  }

  if (concluido) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={32} style={{ color: "#86efac" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>Que alegria ter você aqui! ✨</h1>
          <div className="card" style={{ padding: "20px 24px", margin: "24px 0", background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
            <Sparkles size={16} style={{ color: "var(--gold)", marginBottom: 10 }} />
            <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
              "Você não chegou até aqui por acidente. Cada passo da sua jornada foi preparado por Deus com cuidado e propósito."
            </p>
            <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>— Izabor Cruz</p>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Suas respostas chegaram para mim e já estou orando por você.<br />Sua jornada começa agora.
          </p>
          <button
            onClick={() => router.replace("/mentorada")}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 10, background: "var(--gold)", border: "none", cursor: "pointer", color: "#000", fontSize: 14, fontWeight: 700 }}
          >
            Acessar meu Portal <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ maxWidth: 540, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Heart size={20} style={{ color: "var(--gold)" }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Formulário de Acolhimento ✨</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Antes de começarmos, quero te conhecer melhor.</p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pergunta {passo + 1} de {totalPassos}</span>
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>{Math.round(((passo + 1) / totalPassos) * 100)}%</span>
          </div>
          <div style={{ height: 4, background: "var(--bg-input)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((passo + 1) / totalPassos) * 100}%`, background: "var(--gold)", borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
        </div>

        <div className="card" style={{ padding: "32px 28px", marginBottom: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.4 }}>{perguntaAtual.titulo}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>{perguntaAtual.subtitulo}</p>
          <textarea
            value={respostaAtual}
            onChange={(e) => setRespostas((prev) => ({ ...prev, [perguntaAtual.id]: e.target.value }))}
            placeholder={perguntaAtual.placeholder}
            rows={5}
            style={{ width: "100%", padding: "14px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
          />
        </div>

        <button
          onClick={avancar}
          disabled={!respostaAtual.trim()}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 10, background: !respostaAtual.trim() ? "rgba(201,168,76,0.3)" : "var(--gold)", border: "none", cursor: !respostaAtual.trim() ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700 }}
        >
          {passo < totalPassos - 1 ? <>Próxima pergunta <ArrowRight size={16} /></> : <>Concluir <CheckCircle size={16} /></>}
        </button>

        <button
          onClick={() => router.replace("/mentorada")}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, marginTop: 12, padding: "6px 0" }}
        >
          Pular por enquanto
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {PERGUNTAS.map((_, i) => (
            <div key={i} style={{ width: i === passo ? 20 : 8, height: 8, borderRadius: 999, background: i <= passo ? "var(--gold)" : "var(--border)", opacity: i > passo ? 0.4 : 1, transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
