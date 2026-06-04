"use client";

import { useState, useEffect } from "react";
import { Stethoscope, ChevronDown, ChevronUp, Calendar, Loader2 } from "lucide-react";

type RespostaItem = { pergunta: string; resposta: string };

type Diagnostico = {
  id: string;
  nome: string;
  email: string | null;
  programa: string | null;
  perfil: string | null;
  cor: string;
  foco: string[];
  respostas: RespostaItem[];
  criado_em: string;
};

export default function DiagnosticosAdminPage() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnosticos")
      .then((r) => r.json())
      .then((data) => {
        setDiagnosticos(Array.isArray(data) ? data : []);
        setCarregando(false);
      });
  }, []);

  const totalPorPerfil = {
    restauracao: diagnosticos.filter((d) => d.perfil?.includes("restaurada")).length,
    encontrando: diagnosticos.filter((d) => d.perfil?.includes("encontrando")).length,
    florescendo: diagnosticos.filter((d) => d.perfil?.includes("florescendo")).length,
  };

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando diagnósticos...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Stethoscope size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Mentoradas</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Diagnósticos</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Veja de onde cada mentorada está partindo — emocional, espiritual e pessoal.
        </p>
      </div>

      {/* Resumo por perfil */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Precisam de restauração", valor: totalPorPerfil.restauracao, cor: "#93c5fd" },
          { label: "Estão se encontrando",    valor: totalPorPerfil.encontrando, cor: "#C9A84C" },
          { label: "Estão florescendo",        valor: totalPorPerfil.florescendo, cor: "#86efac" },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: item.cor, margin: "0 0 4px", lineHeight: 1 }}>{item.valor}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {diagnosticos.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Stethoscope size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum diagnóstico recebido ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>As mentoradas respondem o diagnóstico no portal delas e os dados aparecem aqui.</p>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {diagnosticos.map((d) => {
          const isAberto = aberto === d.id;
          return (
            <div key={d.id} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: `3px solid ${d.cor}` }}>
              <button
                onClick={() => setAberto(isAberto ? null : d.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: d.cor + "20", border: `1px solid ${d.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: d.cor, fontWeight: 700, flexShrink: 0 }}>
                  {d.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", color: "var(--text)" }}>{d.nome}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {d.programa && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.programa}</span>}
                    {d.perfil && <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 999, background: d.cor + "20", color: d.cor, border: `1px solid ${d.cor}40` }}>{d.perfil}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-muted)" }}>
                      <Calendar size={10} />
                      {new Date(d.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                {isAberto ? <ChevronUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
              </button>

              {isAberto && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  {d.foco.length > 0 && (
                    <div style={{ marginTop: 16, marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Focos principais</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {d.foco.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: d.cor + "0D", borderRadius: 6, border: `1px solid ${d.cor}20` }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: d.cor, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.respostas.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>Respostas do diagnóstico</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {d.respostas.map((r, i) => (
                          <div key={i} style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 600 }}>{r.pergunta}</p>
                            <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0, fontStyle: "italic" }}>&ldquo;{r.resposta}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
