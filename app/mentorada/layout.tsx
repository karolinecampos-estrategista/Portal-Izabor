"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MentoradaLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;

      const userId = session.user.id;
      const email = session.user.email;

      // Verifica se já está vinculada pelo id ou user_id
      const { data: mentorada } = await supabase
        .from("mentoradas")
        .select("id")
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle();

      if (mentorada) return; // Vínculo já existe, nada a fazer

      // Não encontrou — tenta vincular pelo e-mail via API
      if (email) {
        await fetch("/api/sync-mentorada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, email }),
        });
      }
    });
  }, []);

  return <>{children}</>;
}
