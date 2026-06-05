"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import SidebarMentorada from "./SidebarMentorada";
import { supabase } from "@/lib/supabase";

const ROTAS_PUBLICAS = ["/login", "/acesso", "/mentorada/acolhimento"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [tipo, setTipo] = useState<"admin" | "extraordinaria" | null>(null);
  const [mostrarFinanceiro, setMostrarFinanceiro] = useState(false);
  const [produtosAtivos, setProdutosAtivos] = useState<Record<string, boolean>>({});

  const isPublica = ROTAS_PUBLICAS.some((r) => pathname.startsWith(r));
  const isPortalExtra = pathname.startsWith("/mentorada");

  useEffect(() => {
    if (isPublica) { setVerificando(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace(isPortalExtra ? "/acesso" : "/login");
        return;
      }

      const res = await fetch("/api/perfil", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const perfil = res.ok ? await res.json() : { tipo: "mentorada" };

      // "mentorada" no banco → "extraordinaria" no front
      const t = perfil?.tipo === "admin" ? "admin" : "extraordinaria";
      setTipo(t);
      setMostrarFinanceiro(perfil?.mostrarFinanceiro ?? false);
      setProdutosAtivos(perfil?.produtosAtivos ?? {});

      // Redirecionamentos básicos
      if (t === "admin" && isPortalExtra) { router.replace("/"); return; }
      if (t === "extraordinaria" && !isPortalExtra) { router.replace("/mentorada"); return; }

      setVerificando(false);
    });
  }, [pathname]);

  if (isPublica) return <>{children}</>;
  if (verificando) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--gold-border)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <>
      {isPortalExtra && tipo === "extraordinaria"
        ? <SidebarMentorada mostrarFinanceiro={mostrarFinanceiro} produtosAtivos={produtosAtivos} />
        : <Sidebar />
      }
      <main className="main-layout">
        <div className="md:hidden" style={{ height: 52, flexShrink: 0 }} />
        {children}
      </main>
    </>
  );
}
