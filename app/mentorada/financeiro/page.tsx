"use client";

import { useState, useEffect } from "react";
import { TrendingUp, MessageCircle, CreditCard, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FinanceiroPagamento() {
  const [verificando, setVerificando] = useState(true);
  const [liberado, setLiberado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setVerificando(false); return; }
      const res = await fetch("/api/perfil", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const p = await res.json();
        setLiberado(p.mostrarFinanceiro ?? false);
      }
      setVerificando(false);
    });
  }, []);

  if (verificando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!liberado) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <TrendingUp size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meus Pagamentos</h1>
        </div>
        <div className="card" style={{ padding: "48px 32px", textAlign: "center", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Lock size={22} style={{ color: "var(--gold)" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>
            Financeiro não disponível
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
            O histórico financeiro ainda não foi liberado para você. Em caso de dúvidas sobre pagamentos, fale com a Izabor.
          </p>
          <Link
            href="/mentorada/chat"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            <MessageCircle size={14} /> Falar com a Izabor
          </Link>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <TrendingUp size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financeiro</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meus Pagamentos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Acompanhe o status do seu investimento na mentoria.
        </p>
      </div>

      <div className="card glow-gold" style={{ padding: "40px 32px", marginBottom: 20, background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CreditCard size={22} style={{ color: "var(--gold)" }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>Histórico financeiro em breve</p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 24px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
          Em breve você poderá acompanhar aqui o status das suas parcelas e histórico de pagamentos.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>
          Dúvidas? Entre em contato com a Izabor pelo chat.
        </p>
      </div>

      <Link href="/mentorada/chat" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
        <MessageCircle size={16} /> Falar com a Izabor no chat
      </Link>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
