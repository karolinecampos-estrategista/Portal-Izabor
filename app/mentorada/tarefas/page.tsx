"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare, Circle, Clock, CheckCircle2,
  ChevronDown, ChevronUp, PenLine,
  CalendarDays, Sparkles, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type TipoTarefa = "acao" | "reflexao" | "leitura" | "pratica";
type StatusUI = "pendente" | "em-andamento" | "concluida";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoTarefa | null;
  data_entrega: string | null;
  status: string;
  criado_em: string;
  anotacao: string;
}

const tipoConfig: Record<TipoTarefa, { label: string; cor: string; bg: string; emoji: string }> = {
  acao:     { label: "Ação",     cor: "#C9A84C", bg: "rgba(201,168,76,0.1)",   emoji: "⚡" },
  reflexao: { label: "Reflexão", cor: "#a78bfa", bg: "rgba(167,139,250,0.1)",  emoji: "💭" },
  leitura:  { label: "Leitura",  cor: "#93c5fd", bg: "rgba(147,197,253,0.1)",  emoji: "📖" },
  pratica:  { label: "Prática",  cor: "#86efac", bg: "rgba(134,239,172,0.1)",  emoji: "🎯" },
};

const statusConfig: Record<StatusUI, { label: string; cor: string; bg: string; proximo: StatusUI | null }> = {
  pendente:      { label: "Pendente",     cor: "#6b7280", bg: "rgba(107,114,128,0.1)", proximo: "em-andamento" },
  "em-andamento":{ label: "Em andamento", cor: "#fbbf24", bg: "rgba(251,191,36,0.1)",  proximo: "concluida" },
  concluida:     { label: "Concluída",    cor: "#86efac", bg: "rgba(134,239,172,0.1)", proximo: null },
};

