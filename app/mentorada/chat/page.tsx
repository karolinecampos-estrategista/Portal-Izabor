"use client";

import { MessageCircle, Send, Sparkles, Users, Crown } from "lucide-react";
import { useState } from "react";

type Mensagem = {
  id: number;
  autor: string;
  texto: string;
  hora: string;
  tipo: "izabor" | "mentorada" | "eu";
  cor: string;
};

const MSGS_INICIAIS: Mensagem[] = [
  {
    id: 1, autor: "Izabor Cruz", tipo: "izabor",
    texto: "Bom dia, mulheres extraordinárias! 🙏✨ Hoje quero que vocês comecem o dia declarando: 'Eu sou feita para o extraordinário. Deus está comigo.'",
    hora: "07:02", cor: "#C9A84C",
  },
  {
    id: 2, autor: "Fernanda Lima", tipo: "mentorada",
    texto: "Amei essa palavra, Iza! Me pegou exatamente onde eu precisava hoje. Ontem foi um dia difícil mas essa declaração mudou minha manhã 💜",
    hora: "07:15", cor: "#86efac",
  },
  {
    id: 3, autor: "Camila Souza", tipo: "mentorada",
    texto: "Iza, posso compartilhar aqui? Ontem tive uma conversa difícil com meu marido e pela primeira vez consigo aplicar o que aprendi na sessão. Comunicação não violenta de verdade! 🥹",
    hora: "07:28", cor: "#a78bfa",
  },
  {
    id: 4, autor: "Izabor Cruz", tipo: "izabor",
    texto: "Camila, que bênção isso! É exatamente pra isso que existe o processo. Quando a gente aplica, a transformação é real. Vai contando como evolui! 🙌",
    hora: "07:35", cor: "#C9A84C",
  },
  {
    id: 5, autor: "Patricia Alves", tipo: "mentorada",
    texto: "Gente, essa semana consegui fazer minha primeira palestra! 50 mulheres! Eu que não conseguia nem falar em público... 😭🙏",
    hora: "09:12", cor: "#f9a8d4",
  },
  {
    id: 6, autor: "Izabor Cruz", tipo: "izabor",
    texto: "PATRICIA!!! 🎉 Isso é EXTRAORDINÁRIO! Você lembra que na primeira sessão dizia que nunca ia conseguir falar em público? NUNCA subestime o poder da transformação! Celebro com você! 👑",
    hora: "09:20", cor: "#C9A84C",
  },
  {
    id: 7, autor: "Fernanda Lima", tipo: "mentorada",
    texto: "Pati minha querida!!! Lembro quando você entrou tímida demais. QUE EVOLUÇÃO! 🏆",
    hora: "09:22", cor: "#86efac",
  },
];

export default function Chat() {
  const [mensagens, setMensagens] = useState(MSGS_INICIAIS);
  const [input, setInput] = useState("");
  const [canal, setCanal] = useState<"grupo" | "izabor">("grupo");

  function enviar() {
    if (!input.trim()) return;
    setMensagens((prev) => [...prev, {
      id: Date.now(),
      autor: "Ana Paula (você)",
      tipo: "eu",
      texto: input,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      cor: "#C9A84C",
    }]);
    setInput("");
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <MessageCircle size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Comunidade BW</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Seu espaço de troca e suporte — sem precisar sair do portal.</p>
      </div>

      {/* Seletor de canal */}
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <button
          onClick={() => setCanal("grupo")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
            border: canal === "grupo" ? "1px solid var(--gold-border)" : "1px solid var(--border)",
            background: canal === "grupo" ? "var(--gold-light)" : "transparent",
            color: canal === "grupo" ? "var(--gold)" : "var(--text-muted)",
            transition: "all 0.15s",
          }}
        >
          <Users size={14} /> Grupo BW
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "rgba(134,239,172,0.2)", color: "#86efac", fontWeight: 600 }}>12</span>
        </button>
        <button
          onClick={() => setCanal("izabor")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
            border: canal === "izabor" ? "1px solid var(--gold-border)" : "1px solid var(--border)",
            background: canal === "izabor" ? "var(--gold-light)" : "transparent",
            color: canal === "izabor" ? "var(--gold)" : "var(--text-muted)",
            transition: "all 0.15s",
          }}
        >
          <Crown size={14} /> Izabor Cruz
        </button>
      </div>

      {/* Área de mensagens */}
      <div
        className="card"
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 0,
        }}
      >
        {canal === "grupo" ? (
          mensagens.map((msg) => {
            const isEu = msg.tipo === "eu";
            const isIzabor = msg.tipo === "izabor";

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isEu ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {/* Avatar */}
                {!isEu && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: msg.cor + "20",
                    border: isIzabor ? `1px solid ${msg.cor}50` : "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: msg.cor,
                    flexShrink: 0,
                  }}>
                    {isIzabor ? <Sparkles size={14} /> : msg.autor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}

                {/* Bubble */}
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isEu ? "flex-end" : "flex-start" }}>
                  {!isEu && (
                    <span style={{ fontSize: 10, color: msg.cor, fontWeight: 600, marginBottom: 4 }}>
                      {isIzabor ? "✨ " : ""}{msg.autor}
                    </span>
                  )}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isEu ? "12px 12px 0 12px" : isIzabor ? "0 12px 12px 12px" : "0 12px 12px 12px",
                      background: isEu ? "var(--gold)" : isIzabor ? "rgba(201,168,76,0.12)" : "var(--bg-input)",
                      border: isEu ? "none" : isIzabor ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                      fontSize: 13,
                      color: isEu ? "#000" : "var(--text-soft)",
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.texto}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{msg.hora}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crown size={24} style={{ color: "var(--gold)" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Chat Direto com Izabor</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
              Use esse canal para dúvidas diretas com a mentora. As mensagens são respondidas em até 24h nos dias úteis.
            </p>
          </div>
        )}
      </div>

      {/* Input */}
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
        }}
      >
        <input
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "var(--text)",
          }}
          placeholder={canal === "grupo" ? "Escreva para o grupo BW..." : "Escreva para a Izabor..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
        />
        <button
          onClick={enviar}
          disabled={!input.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: input.trim() ? "var(--gold)" : "var(--bg-input)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          <Send size={15} style={{ color: input.trim() ? "#000" : "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
