"use client";

import { Sunrise, Camera, Star, Lock, Crown, Heart, Instagram, Youtube, ExternalLink } from "lucide-react";

const textoAntes = "Entrei na mentoria com o coração partido e sem acreditar em mim mesma. Minha empresa estava estagnada há 2 anos, meu casamento passando por uma crise que eu não conseguia nem verbalizar. Sentia que estava sempre no modo sobrevivência — nunca no modo extraordinário que eu sabia que estava dentro de mim.";

export default function MeuInicio() {

  const LINHA_DO_TEMPO = [
    { semana: 1, marco: "Primeira sessão — quebrando o silêncio", cor: "#C9A84C", feito: true },
    { semana: 4, marco: "Descoberta da crença limitante central", cor: "#a78bfa", feito: true },
    { semana: 8, marco: "Primeira declaração de identidade em público", cor: "#86efac", feito: true },
    { semana: 12, marco: "Ação corajosa no negócio", cor: "#93c5fd", feito: false },
    { semana: 16, marco: "Resultados visíveis — antes e depois", cor: "#f9a8d4", feito: false },
    { semana: 20, marco: "Preparação para o encontro presencial", cor: "#fca5a5", feito: false },
    { semana: 24, marco: "Encontro Presencial BW — foto do depois ✨", cor: "#C9A84C", feito: false },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Sunrise size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meu Começo</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Antes & Depois</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Registre de onde você saiu para saber o quão longe chegou. Seu testemunho é poderoso.
        </p>
      </div>

      {/* Antes / Depois side by side */}
      <div className="grid-cols-2" style={{ marginBottom: 24 }}>

        {/* Antes */}
        <div className="card" style={{ padding: "20px 22px", border: "1px solid var(--gold-border)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <Sunrise size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Meu Começo</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 999 }}>Mai 2026</span>
          </div>

          {/* Foto antes */}
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: "var(--bg-input)",
              borderRadius: 10,
              border: "2px dashed var(--gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              cursor: "pointer",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Camera size={28} style={{ color: "var(--gold)", opacity: 0.6 }} />
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
              Adicionar foto de hoje
            </p>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Como você está chegando</span>
          </div>

          {/* Texto antes — preenchido pela Izabor */}
          <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: 0 }}>
            "{textoAntes}"
          </p>
        </div>

        {/* Depois — bloqueado até o encontro presencial */}
        <div
          className="card"
          style={{
            padding: "20px 22px",
            border: "1px solid var(--border)",
            opacity: 0.7,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,8,0.6)", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Lock size={22} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: "0 0 8px" }}>Desbloqueado no Encontro Presencial</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
                Na Semana 24, no encontro presencial BW, você vai tirar a foto do seu "depois" e registrar aqui a mulher que você se tornou.
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "var(--gold-light)", border: "1px solid var(--gold-border)", fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
                <Crown size={13} /> Agosto 2026
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <Crown size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Minha Chegada</span>
          </div>
          <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--bg-input)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16 }} />
          <div style={{ height: 100, background: "var(--bg-input)", borderRadius: 8 }} />
        </div>
      </div>

      {/* Linha do tempo */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
          <Star size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Minha Linha do Tempo</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>24 semanas · 6 meses</span>
        </div>

        <div style={{ position: "relative" }}>
          {/* Linha vertical */}
          <div style={{ position: "absolute", left: 11, top: 16, bottom: 16, width: 2, background: "var(--border)", zIndex: 0 }} />

          <div className="flex flex-col gap-4">
            {LINHA_DO_TEMPO.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
                {/* Marcador */}
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: item.feito ? item.cor : "var(--bg-input)",
                  border: item.feito ? `2px solid ${item.cor}` : "2px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.feito
                    ? <Heart size={11} style={{ color: "#000" }} />
                    : item.semana === 24
                    ? <Crown size={11} style={{ color: "var(--text-muted)" }} />
                    : <Lock size={11} style={{ color: "var(--text-muted)" }} />
                  }
                </div>
                {/* Conteúdo */}
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: item.cor, fontWeight: 600, textTransform: "uppercase" }}>Semana {item.semana}</span>
                    {item.feito && <span style={{ fontSize: 9, background: "rgba(134,239,172,0.1)", color: "#86efac", padding: "1px 6px", borderRadius: 999 }}>Concluído</span>}
                  </div>
                  <p style={{ fontSize: 13, color: item.feito ? "var(--text)" : "var(--text-muted)", margin: 0 }}>{item.marco}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links Izabor */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <ExternalLink size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Izabor Cruz nas Redes</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>Acompanhe para mais inspiração</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", textDecoration: "none", transition: "all 0.15s" }}
          >
            <Instagram size={18} style={{ color: "#f9a8d4" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#f9a8d4", margin: 0 }}>@izaborcruz_</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Instagram</p>
            </div>
          </a>
          <a
            href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", textDecoration: "none", transition: "all 0.15s" }}
          >
            <Youtube size={18} style={{ color: "#fca5a5" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: 0 }}>Izabor Cruz</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>YouTube</p>
            </div>
          </a>
        </div>
      </div>

      {/* Citação motivacional */}
      <div
        className="card glow-gold"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 15, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 10px" }}>
          "Sua história de transformação é o maior testemunho de que Deus cumpre o que promete. Não apague o caminho — ele faz parte do extraordinário."
        </p>
        <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>— Izabor Cruz</p>
      </div>
    </div>
  );
}
