"use client";

import { TrendingUp, CheckCircle2, Clock, CreditCard, FileText, Smartphone } from "lucide-react";

type StatusParcela = "pago" | "pendente" | "vencido";

type Parcela = {
  numero: number;
  vencimento: string;
  valor: number;
  status: StatusParcela;
  dataPagamento?: string;
};

const CONTRATO = {
  programa: "Mentoria BW — 6 meses",
  valorTotal: 5000,
  formaPagamento: "Parcelado no cartão",
  totalParcelas: 6,
  dataInicio: "01 Mar 2026",
  dataFim: "31 Ago 2026",
  parcelas: [
    { numero: 1, vencimento: "01 Mar 2026", valor: 834, status: "pago", dataPagamento: "01 Mar 2026" },
    { numero: 2, vencimento: "01 Abr 2026", valor: 834, status: "pago", dataPagamento: "01 Abr 2026" },
    { numero: 3, vencimento: "01 Mai 2026", valor: 834, status: "pago", dataPagamento: "02 Mai 2026" },
    { numero: 4, vencimento: "01 Jun 2026", valor: 834, status: "pendente" },
    { numero: 5, vencimento: "01 Jul 2026", valor: 832, status: "pendente" },
    { numero: 6, vencimento: "01 Ago 2026", valor: 832, status: "pendente" },
  ] as Parcela[],
};

const statusConfig: Record<StatusParcela, { cor: string; bg: string; label: string; icone: React.ReactNode }> = {
  pago:     { cor: "#86efac", bg: "rgba(134,239,172,0.1)", label: "Pago",    icone: <CheckCircle2 size={13} /> },
  pendente: { cor: "#C9A84C", bg: "rgba(201,168,76,0.1)", label: "Pendente", icone: <Clock size={13} /> },
  vencido:  { cor: "#fca5a5", bg: "rgba(239,68,68,0.1)",  label: "Vencido",  icone: <Clock size={13} /> },
};

const pagasConta = CONTRATO.parcelas.filter((p) => p.status === "pago");
const totalPago = pagasConta.reduce((s, p) => s + p.valor, 0);
const totalRestante = CONTRATO.valorTotal - totalPago;
const progresso = Math.round((pagasConta.length / CONTRATO.totalParcelas) * 100);

export default function FinanceiroPagamento() {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <TrendingUp size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meus Pagamentos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Acompanhe o status do pagamento do seu programa.
        </p>
      </div>

      {/* Card do contrato */}
      <div
        className="card glow-gold"
        style={{
          padding: "22px 24px",
          marginBottom: 20,
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "var(--gold)" }}>{CONTRATO.programa}</p>
            <div className="flex items-center gap-2">
              <CreditCard size={12} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{CONTRATO.formaPagamento}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>Valor total</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", margin: 0 }}>
              R$ {CONTRATO.valorTotal.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Progresso */}
        <div style={{ marginBottom: 14 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {pagasConta.length} de {CONTRATO.totalParcelas} parcelas pagas
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#86efac" }}>{progresso}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${progresso}%`, background: "linear-gradient(90deg, #86efac, #4ade80)" }} />
          </div>
        </div>

        {/* Resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={{ padding: "10px 12px", background: "rgba(134,239,172,0.08)", borderRadius: 8, border: "1px solid rgba(134,239,172,0.2)" }}>
            <p style={{ fontSize: 10, color: "#86efac", margin: "0 0 3px", fontWeight: 600 }}>PAGO</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#86efac", margin: 0 }}>
              R$ {totalPago.toLocaleString("pt-BR")}
            </p>
          </div>
          <div style={{ padding: "10px 12px", background: "rgba(201,168,76,0.08)", borderRadius: 8, border: "1px solid var(--gold-border)" }}>
            <p style={{ fontSize: 10, color: "var(--gold)", margin: "0 0 3px", fontWeight: 600 }}>RESTANTE</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: 0 }}>
              R$ {totalRestante.toLocaleString("pt-BR")}
            </p>
          </div>
          <div style={{ padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 3px", fontWeight: 600 }}>VIGÊNCIA</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)", margin: 0 }}>{CONTRATO.dataInicio}</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>até {CONTRATO.dataFim}</p>
          </div>
        </div>
      </div>

      {/* Tabela de parcelas */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <FileText size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Histórico de Parcelas</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Cabeçalho */}
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 120px", gap: 12, padding: "6px 12px" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>#</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Vencimento</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Valor</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Status</span>
          </div>

          {CONTRATO.parcelas.map((p) => {
            const cfg = statusConfig[p.status];
            return (
              <div
                key={p.numero}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr 120px",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: p.status === "pago" ? "rgba(134,239,172,0.05)" : "var(--bg-input)",
                  border: p.status === "pago" ? "1px solid rgba(134,239,172,0.12)" : "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{p.numero}ª</span>
                <div>
                  <p style={{ fontSize: 12, margin: 0, color: "var(--text-soft)" }}>{p.vencimento}</p>
                  {p.dataPagamento && p.status === "pago" && (
                    <p style={{ fontSize: 10, margin: "1px 0 0", color: "var(--text-muted)" }}>Pago em {p.dataPagamento}</p>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: p.status === "pago" ? "#86efac" : "var(--text)" }}>
                  R$ {p.valor.toLocaleString("pt-BR")}
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  color: cfg.cor,
                  background: cfg.bg,
                  border: `1px solid ${cfg.cor}30`,
                }}>
                  {cfg.icone} {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forma de pagamento */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <CreditCard size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Forma de Pagamento</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg-input)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Cartão de Crédito</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>6x de R$ 834,00 · Cobrança automática todo dia 1</p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "12px 0 0", lineHeight: 1.5 }}>
          Em caso de dúvidas sobre pagamentos, entre em contato pelo <strong style={{ color: "var(--text-soft)" }}>chat</strong> ou diretamente com a Izabor.
        </p>
      </div>
    </div>
  );
}
