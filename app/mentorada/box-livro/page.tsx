"use client";

import { Loader2 } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";
import BloqueadoPorProduto from "@/components/BloqueadoPorProduto";
import { BookOpen, Crown } from "lucide-react";

export default function BoxLivroMentorada() {
  const perfil = usePerfil();

  if (perfil.carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <BloqueadoPorProduto produto="livro" ativo={!!perfil.produtosAtivos?.box_livro}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <BookOpen size={16} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Box do Livro</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mulher Incomum — Acompanhamento</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Sessões em grupo, materiais de apoio e reflexões para aprofundar sua leitura.
          </p>
        </div>

        <div className="card glow-gold" style={{ padding: "48px 32px", textAlign: "center", background: "linear-gradient(135deg, #111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Crown size={24} style={{ color: "var(--gold)" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: "0 0 10px" }}>Conteúdo em preparação</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            A Izabor está preparando os materiais, capítulos e encontros do Box do Livro. Em breve tudo estará disponível aqui.
          </p>
        </div>
      </div>
    </BloqueadoPorProduto>
  );
}
