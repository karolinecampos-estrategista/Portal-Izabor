"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookHeart,
  Users,
  CalendarDays,
  PenLine,
  Sparkles,
  Menu,
  X,
  Target,
  Quote,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Heart,
  Trophy,
  TrendingUp,
  LayoutGrid,
  ListTodo,
  Package,
  PlaySquare,
  MessageCircle,
  LogOut,
  ClipboardList,
  Activity,
  FileText,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const sections = [
  {
    label: "Geral",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/agenda", icon: CalendarDays, label: "Agenda" },
      { href: "/metas", icon: Target, label: "Metas" },
      { href: "/conteudo", icon: PenLine, label: "Conteudo" },
      { href: "/frases", icon: Quote, label: "Banco de Frases" },
      { href: "/ideias", icon: Lightbulb, label: "Ideias" },
      { href: "/tarefas", icon: CheckSquare, label: "Minhas Tarefas" },
    ],
  },
  {
    label: "Mentoradas",
    items: [
      { href: "/dashboard-mentorandas", icon: LayoutGrid, label: "Dashboard" },
      { href: "/mentorandas", icon: Users, label: "Cadastro" },
      { href: "/aulas-bw", icon: PlaySquare, label: "Aulas BW" },
      { href: "/devocionais", icon: BookHeart, label: "Devocionais" },
      { href: "/desafios", icon: Trophy, label: "Desafios" },
      { href: "/tarefas-mentoradas", icon: ListTodo, label: "Tarefas" },
      { href: "/depoimentos-admin", icon: Heart, label: "Depoimentos" },
      { href: "/chat-admin", icon: MessageCircle, label: "Chat" },
      { href: "/sessoes", icon: ClipboardList, label: "Sessões" },
      { href: "/checkin", icon: Activity, label: "Check-in Semanal" },
      { href: "/planos", icon: FileText, label: "Planos de Ação" },
      { href: "/diagnosticos", icon: Stethoscope, label: "Diagnósticos" },
      { href: "/financeiro", icon: TrendingUp, label: "Financeiro" },
    ],
  },
  {
    label: "Produtos",
    items: [
      { href: "/box-livro", icon: Users, label: "Box · Compradores" },
      { href: "/box-livro/conteudo", icon: Package, label: "Box · Conteúdo" },
    ],
  },
  {
    label: "Espiritual",
    items: [
      { href: "/estudos", icon: BookOpen, label: "Estudos Biblicos" },
      { href: "/oracoes", icon: Heart, label: "Oracoes" },
    ],
  },
];

export default function Sidebar() {
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
        style={{ width: 220, background: "var(--bg-card)", borderRight: "1px solid var(--border)", padding: 0 }}
      >
        <div className="flex flex-col h-full" style={{ overflowY: "auto" }}>

          {/* Logo */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: "28px 16px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}
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
              Mentora de Mulheres
            </p>
          </div>

          {/* Nav com secoes */}
          <nav style={{ padding: "12px 12px 16px", flex: 1 }}>
            {sections.map((section, si) => (
              <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 4 : 0 }}>
                {/* Label da secao */}
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

                {/* Itens */}
                <div className="flex flex-col gap-0.5">
                  {section.items.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
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

                {/* Divisor entre secoes */}
                {si < sections.length - 1 && (
                  <div style={{ height: 1, background: "var(--border)", margin: "8px 8px 0" }} />
                )}
              </div>
            ))}
          </nav>

          {/* Bottom quote */}
          <div style={{ padding: "16px 16px 24px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5, textAlign: "center", fontStyle: "italic" }}>
              "Fé · Mentalidade · Liderança"
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}
