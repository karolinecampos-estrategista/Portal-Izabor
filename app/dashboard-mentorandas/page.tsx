"use client";

import { useState } from "react";
import { LayoutGrid, Trophy, ListTodo, TrendingUp, CheckCircle2, Clock, AlertCircle, Circle, Star, Phone, Instagram, Flame, Bell, BookHeart, PenLine, PlaySquare, Heart, Check } from "lucide-react";
import Link from "next/link";

/* ── Atividades recentes ── */
type TipoAtividade = "tarefa_concluida" | "desafio_concluido" | "depoimento_enviado" | "aula_concluida" | "anotacao_salva";

interface Atividade {
  id: number;
  mentorandaNome: string;
  tipo: TipoAtividade;
  descricao: string;
  dataHora: string;
  lida: boolean;
}

const TIPO_ATI_CONFIG: Record<TipoAtividade, { label: string; cor: string; bg: string; icon: typeof Bell }> = {
  tarefa_concluida:    { label: "Tarefa",      cor: "#86efac", bg: "rgba(134,239,172,0.12)", icon: CheckCircle2 },
  desafio_concluido:   { label: "Desafio",     cor: "#C9A84C", bg: "rgba(201,168,76,0.12)",  icon: Trophy },
  depoimento_enviado:  { label: "Depoimento",  cor: "#f9a8d4", bg: "rgba(236,72,153,0.1)",   icon: Heart },
  aula_concluida:      { label: "Aula",        cor: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: PlaySquare },
  anotacao_salva:      { label: "Anotação",    cor: "#93c5fd", bg: "rgba(147,197,253,0.12)", icon: PenLine },
};

const ATIVIDADES_INICIAL: Atividade[] = [
  { id: 1, mentorandaNome: "Ana Paula Ferreira", tipo: "desafio_concluido",  descricao: 'concluiu o desafio "Devocional 7 dias"',                       dataHora: "Hoje, 14:32",    lida: false },
  { id: 2, mentorandaNome: "Camila Souza",        tipo: "anotacao_salva",    descricao: 'adicionou anotação na tarefa "Conversa difícil adiada"',         dataHora: "Hoje, 11:15",    lida: false },
  { id: 3, mentorandaNome: "Fernanda Lima",        tipo: "tarefa_concluida",  descricao: 'concluiu a tarefa "Stories da aprendizagem"',                   dataHora: "Ontem, 21:40",   lida: false },
  { id: 4, mentorandaNome: "Patricia Alves",      tipo: "desafio_concluido", descricao: 'concluiu o desafio "Ação corajosa no negócio"',                  dataHora: "Ontem, 18:22",   lida: true  },
  { id: 5, mentorandaNome: "Juliana Matos",        tipo: "depoimento_enviado",descricao: "enviou um depoimento para aprovação",                            dataHora: "28 Mai, 09:10",  lida: false },
  { id: 6, mentorandaNome: "Ana Paula Ferreira",  tipo: "aula_concluida",    descricao: 'concluiu a aula "Quebrando crenças limitantes" — Módulo 1',      dataHora: "27 Mai, 16:55",  lida: true  },
  { id: 7, mentorandaNome: "Camila Souza",        tipo: "tarefa_concluida",  descricao: 'concluiu a tarefa "3 gratidões do dia"',                         dataHora: "26 Mai, 08:30",  lida: true  },
];

/* ── Dados das mentorandas ── */
const MENTORANDAS = [
  { id: 1, nome: "Ana Paula Ferreira", programa: "Imersao BW", sessoes: 8, totalSessoes: 10, cor: "#C9A84C", pilares: ["Fe", "Lideranca"], whatsapp: "(11) 99999-0001", instagram: "@anapaula.empreende", ultimaAtividade: "Hoje" },
  { id: 2, nome: "Camila Souza",       programa: "Mentoria Individual", sessoes: 4, totalSessoes: 8,  cor: "#a78bfa", pilares: ["Emocional", "Familia"], whatsapp: "(21) 98888-0002", instagram: "@camilasouz", ultimaAtividade: "Ontem" },
  { id: 3, nome: "Fernanda Lima",      programa: "Club BW",   sessoes: 18, totalSessoes: 20, cor: "#86efac", pilares: ["Lideranca", "Fe"], whatsapp: "(31) 97777-0003", instagram: "@fernandalima.lider", ultimaAtividade: "Hoje" },
  { id: 4, nome: "Juliana Matos",      programa: "Mentoria Individual", sessoes: 2, totalSessoes: 6,  cor: "#93c5fd", pilares: ["Emocional", "Mentalidade"], whatsapp: "(11) 96666-0004", instagram: "@juliana.matos", ultimaAtividade: "3 dias atrás" },
  { id: 5, nome: "Renata Costa",       programa: "Imersao BW", sessoes: 10, totalSessoes: 10, cor: "#f9a8d4", pilares: ["Lideranca", "Fe", "Mentalidade"], whatsapp: "(85) 95555-0005", instagram: "@renata.incr", ultimaAtividade: "Concluída" },
  { id: 6, nome: "Patricia Alves",     programa: "Club BW",   sessoes: 5, totalSessoes: 20, cor: "#fca5a5", pilares: ["Fe", "Emocional"], whatsapp: "(47) 94444-0006", instagram: "@patricia.alves.bw", ultimaAtividade: "2 dias atrás" },
];

