"use client";

import { useState } from "react";
import { TrendingUp, CheckCircle2, Clock, AlertCircle, CreditCard, DollarSign, Plus, X, ArrowDownLeft, ArrowUpRight, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

type StatusPag = "em-dia" | "atrasado" | "concluido";
type TipoLancamento = "pagamento" | "parcela" | "reembolso" | "ajuste";

interface ContratoAluna {
  id: number;
  nome: string;
  programa: string;
  valorTotal: number;
  valorPago: number;
  parcelas: number;
  parcelasPagas: number;
  proximoVencimento: string;
  status: StatusPag;
  formaPagamento: string;
  cor: string;
}

interface Lancamento {
  id: number;
  mentorandaNome: string;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  descricao: string;
}

const CONTRATOS: ContratoAluna[] = [
  { id: 1, nome: "Ana Paula Ferreira", programa: "Imersao BW",          valorTotal: 5000, valorPago: 2502, parcelas: 6,  parcelasPagas: 3, proximoVencimento: "01 Jun 2026", status: "em-dia",   formaPagamento: "Cartão",   cor: "#C9A84C" },
  { id: 2, nome: "Camila Souza",       programa: "Mentoria Individual", valorTotal: 3500, valorPago: 1750, parcelas: 4,  parcelasPagas: 2, proximoVencimento: "15 Jun 2026", status: "em-dia",   formaPagamento: "Parcelado", cor: "#a78bfa" },
  { id: 3, nome: "Fernanda Lima",      programa: "Club BW",             valorTotal: 1200, valorPago: 900,  parcelas: 12, parcelasPagas: 9, proximoVencimento: "01 Jun 2026", status: "em-dia",   formaPagamento: "Cartão",   cor: "#86efac" },
  { id: 4, nome: "Juliana Matos",      programa: "Mentoria Individual", valorTotal: 3000, valorPago: 1000, parcelas: 3,  parcelasPagas: 1, proximoVencimento: "10 Mai 2026", status: "atrasado", formaPagamento: "Boleto",   cor: "#93c5fd" },
  { id: 5, nome: "Renata Costa",       programa: "Imersao BW",          valorTotal: 4500, valorPago: 4500, parcelas: 5,  parcelasPagas: 5, proximoVencimento: "",            status: "concluido",formaPagamento: "Cartão",   cor: "#f9a8d4" },
  { id: 6, nome: "Patricia Alves",     programa: "Club BW",             valorTotal: 1200, valorPago: 500,  parcelas: 12, parcelasPagas: 5, proximoVencimento: "01 Jun 2026", status: "em-dia",   formaPagamento: "Hotmart",  cor: "#fca5a5" },
];

const LANCAMENTOS_INICIAL: Lancamento[] = [
  { id: 1, mentorandaNome: "Ana Paula Ferreira", tipo: "parcela",   valor: 834,  data: "2026-05-01", descricao: "3ª parcela — Imersao BW" },
  { id: 2, mentorandaNome: "Camila Souza",       tipo: "parcela",   valor: 875,  data: "2026-05-15", descricao: "2ª parcela — Mentoria Individual" },
  { id: 3, mentorandaNome: "Juliana Matos",      tipo: "pagamento", valor: 1000, data: "2026-04-10", descricao: "1ª parcela — Mentoria Individual" },
  { id: 4, mentorandaNome: "Patricia Alves",     tipo: "parcela",   valor: 100,  data: "2026-05-01", descricao: "5ª mensalidade Club BW" },
  { id: 5, mentorandaNome: "Fernanda Lima",      tipo: "parcela",   valor: 100,  data: "2026-05-01", descricao: "9ª mensalidade Club BW" },
];

const statusConfig: Record<StatusPag, { label: string; cor: string; bg: string; icone: React.ReactNode }> = {
  "em-dia":   { label: "Em dia",   cor: "#86efac", bg: "rgba(134,239,172,0.1)", icone: <CheckCircle2 size={12} /> },
  "atrasado": { label: "Atrasado", cor: "#fca5a5", bg: "rgba(239,68,68,0.1)",   icone: <AlertCircle size={12} /> },
  "concluido":{ label: "Pago",     cor: "#C9A84C", bg: "rgba(201,168,76,0.1)",  icone: <CheckCircle2 size={12} /> },
};

const tipoConfig: Record<TipoLancamento, { label: string; cor: string; bg: string; icone: React.ReactNode; sinal: "+" | "-" }> = {
  pagamento: { label: "Pagamento",  cor: "#86efac", bg: "rgba(134,239,172,0.1)", icone: <ArrowDownLeft size={12} />,  sinal: "+" },
  parcela:   { label: "Parcela",    cor: "#86efac", bg: "rgba(134,239,172,0.1)", icone: <ArrowDownLeft size={12} />,  sinal: "+" },
  reembolso: { label: "Reembolso",  cor: "#fca5a5", bg: "rgba(239,68,68,0.1)",   icone: <ArrowUpRight size={12} />,   sinal: "-" },
  ajuste:    { label: "Ajuste",     cor: "#fde047", bg: "rgba(253,224,71,0.1)",   icone: <SlidersHorizontal size={12} />, sinal: "+" },
};

const MENTORANDAS_NOMES = CONTRATOS.map((c) => c.nome);

function formatarData(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${meses[parseInt(m)]}`;
}

const FORM_VAZIO = { mentorandaNome: "", tipo: "pagamento" as TipoLancamento, valor: "", data: "", descricao: "" };

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(LANCAMENTOS_INICIAL);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [contratoAberto, setContratoAberto] = useState<number | null>(null);

  const totalRecebido = CONTRATOS.reduce((s, c) => s + c.valorPago, 0);
  const totalContratado = CONTRATOS.reduce((s, c) => s + c.valorTotal, 0);
  const totalPendente = totalContratado - totalRecebido;
  const atrasados = CONTRATOS.filter((c) => c.status === "atrasado").length;
  const totalLancamentos = lancamentos.filter((l) => l.tipo !== "reembolso").reduce((s, l) => s + l.valor, 0);

  function salvarLancamento() {
    if (!form.mentorandaNome || !form.valor || !form.data) return;
    const novo: Lancamento = {
      id: Date.now(),
      mentorandaNome: form.mentorandaNome,
      tipo: form.tipo,
      valor: Number(form.valor),
      data: form.data,
      descricao: form.descricao,
    };
    setLancamentos((prev) => [novo, ...prev].sort((a, b) => b.data.localeCompare(a.data)));
    setForm(FORM_VAZIO);
    setMostrarForm(false);
  }

  const lancamentosOrdenados = [...lancamentos].sort((a, b) => b.data.localeCompare(a.data));
  const contratoMap = Object.fromEntries(CONTRATOS.map((c) => [c.nome, c]));

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <TrendingUp size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Financeiro das Mentorias</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Contratos, pagamentos e lançamentos manuais.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus size={14} /> Novo Lançamento
        </button>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 24 }}>
        <div className="card glow-gold" style={{ padding: "16px 18px", background: "linear-gradient(135deg,#111 0%,#161208 100%)", border: "1px solid var(--gold-border)" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <DollarSign size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase" }}>Recebido</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", margin: 0 }}>
            R$ {totalRecebido.toLocaleString("pt-BR")}
          </p>
          <div className="progress-bar" style={{ marginTop: 8, height: 4 }}>
            <div className="progress-fill" style={{ width: `${(totalRecebido / totalContratado) * 100}%` }} />
          </div>
        </div>
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <Clock size={13} style={{ color: "#fde047" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>A Receber</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#fde047", margin: 0 }}>
            R$ {totalPendente.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <TrendingUp size={13} style={{ color: "#86efac" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Contratos</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#86efac", margin: 0 }}>
            R$ {totalContratado.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <AlertCircle size={13} style={{ color: "#fca5a5" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Atrasadas</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: atrasados > 0 ? "#fca5a5" : "var(--text-muted)", margin: 0 }}>
            {atrasados}
          </p>
        </div>
      </div>

      {/* ── FORM NOVO LANÇAMENTO ── */}
      {mostrarForm && (
        <div className="card" style={{ padding: "20px 22px", marginBottom: 24, border: "1px solid var(--gold-border)", background: "linear-gradient(135deg,#111 0%,#130f04 100%)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Registrar Lançamento
            </p>
            <button onClick={() => setMostrarForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Mentorada</p>
              <select value={form.mentorandaNome} onChange={(e) => setForm({ ...form, mentorandaNome: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
                <option value="">Selecionar...</option>
                {MENTORANDAS_NOMES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Tipo</p>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}>
                <option value="pagamento">Pagamento recebido</option>
                <option value="parcela">Parcela recebida</option>
                <option value="reembolso">Reembolso</option>
                <option value="ajuste">Ajuste / Desconto</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Valor (R$)</p>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
                placeholder="0,00"
              />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data</p>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Observação (opcional)</p>
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
              placeholder="Ex: 3ª parcela — cartão final 1234"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-gold flex items-center gap-2"
              onClick={salvarLancamento}
              disabled={!form.mentorandaNome || !form.valor || !form.data}
            >
              <Plus size={13} /> Registrar
            </button>
            <button onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── CONTRATOS ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <CreditCard size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Contratos por Aluna</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{CONTRATOS.length} alunas</span>
        </div>

        <div className="flex flex-col gap-2">
          {CONTRATOS.map((c) => {
            const cfg = statusConfig[c.status];
            const pct = Math.round((c.parcelasPagas / c.parcelas) * 100);
            const aberta = contratoAberto === c.id;
            return (
              <div
                key={c.id}
                className="card"
                style={{
                  overflow: "hidden",
                  border: c.status === "atrasado" ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)",
                }}
              >
                {/* Linha clicável */}
                <div
                  className="flex items-center gap-3"
                  style={{ padding: "13px 16px", cursor: "pointer", background: c.status === "atrasado" ? "rgba(239,68,68,0.03)" : "transparent" }}
                  onClick={() => setContratoAberto(aberta ? null : c.id)}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.cor + "20", color: c.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {c.nome.split(" ").map((n) => n[0]).join("").slice(0,2)}
                  </div>
                  {/* Nome + programa */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome}</p>
                    <span style={{ fontSize: 11, color: c.cor, fontWeight: 500 }}>{c.programa}</span>
                  </div>
                  {/* Mini progress */}
                  <div style={{ minWidth: 80, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right" }}>{c.parcelasPagas}/{c.parcelas} · {pct}%</span>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: c.cor }} />
                    </div>
                  </div>
                  {/* Status */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, color: cfg.cor, background: cfg.bg, border: `1px solid ${cfg.cor}30`, flexShrink: 0 }}>
                    {cfg.icone} {cfg.label}
                  </span>
                  {/* Chevron */}
                  <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {aberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {aberta && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "var(--bg-input)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14 }}>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Pago</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#86efac", margin: 0 }}>R$ {c.valorPago.toLocaleString("pt-BR")}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>de R$ {c.valorTotal.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Parcelas</p>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: c.cor }}>{c.parcelasPagas} de {c.parcelas}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{pct}% quitado</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Forma</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{c.formaPagamento}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Próx. Vencimento</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: c.status === "atrasado" ? "#fca5a5" : "var(--text)" }}>
                          {c.proximoVencimento || "—"}
                        </p>
                        {c.status === "atrasado" && (
                          <span style={{ fontSize: 10, color: "#fca5a5" }}>⚠ Em atraso</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>A Receber</p>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#fde047" }}>
                          R$ {(c.valorTotal - c.valorPago).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LANÇAMENTOS ── */}
      <div className="card" style={{ padding: "18px 20px", overflowX: "auto" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <RotateCcw size={13} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Lançamentos Registrados</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{lancamentos.length} entradas</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#86efac" }}>
            Total: R$ {totalLancamentos.toLocaleString("pt-BR")}
          </span>
        </div>

        {lancamentosOrdenados.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
            Nenhum lançamento registrado ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lancamentosOrdenados.map((l) => {
              const cfg = tipoConfig[l.tipo];
              const contrato = contratoMap[l.mentorandaNome];
              return (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 8,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Ícone */}
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.cor, flexShrink: 0 }}>
                    {cfg.icone}
                  </div>

                  {/* Mentorada + descrição */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{l.mentorandaNome.split(" ")[0]} {l.mentorandaNome.split(" ")[1]}</p>
                      {contrato && (
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999, background: contrato.cor + "15", color: contrato.cor, fontWeight: 600, whiteSpace: "nowrap" }}>{contrato.programa}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: cfg.bg, color: cfg.cor, fontWeight: 600, whiteSpace: "nowrap" }}>{cfg.label}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatarData(l.data)}</span>
                      {l.descricao && <span style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.descricao}</span>}
                    </div>
                  </div>

                  {/* Valor */}
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.sinal === "+" ? "#86efac" : "#fca5a5", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {cfg.sinal} R$ {l.valor.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
