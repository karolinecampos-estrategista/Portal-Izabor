"use client";

import { useState, useEffect, useMemo } from "react";
import { Stethoscope, ChevronDown, ChevronUp, Calendar, Loader2, Phone, Mail, Instagram, Users, RefreshCw } from "lucide-react";

type RespostaItem = { pergunta: string; resposta: string };

type MentoradaInfo = {
  id: string | null;
  nome: string | null;
  cor: string;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  programa: string | null;
  status: string | null;
};

type Diagnostico = {
  id: string;
  nome: string;
  email: string | null;
  programa: string | null;
  perfil: string | null;
  cor: string;
  foco: string[];
  respostas: RespostaItem[];
  criado_em: string;
  mentoradas?: MentoradaInfo | null;
};

type Grupo = {
  key: string;
  nome: string;
  cor: string;
  mentorada: MentoradaInfo | null;
  historico: Diagnostico[];
};

const PERFIL_COR: Record<string, string> = {
  restaura: "#93c5fd",
  encontra: "#C9A84C",
  floresc:  "#86efac",
};

function perfilCor(perfil: string | null) {
  if (!perfil) return "#C9A84C";
  const lower = perfil.toLowerCase();
  if (lower.includes("restaura")) return PERFIL_COR.restaura;
  if (lower.includes("encontra")) return PERFIL_COR.encontra;
  if (lower.includes("floresc"))  return PERFIL_COR.floresc;
  return "#C9A84C";
}

function iniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DiagnosticosAdminPage() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<string>("todas");
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/diagnosticos")
      .then((r) => r.json())
      .then((data) => {
        setDiagnosticos(Array.isArray(data) ? data : []);
        setCarregando(false);
      });
  }, []);

  // Agrupar por mentorada (key = mentoradas.id ?? nome)
  const grupos: Grupo[] = useMemo(() => {
    const map = new Map<string, Grupo>();
    for (const d of diagnosticos) {
      const key = d.mentoradas?.id ?? d.nome;
      if (!map.has(key)) {
        map.set(key, {
          key,
          nome: d.mentoradas?.nome ?? d.nome,
          cor: d.mentoradas?.cor ?? d.cor,
          mentorada: d.mentoradas ?? null,
          historico: [],
        });
      }
      map.get(key)!.historico.push(d);
    }
    return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [diagnosticos]);

  const gruposFiltrados = filtro === "todas" ? grupos : grupos.filter((g) => g.key === filtro);

  function toggleDiag(id: string) {
    setAbertos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalPorPerfil = {
    restauracao: diagnosticos.filter((d) => d.perfil?.toLowerCase().includes("restaura")).length,
    encontrando: diagnosticos.filter((d) => d.perfil?.toLowerCase().includes("encontra")).length,
    florescendo: diagnosticos.filter((d) => d.perfil?.toLowerCase().includes("floresc")).length,
  };

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando diagnósticos...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Stethoscope size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Mentoradas</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Diagnósticos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Veja de onde cada mentorada está partindo — emocional, espiritual e pessoal.
        </p>
      </div>

      {/* Resumo por perfil */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Precisam de restauração", valor: totalPorPerfil.restauracao, cor: "#93c5fd" },
          { label: "Estão se encontrando",    valor: totalPorPerfil.encontrando, cor: "#C9A84C" },
          { label: "Estão florescendo",        valor: totalPorPerfil.florescendo, cor: "#86efac" },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: item.cor, margin: "0 0 4px", lineHeight: 1 }}>{item.valor}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {diagnosticos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Stethoscope size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum diagnóstico recebido ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>As mentoradas respondem o diagnóstico no portal delas e os dados aparecem aqui.</p>
        </div>
      ) : (
        <>
          {/* Filtro por mentorada */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 4 }}>
              <Users size={13} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Filtrar:</span>
            </div>
            <button
              onClick={() => setFiltro("todas")}
              style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: filtro === "todas" ? 700 : 400, cursor: "pointer", border: filtro === "todas" ? "1px solid var(--gold)" : "1px solid var(--border)", background: filtro === "todas" ? "var(--gold-light)" : "transparent", color: filtro === "todas" ? "var(--gold)" : "var(--text-muted)" }}
            >
              Todas ({grupos.length})
            </button>
            {grupos.map((g) => {
              const ativo = filtro === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => setFiltro(ativo ? "todas" : g.key)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: ativo ? 700 : 400, cursor: "pointer", border: ativo ? `1px solid ${g.cor}` : "1px solid var(--border)", background: ativo ? g.cor + "15" : "transparent", color: ativo ? g.cor : "var(--text-muted)" }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: g.cor, flexShrink: 0 }} />
                  {g.nome}
                  {g.historico.length > 1 && (
                    <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 999, background: ativo ? g.cor + "30" : "var(--bg-input)", color: ativo ? g.cor : "var(--text-muted)" }}>
                      {g.historico.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lista por grupo/mentorada */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {gruposFiltrados.map((grupo) => {
              const m = grupo.mentorada;
              const temContato = m?.whatsapp || m?.email || m?.instagram;
              const ultimoDiag = grupo.historico[0];

              return (
                <div key={grupo.key} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", borderLeft: `3px solid ${grupo.cor}` }}>

                  {/* Card da mentorada */}
                  <div style={{ padding: "18px 20px", background: `linear-gradient(135deg, ${grupo.cor}06 0%, transparent 100%)`, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: grupo.cor + "20", border: `2px solid ${grupo.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: grupo.cor, fontWeight: 700, flexShrink: 0 }}>
                          {iniciais(grupo.nome)}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{grupo.nome}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {m?.programa && (
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: grupo.cor + "15", color: grupo.cor, border: `1px solid ${grupo.cor}30`, fontWeight: 600 }}>{m.programa}</span>
                            )}
                            {grupo.historico.length > 0 && ultimoDiag.perfil && (
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: perfilCor(ultimoDiag.perfil) + "15", color: perfilCor(ultimoDiag.perfil), border: `1px solid ${perfilCor(ultimoDiag.perfil)}30` }}>
                                {ultimoDiag.perfil}
                              </span>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <RefreshCw size={10} style={{ color: "var(--text-muted)" }} />
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{grupo.historico.length} diagnóstico{grupo.historico.length !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contatos rápidos */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {m?.whatsapp && (
                          <a href={`https://wa.me/55${m.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            title={`WhatsApp: ${m.whatsapp}`}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.2)", color: "#86efac", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >
                            <Phone size={13} /> <span style={{ display: "none" }}>WhatsApp</span>
                            <span style={{ fontSize: 11 }}>{m.whatsapp}</span>
                          </a>
                        )}
                        {m?.email && (
                          <a href={`mailto:${m.email}`}
                            title={m.email}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >
                            <Mail size={13} />
                            <span style={{ fontSize: 11 }}>{m.email}</span>
                          </a>
                        )}
                        {m?.instagram && (
                          <a href={`https://instagram.com/${m.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "rgba(249,168,212,0.08)", border: "1px solid rgba(249,168,212,0.2)", color: "#f9a8d4", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >
                            <Instagram size={13} />
                            <span style={{ fontSize: 11 }}>{m.instagram}</span>
                          </a>
                        )}
                        {!temContato && m && (
                          <a href="/mentorandas" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, background: "rgba(253,211,77,0.06)", border: "1px solid rgba(253,211,77,0.15)", color: "#fcd34d", fontSize: 11, textDecoration: "none" }}>
                            Cadastrar contatos →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Histórico de diagnósticos */}
                  <div style={{ padding: "0 20px 16px" }}>
                    {grupo.historico.length > 1 && (
                      <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "14px 0 10px" }}>
                        Histórico — {grupo.historico.length} diagnósticos
                      </p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: grupo.historico.length > 1 ? 0 : 14 }}>
                      {grupo.historico.map((d, idx) => {
                        const isAberto = abertos.has(d.id);
                        const cor = perfilCor(d.perfil);
                        return (
                          <div key={d.id} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                            <button
                              onClick={() => toggleDiag(d.id)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                            >
                              {/* Indicador de mais recente */}
                              {idx === 0 && grupo.historico.length > 1 && (
                                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(134,239,172,0.12)", color: "#86efac", border: "1px solid rgba(134,239,172,0.2)", fontWeight: 700, flexShrink: 0, textTransform: "uppercase" }}>Recente</span>
                              )}
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <Calendar size={11} style={{ color: "var(--text-muted)" }} />
                                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatarData(d.criado_em)}</span>
                                </div>
                                {d.perfil && (
                                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: cor + "15", color: cor, border: `1px solid ${cor}30`, fontWeight: 600 }}>
                                    {d.perfil}
                                  </span>
                                )}
                                {d.foco.length > 0 && (
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.foco.length} focos definidos</span>
                                )}
                              </div>
                              {isAberto
                                ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                            </button>

                            {isAberto && (
                              <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                                {d.foco.length > 0 && (
                                  <div style={{ marginTop: 14, marginBottom: 14 }}>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Focos principais</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      {d.foco.map((f, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: cor + "0D", borderRadius: 6, border: `1px solid ${cor}20` }}>
                                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: cor, flexShrink: 0 }} />
                                          <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{f}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {d.respostas.length > 0 && (
                                  <div>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>Respostas</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      {d.respostas.map((r, i) => (
                                        <div key={i} style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 600 }}>{r.pergunta}</p>
                                          <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0, fontStyle: "italic" }}>&ldquo;{r.resposta}&rdquo;</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
