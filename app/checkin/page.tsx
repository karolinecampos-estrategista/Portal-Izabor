"use client";

import { useEffect, useState } from "react";
import {
  Activity, TrendingUp, TrendingDown, Minus, Loader2,
  Phone, Mail, Instagram, X, Calendar, MessageSquare, ChevronDown, ChevronUp,
} from "lucide-react";

type CheckIn = {
  id: string;
  nome: string;
  programa: string | null;
  humor: number;
  semana: string | null;
  texto: string | null;
  criado_em: string;
  mentoradas?: {
    id: string | null;
    nome: string | null;
    cor: string;
    whatsapp: string | null;
    email: string | null;
    instagram: string | null;
    programa: string | null;
    status: string | null;
    aniversario: string | null;
  } | null;
};

const EMOJIS = ["😔", "😟", "😐", "🙂", "🤩"];
const LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Incrível!"];

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function humorColor(h: number) {
  if (h <= 2) return "#fca5a5";
  if (h === 3) return "#fcd34d";
  return "#86efac";
}

function HumorIcon({ h }: { h: number }) {
  if (h <= 2) return <TrendingDown size={14} style={{ color: "#fca5a5" }} />;
  if (h === 3) return <Minus size={14} style={{ color: "#fcd34d" }} />;
  return <TrendingUp size={14} style={{ color: "#86efac" }} />;
}

function diasAtras(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `${dias}d atrás`;
}

function iniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function mesAno(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mesAnoLabel(key: string) {
  const [ano, mes] = key.split("-");
  return `${MESES[parseInt(mes) - 1]} ${ano}`;
}

function mesAnoLabelFull(key: string) {
  const [ano, mes] = key.split("-");
  return `${MESES_FULL[parseInt(mes) - 1]} de ${ano}`;
}

function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CheckinAdminPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [detalhe, setDetalhe] = useState<CheckIn | null>(null);
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/checkins")
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        setCheckins(lista);
        // Abre o mês mais recente por padrão
        if (lista.length > 0) {
          const primeiro = mesAno(lista[0].criado_em);
          setMesesAbertos(new Set([primeiro]));
          setFiltroMes(primeiro);
        }
        setCarregando(false);
      });
  }, []);

  // Meses únicos ordenados do mais recente
  const mesesUnicos = [...new Set(checkins.map((c) => mesAno(c.criado_em)))].sort((a, b) => b.localeCompare(a));

  // Check-ins filtrados
  const filtrados = filtroMes === "todos"
    ? checkins
    : checkins.filter((c) => mesAno(c.criado_em) === filtroMes);

  // Agrupados por mês
  const agrupados: Record<string, CheckIn[]> = {};
  filtrados.forEach((c) => {
    const k = mesAno(c.criado_em);
    if (!agrupados[k]) agrupados[k] = [];
    agrupados[k].push(c);
  });
  const mesesVisiveis = Object.keys(agrupados).sort((a, b) => b.localeCompare(a));

  function toggleMes(m: string) {
    setMesesAbertos((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando check-ins...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Club BW</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Check-in Semanal</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Como suas extraordinárias estão chegando — clique em qualquer card para ver detalhes e entrar em contato.</p>
      </div>

      {checkins.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Activity size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum check-in recebido ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>As mentoradas respondem no portal delas e os dados aparecem aqui.</p>
        </div>
      ) : (
        <>
          {/* Filtro por mês */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button
              onClick={() => setFiltroMes("todos")}
              style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: filtroMes === "todos" ? 700 : 400, cursor: "pointer", border: filtroMes === "todos" ? "1px solid var(--gold)" : "1px solid var(--border)", background: filtroMes === "todos" ? "var(--gold-light)" : "transparent", color: filtroMes === "todos" ? "var(--gold)" : "var(--text-muted)" }}
            >
              Todos ({checkins.length})
            </button>
            {mesesUnicos.map((m) => {
              const count = checkins.filter((c) => mesAno(c.criado_em) === m).length;
              const ativo = filtroMes === m;
              return (
                <button key={m} onClick={() => { setFiltroMes(m); setMesesAbertos(new Set([m])); }}
                  style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: ativo ? 700 : 400, cursor: "pointer", border: ativo ? "1px solid var(--gold)" : "1px solid var(--border)", background: ativo ? "var(--gold-light)" : "transparent", color: ativo ? "var(--gold)" : "var(--text-muted)" }}
                >
                  {mesAnoLabel(m)} ({count})
                </button>
              );
            })}
          </div>

          {/* Check-ins agrupados por mês */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {mesesVisiveis.map((mes) => {
              const aberto = mesesAbertos.has(mes);
              const lista = agrupados[mes];
              return (
                <div key={mes}>
                  {/* Cabeçalho do mês — clicável para colapsar */}
                  <button
                    onClick={() => toggleMes(mes)}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "8px 0", marginBottom: aberto ? 12 : 0, textAlign: "left" }}
                  >
                    <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {mesAnoLabelFull(mes)} · {lista.length} check-in{lista.length !== 1 ? "s" : ""}
                    </span>
                    <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
                    {aberto ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                  </button>

                  {aberto && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
                      {lista.map((c) => {
                        const cor = c.mentoradas?.cor ?? "#C9A84C";
                        return (
                          <div
                            key={c.id}
                            onClick={() => setDetalhe(c)}
                            className="card"
                            style={{ padding: "18px", cursor: "pointer", transition: "border-color 0.15s", borderColor: "var(--border)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = cor + "60")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                          >
                            {/* Cabeçalho do card */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: cor + "20", border: `1px solid ${cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: cor, fontWeight: 700, flexShrink: 0 }}>
                                {iniciais(c.mentoradas?.nome ?? c.nome)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {c.mentoradas?.nome ?? c.nome}
                                </p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
                                  {c.semana ?? "Esta semana"} · {diasAtras(c.criado_em)}
                                </p>
                              </div>
                              <HumorIcon h={c.humor} />
                            </div>

                            {/* Humor */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-input)", borderRadius: 8, marginBottom: c.texto ? 10 : 0 }}>
                              <span style={{ fontSize: 18 }}>{EMOJIS[c.humor - 1]}</span>
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: humorColor(c.humor), margin: 0 }}>{LABELS[c.humor - 1]}</p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Como está se sentindo: {c.humor}/5</p>
                              </div>
                            </div>

                            {/* Texto (truncado) */}
                            {c.texto && (
                              <p style={{ fontSize: 11, color: "var(--text-soft)", lineHeight: 1.5, margin: "10px 0 0", fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                &ldquo;{c.texto}&rdquo;
                              </p>
                            )}

                            {/* Indicador de contatos */}
                            {(c.mentoradas?.whatsapp || c.mentoradas?.email) && (
                              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "10px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                                <Phone size={9} /> Clique para ver contatos e detalhes
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              💡 As mentoradas respondem o check-in no portal delas. Clique em qualquer card para ver os dados completos e entrar em contato.
            </p>
          </div>
        </>
      )}

      {/* Modal de Detalhe */}
      {detalhe && (() => {
        const m = detalhe.mentoradas;
        const cor = m?.cor ?? "#C9A84C";
        const nomeExibir = m?.nome ?? detalhe.nome;
        const temContato = m?.whatsapp || m?.email || m?.instagram;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setDetalhe(null); }}
          >
            <div style={{ background: "var(--bg-card)", border: `1px solid ${cor}30`, borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)", background: `linear-gradient(135deg, ${cor}08 0%, transparent 100%)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: cor + "20", border: `2px solid ${cor}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: cor, fontWeight: 700, flexShrink: 0 }}>
                    {iniciais(nomeExibir)}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>{nomeExibir}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {m?.programa && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: cor + "15", color: cor, fontWeight: 700, border: `1px solid ${cor}30` }}>{m.programa}</span>}
                      {m?.status && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.status}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Metadados do check-in */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatarData(detalhe.criado_em)}</span>
                  </div>
                  {detalhe.semana && (
                    <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--bg-input)", borderRadius: 6, color: "var(--text-muted)" }}>{detalhe.semana}</span>
                  )}
                </div>

                {/* Como está se sentindo */}
                <div style={{ padding: "16px", background: "var(--bg-input)", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 36 }}>{EMOJIS[detalhe.humor - 1]}</span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: humorColor(detalhe.humor), margin: "0 0 4px" }}>{LABELS[detalhe.humor - 1]}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Como está se sentindo: {detalhe.humor}/5</p>
                  </div>
                </div>

                {/* O que ela compartilhou */}
                {detalhe.texto ? (
                  <div style={{ padding: "14px 16px", background: "var(--bg-input)", borderRadius: 10, borderLeft: `3px solid ${cor}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <MessageSquare size={12} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>O que ela compartilhou</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                      &ldquo;{detalhe.texto}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>Nenhuma mensagem adicional neste check-in.</p>
                )}

                {/* Dados extras da mentorada */}
                {m?.aniversario && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8 }}>
                    <span style={{ fontSize: 16 }}>🎂</span>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aniversário</p>
                      <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{new Date(m.aniversario + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</p>
                    </div>
                  </div>
                )}

                {/* Contatos — sempre exibir a seção */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Entrar em contato
                  </p>

                  {!m ? (
                    <div style={{ padding: "14px 16px", background: "rgba(252,165,165,0.07)", border: "1px solid rgba(252,165,165,0.2)", borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: "#fca5a5", margin: "0 0 4px", fontWeight: 600 }}>Mentorada não vinculada</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                        Este check-in foi enviado antes do vínculo por UUID. Atualize o cadastro da mentorada e ela aparecerá corretamente.
                      </p>
                    </div>
                  ) : !temContato ? (
                    <div style={{ padding: "14px 16px", background: "rgba(253,211,77,0.06)", border: "1px solid rgba(253,211,77,0.2)", borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: "#fcd34d", margin: "0 0 4px", fontWeight: 600 }}>Nenhum contato cadastrado</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px" }}>
                        Cadastre o WhatsApp, e-mail ou Instagram desta mentorada para ter acesso rápido aqui.
                      </p>
                      <a href="/mentorandas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#fcd34d", textDecoration: "none", padding: "6px 12px", background: "rgba(253,211,77,0.1)", border: "1px solid rgba(253,211,77,0.2)", borderRadius: 6 }}>
                        Atualizar cadastro →
                      </a>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {m.whatsapp && (
                        <a
                          href={`https://wa.me/55${m.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.2)", color: "#86efac", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                        >
                          <Phone size={16} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>Abrir WhatsApp</p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{m.whatsapp}</p>
                          </div>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(134,239,172,0.6)" }}>↗</span>
                        </a>
                      )}
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                        >
                          <Mail size={16} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>Enviar e-mail</p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{m.email}</p>
                          </div>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(201,168,76,0.6)" }}>↗</span>
                        </a>
                      )}
                      {m.instagram && (
                        <a
                          href={`https://instagram.com/${m.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(249,168,212,0.08)", border: "1px solid rgba(249,168,212,0.2)", color: "#f9a8d4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                        >
                          <Instagram size={16} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>Ver Instagram</p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{m.instagram}</p>
                          </div>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(249,168,212,0.6)" }}>↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
