"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlaySquare, Trophy, Heart, MessageCircle, TrendingUp,
  Sunrise, User, ShoppingBag, Gift, Instagram, Youtube,
  Menu, X, LogOut, CalendarDays, BookHeart, CheckSquare,
  BookOpen, Activity, FileText, Stethoscope, Lock,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Props {
  mostrarFinanceiro?: boolean;
  produtosAtivos?: Record<string, boolean>;
}

// Produto necessário para cada rota (null = livre)
const PRODUTO_POR_ROTA: Record<string, string | null> = {
  "/mentorada/aulas":      "seja_incomum",
  "/mentorada/devocional": "seja_incomum",
  "/mentorada/plano":      "seja_incomum",
  "/mentorada/tarefas":    "seja_incomum",
  "/mentorada/jornada":    "seja_incomum",
  "/mentorada/diagnostico":"seja_incomum",
  "/mentorada/checkin":    "seja_incomum",
  "/mentorada/meu-inicio": "seja_incomum",
  "/mentorada/depoimentos":"club_bw",
  "/mentorada/chat":       "club_bw",
  "/mentorada/box-livro":  "livro",
  "/mentorada/financeiro": null, // controlado por mostrarFinanceiro
};

const SECTIONS = [
  {
    label: "Principal",
    items: [
      { href: "/mentorada", icon: LayoutDashboard, label: "Início" },
      { href: "/mentorada/agenda", icon: CalendarDays, label: "Agenda" },
    ],
  },
  {
    label: "Pessoal",
    items: [
      { href: "/mentorada/meu-inicio", icon: Sunrise, label: "Meu Começo" },
      { href: "/mentorada/diagnostico", icon: Stethoscope, label: "Meu Diagnóstico" },
      { href: "/mentorada/checkin", icon: Activity, label: "Check-in Semanal" },
      { href: "/mentorada/perfil", icon: User, label: "Meu Perfil" },
    ],
  },
  {
    label: "Seja Incomum",
    items: [
      { href: "/mentorada/aulas", icon: PlaySquare, label: "Aulas" },
      { href: "/mentorada/devocional", icon: BookHeart, label: "Devocional" },
      { href: "/mentorada/plano", icon: FileText, label: "Meu Plano de Ação" },
      { href: "/mentorada/tarefas", icon: CheckSquare, label: "Minhas Tarefas" },
      { href: "/mentorada/jornada", icon: Trophy, label: "Minha Jornada" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { href: "/mentorada/depoimentos", icon: Heart, label: "Depoimentos" },
      { href: "/mentorada/chat", icon: MessageCircle, label: "Chat" },
    ],
  },
  {
    label: "Livro",
    items: [
      { href: "/mentorada/box-livro", icon: BookOpen, label: "Box do Livro" },
    ],
  },
  {
    label: "Minha Área",
    items: [
      { href: "/mentorada/produtos", icon: Gift, label: "Meus Programas" },
      { href: "/mentorada/loja", icon: ShoppingBag, label: "Cupons & Loja" },
    ],
  },
];

export default function SidebarMentorada({ mostrarFinanceiro = false, produtosAtivos = {} }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function temAcesso(href: string): boolean {
    if (href === "/mentorada/financeiro") return mostrarFinanceiro;
    const produto = PRODUTO_POR_ROTA[href];
    if (!produto) return true; // livre
    return !!produtosAtivos[produto];
  }

  // Adiciona financeiro dinamicamente se liberado
  const sections = mostrarFinanceiro
    ? [...SECTIONS, { label: "Financeiro", items: [{ href: "/mentorada/financeiro", icon: TrendingUp, label: "Financeiro" }] }]
    : SECTIONS;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/acesso");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)", height: 52 }}
      >
        <div style={{ width: 36, height: 36, background: "#000", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
          <img src="/bw1.jpeg" alt="Build Woman" style={{ height: 36, width: 36, objectFit: "contain", mixBlendMode: "screen" }} />
        </div>
        <button onClick={() => setOpen(!open)} style={{ color: "rgba(240,240,240,0.7)", background: "none", border: "none", cursor: "pointer" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setOpen(false)} />
      )}

      <aside
        className={`sidebar-aside fixed top-0 left-0 h-full z-50 flex flex-col${open ? " sidebar-open" : ""}`}
        style={{ width: 220, background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex flex-col h-full" style={{ overflowY: "auto" }}>
          {/* Logo */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: "20px 16px 18px", borderBottom: "1px solid var(--sidebar-border)", flexShrink: 0 }}
          >
            <img
              src="/bw1.jpeg"
              alt="Build Woman"
              style={{ width: 140, height: 140, objectFit: "contain", display: "block", mixBlendMode: "screen" }}
            />
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 12px 16px", flex: 1 }}>
            {sections.map((section, si) => (
              <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 4 : 0 }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(201,168,76,0.55)", padding: "10px 8px 4px", margin: 0,
                }}>
                  {section.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/mentorada" && pathname.startsWith(href));
                    const livre = temAcesso(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`sidebar-link ${active ? "active" : ""}`}
                        style={!livre ? { opacity: 0.45 } : {}}
                      >
                        <Icon size={15} />
                        {label}
                        {!livre && <Lock size={10} style={{ marginLeft: "auto", opacity: 0.7 }} />}
                      </Link>
                    );
                  })}
                </div>
                {si < sections.length - 1 && (
                  <div style={{ height: 1, background: "rgba(201,168,76,0.12)", margin: "8px 8px 0" }} />
                )}
              </div>
            ))}
          </nav>

          {/* Social + logout */}
          <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--sidebar-border)", flexShrink: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.55)", marginBottom: 8 }}>
              Redes Sociais
            </p>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <a href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti" target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 8, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", fontSize: 11, color: "#f9a8d4", fontWeight: 500, textDecoration: "none" }}>
                <Instagram size={13} /> Insta
              </a>
              <a href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq" target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, color: "#fca5a5", fontWeight: 500, textDecoration: "none" }}>
                <Youtube size={13} /> YouTube
              </a>
            </div>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", cursor: "pointer", width: "100%" }}
            >
              <LogOut size={13} /> Sair do portal
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
