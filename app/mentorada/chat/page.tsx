"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, Send } from "lucide-react";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/lib/supabase";

interface Mensagem {
  id: string;
  user_id: string;
  nome: string;
  conteudo: string;
  canal: string;
  criado_em: string;
}

const CORES = [
  "#C9A84C", "#a78bfa", "#86efac", "#60a5fa",
  "#fb923c", "#f472b6", "#fca5a5", "#34d399",
];

function corPorId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CORES[h % CORES.length];
}

function horaFormatada(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ChatContent({ token, userId }: { token: string; userId: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const carregarMensagens = useCallback(async () => {
    const res = await fetch("/api/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMensagens(data);
    }
  }, [token]);

  useEffect(() => { carregarMensagens(); }, [carregarMensagens]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("chat:comunidade-mentorada")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens_chat", filter: "canal=eq.comunidade" },
        (payload) => {
          setMensagens((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Mensagem];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "mensagens_chat" },
        (payload) => {
          const did = payload.old?.id;
          if (did) setMensagens((prev) => prev.filter((m) => m.id !== did));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function enviar() {
    const msg = texto.trim();
    if (!msg || enviando) return;
    setEnviando(true);
    setTexto("");
    await fetch("/api/chat", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ conteudo: msg }),
    });
    setEnviando(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <MessageCircle size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Comunidade BW</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Espaço exclusivo Club BW — bem-vinda!</p>
      </div>

      {/* Messages area */}
      <div
        className="card"
        style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}
      >
        {mensagens.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: "auto", marginBottom: "auto" }}>
            Nenhuma mensagem ainda. Seja a primeira a escrever!
          </div>
        )}
        {mensagens.map((m) => {
          const isOwn = m.user_id === userId;
          const cor = corPorId(m.user_id);
          return (
            <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: isOwn ? "row-reverse" : "row", alignItems: "flex-end" }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: cor + "22", color: cor, border: `1.5px solid ${cor}`,
              }}>
                {m.nome.charAt(0).toUpperCase()}
              </div>
              {/* Bubble */}
              <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", gap: 2, alignItems: isOwn ? "flex-end" : "flex-start" }}>
                {!isOwn && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: cor }}>{m.nome}</span>
                )}
                <div style={{
                  padding: "8px 12px",
                  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isOwn ? "var(--gold)" : "var(--bg-input)",
                  color: isOwn ? "#1a1a1a" : "var(--text)",
                  fontSize: 13, lineHeight: 1.55, wordBreak: "break-word",
                }}>
                  {m.conteudo}
                </div>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{horaFormatada(m.criado_em)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}>
        <textarea
          ref={inputRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          disabled={enviando}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: 13, color: "var(--text)", resize: "none", maxHeight: 100,
            lineHeight: 1.5, fontFamily: "inherit",
          }}
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          style={{
            width: 34, height: 34, borderRadius: "50%", border: "none",
            background: texto.trim() && !enviando ? "var(--gold)" : "var(--bg-input)",
            cursor: texto.trim() && !enviando ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
          }}
        >
          <Send size={14} style={{ color: texto.trim() && !enviando ? "#1a1a1a" : "var(--text-muted)", marginLeft: 2 }} />
        </button>
      </div>
      <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 6 }}>
        Enter para enviar · Shift+Enter para nova linha
      </p>
    </div>
  );
}

export default function ChatPage() {
  const { carregando, produtosAtivos } = usePerfil();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session) {
        setToken(session.access_token);
        setUserId(session.user.id);
      }
    });
  }, []);

  if (carregando) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="club_bw" ativo={!!produtosAtivos?.club_bw}>
      {token && userId ? (
        <ChatContent token={token} userId={userId} />
      ) : (
        <div style={{ display: "flex", justifyContent: "center", padding: 64, color: "var(--text-muted)", fontSize: 13 }}>
          Carregando sessão...
        </div>
      )}
    </BloqueadoPorProduto>
  );
}
