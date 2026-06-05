"use client";

import { useState, useEffect } from "react";
import { CreditCard, MessageCircle, Loader2, CheckCircle2, Calendar, Sparkles, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProdutoInvestimento {
  chave: string;
  nome: string;
  tipo: string;
  emoji: string;
  cor: string;
  dataCompra?: string | null;
  mesInicio?: string | null;
  mesFim?: string | null;
  statusAcesso?: string | null;
  statusPagamento?: string | null;
  valor?: number | null;
  formaPagamento?: string | null;
}

const PG_CFG: Record<string, { label: string; cor: string; bg: string }> = {
  pago:     { label: "Pago",     cor: "#86efac", bg: "rgba(134,239,172,0.10)" },
  parcial:  { label: "Parcial",  cor: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  pendente: { label: "Pendente", cor: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
  isento:   { label: "Isento",   cor: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
};

const FORMA_LABEL: Record<string, string> = {
  pix:           "PIX",
  cartao_credito: "Cartão de Crédito",
  boleto:        "Boleto",
  transferencia: "Transferência",
  cortesia:      "Cortesia",
};

function formatarData(iso: string | null | undefined) {
  if (!iso) return null;
  const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function StatusBadge({ status, cor }: { status: string | null | undefined; cor: string }) {
  const map: Record<string, { label: string; c: string; bg: string }> = {
    ativo:    { label: "Ativa", c: "#86efac", bg: "rgba(134,239,172,0.12)" },
    ativa:    { label: "Ativa", c: "#86efac", bg: "rgba(134,239,172,0.12)" },
    entregue: { label: "Entregue", c: "#86efac", bg: "rgba(134,239,172,0.12)" },
    enviado:  { label: "Enviado", c: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
    pendente: { label: "Pendente", c: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  };
  const cfg = map[status ?? "ativo"] ?? { label: status ?? "Ativo", c: cor, bg: cor + "20" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: cfg.c, background: cfg.bg }}>
      <CheckCircle2 size={9} /> {cfg.label}
    </span>
  );
}

export default function MeuInvestimento() {
  const [produtos, setProdutos] = useState<ProdutoInvestimento[]>([]);
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }
      const res = await fetch("/api/meu-investimento", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setProdutos(d.produtos ?? []);
        setNome(d.nome ?? "");
      }
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <CreditCard size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Minha Área</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meus Pagamentos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Resumo do seu investimento com a Izabor Cruz.
        </p>
      </div>

      {/* Produtos adquiridos */}
      {produtos.length === 0 ? (
        <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <Sparkles size={32} style={{ color: "var(--gold)", opacity: 0.4, marginBottom: 14 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>Nenhum produto ativo ainda</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
            Quando você adquirir um programa, ele aparecerá aqui.
          </p>
          <a href="/mentorada/produtos" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Ver programas disponíveis
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {produtos.map(p => (
            <div key={p.chave} style={{ padding: "22px 24px", borderRadius: 16, border: `1px solid ${p.cor}30`, background: `linear-gradient(135deg, var(--bg-card) 0%, ${p.cor}06 100%)` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{p.emoji}</span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: p.cor, margin: 0 }}>{p.nome}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{p.tipo}</p>
                  </div>
                </div>
                <StatusBadge status={p.statusAcesso} cor={p.cor} />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: p.statusPagamento ? 14 : 0 }}>
                {p.dataCompra && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Data de aquisição</p>
                      <p style={{ fontSize: 13, color: "var(--text)", margin: 0, fontWeight: 600 }}>{formatarData(p.dataCompra)}</p>
                    </div>
                  </div>
                )}
                {p.mesInicio && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Período</p>
                      <p style={{ fontSize: 13, color: "var(--text)", margin: 0, fontWeight: 600 }}>
                        {p.mesInicio}{p.mesFim ? ` → ${p.mesFim}` : " em diante"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Situação do pagamento */}
              {p.statusPagamento && (
                <div style={{ borderTop: `1px solid ${p.cor}18`, paddingTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <DollarSign size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pagamento</p>
                  </div>
                  {(() => {
                    const pg = PG_CFG[p.statusPagamento] ?? PG_CFG.pendente;
                    return (
                      <>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: pg.cor, background: pg.bg }}>
                          {pg.label}
                        </span>
                        {p.valor != null && (
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                            R$ {Number(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {p.formaPagamento && (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            via {FORMA_LABEL[p.formaPagamento] ?? p.formaPagamento}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Aviso + contato */}
      <div style={{ padding: "18px 20px", borderRadius: 12, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
        <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 12px", lineHeight: 1.6 }}>
          Dúvidas sobre pagamentos, notas fiscais ou cancelamentos? Fale direto com a Izabor.
        </p>
        <a
          href="/mentorada/chat"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
        >
          <MessageCircle size={14} /> Falar com o Suporte
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
