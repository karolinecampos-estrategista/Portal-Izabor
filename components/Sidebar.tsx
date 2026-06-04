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
        style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)", height: 52 }}
      >
        <img src="/logo-bw.jpeg" alt="Build Woman" style={{ height: 36, width: 36, objectFit: "cover", borderRadius: 6 }} />
        <button onClick={() => setOpen(!open)} style={{ color: "rgba(240,240,240,0.7)", background: "none", border: "none", cursor: "pointer" }}>
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
        style={{ width: 220, background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)", padding: 0 }}
      >
        <div className="flex flex-col h-full" style={{ overflowY: "auto" }}>

          {/* Logo */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: "20px 16px 18px", borderBottom: "1px solid var(--sidebar-border)", flexShrink: 0 }}
          >
            <img
              src="/logo-bw.jpeg"
              alt="Build Woman"
              style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 12, display: "block" }}
            />
          </div>

          {/* Nav com secoes */}
          <nav style={{ padding: "12px 12px 16px", flex: 1 }}>
            {sections.map((section, si) => (
              <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 4 : 0 }}>
                <p style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(201,168,76,0.55)",
                  padding: "10px 8px 4px",
                  margin: 0,
                }}>
                  {section.label}
                </p>

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

                {si < sections.length - 1 && (
                  <div style={{ height: 1, background: "rgba(201,168,76,0.12)", margin: "8px 8px 0" }} />
                )}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--sidebar-border)", flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "rgba(240,240,240,0.55)", background: "none", border: "1px solid rgba(201,168,76,0.2)", cursor: "pointer", width: "100%", transition: "all 0.15s" }}
            >
              <LogOut size={13} /> Sair do painel
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