/* ── Desafios ── */
type StatusDesafio = "concluiu" | "pendente" | "nao-enviado";
const DESAFIOS_TRACK = [
  {
    titulo: "Devocional 7 dias",
    prazo: "03 Jun",
    status: {
      "Ana Paula Ferreira": "concluiu",
      "Camila Souza":       "pendente",
      "Fernanda Lima":      "concluiu",
      "Juliana Matos":      "nao-enviado",
      "Renata Costa":       "nao-enviado",
      "Patricia Alves":     "pendente",
    } as Record<string, StatusDesafio>,
  },
  {
    titulo: "Ação corajosa no negócio",
    prazo: "06 Jun",
    status: {
      "Ana Paula Ferreira": "pendente",
      "Camila Souza":       "pendente",
      "Fernanda Lima":      "concluiu",
      "Juliana Matos":      "nao-enviado",
      "Renata Costa":       "nao-enviado",
      "Patricia Alves":     "concluiu",
    } as Record<string, StatusDesafio>,
  },
  {
    titulo: "Crenças limitantes",
    prazo: "Juliana · 31 Mai",
    status: {
      "Juliana Matos": "pendente",
    } as Record<string, StatusDesafio>,
  },
];

/* ── Tarefas ── */
type StatusTarefa = "concluiu" | "pendente" | "vencida";
const TAREFAS_TRACK = [
  {
    titulo: "3 gratidões do dia",
    tipo: "🎯 Prática",
    prazo: "30 Mai",
    status: {
      "Ana Paula Ferreira": "pendente",
    } as Record<string, StatusTarefa>,
  },
  {
    titulo: "Cap. 3 Mulher INCOMUM",
    tipo: "📖 Leitura",
    prazo: "02 Jun",
    status: {
      "Juliana Matos": "pendente",
    } as Record<string, StatusTarefa>,
  },
  {
    titulo: "Conversa difícil adiada",
    tipo: "💭 Reflexão",
    prazo: "29 Mai",
    status: {
      "Camila Souza": "concluiu",
    } as Record<string, StatusTarefa>,
  },
  {
    titulo: "Stories da aprendizagem",
    tipo: "⚡ Ação",
    prazo: "31 Mai",
    status: {
      "Ana Paula Ferreira": "concluiu",
      "Camila Souza":       "concluiu",
      "Fernanda Lima":      "pendente",
      "Patricia Alves":     "pendente",
    } as Record<string, StatusTarefa>,
  },
  {
    titulo: "3 próximos passos negócio",
    tipo: "⚡ Ação",
    prazo: "05 Jun",
    status: {
      "Fernanda Lima": "pendente",
    } as Record<string, StatusTarefa>,
  },
];

function StatusDot({ status }: { status: StatusDesafio | StatusTarefa | undefined }) {
  if (!status) return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 8, color: "var(--text-muted)" }}>—</span>
    </div>
  );
  if (status === "concluiu") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(134,239,172,0.15)", border: "1px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CheckCircle2 size={13} style={{ color: "#86efac" }} />
    </div>
  );
  if (status === "vencida") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(252,165,165,0.12)", border: "1px solid rgba(252,165,165,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AlertCircle size={13} style={{ color: "#fca5a5" }} />
    </div>
  );
  return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(253,224,71,0.1)", border: "1px solid rgba(253,224,71,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Clock size={13} style={{ color: "#fde047" }} />
    </div>
  );
}

const nomesCurtos = MENTORANDAS.map((m) => m.nome.split(" ")[0]);

