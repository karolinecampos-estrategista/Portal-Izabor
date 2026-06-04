"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Sparkles, Users, Crown,
  Search, Circle,
} from "lucide-react";

type MsgTipo = "izabor" | "mentorada";

interface Mensagem {
  id: number;
  autor: string;
  tipo: MsgTipo;
  texto: string;
  hora: string;
  cor: string;
}

interface Conversa {
  id: string;
  tipo: "grupo" | "dm";
  nome: string;
  avatar: string;
  cor: string;
  naoLidas: number;
  ultimaMsg: string;
  ultimaHora: string;
  mensagens: Mensagem[];
}

const CONVERSAS_INICIAL: Conversa[] = [
  {
    id: "grupo",
    tipo: "grupo",
    nome: "Grupo BW",
    avatar: "BW",
    cor: "#C9A84C",
    naoLidas: 2,
    ultimaMsg: "Fernanda: QUE EVOLUÇÃO! 🏆",
    ultimaHora: "09:22",
    mensagens: [
      { id: 1, autor: "Izabor Cruz", tipo: "izabor", texto: "Bom dia, mulheres extraordinárias! 🙏✨ Hoje quero que vocês comecem o dia declarando: 'Eu sou feita para o extraordinário. Deus está comigo.'", hora: "07:02", cor: "#C9A84C" },
      { id: 2, autor: "Fernanda Lima", tipo: "mentorada", texto: "Amei essa palavra, Iza! Me pegou exatamente onde eu precisava hoje. Ontem foi um dia difícil mas essa declaração mudou minha manhã 💜", hora: "07:15", cor: "#86efac" },
      { id: 3, autor: "Camila Souza", tipo: "mentorada", texto: "Iza, posso compartilhar? Ontem tive uma conversa difícil com meu marido e pela primeira vez apliquei o que aprendi na sessão. Comunicação não violenta de verdade! 🥹", hora: "07:28", cor: "#a78bfa" },
      { id: 4, autor: "Izabor Cruz", tipo: "izabor", texto: "Camila, que bênção! É exatamente pra isso que existe o processo. Quando a gente aplica, a transformação é real. Vai contando como evolui! 🙌", hora: "07:35", cor: "#C9A84C" },
      { id: 5, autor: "Patricia Alves", tipo: "mentorada", texto: "Gente, essa semana consegui fazer minha primeira palestra! 50 mulheres! Eu que não conseguia falar em público... 😭🙏", hora: "09:12", cor: "#f9a8d4" },
      { id: 6, autor: "Izabor Cruz", tipo: "izabor", texto: "PATRICIA!!! 🎉 Isso é EXTRAORDINÁRIO! Você lembra que dizia que nunca ia conseguir falar em público? NUNCA subestime o poder da transformação! 👑", hora: "09:20", cor: "#C9A84C" },
      { id: 7, autor: "Fernanda Lima", tipo: "mentorada", texto: "Pati minha querida!!! QUE EVOLUÇÃO! 🏆", hora: "09:22", cor: "#86efac" },
    ],
  },
  {
    id: "dm-camila",
    tipo: "dm",
    nome: "Camila Souza",
    avatar: "CS",
    cor: "#a78bfa",
    naoLidas: 1,
    ultimaMsg: "Iza, tenho uma dúvida sobre a tarefa...",
    ultimaHora: "Hoje, 14:10",
    mensagens: [
      { id: 1, autor: "Camila Souza", tipo: "mentorada", texto: "Iza, tenho uma dúvida sobre a tarefa da conversa difícil. Faço antes ou depois de rezar sobre o assunto?", hora: "14:10", cor: "#a78bfa" },
    ],
  },
  {
    id: "dm-juliana",
    tipo: "dm",
    nome: "Juliana Matos",
    avatar: "JM",
    cor: "#93c5fd",
    naoLidas: 2,
    ultimaMsg: "Me senti muito mal depois da última sessão...",
    ultimaHora: "Ontem",
    mensagens: [
      { id: 1, autor: "Juliana Matos", tipo: "mentorada", texto: "Iza, queria te falar uma coisa... Me senti muito mal depois da última sessão. Acho que mexeu em coisas que eu não esperava.", hora: "22:14", cor: "#93c5fd" },
      { id: 2, autor: "Juliana Matos", tipo: "mentorada", texto: "Mas ao mesmo tempo foi o mais honesto que já fui comigo mesma. Obrigada por não deixar eu fugir.", hora: "22:16", cor: "#93c5fd" },
    ],
  },
  {
    id: "dm-ana",
    tipo: "dm",
    nome: "Ana Paula Ferreira",
    avatar: "AP",
    cor: "#C9A84C",
    naoLidas: 0,
    ultimaMsg: "Perfeito, vou fazer isso! Obrigada ✨",
    ultimaHora: "27 Mai",
    mensagens: [
      { id: 1, autor: "Izabor Cruz", tipo: "izabor", texto: "Ana, para nossa próxima sessão quero que você anote 3 situações em que você escolheu o medo em vez da fé essa semana. Sem julgamento — só observação.", hora: "18:00", cor: "#C9A84C" },
      { id: 2, autor: "Ana Paula Ferreira", tipo: "mentorada", texto: "Perfeito, vou fazer isso! Obrigada ✨", hora: "18:23", cor: "#C9A84C" },
    ],
  },
  {
    id: "dm-fernanda",
    tipo: "dm",
    nome: "Fernanda Lima",
    avatar: "FL",
    cor: "#86efac",
    naoLidas: 0,
    ultimaMsg: "Obrigada Iza! A renovação vai ser em janeiro 🙌",
    ultimaHora: "25 Mai",
    mensagens: [
      { id: 1, autor: "Fernanda Lima", tipo: "mentorada", texto: "Iza, queria saber sobre a renovação do Club. Tenho interesse em continuar!", hora: "10:30", cor: "#86efac" },
      { id: 2, autor: "Izabor Cruz", tipo: "izabor", texto: "Que maravilha, Fernanda! A renovação vai ser em janeiro — já vai deixar marcado. Vou te mandar os detalhes por aqui quando chegar mais perto.", hora: "11:00", cor: "#C9A84C" },
      { id: 3, autor: "Fernanda Lima", tipo: "mentorada", texto: "Obrigada Iza! A renovação vai ser em janeiro 🙌", hora: "11:05", cor: "#86efac" },
    ],
  },
  {
    id: "dm-patricia",
    tipo: "dm",
    nome: "Patricia Alves",
    avatar: "PA",
    cor: "#f9a8d4",
    naoLidas: 0,
    ultimaMsg: "Enviando a foto do evento em breve!",
    ultimaHora: "26 Mai",
    mensagens: [
      { id: 1, autor: "Patricia Alves", tipo: "mentorada", texto: "Iza, fiz a palestra! Foi incrível. Enviando a foto do evento em breve!", hora: "20:00", cor: "#f9a8d4" },
      { id: 2, autor: "Izabor Cruz", tipo: "izabor", texto: "Patricia! Que orgulho! Não vejo a hora de ver a foto! 🎉", hora: "20:10", cor: "#C9A84C" },
    ],
  },
  {
    id: "dm-renata",
    tipo: "dm",
    nome: "Renata Costa",
    avatar: "RC",
    cor: "#fca5a5",
    naoLidas: 0,
    ultimaMsg: "Programa concluído! ✅",
    ultimaHora: "Mar 2026",
    mensagens: [
      { id: 1, autor: "Renata Costa", tipo: "mentorada", texto: "Iza, queria deixar registrado: foi a melhor decisão da minha vida entrar na imersão. Obrigada por tudo.", hora: "15:00", cor: "#fca5a5" },
      { id: 2, autor: "Izabor Cruz", tipo: "izabor", texto: "Renata, o mérito é seu. Você foi corajosa, consistente e entregue. A transformação foi sua. 💜 Programa concluído com honra!", hora: "15:20", cor: "#C9A84C" },
    ],
  },
];

