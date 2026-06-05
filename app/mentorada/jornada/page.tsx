"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckSquare, Loader2, Target } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Desafio = {
  id: string;
  titulo: string;
  descricao: string | null;
  pilar: string;
  prazo: string | null;
  destino: string;
  mentorada_nome: string | null;
};

const pilarColor: Record<string, string> = {
  "Fe":          "#a78bfa",
  "Fé":          "#a78bfa",
  "Mentalidade": "#93c5fd",
  "Liderança":   "#C9A84C",
  "Lideranca":   "#C9A84C",
  "Emocional":   "#f9a8d4",
  "Família":     "#86efac",
  "Familia":     "#86efac",
  "Físico":      "#fca5a5",
  "Fisico":      "#fca5a5",
};

function corDopilar(pilar: string) {
  return pilarColor[pilar] ?? "#C9A84C";
}

function formatPrazo(iso: string) {
  const [y, m, d] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

export default function Jornada() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [feitos, setFeitos] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let nomeMentorada = "";
      if (session) {
        const { data: m } = await supabase
          .from("mentoradas")
          .select("nome")
          .eq("user_id", session.user.id)
          .single();
        if (m) nomeMentorada = m.nome;
      }

      const res = await fetch("/api/desafios");
      const todos: Desafio[] = await res.json();

      const meus = Array.isArray(todos)
        ? todos.filter(
            (d) =>
              d.destino === "todas-bw" ||
              (d.destino === "individual" && d.mentorada_nome === nomeMentorada)
          )
        : [];

      setDesafios(meus);
      setCarregando(false);
    });
  }, []);

  function toggleFeito(id: string) {
    setFeitos((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const totalFeitos = feitos.size;
  const total = desafios.length;
  const progGeral = total > 0 ? Math.round((totalFeitos / total) * 100) : 0;

  const pilares = [...new Set(desafios.map((d) => d.pilar))];

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando desafios...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Trophy size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Minha Jornada</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Jornada & Desafios</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Sua transformação semana a semana. Cada check é um passo no extraordinário.</p>
      </div>

      {desafios.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Trophy size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum desafio publicado ainda.</p>
          <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
            A Izabor vai enviar desafios conforme sua jornada avança.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--gold)", margin: 0 }}>{progGeral}%</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>📊 Progresso</p>
            </div>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#86efac", margin: 0 }}>{totalFeitos}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>✅ Concluídos</p>
            </div>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa", margin: 0 }}>{total}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>🎯 Total</p>
            </div>
          </div>

          {/* Barra geral */}
          {total > 0 && (
            <div className="card" style={{ padding: "16px 20px", marginBottom: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Progresso geral</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{progGeral}%</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${progGeral}%`, background: "var(--gold)" }} />
              </div>
            </div>
          )}

          {/* Desafios por pilar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {pilares.map((pilar) => {
              const dosPilar = desafios.filter((d) => d.pilar === pilar);
              const cor = corDopilar(pilar);
              const feitosPilar = dosPilar.filter((d) => feitos.has(d.id)).length;
              const progPilar = dosPilar.length > 0 ? Math.round((feitosPilar / dosPilar.length) * 100) : 0;

              return (
                <div key={pilar}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Target size={13} style={{ color: cor }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: cor }}>{pilar}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{feitosPilar}/{dosPilar.length}</span>
                    <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 999, marginLeft: 4 }}>
                      <div style={{ height: "100%", width: `${progPilar}%`, background: cor, borderRadius: 999, transition: "width 0.3s" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dosPilar.map((d) => {
                      const feito = feitos.has(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => toggleFeito(d.id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "14px 16px",
                            borderRadius: 10,
                            background: feito ? "rgba(134,239,172,0.07)" : "var(--bg-card)",
                            border: feito ? "1px solid rgba(134,239,172,0.2)" : "1px solid var(--border)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                            width: "100%",
                          }}
                        >
                          <CheckSquare
                            size={16}
                            style={{ color: feito ? "#86efac" : "var(--text-muted)", flexShrink: 0, marginTop: 1 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: 13,
                              fontWeight: feito ? 400 : 600,
                              color: feito ? "var(--text-muted)" : "var(--text)",
                              textDecoration: feito ? "line-through" : "none",
                              lineHeight: 1.5,
                              display: "block",
                            }}>
                              {d.titulo}
                            </span>
                            {d.descricao && !feito && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: 4 }}>
                                {d.descricao}
                              </span>
                            )}
                            {d.prazo && !feito && (
                              <span style={{ fontSize: 10, color: cor, fontWeight: 600, marginTop: 4, display: "block" }}>
                                Prazo: {formatPrazo(d.prazo)}
                              </span>
                            )}
                          </div>
                          {feito && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(134,239,172,0.12)", color: "#86efac", fontWeight: 700, flexShrink: 0 }}>
                              ✓ Feito
                            </span>
                          )}
                        </button>
                      );
                    })}
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