export default function DashboardMentorandas() {
  const [atividades, setAtividades] = useState<Atividade[]>(ATIVIDADES_INICIAL);

  function marcarLida(id: number) {
    setAtividades((prev) => prev.map((a) => a.id === id ? { ...a, lida: true } : a));
  }
  function marcarTodasLidas() {
    setAtividades((prev) => prev.map((a) => ({ ...a, lida: true })));
  }

  const naoLidas = atividades.filter((a) => !a.lida).length;

  const totalSessoes = MENTORANDAS.reduce((s, m) => s + m.sessoes, 0);
  const totalPossivel = MENTORANDAS.reduce((s, m) => s + m.totalSessoes, 0);
  const progMedio = Math.round((totalSessoes / totalPossivel) * 100);

  const desafiosConcluidos = DESAFIOS_TRACK.flatMap((d) => Object.values(d.status)).filter((s) => s === "concluiu").length;
  const desafiosPendentes = DESAFIOS_TRACK.flatMap((d) => Object.values(d.status)).filter((s) => s === "pendente").length;

  const tarefasConcluidas = TAREFAS_TRACK.flatMap((t) => Object.values(t.status)).filter((s) => s === "concluiu").length;
  const tarefasPendentes = TAREFAS_TRACK.flatMap((t) => Object.values(t.status)).filter((s) => s === "pendente").length;

  const precisamAtencao = MENTORANDAS.filter((m) => {
    const prog = m.sessoes / m.totalSessoes;
    return prog < 0.4 && m.programa !== "Club BW";
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <LayoutGrid size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Visão Geral</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Dashboard das Mentoradas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Acompanhe a evolução, desafios e tarefas de todas as suas alunas.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Progresso Médio", value: `${progMedio}%`, sub: "evolução geral", icon: TrendingUp, color: "var(--gold)" },
          { label: "Desafios Concluídos", value: desafiosConcluidos, sub: `${desafiosPendentes} pendentes`, icon: Trophy, color: "#86efac" },
          { label: "Tarefas Concluídas", value: tarefasConcluidas, sub: `${tarefasPendentes} pendentes`, icon: ListTodo, color: "#a78bfa" },
          { label: "Precisam Atenção", value: precisamAtencao.length, sub: "baixo progresso", icon: AlertCircle, color: precisamAtencao.length > 0 ? "#fca5a5" : "#86efac" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
              <s.icon size={13} style={{ color: s.color }} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── ATIVIDADE RECENTE ── */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Atividade Recente</span>
            {naoLidas > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(201,168,76,0.18)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                {naoLidas} nova{naoLidas > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {naoLidas > 0 && (
            <button
              onClick={marcarTodasLidas}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
            >
              <Check size={10} /> Marcar todas como lidas
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {atividades.map((a) => {
            const cfg = TIPO_ATI_CONFIG[a.tipo];
            const AtiIcon = cfg.icon;
            const primNome = a.mentorandaNome.split(" ")[0];
            const mentoranda = MENTORANDAS.find((m) => m.nome === a.mentorandaNome);

            return (
              <div
                key={a.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  background: a.lida ? "var(--bg-input)" : `${cfg.bg}`,
                  border: a.lida ? "1px solid var(--border)" : `1px solid ${cfg.cor}30`,
                  transition: "all 0.2s",
                }}
              >
                {/* Ícone tipo */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.lida ? "var(--bg-card)" : cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${a.lida ? "var(--border)" : cfg.cor + "30"}` }}>
                  <AtiIcon size={14} style={{ color: a.lida ? "var(--text-muted)" : cfg.cor }} />
                </div>

                {/* Avatar mentee */}
                {mentoranda && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: mentoranda.cor + "20", color: mentoranda.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                    {a.mentorandaNome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, margin: "0 0 2px", lineHeight: 1.5, color: "var(--text)" }}>
                    <strong style={{ color: a.lida ? "var(--text-soft)" : "var(--text)", fontWeight: 600 }}>{primNome}</strong>{" "}
                    <span style={{ color: a.lida ? "var(--text-muted)" : "var(--text-soft)" }}>{a.descricao}</span>
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.dataHora}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "0px 5px", borderRadius: 4, background: a.lida ? "var(--bg-card)" : cfg.bg, color: a.lida ? "var(--text-muted)" : cfg.cor }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Ponto não lida + botão */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {!a.lida && (
                    <>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }} />
                      <button
                        onClick={() => marcarLida(a.id)}
                        style={{ fontSize: 10, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Lida
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EVOLUÇÃO POR MENTORADA ── */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Evolução por Mentorada</span>
          </div>
          <Link href="/mentorandas" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>Ver perfis completos →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
          {MENTORANDAS.map((m) => {
            const pct = Math.round((m.sessoes / m.totalSessoes) * 100);
            const atencao = pct < 40 && m.programa !== "Club BW";
            return (
              <div
                key={m.id}
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-input)",
                  borderRadius: 10,
                  border: atencao ? "1px solid rgba(252,165,165,0.2)" : "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.cor + "20", color: m.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {m.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between">
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome.split(" ")[0]} {m.nome.split(" ")[1]}</p>
                      {atencao && <AlertCircle size={12} style={{ color: "#fca5a5", flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{m.programa}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.sessoes}/{m.totalSessoes} sessões</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.cor }}>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 5, marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: m.cor }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {m.pilares.slice(0, 2).map((p) => (
                      <span key={p} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 10, color: m.ultimaAtividade === "Hoje" ? "#86efac" : "var(--text-muted)" }}>
                      <Flame size={9} style={{ display: "inline", marginRight: 3 }} />{m.ultimaAtividade}
                    </span>
                    <div className="flex items-center gap-1">
                      <a href={`https://wa.me/55${m.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#86efac", opacity: 0.7 }}><Phone size={11} /></a>
                      <a href={`https://instagram.com/${m.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#f9a8d4", opacity: 0.7 }}><Instagram size={11} /></a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESAFIOS — QUEM ESTÁ FAZENDO ── */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20, overflowX: "auto" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <Trophy size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Desafios — Acompanhamento</span>
          </div>
          <Link href="/desafios" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>Gerenciar desafios →</Link>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4" style={{ marginBottom: 12 }}>
          {[
            { label: "Concluiu", icon: <CheckCircle2 size={11} />, cor: "#86efac" },
            { label: "Pendente", icon: <Clock size={11} />, cor: "#fde047" },
            { label: "Não enviado", icon: <Circle size={11} />, cor: "var(--text-muted)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1" style={{ fontSize: 10, color: l.cor }}>
              {l.icon} {l.label}
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ minWidth: 500 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${DESAFIOS_TRACK.length}, 1fr)`, gap: 6, marginBottom: 6, paddingLeft: 4 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>Mentorada</span>
            {DESAFIOS_TRACK.map((d, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-soft)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.titulo}</p>
                <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>{d.prazo}</p>
              </div>
            ))}
          </div>

          {/* Linhas */}
          {MENTORANDAS.map((m) => (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: `180px repeat(${DESAFIOS_TRACK.length}, 1fr)`, gap: 6, marginBottom: 4, padding: "6px 4px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", alignItems: "center" }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.cor + "20", color: m.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                  {m.nome.split(" ").map((n) => n[0]).join("").slice(0,2)}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome.split(" ")[0]}</span>
              </div>
              {DESAFIOS_TRACK.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                  <StatusDot status={d.status[m.nome]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── TAREFAS — QUEM ESTÁ FAZENDO ── */}
      <div className="card" style={{ padding: "18px 20px", overflowX: "auto" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <ListTodo size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Tarefas — Acompanhamento</span>
          </div>
          <Link href="/tarefas-mentoradas" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>Gerenciar tarefas →</Link>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4" style={{ marginBottom: 12 }}>
          {[
            { label: "Concluiu", icon: <CheckCircle2 size={11} />, cor: "#86efac" },
            { label: "Pendente", icon: <Clock size={11} />, cor: "#fde047" },
            { label: "Vencida",  icon: <AlertCircle size={11} />, cor: "#fca5a5" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1" style={{ fontSize: 10, color: l.cor }}>
              {l.icon} {l.label}
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ minWidth: 640 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${TAREFAS_TRACK.length}, 1fr)`, gap: 6, marginBottom: 6, paddingLeft: 4 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>Mentorada</span>
            {TAREFAS_TRACK.map((t, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 9, fontWeight: 600, color: "var(--text-soft)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titulo}</p>
                <p style={{ fontSize: 8, color: "var(--text-muted)", margin: 0 }}>{t.tipo}</p>
              </div>
            ))}
          </div>

          {/* Linhas */}
          {MENTORANDAS.map((m) => (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: `180px repeat(${TAREFAS_TRACK.length}, 1fr)`, gap: 6, marginBottom: 4, padding: "6px 4px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", alignItems: "center" }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.cor + "20", color: m.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                  {m.nome.split(" ").map((n) => n[0]).join("").slice(0,2)}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome.split(" ")[0]}</span>
              </div>
              {TAREFAS_TRACK.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                  <StatusDot status={t.status[m.nome]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quem precisa de atenção */}
        {precisamAtencao.length > 0 && (
          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(252,165,165,0.06)", borderRadius: 10, border: "1px solid rgba(252,165,165,0.15)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <AlertCircle size={13} style={{ color: "#fca5a5" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5" }}>Mentoradas que precisam de atenção</span>
            </div>
            <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
              {precisamAtencao.map((m) => (
                <div key={m.id} className="flex items-center gap-2" style={{ padding: "6px 10px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.cor + "20", color: m.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                    {m.nome.split(" ").map((n) => n[0]).join("").slice(0,2)}
                  </div>
                  <span style={{ fontSize: 12 }}>{m.nome.split(" ")[0]}</span>
                  <span style={{ fontSize: 10, color: "#fca5a5" }}>{Math.round((m.sessoes/m.totalSessoes)*100)}%</span>
                  <a href={`https://wa.me/55${m.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#86efac" }}><Phone size={11} /></a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
