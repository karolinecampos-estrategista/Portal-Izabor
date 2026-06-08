"use client";

import { Heart, Plus, MessageSquare, Image, Video, X, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";

type TipoDepoimento = "texto" | "imagem" | "video";

interface Depoimento {
  id: string;
  nome: string;
  programa: string | null;
  conteudo: string;
  conteudo_editado: string | null;
  aprovado_em: string;
}

function formatData(iso: string) {
  const d = new Date(iso);
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Depoimentos() {
  const perfil = usePerfil();
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [nomeMentorada, setNomeMentorada] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [tipoForm, setTipoForm] = useState<TipoDepoimento>("texto");
  const [textoForm, setTextoForm] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }

      const { data: m } = await supabase
        .from("mentoradas")
        .select("nome")
        .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
        .maybeSingle();
      if (m) setNomeMentorada(m.nome.split(" ")[0]);

      const res = await fetch("/api/depoimentos");
      if (res.ok) setDepoimentos(await res.json());
      setCarregando(false);
    });
  }, []);

  async function enviarDepoimento() {
    if (!textoForm.trim() || enviando) return;
    setEnviando(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setEnviando(false); return; }

    await fetch("/api/depoimentos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ conteudo: textoForm, tipo: tipoForm }),
    });

    setTextoForm("");
    setFormAberto(false);
    setEnviando(false);
  }

  if (perfil.carregando || carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="club_bw" ativo={!!perfil.produtosAtivos?.club_bw}>
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

      {/* Depoimentos aprovados */}
      {depoimentos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {depoimentos.map((d) => (
            <div key={d.id} className="card" style={{ padding: "24px 26px", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
              <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.75, margin: "0 0 14px" }}>
                &ldquo;{d.conteudo_editado ?? d.conteudo}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Heart size={14} style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", margin: 0 }}>{d.nome}</p>
                  {d.programa && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{d.programa}</p>}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{formatData(d.aprovado_em)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Convite para compartilhar */}
      {depoimentos.length === 0 && (
        <div
          className="card glow-gold"
          style={{ padding: "32px 28px", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)", textAlign: "center", marginBottom: 24 }}
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
          <button className="btn-gold flex items-center gap-2" style={{ margin: "0 auto" }} onClick={() => setFormAberto(true)}>
            <Plus size={14} /> Compartilhar minha história
          </button>
        </div>
      )}

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
              <button className="btn-gold flex items-center gap-2" onClick={enviarDepoimento} disabled={!textoForm.trim() || enviando}>
                {enviando ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={13} />}
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
    </BloqueadoPorProduto>
  );
}
