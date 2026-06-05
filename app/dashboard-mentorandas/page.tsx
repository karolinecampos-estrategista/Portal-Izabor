"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Users, Phone, Instagram, ChevronRight, Loader2, Activity } from "lucide-react";
import Link from "next/link";

type Mentorada = {
  id: string;
  nome: string;
  programa: string;
  sessoes_feitas: number;
  total_sessoes: number;
  cor: string;
  status: string;
  whatsapp: string | null;
  instagram: string | null;
  aniversario: string | null;
  proxima_sessao: string | null;
};

export default function DashboardMentorandas() {
  const [mentoradas, setMentoradas] = useState<Mentorada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"ativas" | "todas">("ativas");

  useEffect(() => {
    fetch("/api/mentoradas")
      .then(r => r.json())
      .then(d => { setMentoradas(Array.isArray(d) ? d : []); setCarregando(false); });
  }, []);

  const ativas = mentoradas.filter(m => m.status === "ativo");
  const concluidas = mentoradas.filter(m => m.status === "concluido");
  const lista = filtro === "ativas" ? ativas : mentoradas;

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <LayoutGrid size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dashboard</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Visão das Mentoradas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Acompanhe o progresso de cada aluna.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total",          value: mentoradas.length, color: "var(--gold)",  bg: "rgba(201,168,76,0.1)" },
          { label: "Ativas",         value: ativas.length,     color: "#86efac",      bg: "rgba(134,239,172,0.1)" },
          { label: "Concluídas",     value: concluidas.length, color: "#a78bfa",      bg: "rgba(167,139,250,0.1)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Users size={14} style={{ color: s.color }} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: "0 0 2px", lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        {(["ativas", "todas"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 6, cursor: "pointer",
            border: filtro === f ? "1px solid var(--gold)" : "1px solid var(--border)",
            background: filtro === f ? "var(--gold-light)" : "transparent",
            color: filtro === f ? "var(--gold)" : "var(--text-muted)", fontWeight: filtro === f ? 700 : 400,
          }}>
            {f === "ativas" ? `Ativas (${ativas.length})` : `Todas (${mentoradas.length})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <Activity size={28} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 6px" }}>Nenhuma mentorada cadastrada ainda</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Cadastre as primeiras mentoradas na seção <strong>Mentoradas</strong>.</p>
          <Link href="/mentorandas" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Ir para Mentorandas <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map(m => {
            const prog = m.total_sessoes > 0 ? Math.round((m.sessoes_feitas / m.total_sessoes) * 100) : 0;
            return (
              <div key={m.id} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div className="avatar" style={{ width: 44, height: 44, background: m.cor + "22", color: m.cor, fontSize: 14, flexShrink: 0 }}>
                    {m.nome.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{m.nome}</p>
                      <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 999, background: m.cor + "20", color: m.cor, fontWeight: 600 }}>{m.programa}</span>
                      {m.status === "concluido" && <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 999, background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontWeight: 600 }}>Concluída</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ height: 4, flex: 1, maxWidth: 160 }}>
                        <div className="progress-fill" style={{ width: `${prog}%`, background: m.cor }} />
                      </div>
                      <span style={{ fontSize: 11, color: m.cor, fontWeight: 600 }}>{m.sessoes_feitas}/{m.total_sessoes}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                    {m.whatsapp && (
                      <a href={`https://wa.me/55${m.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#86efac", opacity: 0.8 }}>
                        <Phone size={15} />
                      </a>
                    )}
                    {m.instagram && (
                      <a href={`https://instagram.com/${m.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#f9a8d4", opacity: 0.8 }}>
                        <Instagram size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
