"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle, Loader2, TrendingUp, TrendingDown, Minus, Calendar, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";

const EMOJIS = ["😔", "😟", "😐", "🙂", "🤩"];
const LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Incrível!"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

type CheckIn = {
  id: string;
  humor: number;
  texto: string | null;
  semana: string | null;
  criado_em: string;
};

type MentoradaInfo = { id: string; nome: string; programa: string | null; user_id: string };

function semanaAtual() {
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const semana = Math.ceil(((agora.getTime() - inicioAno.getTime()) / 86400000 + inicioAno.getDay() + 1) / 7);
  return `Semana ${semana} — ${agora.getFullYear()}`;
}

function mesAnoKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sentimentoColor(h: number) {
  if (h <= 2) return "#fca5a5";
  if (h === 3) return "#fcd34d";
  return "#86efac";
}

function formatarDataCurta(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MESES_SHORT[d.getMonth()]}`;
}

export default function CheckinMentoradaPage() {
  const perfil = usePerfil();
  const [aba, setAba] = useState<"checkin" | "evolucao">("checkin");
  const [sentimento, setSentimento] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mentoradaInfo, setMentoradaInfo] = useState<MentoradaInfo | null>(null);
  const [historico, setHistorico] = useState<CheckIn[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [filtroMes, setFiltroMes] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("mentoradas")
        .select("id, nome, programa, user_id")
        .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
        .maybeSingle();
      const info: MentoradaInfo = data ?? {
        id: session.user.id,
        nome: "Mentorada",
        programa: null,
        user_id: session.user.id,
      };
      setMentoradaInfo(info);
    });
  }, []);

  useEffect(() => {
    if (!mentoradaInfo?.id) return;
    setCarregandoHistorico(true);
    fetch(`/api/checkins?mentorada_id=${mentoradaInfo.id}`)
      .then((r) => r.json())
      .then((data: CheckIn[]) => {
        const lista = Array.isArray(data) ? data : [];
        setHistorico(lista);
        if (lista.length > 0 && !filtroMes) {
          setFiltroMes(mesAnoKey(lista[0].criado_em));
        }
        setCarregandoHistorico(false);
      });
  }, [mentoradaInfo?.id]);

  async function enviar() {
    if (!sentimento) return;
    setEnviando(true);
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: mentoradaInfo?.user_id ?? null,
        mentorada_id: mentoradaInfo?.id ?? null,
        nome: mentoradaInfo?.nome ?? "Mentorada",
        programa: mentoradaInfo?.programa ?? null,
        humor: sentimento,
        texto: texto.trim() || null,
        semana: semanaAtual(),
      }),
    });
    setEnviando(false);
    setEnviado(true);
    // Recarrega histórico
    if (mentoradaInfo?.id) {
      fetch(`/api/checkins?mentorada_id=${mentoradaInfo.id}`)
        .then((r) => r.json())
        .then((data: CheckIn[]) => {
          if (Array.isArray(data)) {
            setHistorico(data);
            setFiltroMes(mesAnoKey(data[0]?.criado_em ?? new Date().toISOString()));
          }
        });
    }
  }

  // Meses com check-ins, do mais recente
  const mesesUnicos = [...new Set(historico.map((c) => mesAnoKey(c.criado_em)))].sort((a, b) => b.localeCompare(a));
  const checkinsDoMes = historico.filter((c) => mesAnoKey(c.criado_em) === filtroMes);
  const media = checkinsDoMes.length > 0
    ? checkinsDoMes.reduce((s, c) => s + c.humor, 0) / checkinsDoMes.length
    : 0;
  const tendencia = checkinsDoMes.length >= 2
    ? checkinsDoMes[0].humor - checkinsDoMes[checkinsDoMes.length - 1].humor
    : 0;

  function labelMes(key: string) {
    const [ano, mes] = key.split("-");
    return `${MESES_FULL[parseInt(mes) - 1]} de ${ano}`;
  }
  function labelMesCurto(key: string) {
    const [ano, mes] = key.split("-");
    return `${MESES_SHORT[parseInt(mes) - 1]} ${ano}`;
  }

  if (perfil.carregando) return null;

  // Tela de confirmação após envio
  if (enviado) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={28} style={{ color: "#86efac" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>Check-in enviado! ✨</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Izabor recebeu como você está chegando nesta semana.<br />
          Ela está orando por você. Continue firme na jornada!
        </p>
        <div className="card" style={{ padding: "16px 20px", background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 6px" }}>
            &ldquo;O que você gera no secreto com Deus é o que te sustenta em público.&rdquo;
          </p>
          <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => { setEnviado(false); setSentimento(null); setTexto(""); }}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
          >
            Novo check-in
          </button>
          <button
            onClick={() => { setEnviado(false); setSentimento(null); setTexto(""); setAba("evolucao"); }}
            style={{ background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Ver minha evolução
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="club_bw" ativo={!!perfil.produtosAtivos?.club_bw}>
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Semanal</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Check-in da Semana</h1>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-input)", borderRadius: 10, padding: 4 }}>
        {([
          { key: "checkin", label: "Como estou hoje", icon: <Activity size={13} /> },
          { key: "evolucao", label: "Minha evolução", icon: <BarChart2 size={13} /> },
        ] as { key: "checkin" | "evolucao"; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setAba(t.key)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: aba === t.key ? 700 : 400, background: aba === t.key ? "var(--bg-card)" : "transparent", color: aba === t.key ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s" }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Aba: Como estou hoje */}
      {aba === "checkin" && (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Como você está chegando nesta semana?</p>

          <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Como você está se sentindo hoje?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setSentimento(i + 1)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 6px", borderRadius: 10, background: sentimento === i + 1 ? "var(--gold-light)" : "var(--bg-input)", border: `2px solid ${sentimento === i + 1 ? "var(--gold)" : "var(--border)"}`, cursor: "pointer", transition: "all 0.2s" }}
                >
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <span style={{ fontSize: 9, color: sentimento === i + 1 ? "var(--gold)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>{LABELS[i]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              O que está pesando ou alegrando esta semana? <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
            </p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Pode compartilhar livremente aqui..."
              rows={4}
              style={{ width: "100%", padding: "12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
            />
          </div>

          <button
            onClick={enviar}
            disabled={!sentimento || enviando}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: !sentimento ? "rgba(201,168,76,0.3)" : "var(--gold)", cursor: !sentimento ? "not-allowed" : "pointer", color: "#000", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {enviando ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</> : "Enviar meu check-in ✨"}
          </button>
        </>
      )}

      {/* Aba: Minha evolução */}
      {aba === "evolucao" && (
        <>
          {carregandoHistorico ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, gap: 10, color: "var(--text-muted)" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Carregando sua jornada...</span>
            </div>
          ) : historico.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>
              <BarChart2 size={28} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>Você ainda não fez nenhum check-in.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Faça o primeiro hoje e comece a acompanhar sua evolução!</p>
              <button onClick={() => setAba("checkin")} style={{ marginTop: 16, background: "var(--gold)", border: "none", color: "#000", padding: "9px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                Fazer check-in agora
              </button>
            </div>
          ) : (
            <>
              {/* Filtro de mês */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {mesesUnicos.map((m) => {
                  const ativo = filtroMes === m;
                  return (
                    <button key={m} onClick={() => setFiltroMes(m)}
                      style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: ativo ? 700 : 400, cursor: "pointer", border: ativo ? "1px solid var(--gold)" : "1px solid var(--border)", background: ativo ? "var(--gold-light)" : "transparent", color: ativo ? "var(--gold)" : "var(--text-muted)" }}
                    >
                      {labelMesCurto(m)}
                    </button>
                  );
                })}
              </div>

              {/* Resumo do mês */}
              {checkinsDoMes.length > 0 && (
                <div className="card" style={{ padding: "20px 24px", marginBottom: 20, background: "linear-gradient(135deg, #111111 0%, #0d1117 100%)", borderLeft: "3px solid var(--gold)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                    Relatório de {labelMes(filtroMes)}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {/* Média */}
                    <div style={{ textAlign: "center", padding: "12px 8px", background: "var(--bg-input)", borderRadius: 8 }}>
                      <p style={{ fontSize: 22, margin: "0 0 4px" }}>{EMOJIS[Math.round(media) - 1] ?? "😐"}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: sentimentoColor(Math.round(media)), margin: "0 0 2px" }}>{LABELS[Math.round(media) - 1] ?? "Regular"}</p>
                      <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>Média do mês</p>
                    </div>
                    {/* Quantidade */}
                    <div style={{ textAlign: "center", padding: "12px 8px", background: "var(--bg-input)", borderRadius: 8 }}>
                      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--gold)", margin: "0 0 4px" }}>{checkinsDoMes.length}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>check-in{checkinsDoMes.length !== 1 ? "s" : ""}</p>
                      <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>Neste mês</p>
                    </div>
                    {/* Tendência */}
                    <div style={{ textAlign: "center", padding: "12px 8px", background: "var(--bg-input)", borderRadius: 8 }}>
                      {checkinsDoMes.length >= 2 ? (
                        <>
                          <p style={{ fontSize: 22, margin: "0 0 4px" }}>
                            {tendencia > 0 ? "📈" : tendencia < 0 ? "📉" : "➡️"}
                          </p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: tendencia > 0 ? "#86efac" : tendencia < 0 ? "#fca5a5" : "#fcd34d", margin: "0 0 2px" }}>
                            {tendencia > 0 ? "Melhorando" : tendencia < 0 ? "Oscilando" : "Estável"}
                          </p>
                          <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>Tendência</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: 22, margin: "0 0 4px" }}>⭐</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>Primeiro</p>
                          <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>check-in</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timeline de emojis */}
                  {checkinsDoMes.length > 1 && (
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Sua jornada no mês</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
                        {[...checkinsDoMes].reverse().map((c, idx, arr) => (
                          <div key={c.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <span style={{ fontSize: 18 }} title={`${LABELS[c.humor - 1]} — ${formatarDataCurta(c.criado_em)}`}>{EMOJIS[c.humor - 1]}</span>
                              <span style={{ fontSize: 8, color: "var(--text-muted)" }}>{formatarDataCurta(c.criado_em)}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div style={{ width: 20, height: 1, background: "var(--border)", flexShrink: 0, margin: "0 2px 10px" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de check-ins do mês */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {checkinsDoMes.map((c) => (
                  <div key={c.id} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid ${sentimentoColor(c.humor)}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: c.texto ? 10 : 0 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{EMOJIS[c.humor - 1]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: sentimentoColor(c.humor), margin: "0 0 2px" }}>{LABELS[c.humor - 1]}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={10} style={{ color: "var(--text-muted)" }} />
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatarDataCurta(c.criado_em)}</span>
                          </div>
                          {c.semana && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>· {c.semana}</span>}
                        </div>
                      </div>
                      {/* Barra de nível */}
                      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                        {[1,2,3,4,5].map((n) => (
                          <div key={n} style={{ width: 4, height: n <= c.humor ? 12 : 6, borderRadius: 2, background: n <= c.humor ? sentimentoColor(c.humor) : "var(--border)", alignSelf: "flex-end" }} />
                        ))}
                      </div>
                    </div>
                    {c.texto && (
                      <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6, margin: 0, fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        &ldquo;{c.texto}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                  💛 Cada check-in é um registro da sua jornada. Izabor acompanha sua evolução semana a semana.
                </p>
              </div>
            </>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
    </BloqueadoPorProduto>
  );
}
