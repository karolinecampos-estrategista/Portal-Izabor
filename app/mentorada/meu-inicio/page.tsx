"use client";

import { useState, useEffect } from "react";
import { Sunrise, Heart, Instagram, Youtube, ExternalLink, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";

interface MeuInicioData {
  foto_inicio: string | null;
  foto_atual: string | null;
  mensagem: string | null;
}

export default function MeuInicio() {
  const perfil = usePerfil();
  const [dados, setDados] = useState<MeuInicioData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }

      const { data: mentorada } = await supabase
        .from("mentoradas")
        .select("nome, criado_em")
        .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
        .maybeSingle();

      if (mentorada) {
        setNome(mentorada.nome?.split(" ")[0] ?? "");
        if (mentorada.criado_em) {
          const d = new Date(mentorada.criado_em);
          const mes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
          setDataInicio(mes.charAt(0).toUpperCase() + mes.slice(1));
        }
      }

      const res = await fetch("/api/meu-inicio", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setDados(await res.json());
      setCarregando(false);
    });
  }, []);

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
    <div style={{ maxWidth: 820, margin: "0 auto", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Sunrise size={16} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Club BW</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meu Começo</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          De onde você saiu para saber o quão longe chegou.
        </p>
      </div>

      {/* Badge data de início */}
      {dataInicio && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", marginBottom: 24 }}>
          <Sunrise size={13} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>Sua jornada começou em {dataInicio}</span>
        </div>
      )}

      {/* Fotos de transformação */}
      {dados?.foto_inicio ? (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Meu Começo</p>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "1" }}>
                <img src={dados.foto_inicio} alt="Foto do começo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Hoje</p>
              {dados.foto_atual ? (
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(167,139,250,0.3)", aspectRatio: "1" }}>
                  <img src={dados.foto_atual} alt="Foto atual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ borderRadius: 12, border: "1px dashed rgba(167,139,250,0.3)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <ImageIcon size={24} style={{ color: "rgba(167,139,250,0.4)", marginBottom: 6 }} />
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Em breve</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {dados.mensagem && (
            <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #111 0%, #0d0b14 100%)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Heart size={12} style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mensagem da Izabor</span>
              </div>
              <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.75, margin: 0 }}>
                &ldquo;{dados.mensagem}&rdquo;
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: "40px 28px", background: "linear-gradient(135deg, #111 0%, #0d0b14 100%)", border: "1px solid rgba(167,139,250,0.25)", textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Sunrise size={24} style={{ color: "#a78bfa" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa", margin: "0 0 10px" }}>
            {nome ? `${nome}, seu começo está sendo registrado` : "Seu começo está sendo registrado"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            A Izabor vai registrar sua foto do começo e uma mensagem especial para você. Esse será o seu ponto de partida — guardado para sempre.
          </p>
        </div>
      )}

      {/* Citação */}
      <div className="card" style={{ padding: "20px 24px", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)", textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
          &ldquo;Sua história de transformação é o maior testemunho de que Deus cumpre o que promete. Não apague o caminho — ele faz parte do extraordinário.&rdquo;
        </p>
        <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
      </div>

      {/* Links Izabor */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <ExternalLink size={13} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Izabor Cruz nas Redes</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti" target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", textDecoration: "none" }}>
            <Instagram size={18} style={{ color: "#f9a8d4" }} />
            <div><p style={{ fontSize: 13, fontWeight: 600, color: "#f9a8d4", margin: 0 }}>@izaborcruz_</p><p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Instagram</p></div>
          </a>
          <a href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq" target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", textDecoration: "none" }}>
            <Youtube size={18} style={{ color: "#fca5a5" }} />
            <div><p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: 0 }}>Izabor Cruz</p><p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>YouTube</p></div>
          </a>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
    </BloqueadoPorProduto>
  );
}
