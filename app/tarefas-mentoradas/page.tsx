"use client";

import { useState, useEffect } from "react";
import {
  ListTodo, Plus, X, CheckCircle2, Circle, Clock,
  Send, ChevronDown, ChevronUp, Trash2, Loader2, Pencil,
} from "lucide-react";

type TipoTarefa = "acao" | "reflexao" | "leitura" | "pratica";

interface Mentorada {
  id: string;
  nome: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoTarefa | null;
  mentorada_id: string | null;
  mentorada_nome: string | null;
  data_entrega: string | null;
  status: string;
  criado_em: string;
}

const tipoConfig: Record<TipoTarefa, { label: string; cor: string; bg: string; emoji: string }> = {
  acao:     { label: "Ação",     cor: "#C9A84C", bg: "rgba(201,168,76,0.12)",   emoji: "⚡" },
  reflexao: { label: "Reflexão", cor: "#a78bfa", bg: "rgba(167,139,250,0.12)",  emoji: "💭" },
  leitura:  { label: "Leitura",  cor: "#93c5fd", bg: "rgba(147,197,253,0.12)",  emoji: "📖" },
  pratica:  { label: "Prática",  cor: "#86efac", bg: "rgba(134,239,172,0.12)",  emoji: "🎯" },
};

const FORM_VAZIO = {
  titulo: "", descricao: "", tipo: "acao" as TipoTarefa,
  mentorada_id: "", data_entrega: "",
};

