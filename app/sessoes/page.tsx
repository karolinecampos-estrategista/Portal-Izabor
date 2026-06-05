"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Video, Clock, Calendar, X, CheckCircle, Loader2, Pencil, Trash2, Link as LinkIcon, ExternalLink, NotebookPen } from "lucide-react";

type Mentorada = { id: string; nome: string; cor: string; acesso_club_bw: boolean; whatsapp: string | null; email: string | null };

type Sessao = {
  id: string;
  mentorada_id: string | null;
  mentorada_nome: string;
  cor: string;
  data: string;
  horario: string | null;
  duracao: string;
  status: "realizada" | "agendada" | "faltou" | "remarcada";
  link_meet: string | null;
  resumo: string | null;
  acoes: string[];
  gravacao: string | null;
  criado_em: string;
};

type FormData = {
  mentorada_id: string;
  mentorada_nome: string;
  data: string;
  horario: string;
  duracao: string;
  status: Sessao["status"];
  link_meet: string;
  resumo: string;
  acoes: string[];
  gravacao: string;
};

const FORM_VAZIO: FormData = {
  mentorada_id: "", mentorada_nome: "", data: "", horario: "", duracao: "60 min",
  status: "agendada", link_meet: "", resumo: "", acoes: [], gravacao: "",
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

function iniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function SessoesPage() {
  const [sessoes, setSessoes]         = useState<Sessao[]>([]);
  const [mentoradas, setMentoradas]   = useState<Mentorada[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [salvando, setSalvando]       = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [acaoInput, setAcaoInput]     = useState("");
  const [filtroMentorada, setFiltroMentorada] = useState("");
  const [form, setForm]               = useState<FormData>(FORM_VAZIO);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessoes").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([sess, ment]) => {
      setSessoes(Array.isArray(sess) ? sess : []);
      // Apenas Club BW
      setMentoradas(Array.isArray(ment) ? ment.filter((m: Mentorada) => m.acesso_club_bw) : []);
      setCarregando(false);
    });
  }, []);

  function abrirNova() {
    setForm(FORM_VAZIO);
    setAcaoInput("");
    setEditandoId(null);
    setModalAberto(true);
  }

  function abrirEdicao(s: Sessao) {
    setForm({
      mentorada_id: s.mentorada_id ?? "",
      mentorada_nome: s.mentorada_nome,
      data: s.data,
      horario: s.horario ?? "",
      duracao: s.duracao,
      status: s.status,
      link_meet: s.link_meet ?? "",
      resumo: s.resumo ?? "",
      acoes: s.acoes ?? [],
      gravacao: s.gravacao ?? "",
    });
    setAcaoInput("");
    setEditandoId(s.id);
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
    const payload = {
      mentorada_id:   form.mentorada_id || null,
      mentorada_nome: form.mentorada_nome,
      cor:            mentorada?.cor ?? "#a78bfa",
      data:           form.data,
      horario:        form.horario || null,
      duracao:        form.duracao,
      status:         form.status,
      link_meet:      form.link_meet || null,
      resumo:         form.resumo || null,
      acoes:          form.acoes,
      gravacao:       form.gravacao || null,
    };

    let res: Response;
    if (editandoId) {
      res = await fetch("/api/sessoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editandoId, ...payload }) });
    } else {
      res = await fetch("/api/sessoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }

    const json = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro ao salvar: " + json.error); return; }

    if (editandoId) {
      setSessoes((prev) => prev.map((s) => s.id === editandoId ? json : s));
    } else {
      setSessoes((prev) => [json, ...prev]);
    }
    setModalAberto(false);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta sessão?")) return;
    await fetch(`/api/sessoes?id=${id}`, { method: "DELETE" });
    setSessoes((prev) => prev.filter((s) => s.id !== id));
  }

  const lista = filtroMentorada
    ? sessoes.filter((s) => s.mentorada_id === filtroMentorada)
    : sessoes;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando sessões...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ClipboardList size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Club BW</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Sessões</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Agende calls, registre relatórios e tarefas para cada aluna.</p>
        </div>
        <button
          onClick={abrirNova}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "var(--gold)", border: "none", cursor: "pointer", color: "#000", fontSize: 13, fontWeight: 700 }}
        >
          <Plus size={15} /> Agendar Call
        </button>
      </div>

      {/* Filtro por mentorada */}
      {mentoradas.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFiltroMentorada("")}
            style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: filtroMentorada === "" ? 700 : 400, cursor: "pointer", border: filtroMentorada === "" ? "1px solid var(--gold)" : "1px solid var(--border)", background: filtroMentorada === "" ? "var(--gold-light)" : "transparent", color: filtroMentorada === "" ? "var(--gold)" : "var(--text-muted)" }}
          >
            Todas ({sessoes.length})
          </button>
          {mentoradas.map((m) => {
            const count = sessoes.filter((s) => s.mentorada_id === m.id).length;
            const ativo = filtroMentorada === m.id;
            return (
              <button key={m.id} onClick={() => setFiltroMentorada(m.id)}
                style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: ativo ? 700 : 400, cursor: "pointer", border: ativo ? `1px solid ${m.cor}` : "1px solid var(--border)", background: ativo ? m.cor + "18" : "transparent", color: ativo ? m.cor : "var(--text-muted)" }}
              >
                {m.nome.split(" ")[0]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <ClipboardList size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma sessão registrada.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Clique em &quot;Agendar Call&quot; para começar.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {lista.map((s) => {
            const st = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.agendada;
            return (
              <div key={s.id} className="card" style={{ padding: "20px 24px", borderLeft: `3px solid ${s.cor}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Cabeçalho */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.cor + "20", border: `1px solid ${s.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: s.cor, fontWeight: 700, flexShrink: 0 }}>
                        {iniciais(s.mentorada_nome)}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.mentorada_nome}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={11} style={{ color: "var(--text-muted)" }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatarData(s.data)}{s.horario ? ` às ${s.horario}` : ""}</span>
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

                    {/* Link Meet */}
                    {s.link_meet && (
                      <a href={s.link_meet} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.25)", color: "#93c5fd", fontSize: 11, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}
                      >
                        <Video size={12} /> Entrar na Call · Meet
                      </a>
                    )}

                    {/* Relatório */}
                    {s.resumo && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                          <NotebookPen size={10} /> Relatório da call
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>{s.resumo}</p>
                      </div>
                    )}

                    {/* Tarefas */}
                    {s.acoes && s.acoes.length > 0 && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Tarefas para a aluna</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {s.acoes.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <CheckCircle size={11} style={{ color: s.cor, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {s.status === "agendada" && !s.resumo && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginTop: 4 }}>
                        Call agendada. Edite para adicionar relatório e tarefas após o encontro.
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => abrirEdicao(s)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}
                    >
                      <Pencil size={11} /> Editar
                    </button>
                    <button onClick={() => excluir(s.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "transparent", border: "1px solid rgba(252,165,165,0.3)", cursor: "pointer", color: "#fca5a5", fontSize: 11, fontWeight: 600 }}
                    >
                      <Trash2 size={11} /> Excluir
                    </button>
                    {s.gravacao && (
                      <a href={s.gravacao} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                      >
                        <ExternalLink size={11} /> Gravação
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}
        >
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ClipboardList size={16} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>{editandoId ? "Editar Sessão" : "Agendar Call"}</span>
              </div>
              <button onClick={() => setModalAberto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Mentorada */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Aluna Club BW *</label>
                <select
                  value={form.mentorada_id}
                  onChange={(e) => selecionarMentorada(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: form.mentorada_id ? "var(--text)" : "var(--text-muted)", fontSize: 13, outline: "none" }}
                >
                  <option value="">Selecione a aluna</option>
                  {mentoradas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              {/* Data + Horário */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Data *</label>
                  <input type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Horário</label>
                  <input type="time" value={form.horario} onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Duração + Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Duração</label>
                  <select value={form.duracao} onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                  >
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                    <option>90 min</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Sessao["status"] }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                  >
                    {(Object.keys(STATUS_CONFIG) as Sessao["status"][]).map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link Meet */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  <LinkIcon size={11} style={{ display: "inline", marginRight: 4 }} />
                  Link do Meet <span style={{ fontWeight: 400 }}>(a aluna receberá este link no portal)</span>
                </label>
                <input type="url" value={form.link_meet} onChange={(e) => setForm((f) => ({ ...f, link_meet: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                />
              </div>

              {/* Relatório da call */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Relatório da call <span style={{ fontWeight: 400 }}>(preencha após o encontro)</span>
                </label>
                <textarea value={form.resumo} onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
                  placeholder="O que foi trabalhado neste encontro..."
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                />
              </div>

              {/* Tarefas */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Tarefas para a aluna <span style={{ fontWeight: 400 }}>(a aluna verá estas tarefas no portal)</span>
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="text" value={acaoInput} onChange={(e) => setAcaoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarAcao(); } }}
                    placeholder="Escreva uma tarefa e pressione Enter"
                    style={{ flex: 1, padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                  />
                  <button onClick={adicionarAcao}
                    style={{ padding: "9px 14px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 8, cursor: "pointer", color: "var(--gold)", fontSize: 13, fontWeight: 600 }}
                  >+ Add</button>
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

              {/* Gravação */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Link da gravação <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                <input type="url" value={form.gravacao} onChange={(e) => setForm((f) => ({ ...f, gravacao: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
                />
              </div>

              {/* Botões */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => setModalAberto(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}
                >Cancelar</button>
                <button onClick={salvar} disabled={!form.mentorada_nome || !form.data || salvando}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, background: !form.mentorada_nome || !form.data ? "rgba(201,168,76,0.3)" : "var(--gold)", border: "none", cursor: !form.mentorada_nome || !form.data ? "not-allowed" : "pointer", color: "#000", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {salvando ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : editandoId ? "Salvar Alterações" : "Agendar Call"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