export default function ChatAdmin() {
  const [conversas, setConversas] = useState<Conversa[]>(CONVERSAS_INICIAL);
  const [ativaId, setAtivaId] = useState("grupo");
  const [input, setInput] = useState("");
  const [busca, setBusca] = useState("");
  const [mobileView, setMobileView] = useState<"lista" | "chat">("lista");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ativa = conversas.find((c) => c.id === ativaId)!;
  const totalNaoLidas = conversas.reduce((s, c) => s + c.naoLidas, 0);

  function selecionarConversa(id: string) {
    setConversas((prev) =>
      prev.map((c) => c.id === id ? { ...c, naoLidas: 0 } : c)
    );
    setAtivaId(id);
    setMobileView("chat");
  }

  function enviar() {
    if (!input.trim()) return;
    const nova: Mensagem = {
      id: Date.now(),
      autor: "Izabor Cruz",
      tipo: "izabor",
      texto: input,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      cor: "#C9A84C",
    };
    setConversas((prev) =>
      prev.map((c) =>
        c.id === ativaId
          ? { ...c, mensagens: [...c.mensagens, nova], ultimaMsg: `Você: ${input}`, ultimaHora: nova.hora }
          : c
      )
    );
    setInput("");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ativa?.mensagens.length]);

  const conversasFiltradas = conversas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function PainelConversas() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Search */}
        <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-input)", borderRadius: 8, padding: "8px 12px" }}>
            <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar conversa..."
              style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "var(--text)", flex: 1 }}
            />
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversasFiltradas.map((c) => {
            const ativo = c.id === ativaId;
            return (
              <button
                key={c.id}
                onClick={() => selecionarConversa(c.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", border: "none", cursor: "pointer",
                  background: ativo ? "var(--gold-light)" : "transparent",
                  borderLeft: ativo ? "3px solid var(--gold)" : "3px solid transparent",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: c.tipo === "grupo" ? 10 : "50%",
                  background: c.cor + "20", color: c.cor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  border: `1px solid ${c.cor}30`,
                }}>
                  {c.tipo === "grupo" ? <Users size={16} style={{ color: c.cor }} /> : c.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: ativo ? 700 : 600, color: ativo ? "var(--gold)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.nome}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginLeft: 6 }}>{c.ultimaHora}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {c.ultimaMsg}
                    </span>
                    {c.naoLidas > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: "50%", background: "var(--gold)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {c.naoLidas}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <MessageCircle size={18} style={{ color: "var(--gold)" }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Chat das Mentoradas</h1>
            {totalNaoLidas > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(201,168,76,0.2)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                {totalNaoLidas} não lida{totalNaoLidas > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Grupo BW + conversas diretas — responda como Izabor.
          </p>
        </div>
      </div>

      {/* ── Mobile: mostra lista OU chat ── */}

      {/* MOBILE — Lista de conversas */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Mobile: alterna entre lista e chat */}
        <div style={{ display: "flex", height: "calc(100vh - 200px)", minHeight: 500, overflow: "hidden" }}>

          {/* Painel esquerdo — sempre visível no desktop, condicional no mobile */}
          <div
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            className="chat-sidebar-panel"
          >
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                Conversas
              </p>
            </div>
            <PainelConversas />
          </div>

          {/* Painel direito — conversa ativa */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              {/* Botão voltar — só mobile */}
              <button
                className="chat-back-btn"
                onClick={() => setMobileView("lista")}
                style={{ display: "none", background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, marginRight: 4 }}
              >
                ← Conversas
              </button>

              <div style={{
                width: 34, height: 34, borderRadius: ativa.tipo === "grupo" ? 8 : "50%",
                background: ativa.cor + "20", color: ativa.cor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, flexShrink: 0,
              }}>
                {ativa.tipo === "grupo" ? <Users size={15} style={{ color: ativa.cor }} /> : ativa.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ativa.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                  {ativa.tipo === "grupo" ? "Grupo com todas as alunas BW" : "Conversa direta — privada"}
                </p>
              </div>
              {ativa.tipo === "grupo" && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(134,239,172,0.1)", color: "#86efac", border: "1px solid rgba(134,239,172,0.2)", flexShrink: 0 }}>
                  12 alunas
                </span>
              )}
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {ativa.mensagens.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", gap: 10 }}>
                  <Circle size={28} style={{ color: "var(--text-muted)" }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Nenhuma mensagem ainda</p>
                </div>
              )}
              {ativa.mensagens.map((msg) => {
                const isIzabor = msg.tipo === "izabor";
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: isIzabor ? "row-reverse" : "row", alignItems: "flex-start", gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: msg.cor + "20", border: `1px solid ${msg.cor}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: msg.cor, flexShrink: 0,
                    }}>
                      {isIzabor ? <Sparkles size={12} /> : msg.autor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isIzabor ? "flex-end" : "flex-start" }}>
                      <span style={{ fontSize: 10, color: msg.cor, fontWeight: 600, marginBottom: 3 }}>
                        {isIzabor ? "✨ Você (Izabor)" : msg.autor}
                      </span>
                      <div style={{
                        padding: "10px 13px", lineHeight: 1.6, fontSize: 13,
                        borderRadius: isIzabor ? "12px 12px 0 12px" : "0 12px 12px 12px",
                        background: isIzabor ? "rgba(201,168,76,0.15)" : "var(--bg-input)",
                        border: isIzabor ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                        color: "var(--text-soft)",
                        wordBreak: "break-word",
                      }}>
                        {msg.texto}
                      </div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{msg.hora}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-input)", borderRadius: 10, padding: "9px 12px", border: "1px solid var(--border)" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--gold-light)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={11} style={{ color: "var(--gold)" }} />
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviar()}
                  placeholder={ativa.tipo === "grupo" ? "Escrever para o grupo como Izabor..." : `Responder a ${ativa.nome.split(" ")[0]}...`}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text)" }}
                />
                <button
                  onClick={enviar}
                  disabled={!input.trim()}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", border: "none",
                    background: input.trim() ? "var(--gold)" : "var(--bg-card)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: input.trim() ? "pointer" : "default",
                    transition: "all 0.2s", flexShrink: 0,
                  }}
                >
                  <Send size={13} style={{ color: input.trim() ? "#000" : "var(--text-muted)" }} />
                </button>
              </div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "5px 0 0", paddingLeft: 2 }}>
                Enviando como <strong style={{ color: "var(--gold)" }}>Izabor Cruz</strong> — a mentorada verá no chat dela
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para mobile — painel lateral some, mostra apenas a view ativa */}
      <style>{`
        @media (max-width: 768px) {
          .chat-sidebar-panel {
            ${mobileView === "chat" ? "display: none !important;" : "width: 100% !important; border-right: none !important;"}
          }
          .chat-back-btn {
            display: ${mobileView === "chat" ? "block" : "none"} !important;
          }
        }
      `}</style>
    </div>
  );
}
