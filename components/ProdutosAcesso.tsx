"use client";

import { useEffect, useState } from "react";
import { Crown, BookOpen, Flame, Heart, Lock, Unlock, Copy, Check, RefreshCw } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projeto-iza-nine.vercel.app";

const PRODUTOS = [
  {
    key: "acesso_seja_incomum",
    produto: "seja_incomum",
    nome: "Seja Incomum",
    descricao: "Video Aulas",
    icon: Crown,
    cor: "#C9A84C",
  },
  {
    key: "acesso_club_bw",
    produto: "club_bw",
    nome: "Club BW",
    descricao: "Mentoria",
    icon: Heart,
    cor: "#a78bfa",
  },
  {
    key: "acesso_box_livro",
    produto: "box_livro",
    nome: "Box do Livro",
    descricao: "Livro + Devocional 30 dias",
    icon: BookOpen,
    cor: "#86efac",
  },
  {
    key: "acesso_evento",
    produto: "evento",
    nome: "Simplesmente Seja",
    descricao: "Evento Izabor Cruz",
    icon: Flame,
    cor: "#fb923c",
  },
] as const;

interface AcessoData {
  id: string;
  nome: string;
  email: string;
  acesso_seja_incomum: boolean;
  acesso_club_bw: boolean;
  acesso_box_livro: boolean;
  acesso_evento: boolean;
  convite_enviado: boolean;
  slug?: string | null;
}

interface Props {
  email: string | null | undefined;
  nome: string;
  defaultProduto?: "seja_incomum" | "club_bw" | "box_livro" | "evento";
}

export default function ProdutosAcesso({ email, nome, defaultProduto = "seja_incomum" }: Props) {
  const [acesso, setAcesso] = useState<AcessoData | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "ok" | "erro" } | null>(null);

  useEffect(() => {
    if (!email) return;
    setCarregando(true);
    fetch(`/api/acesso-extraordinaria?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => { setAcesso(d); setCarregando(false); })
      .catch(() => setCarregando(false));
  }, [email]);

  if (!email) return null;

  async function toggleAcesso(campo: string, valorAtual: boolean) {
    if (!email) return;
    setAtualizando(campo);
    const res = await fetch("/api/acesso-extraordinaria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, [campo]: !valorAtual }),
    });
    const d = await res.json();
    if (d.error) {
      setMensagem({ texto: d.error, tipo: "erro" });
    } else {
      setAcesso(d);
    }
    setAtualizando(null);
  }

  async function reenviarConvite() {
    if (!email || !nome) return;
    setEnviandoConvite(true);
    const produtosAtivos = PRODUTOS
      .filter(p => acesso?.[p.key])
      .map(p => p.produto)[0] ?? defaultProduto;

    const res = await fetch("/api/acesso-extraordinaria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nome, produto: produtosAtivos }),
    });
    const d = await res.json();
    const msg = d.linkAcesso
      ? `${d.mensagem ?? "Acesso gerado!"} — Link copiado abaixo.`
      : (d.mensagem ?? d.error ?? "Convite enviado!");
    setMensagem({ texto: msg, tipo: d.ok !== false ? "ok" : "erro" });
    setEnviandoConvite(false);

    // Recarrega acesso para atualizar slug/link
    fetch(`/api/acesso-extraordinaria?email=${encodeURIComponent(email)}`)
      .then(r => r.json()).then(d => setAcesso(d));
  }

  const linkPortal = acesso?.slug
    ? `${SITE_URL}/portal/${acesso.slug}`
    : `${SITE_URL}/acesso`;

  function copiarLink() {
    navigator.clipboard.writeText(linkPortal).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const temAlgumAcesso = acesso && PRODUTOS.some(p => acesso[p.key]);

  return (
    <div style={{
      marginTop: 20,
      padding: "18px 20px",
      background: "rgba(201,168,76,0.06)",
      border: "1px solid rgba(201,168,76,0.2)",
      borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={14} style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: 1 }}>
            Acesso das Extraordinárias
          </span>
        </div>
        {acesso && (
          <span style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 99,
            background: acesso.convite_enviado ? "rgba(134,239,172,0.15)" : "rgba(107,114,128,0.15)",
            color: acesso.convite_enviado ? "#86efac" : "#6b7280",
          }}>
            {acesso.convite_enviado ? "✓ Convite enviado" : "Sem conta ainda"}
          </span>
        )}
      </div>

      {carregando ? (
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Carregando...</p>
      ) : (
        <>
          {/* Produtos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {PRODUTOS.map(p => {
              const temAcesso = acesso?.[p.key] ?? false;
              const Icon = p.icon;
              const atualizandoEsse = atualizando === p.key;
              return (
                <div key={p.key} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: temAcesso ? `${p.cor}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${temAcesso ? p.cor + "30" : "var(--border)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={14} style={{ color: temAcesso ? p.cor : "#6b7280" }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: temAcesso ? "#fff" : "var(--text-muted)", margin: 0 }}>
                        {p.nome}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{p.descricao}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acesso ? toggleAcesso(p.key, temAcesso) : reenviarConvite()}
                    disabled={atualizandoEsse || !acesso}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                      fontSize: 11, fontWeight: 600,
                      background: temAcesso ? "rgba(239,68,68,0.12)" : "rgba(201,168,76,0.15)",
                      border: `1px solid ${temAcesso ? "rgba(239,68,68,0.2)" : "rgba(201,168,76,0.3)"}`,
                      color: temAcesso ? "#f87171" : "#C9A84C",
                      opacity: atualizandoEsse ? 0.5 : 1,
                    }}
                  >
                    {temAcesso
                      ? <><Unlock size={10} /> Revogar</>
                      : <><Lock size={10} /> Liberar</>
                    }
                  </button>
                </div>
              );
            })}
          </div>

          {/* Link de acesso */}
          <div style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 600 }}>
              {acesso?.slug ? `Link exclusivo da aluna (/portal/${acesso.slug})` : "Link de acesso ao portal"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{
                fontSize: 11, color: acesso?.slug ? "#86efac" : "#C9A84C", flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {linkPortal}
              </code>
              <button
                onClick={copiarLink}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  background: copiado ? "rgba(134,239,172,0.15)" : "rgba(201,168,76,0.12)",
                  border: `1px solid ${copiado ? "rgba(134,239,172,0.3)" : "rgba(201,168,76,0.25)"}`,
                  color: copiado ? "#86efac" : "#C9A84C",
                }}
              >
                {copiado ? <><Check size={10} /> Copiado!</> : <><Copy size={10} /> Copiar</>}
              </button>
              <button
                onClick={reenviarConvite}
                disabled={enviandoConvite}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  opacity: enviandoConvite ? 0.5 : 1,
                }}
              >
                <RefreshCw size={10} /> {enviandoConvite ? "Enviando..." : !temAlgumAcesso ? "Criar conta" : "Reenviar convite"}
              </button>
            </div>
          </div>

          {/* Mensagem de feedback */}
          {mensagem && (
            <p style={{
              fontSize: 11, marginTop: 8,
              color: mensagem.tipo === "ok" ? "#86efac" : "#f87171",
            }}>
              {mensagem.tipo === "ok" ? "✓ " : "✗ "}{mensagem.texto}
            </p>
          )}
        </>
      )}
    </div>
  );
}
