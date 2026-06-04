"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Video, Clock, Calendar, X, CheckCircle, Loader2 } from "lucide-react";

type Mentorada = { id: string; nome: string; cor: string };

type Sessao = {
  id: string;
  mentorada_id: string | null;
  mentorada_nome: string;
  cor: string;
  data: string;
  duracao: string;
  resumo: string | null;
  acoes: string[];
  gravacao: string | null;
  status: "realizada" | "agendada" | "faltou" | "remarcada";
  criado_em: string;
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
  return `${dia}/${mes}/${ano}`;
}

export default function SessoesPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoInput, setAcaoInput] = useState("");
  const [form, setForm] = useState({
    mentorada_id: "",
    mentorada_nome: "",
    data: "",
    duracao: "60 min",
    status: "agendada" as Sessao["status"],
    resumo: "",
    acoes: [] as string[],
    gravacao: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sessoes").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([sess, ment]) => {
      setSessoes(Array.isArray(sess) ? sess : []);
      setMentoradas(Array.isArray(ment) ? ment : []);
      setCarregando(false);
    });
  }, []);

  function abrirModal() {
    setForm({ mentorada_id: "", mentorada_nome: "", data: "", duracao: "60 min", status: "agendada", resumo: "", acoes: [], gravacao: "" });
    setAcaoInput("");
    setModalAberto(true);
  }

  function selecionarMentorada(id: string) {
    const m = mentoradas.find((x) => x.id === id);
    setForm((f) => ({ ...f, mentorada_id: id, mentorada_nome: m?.nome ?? "" }));
  }

  function adicionarAcao() {
    if (!acaoInput.trim()) return;
    setForm((f) => ({ ...f, acoes: [...f.acoes, acaoInput.trim()] }));
    setAcaoInput("");
  }

  function removerAcao(i: number) {
    setForm((f) => ({ ...f, acoes: f.acoes.filter((_, idx) => idx !== i) }));
  }

  async function salvar() {
    if (!form.mentorada_nome || !form.data) return;
    setSalvando(true);
    const mentorada = mentoradas.find((m) => m.id === form.mentorada_id);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorada_id: form.mentorada_id || null,
        mentorada_nome: form.mentorada_nome,
        cor: mentorada?.cor ?? "#C9A84C",
        data: form.data,
        duracao: form.duracao,
        status: form.status,
        resumo: form.resumo || null,
        acoes: form.acoes,
        gravacao: form.gravacao || null,
      }),
    });
    const nova = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro ao salvar: " + nova.error); return; }
    setSessoes((prev) => [nova, ...prev]);
    setModalAberto(false);
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando sessões...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ClipboardList size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Mentoradas</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Histórico de Sessões</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Registre o que foi trabalhado em cada encontro.</p>
        </div>
        <button
          onClick={abrirModal}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "var(--gold)", border: "none", cursor: "pointer", color: "#000", fontSize: 13, fontWeight: 700 }}
        >
          <Plus size={15} /> Nova Sessão
        </button>
      </div>

      {sessoes.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <ClipboardList size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma sessão registrada ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Nova Sessão&quot; para começar.</p>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sessoes.map((s) => {
          const st = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.agendada;
          return (
            <div key={s.id} className="card" style={{ padding: "20px 24px", borderLeft: `3px solid ${s.cor}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.cor + "20", border: `1px solid ${s.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: s.cor, fontWeight: 700, flexShrink: 0 }}>
                      {s.mentorada_nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.mentorada_nome}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatarData(s.data)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duracao}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                  </div>

                  {s.resumo && <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, margin: "0 0 12px" }}>{s.resumo}</p>}

                  {s.acoes && s.acoes.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Próximas Ações</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {s.acoes.map((a, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.cor, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.status === "agendada" && !s.resumo && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Sessão ainda não realizada.</p>
                  )}
                </div>

                {s.gravacao && (
                  <a
                    href={s.gravacao}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontSize: 11, cursor: "pointer", fontWeight: 600, flexShrink: 0, textDecoration: "none" }}
                  >
                    <Video size={12} /> Ver gravação
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Sessão */}
      {modalAberto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}
        >
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ClipboardList size={16} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Nova Sessão</span>
              </div>
              <button onClick={() => setModalAberto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Mentorada */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Mentorada *</label>
                <select
                  value={form.mentorada_id}
                  onChange={(e) => selecionarMentorada(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: form.mentorada_id ? "var(--text)" : "var(--text-muted)", fontSize: 13, outline: "none" }}
                >
                  <option value="">Selecione a mentorada</option>
                  {mentoradas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              {/* Data + Duração */}
              <div className="form-grid-2">
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Data *</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", minWidth: 0, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Duração</label>
                  <select
                    value={form.duracao}
                    onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                  >
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                    <option>90 min</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 600 }}>Status</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(Object.keys(STATUS_CONFIG) as Sessao["status"][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      style={{
                        padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: `1px solid ${form.status === s ? STATUS_CONFIG[s].color : "var(--border)"}`,
                        background: form.status === s ? STATUS_CONFIG[s].bg : "var(--bg-input)",
                        color: form.status === s ? STATUS_CONFIG[s].color : "var(--text-muted)",
                      }}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Resumo da sessão</label>
                <textarea
                  value={form.resumo}
                  onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
                  placeholder="O que foi trabalhado neste encontro..."
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                />
              </div>

              {/* Próximas ações */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Próximas Ações</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={acaoInput}
                    onChange={(e) => setAcaoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarAcao(); } }}
                    placeholder="Escreva uma ação e pressione Enter"
                    style={{ flex: 1, padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                  />
                  <button onClick={adicionarAcao} style={{ padding: "9px 14px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 8, cursor: "pointer", color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
                {form.acoes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {form.acoes.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <CheckCircle size={13} style={{ color: "var(--gold)", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: "var(--text-soft)" }}>{a}</span>
                        <button onClick={() => removerAcao(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link gravação */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Link da gravação <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="url"
                  value={form.gravacao}
                  onChange={(e) => setForm((f) => ({ ...f, gravacao: e.target.value }))}
                  placeholder="https://zoom.us/rec/..."
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                />
              </div>

              {/* Botões */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => setModalAberto(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={!form.mentorada_nome || !form.data || salvando}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, background: !form.mentorada_nome || !form.data ? "rgba(201,168,76,0.3)" : "var(--gold)", border: "none", cursor: !form.mentorada_nome || !form.data ? "not-allowed" : "pointer", color: "#000", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {salvando ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : "Salvar Sessão"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
