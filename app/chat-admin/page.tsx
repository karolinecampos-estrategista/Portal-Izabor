"use client";

import { MessageCircle, Crown } from "lucide-react";

export default function ChatAdmin() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <MessageCircle size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Chat com Mentoradas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Comunicação direta com as alunas.</p>
      </div>

      {/* Em breve */}
      <div
        className="card"
        style={{
          padding: "60px 32px",
          textAlign: "center",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
        }}
      >
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Crown size={24} style={{ color: "var(--gold)" }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>
          Chat em desenvolvimento
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
          O sistema de chat integrado estará disponível em breve. Por enquanto, as mentorandas podem ser contatadas diretamente pelo WhatsApp cadastrado no perfil de cada uma.
        </p>
      </div>
    </div>
  );
}
