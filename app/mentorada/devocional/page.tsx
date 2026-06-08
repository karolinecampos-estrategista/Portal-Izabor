"use client";

import { useState, useEffect } from "react";
import { Flame, Play, ChevronDown, ChevronUp, BookHeart, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";

type Devocional = {
  id: string;
  titulo: string;
  tipo: "texto" | "video";
  conteudo: string | null;
  versiculo: string | null;
  link_video: string | null;
  destino: string;
  mentorada_id: string | null;
  mentorada_nome: string | null;
  criado_em: string;
};

export default function DevocionalMentoradaPage() {
  const perfil = usePerfil();
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);
  const [nomeMentorada, setNomeMentorada] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let mentoradaId = "";
      let nome = "";
      if (session) {
        const { data: m } = await supabase
          .from("mentoradas")
          .select("id, nome")
          .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
          .maybeSingle();
        if (m) { mentoradaId = m.id; nome = m.nome; }
        setNomeMentorada(nome);
      }

      const res = await fetch("/api/devocionais");
      const todos: (Devocional & { publicado: boolean })[] = await res.json();

      const visiveis = todos.filter((d) => {
        if (!d.publicado) return false;
        if (d.destino === "todas-bw") return true;
        if (d.destino !== "individual") return false;
        // ID tem prioridade; cai para nome em devocionais antigos sem mentorada_id
        if (d.mentorada_id && mentoradaId) return d.mentorada_id === mentoradaId;
        return d.mentorada_nome === nome;
      });

      setDevocionais(visiveis);
      setCarregando(false);

      // Abre o mais recente automaticamente
      if (visiveis.length > 0) setExpandido(visiveis[0].id);
    });
  }, []);

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (carregando || perfil.carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando devocionais...</span>
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="club_bw" ativo={!!perfil.produtosAtivos?.club_bw}>
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookHeart size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Palavras da Izabor</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Devocionais</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Mensagens enviadas especialmente para a sua jornada.
        </p>
      </div>

      {devocionais.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <BookHeart size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum devocional publicado ainda.</p>
          <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
            Em breve a Izabor compartilhará palavras para a sua jornada.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {devocionais.map((d, idx) => {
          const aberto = expandido === d.id;
          const isHoje = idx === 0;

          return (
            <div
              key={d.id}
              className="card"
              style={{
                padding: 0, overflow: "hidden",
                border: isHoje ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                background: isHoje ? "linear-gradient(135deg, #111111 0%, #161208 100%)" : "var(--bg-card)",
              }}
            >
              {/* Cabeçalho */}
              <button
                onClick={() => setExpandido(aberto ? null : d.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: isHoje ? "var(--gold-light)" : "var(--bg-input)", border: `1px solid ${isHoje ? "var(--gold-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {d.tipo === "video"
                    ? <Play size={16} style={{ color: isHoje ? "var(--gold)" : "var(--text-muted)" }} />
                    : <Flame size={16} style={{ color: isHoje ? "var(--gold)" : "var(--text-muted)" }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isHoje && (
                    <p style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>
                      Devocional de hoje
                    </p>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text)" }}>{d.titulo}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0" }}>{formatarData(d.criado_em)}</p>
                </div>
                {aberto ? <ChevronUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
              </button>

              {/* Conteúdo expandido */}
              {aberto && (
                <div style={{ borderTop: `1px solid ${isHoje ? "var(--gold-border)" : "var(--border)"}`, padding: "20px 24px" }}>
                  {d.tipo === "video" && d.link_video && (
                    <a
                      href={d.link_video}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, textDecoration: "none", marginBottom: 16 }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Play size={18} style={{ color: "#93c5fd" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: "#93c5fd", fontWeight: 600, margin: 0 }}>Assistir vídeo</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Abrir no YouTube / Vimeo</p>
                      </div>
                      <ExternalLink size={14} style={{ color: "#93c5fd", flexShrink: 0 }} />
                    </a>
                  )}

                  {d.conteudo && (
                    <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.8, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>
                      {d.conteudo}
                    </p>
                  )}

                  {d.versiculo && (
                    <div className="verse-block" style={{ fontSize: 13, lineHeight: 1.6 }}>
                      {d.versiculo}
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
    </BloqueadoPorProduto>
  );
}
