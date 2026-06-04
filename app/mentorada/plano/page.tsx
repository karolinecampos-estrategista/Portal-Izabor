"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Marco = { id: string; texto: string; feito: boolean; semana: string; ordem: number };
type Plano = { id: string; mentorada_nome: string; cor: string; programa: string; marcos: Marco[] };

export default function PlanoMentoradaPage() {
  const [plano, setPlano] = useState<Plano | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }

      const { data: mentorada } = await supabase
        .from("mentoradas")
        .select("id, nome")
        .eq("user_id", session.user.id)
        .single();

      if (!mentorada) { setCarregando(false); return; }

      const res = await fetch("/api/planos");
      const planos: Plano[] = await res.json();
      const meuPlano = planos.find(
        (p) => p.mentorada_nome === mentorada.nome
      ) ?? null;
      setPlano(meuPlano);
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando plano...</span>
      </div>
    );
  }

  if (!plano) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FileText size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Minha Jornada</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Meu Plano de Ação</h1>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Seu plano de ação ainda não foi criado.</p>
          <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
            A Izabor vai criar seu plano personalizado após as primeiras sessões.
          </p>
        </div>
      </div>
    );
  }

  const marcosOrdenados = [...(plano.marcos ?? [])].sort((a, b) => a.ordem - b.ordem);
  const feitos = marcosOrdenados.filter((m) => m.feito).length;
  const prog = marcosOrdenados.length > 0 ? Math.round((feitos / marcosOrdenados.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <FileText size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Minha Jornada</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Meu Plano de Ação</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Os marcos que você vai conquistar nesta mentoria.</p>
      </div>

      {/* Progresso */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Progresso da Jornada</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>{prog}%</span>
        </div>
        <div style={{ height: 8, background: "var(--bg-input)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${prog}%`, background: "var(--gold)", borderRadius: 999, transition: "width 0.4s" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          {feitos} de {marcosOrdenados.length} marcos conquistados — {plano.programa}
        </p>
      </div>

      {/* Marcos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {marcosOrdenados.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: m.feito ? "rgba(201,168,76,0.07)" : "var(--bg-card)",
              border: `1px solid ${m.feito ? "rgba(201,168,76,0.25)" : "var(--border)"}`,
              borderRadius: 10,
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {m.feito ? (
                <CheckCircle size={20} style={{ color: "var(--gold)" }} />
              ) : (
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={11} style={{ color: "var(--text-muted)" }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: m.feito ? 500 : 600, margin: 0, color: m.feito ? "var(--text-soft)" : "var(--text)", textDecoration: m.feito ? "line-through" : "none" }}>
                {m.texto}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "3px 0 0" }}>{m.semana}</p>
            </div>
            {m.feito && (
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "rgba(201,168,76,0.15)", color: "var(--gold)", fontWeight: 700, border: "1px solid var(--gold-border)", flexShrink: 0 }}>
                ✓ Conquistado
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "16px 20px", background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
        <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 6px" }}>
          &ldquo;Deus te dá a visão, mas a construção é sua. Cada marco que você conquista é uma declaração de fé em ação.&rdquo;
        </p>
        <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