function formatarData(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)]}`;
}

function prazoVencido(iso: string) {
  if (!iso) return false;
  return new Date(iso) < new Date(new Date().toISOString().split("T")[0]);
}

function isConcluida(status: string) {
  return status.toLowerCase().replace("í","i").includes("conclu");
}

function TarefaForm({
  titulo, mentoradas, form, setForm, onEnviar, onCancelar, salvando, modoEdicao,
}: {
  titulo: string;
  mentoradas: Mentorada[];
  form: typeof FORM_VAZIO;
  setForm: (f: typeof FORM_VAZIO) => void;
  onEnviar: () => void;
  onCancelar: () => void;
  salvando: boolean;
  modoEdicao: boolean;
}) {
  return (
    <div className="card" style={{ padding: "20px 22px", marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{titulo}</p>
        <button onClick={onCancelar} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <input
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          style={{ padding: "10px 12px", fontSize: 13, width: "100%" }}
          placeholder="O que você quer que ela faça?"
        />
        <textarea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          style={{ padding: "10px 12px", fontSize: 13, width: "100%", minHeight: 70, resize: "vertical" }}
          placeholder="Detalhe como ela deve executar..."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Tipo</p>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoTarefa })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
              <option value="acao">⚡ Ação</option>
              <option value="reflexao">💭 Reflexão</option>
              <option value="leitura">📖 Leitura</option>
              <option value="pratica">🎯 Prática</option>
            </select>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Para quem</p>
            <select
              value={form.mentorada_id}
              onChange={(e) => setForm({ ...form, mentorada_id: e.target.value })}
              style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
            >
              <option value="">✨ Todas as BW</option>
              {mentoradas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Prazo</p>
            <input
              type="date"
              value={form.data_entrega}
              onChange={(e) => setForm({ ...form, data_entrega: e.target.value })}
              style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-gold flex items-center gap-2" onClick={onEnviar} disabled={salvando || !form.titulo.trim()}>
            {salvando ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
            {salvando ? "Salvando..." : modoEdicao ? "Salvar alterações" : "Enviar Tarefa"}
          </button>
          <button onClick={onCancelar} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function TarefasMentoradas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEdicao, setFormEdicao] = useState(FORM_VAZIO);
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "concluida">("todas");
  const [expandida, setExpandida] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tarefas").then((r) => r.json()),
      fetch("/api/mentoradas").then((r) => r.json()),
    ]).then(([tarefData, mentData]) => {
      setTarefas(Array.isArray(tarefData) ? tarefData : []);
      setMentoradas(Array.isArray(mentData) ? mentData.map((m: { id: string; nome: string }) => ({ id: m.id, nome: m.nome })) : []);
      setCarregando(false);
    });
  }, []);

  const filtradas = tarefas.filter((t) => {
    if (filtro === "pendente")  return !isConcluida(t.status);
    if (filtro === "concluida") return isConcluida(t.status);
    return true;
  });
  const pendentes  = tarefas.filter((t) => !isConcluida(t.status)).length;
  const concluidas = tarefas.filter((t) => isConcluida(t.status)).length;

  async function enviar() {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    const res = await fetch("/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo:       form.titulo,
        descricao:    form.descricao  || null,
        tipo:         form.tipo,
        mentorada_id: form.mentorada_id || null,
        data_entrega: form.data_entrega || null,
        status:       "Pendente",
      }),
    });
    const raw = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setTarefas((prev) => [raw, ...prev]);
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  function abrirEdicao(t: Tarefa) {
    setFormEdicao({
      titulo:       t.titulo,
      descricao:    t.descricao  ?? "",
      tipo:         (t.tipo ?? "acao") as TipoTarefa,
      mentorada_id: t.mentorada_id ?? "",
      data_entrega: t.data_entrega ?? "",
    });
    setEditandoId(t.id);
    setExpandida(null);
  }

  async function salvarEdicao() {
    if (!editandoId || !formEdicao.titulo.trim()) return;
    setSalvando(true);
    const res = await fetch("/api/tarefas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:           editandoId,
        titulo:       formEdicao.titulo,
        descricao:    formEdicao.descricao  || null,
        tipo:         formEdicao.tipo,
        mentorada_id: formEdicao.mentorada_id || null,
        data_entrega: formEdicao.data_entrega || null,
      }),
    });
    const raw = await res.json();
    setSalvando(false);
    if (!res.ok) { alert("Erro: " + raw.error); return; }
    setTarefas((prev) => prev.map((t) => t.id === editandoId ? { ...t, ...raw } : t));
    setEditandoId(null);
    setFormEdicao(FORM_VAZIO);
  }

  async function toggleStatus(id: string, statusAtual: string) {
    const novoStatus = isConcluida(statusAtual) ? "Pendente" : "Concluída";
    setTarefas((prev) => prev.map((t) => t.id === id ? { ...t, status: novoStatus } : t));
    await fetch("/api/tarefas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: novoStatus }),
    });
  }

  async function deletar(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    await fetch(`/api/tarefas?id=${id}`, { method: "DELETE" });
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <ListTodo size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tarefas</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Tarefas para Mentoradas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Ações, reflexões, leituras e práticas atribuídas individualmente ou para todas.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); }}>
          <Plus size={14} /> Nova Tarefa
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total",      value: tarefas.length, color: "var(--text-muted)" },
          { label: "Pendentes",  value: pendentes,      color: "#fde047" },
          { label: "Concluídas", value: concluidas,     color: "#86efac" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        {(["todas", "pendente", "concluida"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: filtro === f ? "1px solid var(--gold-border)" : "1px solid var(--border)", background: filtro === f ? "var(--gold-light)" : "transparent", color: filtro === f ? "var(--gold)" : "var(--text-muted)", transition: "all 0.15s" }}>
            {f === "todas" ? "Todas" : f === "pendente" ? "Pendentes" : "Concluídas"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{filtradas.length} tarefa{filtradas.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Form nova tarefa */}
      {mostrarForm && !editandoId && (
        <TarefaForm
          titulo="Nova Tarefa"
          mentoradas={mentoradas}
          form={form}
          setForm={setForm}
          onEnviar={enviar}
          onCancelar={() => { setMostrarForm(false); setForm(FORM_VAZIO); }}
          salvando={salvando}
          modoEdicao={false}
        />
      )}

      {tarefas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <ListTodo size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma tarefa criada ainda.</p>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtradas.map((t) => {
          const cfg       = tipoConfig[t.tipo ?? "acao"] ?? tipoConfig.acao;
          const aberta    = expandida === t.id;
          const concluida = isConcluida(t.status);
          const vencida   = !concluida && prazoVencido(t.data_entrega ?? "");
          const destino   = t.mentorada_nome ?? "Todas as BW";
          const editando  = editandoId === t.id;

          return (
            <div key={t.id}>
              {/* Form de edição inline */}
              {editando && (
                <TarefaForm
                  titulo="Editar Tarefa"
                  mentoradas={mentoradas}
                  form={formEdicao}
                  setForm={setFormEdicao}
                  onEnviar={salvarEdicao}
                  onCancelar={() => { setEditandoId(null); setFormEdicao(FORM_VAZIO); }}
                  salvando={salvando}
                  modoEdicao={true}
                />
              )}

              <div className="card" style={{ padding: "13px 16px", opacity: concluida ? 0.65 : 1, border: vencida ? "1px solid rgba(252,165,165,0.25)" : editando ? "1px solid var(--gold-border)" : "1px solid var(--border)", transition: "opacity 0.2s" }}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(t.id, t.status)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, paddingTop: 2 }}>
                    {concluida ? <CheckCircle2 size={16} style={{ color: "#86efac" }} /> : <Circle size={16} style={{ color: "var(--text-muted)" }} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: cfg.bg, color: cfg.cor }}>{cfg.emoji} {cfg.label}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 500, background: destino === "Todas as BW" ? "rgba(201,168,76,0.1)" : "var(--bg-input)", color: destino === "Todas as BW" ? "var(--gold)" : "var(--text-muted)", border: "1px solid var(--border)" }}>
                        {destino === "Todas as BW" ? "✨ Todas as BW" : destino.split(" ")[0]}
                      </span>
                      {vencida && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(252,165,165,0.1)", color: "#fca5a5" }}>Vencida</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: concluida ? "var(--text-muted)" : "var(--text)", textDecoration: concluida ? "line-through" : "none" }}>{t.titulo}</p>
                    {aberta && t.descricao && <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 6, lineHeight: 1.6 }}>{t.descricao}</p>}
                    <div className="flex items-center gap-3" style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1"><Clock size={9} /> {new Date(t.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      {t.data_entrega && <span style={{ color: vencida ? "#fca5a5" : "var(--text-muted)" }}>Prazo: {formatarData(t.data_entrega)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                    {t.descricao && (
                      <button onClick={() => setExpandida(aberta ? null : t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 3 }}>
                        {aberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    <button
                      onClick={() => abrirEdicao(t)}
                      title="Editar tarefa"
                      style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 3, opacity: 0.7 }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deletar(t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 3, opacity: 0.5 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
