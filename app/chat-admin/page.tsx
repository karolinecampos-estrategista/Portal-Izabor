"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, Send, Trash2, Shield } from "lucide-react";
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

function dataFormatada(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ChatAdmin() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deletando, setDeletando] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setToken(data.session.access_token);
        setUserId(data.session.user.id);
      }
    });
  }, []);

  const carregarMensagens = useCallback(async (t: string) => {
    const res = await fetch("/api/chat", {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) setMensagens(await res.json());
  }, []);

  useEffect(() => {
    if (token) carregarMensagens(token);
  }, [token, carregarMensagens]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("chat:comunidade-admin")
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
    if (!msg || enviando || !token) return;
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

  async function deletarMensagem(id: string) {
    if (!token) return;
    setDeletando(id);
    await fetch(`/api/chat?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletando(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  }

  // Group messages by date for date separators
  const grupos: { data: string; mensagens: Mensagem[] }[] = [];
  for (const m of mensagens) {
    const d = dataFormatada(m.criado_em);
    const last = grupos[grupos.length - 1];
    if (!last || last.data !== d) grupos.push({ data: d, mensagens: [m] });
    else last.mensagens.push(m);
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <MessageCircle size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Comunidade BW</h1>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--gold)", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", borderRadius: 20, padding: "2px 8px" }}>
            <Shield size={10} /> Admin
          </span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
          {mensagens.length} {mensagens.length !== 1 ? "mensagens" : "mensagem"} · Você pode excluir qualquer mensagem
        </p>
      </div>

      {/* Messages */}
      <div
        className="card"
        style={{ height: "calc(100vh - 280px)", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 0 }}
      >
        {mensagens.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, margin: "auto" }}>
            Nenhuma mensagem ainda no grupo.
          </div>
        )}

        {grupos.map((grupo) => (
          <div key={grupo.data}>
            {/* Date separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 10px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{grupo.data}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {grupo.mensagens.map((m) => {
                const isAdmin = m.user_id === userId;
                const cor = corPorId(m.user_id);
                return (
                  <div
                    key={m.id}
                    className="group"
                    style={{ display: "flex", gap: 10, flexDirection: isAdmin ? "row-reverse" : "row", alignItems: "flex-end" }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      background: isAdmin ? "rgba(201,168,76,0.2)" : cor + "22",
                      color: isAdmin ? "var(--gold)" : cor,
                      border: `1.5px solid ${isAdmin ? "var(--gold-border)" : cor}`,
                    }}>
                      {m.nome.charAt(0).toUpperCase()}
                    </div>

                    {/* Bubble + delete */}
                    <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", gap: 2, alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                      {!isAdmin && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: cor }}>{m.nome}</span>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isAdmin ? "row-reverse" : "row" }}>
                        <div style={{
                          padding: "8px 12px",
                          borderRadius: isAdmin ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isAdmin ? "var(--gold)" : "var(--bg-input)",
                          color: isAdmin ? "#1a1a1a" : "var(--text)",
                          fontSize: 13, lineHeight: 1.55, wordBreak: "break-word",
                        }}>
                          {m.conteudo}
                        </div>
                        {/* Delete button — always visible for admin */}
                        <button
                          onClick={() => deletarMensagem(m.id)}
                          disabled={deletando === m.id}
                          title="Excluir mensagem"
                          style={{
                            width: 24, height: 24, borderRadius: "50%", border: "none",
                            background: "rgba(239,68,68,0.15)",
                            cursor: deletando === m.id ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, opacity: deletando === m.id ? 0.5 : 0.7,
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = deletando === m.id ? "0.5" : "0.7")}
                        >
                          <Trash2 size={11} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{horaFormatada(m.criado_em)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}>
        <textarea
          ref={inputRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escrever como Izabor..."
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
        Mensagens enviadas aparecem como <strong style={{ color: "var(--gold)" }}>Izabor</strong> · Enter para enviar
      </p>
    </div>
  );
}
