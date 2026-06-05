"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PlaySquare, Trophy, Heart, MessageCircle,
  User, ShoppingBag, Gift, Instagram, Youtube,
  Menu, X, LogOut, BookHeart, CheckSquare,
  BookOpen, Activity, FileText, Stethoscope, ClipboardList,
  Sunrise, CreditCard, Flame, Lock,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  produtosAtivos?: Record<string, boolean>;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface Section {
  label: string;
  items: NavItem[];
  cor?: string;
  bloqueado?: boolean;
  linkAquisicao?: string;
}

function buildSections(p: Record<string, boolean>): Section[] {
  const sections: Section[] = [
    {
      label: "Principal",
      items: [
        { href: "/mentorada",        icon: LayoutDashboard, label: "Início" },
        { href: "/mentorada/perfil", icon: User,            label: "Meu Perfil" },
      ],
    },
  ];

  sections.push({
    label: "Seja Incomum",
    cor: "#C9A84C",
    bloqueado: !p.seja_incomum,
    linkAquisicao: "https://izaborcruz.com.br/sejaincomum/",
    items: [
      { href: "/mentorada/aulas", icon: PlaySquare, label: "Aulas" },
    ],
  });

  sections.push({
    label: "Club BW",
    cor: "#a78bfa",
    bloqueado: !p.club_bw,
    linkAquisicao: "https://pay.hub.la/QluuN4fzJrLQBWEnra8G",
    items: [
      { href: "/mentorada/minhas-sessoes", icon: ClipboardList, label: "Minhas Sessões" },
      { href: "/mentorada/checkin",        icon: Activity,      label: "Check-in Semanal" },
      { href: "/mentorada/diagnostico",    icon: Stethoscope,   label: "Meu Diagnóstico" },
      { href: "/mentorada/plano",          icon: FileText,      label: "Meu Plano de Ação" },
      { href: "/mentorada/tarefas",        icon: CheckSquare,   label: "Minhas Tarefas" },
      { href: "/mentorada/devocional",     icon: BookHeart,     label: "Devocional" },
      { href: "/mentorada/jornada",        icon: Trophy,        label: "Minha Jornada" },
      { href: "/mentorada/meu-inicio",     icon: Sunrise,       label: "Meu Começo" },
      { href: "/mentorada/depoimentos",    icon: Heart,         label: "Depoimentos" },
      { href: "/mentorada/chat",           icon: MessageCircle, label: "Chat" },
    ],
  });

  sections.push({
    label: "Box do Livro",
    cor: "#86efac",
    bloqueado: !p.box_livro,
    linkAquisicao: "/mentorada/produtos",
    items: [
      { href: "/mentorada/box-livro", icon: BookOpen, label: "Box do Livro" },
    ],
  });

  if (p.evento) {
    sections.push({
      label: "Simplesmente Seja",
      cor: "#fb923c",
      items: [
        { href: "/mentorada/evento", icon: Flame, label: "Evento" },
      ],
    });
  }

  sections.push({
    label: "Minha Área",
    items: [
      { href: "/mentorada/produtos",    icon: Gift,       label: "Adquirir Programas" },
      { href: "/mentorada/financeiro",  icon: CreditCard, label: "Meus Pagamentos" },
      { href: "/mentorada/loja",        icon: ShoppingBag,label: "Cupons & Loja" },
    ],
  });

  return sections;
}

export default function SidebarMentorada({ produtosAtivos = {} }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const sections = buildSections(produtosAtivos);

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
        <div style={{ background: "var(--sidebar-bg)", isolation: "isolate", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }}>
          <img src="/bw1.jpeg" alt="Build Woman" style={{ height: 38, width: 38, objectFit: "contain", mixBlendMode: "screen" }} />
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
          <div className="flex flex-col items-center justify-center" style={{ padding: "20px 16px 18px", borderBottom: "1px solid var(--sidebar-border)", flexShrink: 0, background: "var(--sidebar-bg)", isolation: "isolate" }}>
            <img src="/bw1.jpeg" alt="Build Woman" style={{ width: 140, height: 140, objectFit: "contain", display: "block", mixBlendMode: "screen" }} />
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 12px 16px", flex: 1 }}>
            {sections.map((section, si) => {
              const bloqueado = !!section.bloqueado;
              return (
                <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 4 : 0, opacity: bloqueado ? 0.55 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 8px 4px" }}>
                    <p style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                      color: section.cor ? section.cor + (bloqueado ? "66" : "88") : "rgba(201,168,76,0.55)",
                      margin: 0, flex: 1,
                    }}>
                      {section.label}
                    </p>
                    {bloqueado && section.linkAquisicao && (
                      <a
                        href={section.linkAquisicao}
                        target={section.linkAquisicao.startsWith("http") ? "_blank" : undefined}
                        rel={section.linkAquisicao.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 4, background: (section.cor ?? "#C9A84C") + "18", border: `1px solid ${(section.cor ?? "#C9A84C")}33`, fontSize: 8, fontWeight: 700, color: section.cor ?? "#C9A84C", textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0 }}
                      >
                        <Lock size={7} /> Adquirir
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map(({ href, icon: Icon, label }) => {
                      if (bloqueado) {
                        return (
                          <a
                            key={href}
                            href={section.linkAquisicao ?? "/mentorada/produtos"}
                            target={section.linkAquisicao?.startsWith("http") ? "_blank" : undefined}
                            rel={section.linkAquisicao?.startsWith("http") ? "noopener noreferrer" : undefined}
                            onClick={() => setOpen(false)}
                            className="sidebar-link"
                            style={{ cursor: "pointer", textDecoration: "none" }}
                          >
                            <Lock size={13} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{label}</span>
                          </a>
                        );
                      }
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
                    <div style={{ height: 1, background: "rgba(201,168,76,0.12)", margin: "8px 8px 0" }} />
                  )}
                </div>
              );
            })}
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
