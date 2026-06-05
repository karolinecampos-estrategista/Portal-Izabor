import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — mentorada busca o próprio; admin pode passar ?mentorada_id=X
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "token inválido" }, { status: 401 });

  const { data: perfil } = await supabaseAdmin
    .from("perfis").select("tipo").eq("id", user.id).single();

  let mentoradaId: string;

  if (perfil?.tipo === "admin") {
    const idParam = new URL(req.url).searchParams.get("mentorada_id");
    if (!idParam) return NextResponse.json({ error: "mentorada_id obrigatório para admin" }, { status: 400 });
    mentoradaId = idParam;
  } else {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("id")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle();
    if (!m) return NextResponse.json(null);
    mentoradaId = m.id;
  }

  const { data } = await supabaseAdmin
    .from("meu_inicio")
    .select("id, foto_inicio, foto_atual, mensagem, atualizado_em")
    .eq("mentorada_id", mentoradaId)
    .maybeSingle();

  return NextResponse.json(data ?? null);
}

// POST/PATCH — admin salva/atualiza (upsert por mentorada_id)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  const { data: perfil } = user
    ? await supabaseAdmin.from("perfis").select("tipo").eq("id", user!.id).single()
    : { data: null };

  if (perfil?.tipo !== "admin") return NextResponse.json({ error: "acesso negado" }, { status: 403 });

  const body = await req.json();
  const { mentorada_id, foto_inicio, foto_atual, mensagem } = body;
  if (!mentorada_id) return NextResponse.json({ error: "mentorada_id obrigatório" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("meu_inicio")
    .upsert(
      { mentorada_id, foto_inicio: foto_inicio ?? null, foto_atual: foto_atual ?? null, mensagem: mensagem ?? null, atualizado_em: new Date().toISOString() },
      { onConflict: "mentorada_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
