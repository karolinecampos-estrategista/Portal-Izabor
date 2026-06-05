"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMOJIS = ["😔", "😟", "😐", "🙂", "🤩"];
const LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Incrível!"];

function semanaAtual() {
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const semana = Math.ceil(((agora.getTime() - inicioAno.getTime()) / 86400000 + inicioAno.getDay() + 1) / 7);
  return `Semana ${semana} — ${agora.getFullYear()}`;
}

export default function CheckinMentoradaPage() {
  const [humor, setHumor] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mentoradaInfo, setMentoradaInfo] = useState<{
    id: string; nome: string; programa: string | null; user_id: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      // Suporta usuárias criadas via portal (id = user.id) e via legado (user_id = user.id)
      const { data } = await supabase
        .from("mentoradas")
        .select("id, nome, programa, user_id")
        .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
        .maybeSingle();
      if (data) {
        setMentoradaInfo(data);
      } else {
        // Fallback: usa o ID da sessão diretamente como mentorada_id
        setMentoradaInfo({ id: session.user.id, nome: "Mentorada", programa: null, user_id: session.user.id });
      }
    });
  }, []);

  async function enviar() {
    if (!humor) return;
    setEnviando(true);
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: mentoradaInfo?.user_id ?? null,
        mentorada_id: mentoradaInfo?.id ?? null,
        nome: mentoradaInfo?.nome ?? "Mentorada",
        programa: mentoradaInfo?.programa ?? null,
        humor,
        texto: texto.trim() || null,
        semana: semanaAtual(),
      }),
    });
    setEnviando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={28} style={{ color: "#86efac" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>Check-in enviado! ✨</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Izabor recebeu como você está chegando nesta semana.<br />
          Ela está orando por você. Continue firme na jornada!
        </p>
        <div className="card" style={{ padding: "16px 20px", background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 6px" }}>
            &ldquo;O que você gera no secreto com Deus é o que te sustenta em público.&rdquo;
          </p>
          <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
        </div>
        <button
          onClick={() => { setEnviado(false); setHumor(null); setTexto(""); }}
          style={{ marginTop: 20, background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
        >
          Fazer novo check-in
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Semanal</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Check-in da Semana</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Como você está chegando nesta semana?</p>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Como você está se sentindo hoje?</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {EMOJIS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => setHumor(i + 1)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "12px 6px", borderRadius: 10,
                background: humor === i + 1 ? "var(--gold-light)" : "var(--bg-input)",
                border: `2px solid ${humor === i + 1 ? "var(--gold)" : "var(--border)"}`,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 22 }}>{emoji}</span>
              <span style={{ fontSize: 9, color: humor === i + 1 ? "var(--gold)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>
                {LABELS[i]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          O que está pesando ou alegrando esta semana? <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pode compartilhar livremente aqui..."
          rows={4}
          style={{ width: "100%", padding: "12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
        />
      </div>

      <button
        onClick={enviar}
        disabled={!humor || enviando}
        style={{
          width: "100%", padding: "13px", borderRadius: 10, border: "none",
          background: !humor ? "rgba(201,168,76,0.3)" : "var(--gold)",
          cursor: !humor ? "not-allowed" : "pointer",
          color: "#000", fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {enviando ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</> : "Enviar meu check-in ✨"}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
