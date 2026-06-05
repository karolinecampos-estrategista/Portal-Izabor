"use client";

import { Lock, ExternalLink } from "lucide-react";
import Link from "next/link";

const PRODUTO_INFO: Record<string, { nome: string; emoji: string; link: string | null; lancamento?: string }> = {
  seja_incomum: { nome: "Seja Incomum",           emoji: "👑", link: "https://izaborcruz.com.br/sejaincomum/" },
  club_bw:      { nome: "Club BW",                emoji: "💜", link: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G" },
  livro:        { nome: "Livro — Mulher Incomum",  emoji: "📖", link: null, lancamento: "Lançamento 10/10 · No evento" },
  evento:       { nome: "Evento Simplesmente Seja",emoji: "🔥", link: "https://simplesmenteseja.izaborcruz.com.br" },
};

interface Props {
  produto: string;
  ativo: boolean;
  children: React.ReactNode;
}

export default function BloqueadoPorProduto({ produto, ativo, children }: Props) {
  if (ativo) return <>{children}</>;

  const info = PRODUTO_INFO[produto] ?? { nome: produto, emoji: "🔒", link: null };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", paddingTop: 20 }}>
      <div
        className="card"
        style={{
          padding: "52px 32px",
          textAlign: "center",
          background: "linear-gradient(135deg, #111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Lock size={26} style={{ color: "var(--gold)" }} />
        </div>

        <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Conteúdo exclusivo
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
          {info.emoji} {info.nome}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
          Este conteúdo é exclusivo para quem adquiriu o <strong style={{ color: "var(--text-soft)" }}>{info.nome}</strong>. Desbloqueie agora para ter acesso completo.
        </p>

        {info.lancamento ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", fontSize: 13, color: "#fbbf24", fontWeight: 600 }}>
            🗓️ {info.lancamento}
          </div>
        ) : info.link ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: "var(--gold)", color: "#000", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
            >
              <ExternalLink size={15} /> Quero ter acesso
            </a>
            <Link
              href="/mentorada/produtos"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}
            >
              Ver todos os programas
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
