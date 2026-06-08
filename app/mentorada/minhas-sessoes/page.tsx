"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Calendar, Clock, Video, CheckSquare, Square, NotebookPen, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";

type Sessao = {
  id: string;
  data: string;
  horario: string | null;
  duracao: string;
  status: "realizada" | "agendada" | "faltou" | "remarcada";
  link_meet: string | null;
  resumo: string | null;
  acoes: string[];
  gravacao: string | null;
  cor: string;
};

const STATUS_CONFIG = {
  realizada:  { label: "Realizada",  bg: "rgba(134,239,172,0.1)",  color: "#86efac",  border: "rgba(134,239,172,0.2)" },
  agendada:   { label: "Agendada",   bg: "rgba(147,197,253,0.12)", color: "#93c5fd",  border: "rgba(147,197,253,0.25)" },
  faltou:     { label: "Faltou",     bg: "rgba(252,165,165,0.1)",  color: "#fca5a5",  border: "rgba(252,165,165,0.2)" },
  remarcada:  { label: "Remarcada",  bg: "rgba(253,211,77,0.1)",   color: "#fcd34d",  border: "rgba(253,211,77,0.2)" },
};

function formatarData(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${dia} ${meses[parseInt(mes) - 1]} ${ano}`;
}

export default function MinhasSessoes() {
  const perfil = usePerfil();
  const [sessoes, setSessoes]     = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tarefasConcluidas, setTarefasConcluidas] = useState<Set<string>>(new Set());
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      // Busca mentorada vinculada
      const { data: mentorada } = await supabase
        .from("mentoradas")
        .select("id")
        .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
        .maybeSingle();

      if (!mentorada) { setCarregando(false); return; }

      const res = await fetch(`/api/sessoes?mentorada_id=${mentorada.id}`);
      if (res.ok) setSessoes(await res.json());
      setCarregando(false);
    });
  }, []);

  function toggleTarefa(sessaoId: string, idx: number) {
    const key = `${sessaoId}-${idx}`;
    setTarefasConcluidas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const agendadas = sessoes.filter((s) => s.status === "agendada" && s.data >= hoje);
  const historico  = sessoes.filter((s) => !(s.status === "agendada" && s.data >= hoje));

  if (perfil.carregando || carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando sessões...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="club_bw" ativo={!!perfil.produtosAtivos?.club_bw}>
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <ClipboardList size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Club BW</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Minhas Sessões</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Suas calls com a Izabor — relatórios e tarefas.</p>
      </div>

      {/* Próximas calls agendadas */}
      {agendadas.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Próximas Calls</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agendadas.map((s) => {
              const st = STATUS_CONFIG[s.status];
              return (
                <div key={s.id} style={{ padding: "18px 20px", background: "linear-gradient(135deg, #111 0%, #0d1117 100%)", border: "1px solid rgba(147,197,253,0.25)", borderRadius: 12, borderLeft: "3px solid #93c5fd" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: s.link_meet ? 12 : 0 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Calendar size={12} style={{ color: "#93c5fd" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{formatarData(s.data)}{s.horario ? ` às ${s.horario}` : ""}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={11} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.duracao}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {s.link_meet && (
                    <a href={s.link_meet} target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "#93c5fd", color: "#000", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                    >
                      <Video size={14} /> Entrar na Call
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      {historico.length === 0 && agendadas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <ClipboardList size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma sessão registrada ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Seus relatórios e tarefas aparecerão aqui após cada call.</p>
        </div>
      ) : historico.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Histórico de Calls</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {historico.map((s) => {
              const st = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.realizada;
              const tarefasTotais = s.acoes?.length ?? 0;
              const tarefasFeitas = s.acoes?.filter((_, i) => tarefasConcluidas.has(`${s.id}-${i}`)).length ?? 0;
              return (
                <div key={s.id} className="card" style={{ padding: "20px", borderLeft: `3px solid ${s.cor}` }}>
                  {/* Header da sessão */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{formatarData(s.data)}{s.horario ? ` às ${s.horario}` : ""}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={11} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duracao}</span>
                      </div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Relatório */}
                  {s.resumo && (
                    <div style={{ marginBottom: 14, padding: "12px 14px", background: "var(--bg-input)", borderRadius: 8, borderLeft: `2px solid ${s.cor}` }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <NotebookPen size={10} /> Relatório
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, margin: 0 }}>{s.resumo}</p>
                    </div>
                  )}

                  {/* Tarefas */}
                  {tarefasTotais > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Tarefas</p>
                        {tarefasTotais > 0 && (
                          <span style={{ fontSize: 10, color: tarefasFeitas === tarefasTotais ? "#86efac" : "var(--text-muted)", fontWeight: 600 }}>
                            {tarefasFeitas}/{tarefasTotais} concluídas
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {s.acoes.map((a, i) => {
                          const feita = tarefasConcluidas.has(`${s.id}-${i}`);
                          return (
                            <button key={i} onClick={() => toggleTarefa(s.id, i)}
                              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 8, background: feita ? "rgba(134,239,172,0.06)" : "var(--bg-input)", border: feita ? "1px solid rgba(134,239,172,0.2)" : "1px solid var(--border)", cursor: "pointer", textAlign: "left" }}
                            >
                              {feita
                                ? <CheckSquare size={14} style={{ color: "#86efac", flexShrink: 0, marginTop: 1 }} />
                                : <Square size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />}
                              <span style={{ fontSize: 12, color: feita ? "var(--text-muted)" : "var(--text)", textDecoration: feita ? "line-through" : "none", lineHeight: 1.4 }}>{a}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gravação */}
                  {s.gravacao && (
                    <div style={{ marginTop: 12 }}>
                      <a href={s.gravacao} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, background: "rgba(147,197,253,0.08)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                      >
                        <ExternalLink size={11} /> Ver gravação
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </BloqueadoPorProduto>
  );
}
