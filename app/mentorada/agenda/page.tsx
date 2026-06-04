"use client";

import { CalendarDays, Clock, MapPin, Video, Users, Crown, Star, Link2, ExternalLink } from "lucide-react";

type TipoEvento = "call" | "presencial" | "imersao" | "club" | "mentoria";

type Evento = {
  id: number;
  titulo: string;
  data: string;          // "DD Mon YYYY" para passados, "YYYY-MM-DD" para futuros
  dataISO?: string;      // YYYY-MM-DD para ordenação e countdown
  hora?: string;
  local?: string;
  tipo: TipoEvento;
  descricao?: string;
  link?: string;
  tipoCall?: string;
  passado?: boolean;
};

const tipoConfig: Record<TipoEvento, { cor: string; bg: string; icone: React.ReactNode; label: string }> = {
  call:      { cor: "#93c5fd", bg: "rgba(59,130,246,0.1)",   icone: <Video size={12} />,  label: "Call Online" },
  presencial:{ cor: "#86efac", bg: "rgba(34,197,94,0.1)",    icone: <MapPin size={12} />, label: "Presencial" },
  imersao:   { cor: "#C9A84C", bg: "rgba(201,168,76,0.1)",   icone: <Crown size={12} />, label: "Imersão BW" },
  club:      { cor: "#a78bfa", bg: "rgba(139,92,246,0.1)",   icone: <Users size={12} />, label: "Club BW" },
  mentoria:  { cor: "#f9a8d4", bg: "rgba(236,72,153,0.1)",   icone: <Star size={12} />,  label: "Mentoria" },
};

function diasAte(dataISO: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataISO + "T12:00:00");
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDataExibicao(dataISO: string): { dia: string; mes: string; full: string } {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m, d] = dataISO.split("-");
  return { dia: d, mes: meses[parseInt(m) - 1], full: `${d} ${meses[parseInt(m) - 1]} ${y}` };
}

const EVENTOS: Evento[] = [
  // Próximos
  {
    id: 1, titulo: "Call Individual — Izabor Cruz", dataISO: "2026-06-03", data: "03 Jun 2026",
    hora: "10:00", tipo: "call", tipoCall: "Sessão de Acompanhamento",
    descricao: "Sessão semanal de acompanhamento. Foco desta semana: identidade e propósito.",
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 2, titulo: "Club BW — Encontro Mensal", dataISO: "2026-06-10", data: "10 Jun 2026",
    hora: "19:30", tipo: "club",
    descricao: "Encontro mensal com todas as alunas do Club BW. Tema: Liderança feminina com fé.",
  },
  {
    id: 3, titulo: "Call de Alinhamento — Jornada", dataISO: "2026-06-17", data: "17 Jun 2026",
    hora: "14:00", tipo: "call", tipoCall: "Alinhamento de Jornada",
    descricao: "Revisão dos desafios do mês e planejamento das próximas semanas.",
    link: "https://meet.google.com/xyz-uvwx-yz1",
  },
  {
    id: 4, titulo: "Call Individual — Izabor Cruz", dataISO: "2026-07-01", data: "01 Jul 2026",
    hora: "10:00", tipo: "call", tipoCall: "Sessão de Acompanhamento",
    descricao: "Sessão semanal de acompanhamento.",
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 5, titulo: "Club BW — Encontro Mensal", dataISO: "2026-07-08", data: "08 Jul 2026",
    hora: "19:30", tipo: "club",
    descricao: "Encontro mensal. Tema: Inteligência emocional no casamento.",
  },
  {
    id: 6, titulo: "Imersão BW — Encontro Presencial", dataISO: "2026-08-15", data: "15 Ago 2026",
    hora: "09:00", local: "São Paulo — SP (local a confirmar)", tipo: "imersao",
    descricao: "Imersão presencial de 3 dias. O encontro mais poderoso da jornada. Encerramento e foto do 'depois'.",
  },
  // Passados
  { id: 7,  titulo: "Call Individual — Semana 7",    data: "20 Mai 2026", hora: "10:00", tipo: "call",  passado: true },
  { id: 8,  titulo: "Club BW — Encontro Mensal",     data: "13 Mai 2026", hora: "19:30", tipo: "club",  passado: true },
  { id: 9,  titulo: "Call Individual — Semana 5",    data: "06 Mai 2026", hora: "10:00", tipo: "call",  passado: true },
  { id: 10, titulo: "Call Individual — Semana 3",    data: "22 Abr 2026", hora: "10:00", tipo: "call",  passado: true },
];

const proximos = EVENTOS.filter((e) => !e.passado).sort((a, b) => (a.dataISO ?? "").localeCompare(b.dataISO ?? ""));
const passados  = EVENTOS.filter((e) => e.passado);
const proximaCall = proximos.find((e) => e.tipo === "call");

