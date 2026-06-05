"use client";

import { Heart, Plus, MessageSquare, Image, Video, X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type TipoDepoimento = "texto" | "imagem" | "video";

export default function Depoimentos() {
  const [nomeMentorada, setNomeMentorada] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [tipoForm, setTipoForm] = useState<TipoDepoimento>("texto");
  const [textoForm, setTextoForm] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: m } = await supabase
        .from("mentoradas")
        .select("nome")
        .eq("user_id", session.user.id)
        .single();
      if (m) setNomeMentorada(m.nome.split(" ")[0]);
    });
  }, []);

  function enviarDepoimento() {
    if (!textoForm.trim()) return;
    setTextoForm("");
    setFormAberto(false);
    setEnviado(true);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <Heart size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Depoimentos</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Histórias de Transformação</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Você também é parte desta história. Compartilhe sua jornada.
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setFormAberto(true)}>
          <Plus size={14} /> Meu Depoimento
        </button>
      </div>

      {/* Depoimento enviado — aguardando aprovação */}
      {enviado && (
        <div style={{ padding: "18px 20px", background: "rgba(201,168,76,0.08)", border: "1px solid var(--gold-border)", borderRadius: 12, marginBottom: 20 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🙏</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Depoimento enviado!</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>Aguardando aprovação da Izabor para aparecer para todo o grupo.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(251,191,36,0.08)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.2)" }}>
            <span style={{ fontSize: 11, color: "#fbbf24" }}>⏳</span>
            <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>Em análise — a Izabor vai revisar e publicar em breve</span>
          </div>
        </div>
      )}

      {/* Convite para compartilhar */}
      <div
        className="card glow-gold"
        style={{
          padding: "32px 28px",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Heart size={22} style={{ color: "var(--gold)" }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>
          {nomeMentorada ? `${nomeMentorada}, sua história importa` : "Sua história importa"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          Os depoimentos das alunas são publicados pela Izabor após aprovação. Quando estiver pronta para compartilhar sua transformação, clique no botão abaixo.
        </p>
        <button
          className="btn-gold flex items-center gap-2"
          style={{ margin: "0 auto" }}
          onClick={() => setFormAberto(true)}
        >
          <Plus size={14} /> Compartilhar minha história
        </button>
      </div>

      {/* Citação */}
      <div className="card" style={{ padding: "20px 24px", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
        <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
          &ldquo;Seu testemunho não é só sua história — é a prova de que Deus cumpre o que promete. Não guarde isso para você.&rdquo;
        </p>
        <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
      </div>

      {/* Modal form */}
      {formAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setFormAberto(false)}>
          <div className="card" style={{ maxWidth: 520, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Compartilhar minha história ✨</h2>
              <button onClick={() => setFormAberto(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Tipo de depoimento</p>
            <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
              {(["texto", "imagem", "video"] as TipoDepoimento[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoForm(t)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 0", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    border: tipoForm === t ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                    background: tipoForm === t ? "var(--gold-light)" : "transparent",
                    color: tipoForm === t ? "var(--gold)" : "var(--text-muted)",
                  }}
                >
                  {t === "texto" ? <MessageSquare size={13} /> : t === "imagem" ? <Image size={13} /> : <Video size={13} />}
                  {t === "texto" ? "Texto" : t === "imagem" ? "Imagem" : "Vídeo"}
                </button>
              ))}
            </div>

            <textarea
              value={textoForm}
              onChange={(e) => setTextoForm(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", fontSize: 13, minHeight: 120, resize: "vertical", borderRadius: 8 }}
              placeholder="Conte sua transformação... O que mudou na sua vida desde que entrou na mentoria?"
            />

            {tipoForm !== "texto" && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  {tipoForm === "imagem" ? "📸 Upload de imagem disponível em breve" : "🎥 Envio de vídeo disponível em breve"}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end" style={{ marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="btn-gold flex items-center gap-2" onClick={enviarDepoimento} disabled={!textoForm.trim()}>
                <Send size={13} /> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
