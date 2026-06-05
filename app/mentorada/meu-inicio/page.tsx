"use client";

import { useState, useEffect } from "react";
import { Sunrise, Star, Crown, Heart, Instagram, Youtube, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Marco = { id: string; texto: string; feito: boolean; semana: string; ordem: number };
type Plano = { id: string; mentorada_nome: string; programa: string; marcos: Marco[] };

export default function MeuInicio() {
  const [plano, setPlano] = useState<Plano | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [dataInicio, setDataInicio] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }

      const { data: mentorada } = await supabase
        .from("mentoradas")
        .select("nome, criado_em")
        .eq("user_id", session.user.id)
        .single();

      if (mentorada?.criado_em) {
        const d = new Date(mentorada.criado_em);
        setDataInicio(d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
      }

      if (mentorada?.nome) {
        const res = await fetch("/api/planos");
        const planos: Plano[] = await res.json();
        const meuPlano = planos.find((p) => p.mentorada_nome === mentorada.nome) ?? null;
        setPlano(meuPlano);
      }

      setCarregando(false);
    });
  }, []);

  const marcosOrdenados = [...(plano?.marcos ?? [])].sort((a, b) => a.ordem - b.ordem);
  const feitos = marcosOrdenados.filter((m) => m.feito).length;
  const prog = marcosOrdenados.length > 0 ? Math.round((feitos / marcosOrdenados.length) * 100) : 0;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Sunrise size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meu Começo</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meu Começo na Mentoria</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Registre de onde você saiu para saber o quão longe chegou.
        </p>
      </div>

      {/* Card de início */}
      <div
        className="card glow-gold"
        style={{
          padding: "24px",
          marginBottom: 24,
          background: "linear-gradient(135deg, #111111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <Sunrise size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Meu Começo</span>
          {dataInicio && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 999, marginLeft: "auto" }}>
              {dataInicio.charAt(0).toUpperCase() + dataInicio.slice(1)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
          Você começou sua jornada Build Woman. Este é o seu ponto de partida — cada passo daqui para frente é uma declaração de fé em ação.
        </p>
      </div>

      {/* Plano de ação / marcos */}
      {marcosOrdenados.length > 0 ? (
        <div className="card" style={{ padding: "20px 22px", marginBottom: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Minha Linha do Tempo</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{feitos}/{marcosOrdenados.length} marcos</span>
          </div>

          {/* Progresso */}
          <div style={{ marginBottom: 18 }}>
            <div className="progress-bar" style={{ height: 6, marginBottom: 6 }}>
              <div className="progress-fill" style={{ width: `${prog}%`, background: "var(--gold)" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{prog}% da jornada concluída</span>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 11, top: 16, bottom: 16, width: 2, background: "var(--border)", zIndex: 0 }} />
            <div className="flex flex-col gap-4">
              {marcosOrdenados.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: item.feito ? "var(--gold)" : "var(--bg-input)",
                    border: item.feito ? "2px solid var(--gold)" : "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {item.feito
                      ? <Heart size={11} style={{ color: "#000" }} />
                      : <Crown size={11} style={{ color: "var(--text-muted)" }} />
                    }
                  </div>
                  <div style={{ flex: 1, paddingBottom: 8 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase" }}>{item.semana}</span>
                      {item.feito && (
                        <span style={{ fontSize: 9, background: "rgba(134,239,172,0.1)", color: "#86efac", padding: "1px 6px", borderRadius: 999 }}>Concluído</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: item.feito ? "var(--text-soft)" : "var(--text)", margin: 0 }}>{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "32px", marginBottom: 20, textAlign: "center" }}>
          <Star size={28} style={{ color: "var(--gold)", opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Sua linha do tempo está sendo criada</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            A Izabor vai montar seu plano personalizado após as primeiras sessões.
          </p>
        </div>
      )}

      {/* Links Izabor */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <ExternalLink size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Izabor Cruz nas Redes</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>Acompanhe para mais inspiração</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", textDecoration: "none" }}
          >
            <Instagram size={18} style={{ color: "#f9a8d4" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#f9a8d4", margin: 0 }}>@izaborcruz_</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Instagram</p>
            </div>
          </a>
          <a
            href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", textDecoration: "none" }}
          >
            <Youtube size={18} style={{ color: "#fca5a5" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: 0 }}>Izabor Cruz</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>YouTube</p>
            </div>
          </a>
        </div>
      </div>

      {/* Citação */}
      <div
        className="card glow-gold"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 15, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 10px" }}>
          &ldquo;Sua história de transformação é o maior testemunho de que Deus cumpre o que promete. Não apague o caminho — ele faz parte do extraordinário.&rdquo;
        </p>
        <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>— Izabor Cruz</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
