"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlaySquare,
  Trophy,
  Heart,
  MessageCircle,
  TrendingUp,
  Sunrise,
  User,
  ShoppingBag,
  Gift,
  Instagram,
  Youtube,
  Sparkles,
  Menu,
  X,
  LogOut,
  CalendarDays,
  BookHeart,
  CheckSquare,
  BookOpen,
  Activity,
  FileText,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const sections = [
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
    label: "Conteúdo BW",
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
    label: "Exclusivos",
    items: [
      { href: "/mentorada/produtos", icon: Gift, label: "Meus Programas" },
      { href: "/mentorada/loja", icon: ShoppingBag, label: "Cupons & Loja" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/mentorada/financeiro", icon: TrendingUp, label: "Financeiro" },
    ],
  },
];

export default function SidebarMentorada() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", height: 52 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em" }}>
            IZABOR CRUZ
          </span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ color: "var(--text-soft)", background: "none", border: "none", cursor: "pointer" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-aside fixed top-0 left-0 h-full z-50 flex flex-col${open ? " sidebar-open" : ""}`}
        style={{ width: 220, background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      >
        <div className="flex flex-col h-full" style={{ overflowY: "auto" }}>

          {/* Logo */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: "24px 16px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold-light)", border: "1px solid var(--gold-border)", marginBottom: 10 }}
            >
              <Sparkles size={18} style={{ color: "var(--gold)" }} />
            </div>
            <p style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Izabor Cruz
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 2, textAlign: "center" }}>
              Portal da Mentorada
            </p>
            {/* Badge mentorada */}
            <div style={{ marginTop: 10, padding: "3px 10px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 999 }}>
              <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>✨ Mentoria BW</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 12px 16px", flex: 1 }}>
            {sections.map((section, si) => (
              <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 4 : 0 }}>
                <p style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  padding: "10px 8px 4px",
                  margin: 0,
                }}>
                  {section.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/mentorada" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`sidebar-link ${active ? "active" : ""}`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
                {si < sections.length - 1 && (
                  <div style={{ height: 1, background: "var(--border)", margin: "8px 8px 0" }} />
                )}
              </div>
            ))}
          </nav>

          {/* Social + logout */}
          <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
              Redes Sociais
            </p>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <a
                href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "7px 0",
                  borderRadius: 8,
                  background: "rgba(236,72,153,0.1)",
                  border: "1px solid rgba(236,72,153,0.2)",
                  fontSize: 11,
                  color: "#f9a8d4",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <Instagram size={13} /> Insta
              </a>
              <a
                href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "7px 0",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  fontSize: 11,
                  color: "#fca5a5",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <Youtube size={13} /> YouTube
              </a>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-muted)",
                background: "none",
                border: "1px solid var(--border)",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.15s",
              }}
            >
              <LogOut size={13} /> Sair do portal
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
