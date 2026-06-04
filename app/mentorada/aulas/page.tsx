"use client";

import { useState, useEffect } from "react";
import { PlaySquare, Play, Clock, Crown, ExternalLink, Loader2, BookOpen } from "lucide-react";

type Aula = {
  id: string;
  titulo: string;
  descricao: string | null;
  duracao: string | null;
  modulo: string | null;
  ordem: number;
  link: string | null;
  thumbnail: string;
};

export default function AulasMentoradaPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [moduloFiltro, setModuloFiltro] = useState("todos");

  useEffect(() => {
    fetch("/api/aulas")
      .then((r) => r.json())
      .then((data) => {
        const publicadas = Array.isArray(data)
          ? data.filter((a: { status: string }) => a.status === "publicada")
          : [];
        setAulas(publicadas);
        setCarregando(false);
      });
  }, []);

  const modulos = [...new Set(aulas.map((a) => a.modulo).filter(Boolean))] as string[];
  const aulasFiltradas = moduloFiltro === "todos" ? aulas : aulas.filter((a) => a.modulo === moduloFiltro);
  const modulosDaLista = modulos.filter((m) => aulasFiltradas.some((a) => a.modulo === m));

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando aulas...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <PlaySquare size={20} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Aulas BW</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Conteúdos exclusivos da sua mentoria.
        </p>
      </div>

      {aulas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <PlaySquare size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhuma aula publicada ainda.</p>
          <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
            A Izabor vai publicar as aulas conforme sua jornada avança.
          </p>
        </div>
      )}

      {/* Filtro de módulo */}
      {modulos.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setModuloFiltro("todos")} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", border: moduloFiltro === "todos" ? "1px solid var(--gold)" : "1px solid var(--border)", background: moduloFiltro === "todos" ? "var(--gold-light)" : "transparent", color: moduloFiltro === "todos" ? "var(--gold)" : "var(--text-muted)", fontWeight: moduloFiltro === "todos" ? 700 : 400 }}>
            Todos
          </button>
          {modulos.map((m) => (
            <button key={m} onClick={() => setModuloFiltro(m)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", border: moduloFiltro === m ? "1px solid var(--gold)" : "1px solid var(--border)", background: moduloFiltro === m ? "var(--gold-light)" : "transparent", color: moduloFiltro === m ? "var(--gold)" : "var(--text-muted)", fontWeight: moduloFiltro === m ? 700 : 400, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.split(" — ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* Aulas por módulo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {modulosDaLista.length > 0 ? modulosDaLista.map((modulo) => {
          const aulasDoModulo = aulasFiltradas
            .filter((a) => a.modulo === modulo)
            .sort((a, b) => a.ordem - b.ordem);
          return (
            <div key={modulo}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Crown size={14} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{modulo}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{aulasDoModulo.length} aula{aulasDoModulo.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aulasDoModulo.map((a) => (
                  <div key={a.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {a.thumbnail}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "var(--text)" }}>{a.titulo}</p>
                      {a.descricao && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{a.descricao}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Aula {a.ordem}</span>
                        {a.duracao && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} style={{ color: "var(--text-muted)" }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.duracao}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                        <Play size={12} /> Assistir <ExternalLink size={11} />
                      </a>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, flexShrink: 0 }}>
                        <BookOpen size={12} /> Em breve
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }) : aulasFiltradas.map((a) => (
          <div key={a.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {a.thumbnail}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{a.titulo}</p>
              {a.duracao && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>{a.duracao}</p>}
            </div>
            {a.link && (
              <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                <Play size={12} /> Assistir
              </a>
            )}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
