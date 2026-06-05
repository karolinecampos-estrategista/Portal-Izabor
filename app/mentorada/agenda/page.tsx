"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, Video, Crown, Loader2 } from "lucide-react";

type Sessao = {
  id: string;
  mentorada_nome: string;
  data: string;
  duracao: string;
  status: string;
  observacoes: string | null;
};

function formatDataExibicao(iso: string): { dia: string; mes: string; full: string } {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m, d] = iso.split("-");
  return { dia: d, mes: meses[parseInt(m) - 1], full: `${d} ${meses[parseInt(m) - 1]} ${y}` };
}

function diasAte(iso: string): number {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const alvo = new Date(iso + "T12:00:00"); alvo.setHours(0,0,0,0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AgendaMentorada() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/sessoes")
      .then((r) => r.json())
      .then((data) => {
        setSessoes(Array.isArray(data) ? data : []);
        setCarregando(false);
      });
  }, []);

  const proximas = sessoes
    .filter((s) => s.status === "agendada" && s.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));

  const passadas = sessoes
    .filter((s) => s.status === "realizada" || s.data < hoje)
    .sort((a, b) => b.data.localeCompare(a.data));

  const proximaCall = proximas[0] ?? null;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando agenda...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <CalendarDays size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Agenda</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Minha Agenda</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Seus encontros e sessões com a Izabor.
        </p>
      </div>

      {/* Próxima sessão — destaque */}
      {proximaCall && (() => {
        const diff = diasAte(proximaCall.data);
        const fmt = formatDataExibicao(proximaCall.data);
        const isHoje = diff === 0;
        const isAmanha = diff === 1;
        const urgente = diff <= 1;

        return (
          <div
            className="card glow-gold"
            style={{
              padding: "22px 24px",
              marginBottom: 24,
              background: urgente
                ? "linear-gradient(135deg, #111 0%, #0d1a0f 100%)"
                : "linear-gradient(135deg, #111 0%, #161208 100%)",
              border: urgente ? "1px solid rgba(134,239,172,0.5)" : "1px solid var(--gold-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Video size={13} style={{ color: urgente ? "#86efac" : "var(--gold)" }} />
              <span style={{ fontSize: 11, color: urgente ? "#86efac" : "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {isHoje ? "Sua sessão é HOJE" : isAmanha ? "Sua sessão é amanhã" : "Próxima Sessão"}
              </span>
              <span style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 700,
                padding: "3px 10px", borderRadius: 999,
                background: urgente ? "rgba(134,239,172,0.15)" : "rgba(201,168,76,0.12)",
                color: urgente ? "#86efac" : "var(--gold)",
                border: `1px solid ${urgente ? "rgba(134,239,172,0.3)" : "var(--gold-border)"}`,
              }}>
                {isHoje ? "Hoje" : isAmanha ? "Amanhã" : `em ${diff} dias`}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Mentoria com Izabor Cruz</p>
                <div className="flex items-center gap-4" style={{ flexWrap: "wrap", marginBottom: 6 }}>
                  <div className="flex items-center gap-1">
                    <CalendarDays size={12} style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{fmt.full}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{proximaCall.duracao}</span>
                  </div>
                </div>
                {proximaCall.observacoes && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{proximaCall.observacoes}</p>
                )}
              </div>
              <div style={{ textAlign: "center", background: urgente ? "rgba(134,239,172,0.1)" : "rgba(201,168,76,0.1)", borderRadius: 10, padding: "10px 20px", border: `1px solid ${urgente ? "rgba(134,239,172,0.3)" : "var(--gold-border)"}`, flexShrink: 0 }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: urgente ? "#86efac" : "var(--gold)", margin: 0, lineHeight: 1 }}>{fmt.dia}</p>
                <p style={{ fontSize: 12, color: urgente ? "#86efac" : "var(--gold)", margin: 0, fontWeight: 700 }}>{fmt.mes}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Próximas sessões */}
      {proximas.length === 0 ? (
        <div className="card" style={{ padding: "40px 20px", textAlign: "center", marginBottom: 20 }}>
          <CalendarDays size={28} style={{ color: "var(--gold)", opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhuma sessão agendada</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            A Izabor vai agendar suas próximas sessões em breve.
          </p>
        </div>
      ) : proximas.length > 1 && (
        <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <CalendarDays size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Próximas Sessões</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{proximas.length} agendadas</span>
          </div>
          <div className="flex flex-col gap-3">
            {proximas.slice(1).map((s) => {
              const fmt = formatDataExibicao(s.data);
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                  <div style={{ minWidth: 42, textAlign: "center", background: "rgba(201,168,76,0.1)", borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{fmt.dia}</p>
                    <p style={{ fontSize: 9, color: "var(--gold)", margin: 0, fontWeight: 700 }}>{fmt.mes}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Mentoria com Izabor Cruz</p>
                    <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                      <Clock size={10} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duracao}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                    Agendada
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      {passadas.length > 0 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <Clock size={13} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Histórico</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{passadas.length} realizadas</span>
          </div>
          <div className="flex flex-col gap-2">
            {passadas.map((s) => {
              const fmt = formatDataExibicao(s.data);
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 8,
                    background: "var(--bg-input)", border: "1px solid var(--border)", opacity: 0.75,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#86efac", flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0, flex: 1 }}>Mentoria com Izabor Cruz</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmt.full} · {s.duracao}</span>
                  <span style={{ fontSize: 10, color: "#86efac", background: "rgba(134,239,172,0.1)", padding: "1px 7px", borderRadius: 999 }}>Realizada</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Citação */}
      <div className="card" style={{ padding: "18px 22px", marginTop: 20, background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <Crown size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Palavra</span>
        </div>
        <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 6px" }}>
          &ldquo;Cada sessão é um passo na direção de quem você foi criada para ser. Apareça inteira.&rdquo;
        </p>
        <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