function normalizarStatus(s: string): StatusUI {
  const lower = s.toLowerCase().replace("í","i").replace("á","a").replace("ã","a");
  if (lower.includes("andamento")) return "em-andamento";
  if (lower.includes("conclu")) return "concluida";
  return "pendente";
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d} ${meses[parseInt(m)-1]}`;
}

function diasRestantes(prazo: string): number {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const alvo = new Date(prazo + "T12:00:00"); alvo.setHours(0,0,0,0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000*60*60*24));
}

export default function MinhasTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nomeMentorada, setNomeMentorada] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<StatusUI | "todas">("todas");
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [notaTemp, setNotaTemp] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let nome = "";
      if (session) {
        const { data: m } = await supabase
          .from("mentoradas")
          .select("nome")
          .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
          .maybeSingle();
        if (m) { nome = m.nome; setNomeMentorada(nome); }
      }

      const res = await fetch("/api/tarefas");
      const todas: Tarefa[] = await res.json();

      // Mostra tarefas globais (sem mentorada_nome) + as específicas dela
      const minhas = Array.isArray(todas)
        ? todas
            .filter((t: Tarefa & { mentorada_nome?: string | null }) =>
              !t.mentorada_nome || t.mentorada_nome === nome
            )
            .map((t) => ({ ...t, anotacao: "" }))
        : [];
      setTarefas(minhas);
      setCarregando(false);
    });
  }, []);

  async function avancarStatus(id: string, statusAtual: string) {
    const statusUI = normalizarStatus(statusAtual);
    const proximo = statusConfig[statusUI].proximo;
    if (!proximo) return;

    const novoStatus = proximo === "em-andamento" ? "Em andamento"
      : proximo === "concluida" ? "Concluída"
      : "Pendente";

    setTarefas((prev) => prev.map((t) => t.id === id ? { ...t, status: novoStatus } : t));
    await fetch("/api/tarefas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: novoStatus }),
    });
  }

  function salvarNota(id: string) {
    setTarefas((prev) => prev.map((t) => t.id === id ? { ...t, anotacao: notaTemp } : t));
    setEditandoNota(null);
  }

  const statusNormalizado = (t: Tarefa) => normalizarStatus(t.status);
  const filtradas = tarefas.filter((t) => filtro === "todas" || statusNormalizado(t) === filtro);
  const pendentes = tarefas.filter((t) => statusNormalizado(t) === "pendente").length;
  const emAndamento = tarefas.filter((t) => statusNormalizado(t) === "em-andamento").length;
  const concluidas = tarefas.filter((t) => statusNormalizado(t) === "concluida").length;
  const pctConcluido = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <CheckSquare size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tarefas</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Minhas Tarefas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Tarefas enviadas pela Izabor para a sua jornada.</p>
      </div>

      {tarefas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <CheckSquare size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma tarefa atribuída ainda.</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>A Izabor vai enviar tarefas conforme sua jornada avança.</p>
        </div>
      ) : (
        <>
          {/* Progresso geral */}
          <div className="card glow-gold" style={{ padding: "20px 24px", marginBottom: 24, background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>Progresso da Jornada</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 900, color: "var(--gold)", lineHeight: 1 }}>{pctConcluido}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8, marginBottom: 16 }}>
              <div className="progress-fill" style={{ width: `${pctConcluido}%`, background: "var(--gold)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Pendentes", valor: pendentes, cor: "#6b7280" },
                { label: "Em andamento", valor: emAndamento, cor: "#fbbf24" },
                { label: "Concluídas", valor: concluidas, cor: "#86efac" },
              ].map(({ label, valor, cor }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: cor, margin: 0, lineHeight: 1 }}>{valor}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {(["todas", "pendente", "em-andamento", "concluida"] as const).map((f) => {
              const cfg = f === "todas" ? null : statusConfig[f];
              return (
                <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filtro === f ? (cfg?.cor ?? "var(--gold)") : "var(--border)"}`, background: filtro === f ? (cfg?.bg ?? "var(--gold-light)") : "transparent", color: filtro === f ? (cfg?.cor ?? "var(--gold)") : "var(--text-muted)", fontWeight: filtro === f ? 700 : 400 }}>
                  {f === "todas" ? "Todas" : cfg!.label}
                  {f !== "todas" && <span style={{ marginLeft: 6, opacity: 0.7 }}>{f === "pendente" ? pendentes : f === "em-andamento" ? emAndamento : concluidas}</span>}
                </button>
              );
            })}
          </div>

          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtradas.length === 0 && (
              <div className="card" style={{ padding: 32, textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma tarefa com esse filtro.</p>
              </div>
            )}

            {filtradas.map((t) => {
              const sUI = statusNormalizado(t);
              const tipo = tipoConfig[t.tipo ?? "acao"] ?? tipoConfig.acao;
              const status = statusConfig[sUI];
              const vencida = t.data_entrega ? t.data_entrega < today() && sUI !== "concluida" : false;
              const dias = t.data_entrega ? diasRestantes(t.data_entrega) : null;
              const aberta = expandida === t.id;

              return (
                <div key={t.id} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: `3px solid ${sUI === "concluida" ? "#86efac" : vencida ? "#f87171" : tipo.cor}`, opacity: sUI === "concluida" ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }} onClick={() => setExpandida(aberta ? null : t.id)}>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (status.proximo) avancarStatus(t.id, t.status); }}
                      title={status.proximo ? `Marcar como ${statusConfig[status.proximo].label}` : "Concluída"}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${status.cor}`, background: sUI === "concluida" ? "#86efac" : sUI === "em-andamento" ? "rgba(251,191,36,0.15)" : "transparent", cursor: status.proximo ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      {sUI === "concluida" && <CheckCircle2 size={14} color="#000" />}
                      {sUI === "em-andamento" && <Clock size={12} color="#fbbf24" />}
                      {sUI === "pendente" && <Circle size={12} color="#6b7280" />}
                    </button>

                    <span style={{ fontSize: 18, flexShrink: 0 }}>{tipo.emoji}</span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "var(--text)", textDecoration: sUI === "concluida" ? "line-through" : "none", opacity: sUI === "concluida" ? 0.6 : 1 }}>
                        {t.titulo}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: tipo.bg, color: tipo.cor }}>{tipo.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: status.bg, color: status.cor }}>{status.label}</span>
                        {vencida && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: "rgba(248,113,113,0.12)", color: "#f87171" }}>Vencida</span>}
                        {!vencida && sUI !== "concluida" && dias !== null && dias >= 0 && dias <= 3 && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                            {dias === 0 ? "Vence hoje" : `${dias}d restantes`}
                          </span>
                        )}
                        {t.data_entrega && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 2 }}>
                            <CalendarDays size={10} style={{ color: "var(--text-muted)" }} />
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Prazo: {formatData(t.data_entrega)}</span>
                          </div>
                        )}
                        {t.anotacao && <PenLine size={11} style={{ color: "var(--gold)", marginLeft: 2 }} />}
                      </div>
                    </div>

                    <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      {aberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {aberta && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "18px 20px", background: "var(--bg)" }}>
                      {t.descricao && (
                        <div style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>O que fazer</p>
                          <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, margin: 0, padding: "14px 16px", background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border)" }}>{t.descricao}</p>
                        </div>
                      )}

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <PenLine size={13} style={{ color: "var(--gold)" }} />
                          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Minha Anotação</p>
                        </div>
                        {editandoNota === t.id ? (
                          <div>
                            <textarea autoFocus value={notaTemp} onChange={(e) => setNotaTemp(e.target.value)} placeholder="Escreva aqui suas reflexões, o que fez, como se sentiu..." rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--gold-border)", color: "var(--text)", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditandoNota(null)}>Cancelar</button>
                              <button className="btn-gold" style={{ fontSize: 12 }} onClick={() => salvarNota(t.id)}>Salvar anotação</button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => { setEditandoNota(t.id); setNotaTemp(t.anotacao); }} style={{ minHeight: 64, padding: "12px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px dashed var(--border)", cursor: "pointer" }}>
                            {t.anotacao
                              ? <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{t.anotacao}</p>
                              : <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>Clique para adicionar uma anotação...</p>
                            }
                          </div>
                        )}
                      </div>

                      {sUI !== "concluida" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          {sUI === "pendente" && (
                            <button onClick={() => avancarStatus(t.id, t.status)} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(251,191,36,0.4)", background: "rgba(251,191,36,0.08)", color: "#fbbf24", fontWeight: 600 }}>
                              Marcar como em andamento
                            </button>
                          )}
                          {sUI === "em-andamento" && (
                            <button onClick={() => avancarStatus(t.id, t.status)} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(134,239,172,0.4)", background: "rgba(134,239,172,0.08)", color: "#86efac", fontWeight: 600 }}>
                              Marcar como concluída ✓
                            </button>
                          )}
                        </div>
                      )}

                      {sUI === "concluida" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(134,239,172,0.06)", borderRadius: 8, border: "1px solid rgba(134,239,172,0.2)" }}>
                          <CheckCircle2 size={14} style={{ color: "#86efac" }} />
                          <span style={{ fontSize: 12, color: "#86efac", fontWeight: 600 }}>Tarefa concluída — ótimo trabalho!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