export default function AgendaMentorada() {
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
          Todos os seus encontros, calls e eventos em um só lugar.
        </p>
      </div>

      {/* Próxima Call — Destaque */}
      {proximaCall && proximaCall.dataISO && (() => {
        const diff = diasAte(proximaCall.dataISO);
        const fmt = formatDataExibicao(proximaCall.dataISO);
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
                {isHoje ? "Sua call é HOJE" : isAmanha ? "Sua call é amanhã" : "Próxima Call"}
              </span>
              {diff >= 0 && (
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 999,
                  background: urgente ? "rgba(134,239,172,0.15)" : "rgba(201,168,76,0.12)",
                  color: urgente ? "#86efac" : "var(--gold)",
                  border: `1px solid ${urgente ? "rgba(134,239,172,0.3)" : "var(--gold-border)"}`,
                }}>
                  {isHoje ? "Hoje" : isAmanha ? "Amanhã" : `em ${diff} dias`}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{proximaCall.titulo}</p>
                {proximaCall.tipoCall && (
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(147,197,253,0.12)", color: "#93c5fd", marginBottom: 8 }}>
                    {proximaCall.tipoCall}
                  </span>
                )}
                <div className="flex items-center gap-4" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                  <div className="flex items-center gap-1">
                    <CalendarDays size={12} style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{proximaCall.data}</span>
                  </div>
                  {proximaCall.hora && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} style={{ color: "var(--gold)" }} />
                      <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{proximaCall.hora}</span>
                    </div>
                  )}
                </div>
                {proximaCall.descricao && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{proximaCall.descricao}</p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ textAlign: "center", background: urgente ? "rgba(134,239,172,0.1)" : "rgba(201,168,76,0.1)", borderRadius: 10, padding: "10px 20px", border: `1px solid ${urgente ? "rgba(134,239,172,0.3)" : "var(--gold-border)"}` }}>
                  <p style={{ fontSize: 32, fontWeight: 900, color: urgente ? "#86efac" : "var(--gold)", margin: 0, lineHeight: 1 }}>{fmt.dia}</p>
                  <p style={{ fontSize: 12, color: urgente ? "#86efac" : "var(--gold)", margin: 0, fontWeight: 700 }}>{fmt.mes}</p>
                </div>
                {proximaCall.link && (
                  <a
                    href={proximaCall.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 8,
                      background: urgente ? "#86efac" : "var(--gold)",
                      color: "#000", textDecoration: "none",
                    }}
                  >
                    <Video size={14} /> Entrar na Call
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legenda */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.entries(tipoConfig) as [TipoEvento, typeof tipoConfig[TipoEvento]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.cor }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Lista de próximos eventos */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <CalendarDays size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Próximos Eventos</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{proximos.length} agendados</span>
        </div>
        <div className="flex flex-col gap-3">
          {proximos.map((e) => {
            const cfg = tipoConfig[e.tipo];
            const fmt = e.dataISO ? formatDataExibicao(e.dataISO) : null;
            const diff = e.dataISO ? diasAte(e.dataISO) : null;

            return (
              <div
                key={e.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 16px", borderRadius: 10,
                  background: "var(--bg-input)",
                  border: `1px solid ${cfg.cor}25`,
                }}
              >
                {/* Data */}
                {fmt && (
                  <div style={{ minWidth: 44, textAlign: "center", background: cfg.bg, borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: cfg.cor, margin: 0, lineHeight: 1 }}>{fmt.dia}</p>
                    <p style={{ fontSize: 9, color: cfg.cor, margin: 0, fontWeight: 700 }}>{fmt.mes}</p>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 3, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{e.titulo}</p>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 600, color: cfg.cor, background: cfg.bg,
                      border: `1px solid ${cfg.cor}30`, padding: "1px 7px", borderRadius: 999,
                    }}>
                      {cfg.icone} {e.tipoCall ?? cfg.label}
                    </span>
                    {diff !== null && diff <= 3 && diff >= 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "rgba(134,239,172,0.12)", color: "#86efac" }}>
                        {diff === 0 ? "Hoje" : diff === 1 ? "Amanhã" : `em ${diff} dias`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
                    {e.hora && (
                      <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.hora}</span>
                      </div>
                    )}
                    {e.local && (
                      <div className="flex items-center gap-1">
                        <MapPin size={11} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.local}</span>
                      </div>
                    )}
                    {e.link && (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#93c5fd", textDecoration: "none" }}
                      >
                        <Link2 size={11} /> Acessar link
                      </a>
                    )}
                  </div>
                  {e.descricao && (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "5px 0 0", lineHeight: 1.5 }}>{e.descricao}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Imersão destaque */}
      <div
        className="card"
        style={{
          padding: "20px 22px", marginBottom: 20,
          background: "linear-gradient(135deg, #111 0%, #120e00 100%)",
          border: "1px solid rgba(201,168,76,0.4)",
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Crown size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Marco da Jornada — Imersão Presencial
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Encontro Presencial BW</p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
          O grande encerramento da sua jornada de 6 meses. É nesse dia que você vai tirar a foto do seu "depois" e registrar no portal quem você se tornou.
        </p>
        <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
            <CalendarDays size={12} /> 15 de Agosto de 2026
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "var(--bg-input)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
            <MapPin size={12} /> São Paulo — SP
          </span>
        </div>
      </div>

      {/* Histórico */}
      {passados.length > 0 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <Clock size={13} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Histórico</span>
          </div>
          <div className="flex flex-col gap-2">
            {passados.map((e) => {
              const cfg = tipoConfig[e.tipo];
              return (
                <div
                  key={e.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 8,
                    background: "var(--bg-input)", border: "1px solid var(--border)", opacity: 0.7,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.cor, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0, flex: 1 }}>{e.titulo}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.data} {e.hora && `· ${e.hora}`}</span>
                  <span style={{ fontSize: 10, color: "#86efac", background: "rgba(134,239,172,0.1)", padding: "1px 7px", borderRadius: 999 }}>Realizado</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
