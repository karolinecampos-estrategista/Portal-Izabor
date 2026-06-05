import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  // Pega o token de autorização do header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ tipo: null }, { status: 401 });
  }

  // Verifica o usuário pelo token
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ tipo: null }, { status: 401 });
  }

  // Busca o perfil com a chave admin (bypassa RLS)
  const { data: perfil } = await supabaseAdmin
    .from("perfis")
    .select("tipo, nome")
    .eq("id", user.id)
    .single();

  const tipo = (perfil?.tipo ?? "mentorada") as "admin" | "mentorada";

  // Para mentoradas, busca o campo acesso da tabela mentoradas
  let acesso: "mentoria" | "livro" | "ambos" = "mentoria";
  if (tipo === "mentorada") {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("acesso, mostrar_financeiro, produtos_ativos")
      .eq("user_id", user.id)
      .single();
    if (m?.acesso) acesso = m.acesso as "mentoria" | "livro" | "ambos";
    return NextResponse.json({
      tipo,
      acesso,
      mostrarFinanceiro: m?.mostrar_financeiro ?? false,
      produtosAtivos: m?.produtos_ativos ?? {},
      nome: perfil?.nome ?? null,
      id: user.id,
    });
  }

  return NextResponse.json({
    tipo,
    acesso,
    mostrarFinanceiro: true,
    produtosAtivos: {},
    nome: perfil?.nome ?? null,
    id: user.id,
  });
}
