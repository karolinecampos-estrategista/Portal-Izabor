"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  tipo: string;
  acesso: string;
  mostrarFinanceiro: boolean;
  produtosAtivos: Record<string, boolean>;
  carregando: boolean;
};

export function usePerfil(): Perfil {
  const [perfil, setPerfil] = useState<Perfil>({
    tipo: "extraordinaria",
    acesso: "mentoria",
    mostrarFinanceiro: false,
    produtosAtivos: {},
    carregando: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setPerfil(p => ({ ...p, carregando: false })); return; }
      const res = await fetch("/api/perfil", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil({
          tipo: data.tipo ?? "extraordinaria",
          acesso: data.acesso ?? "mentoria",
          mostrarFinanceiro: data.mostrarFinanceiro ?? false,
          produtosAtivos: data.produtosAtivos ?? {},
          carregando: false,
        });
      } else {
        setPerfil(p => ({ ...p, carregando: false }));
      }
    });
  }, []);

  return perfil;
}
