"use client";

import { MessageCircle, Send, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Chat() {
  const [input, setInput] = useState("");
  const [nomeMentorada, setNomeMentorada] = useState("");

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

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 120px)" }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <MessageCircle size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Comunidade BW</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Seu espaço de troca e suporte.</p>
      </div>

      {/* Área central — Em breve */}
      <div
        className="card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
          minHeight: 320,
        }}
      >
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Crown size={24} style={{ color: "var(--gold)" }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>
          Chat em breve
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 6px", maxWidth: 360 }}>
          {nomeMentorada ? `${nomeMentorada}, o` : "O"} espaço de comunidade e chat direto com a Izabor estará disponível em breve.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, maxWidth: 340 }}>
          Para dúvidas urgentes, entre em contato pelo WhatsApp da Izabor ou aguarde o acesso ao grupo exclusivo.
        </p>
      </div>

      {/* Input desabilitado — visual only */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          marginTop: 12,
          opacity: 0.5,
        }}
      >
        <input
          disabled
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "var(--text-muted)",
            cursor: "not-allowed",
          }}
          placeholder="Chat disponível em breve..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--bg-input)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "not-allowed",
          }}
        >
          <Send size={15} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
