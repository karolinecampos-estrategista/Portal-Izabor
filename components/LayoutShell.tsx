"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import SidebarMentorada from "./SidebarMentorada";
import { supabase } from "@/lib/supabase";

const ROTAS_PUBLICAS = ["/login", "/mentorada/acolhimento"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [tipo, setTipo] = useState<"admin" | "mentorada" | null>(null);

  const isPublica = ROTAS_PUBLICAS.some((r) => pathname.startsWith(r));
  const isMentorada = pathname.startsWith("/mentorada");

  useEffect(() => {
    if (isPublica) { setVerificando(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: perfil } = await supabase
        .from("perfis")
        .select("tipo")
        .eq("id", session.user.id)
        .single();

      const t = perfil?.tipo ?? "mentorada";
      setTipo(t);

      if (t === "admin" && isMentorada) { router.replace("/"); return; }
      if (t === "mentorada" && !isMentorada) { router.replace("/mentorada"); return; }

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
      {isMentorada && tipo === "mentorada" ? <SidebarMentorada /> : <Sidebar />}
      <main className="main-layout">
        <div className="md:hidden" style={{ height: 52, flexShrink: 0 }} />
        {children}
      </main>
    </>
  );
}
