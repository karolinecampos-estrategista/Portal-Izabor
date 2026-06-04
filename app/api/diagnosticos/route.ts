import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("diagnosticos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("diagnosticos")
    .insert({
      user_id: body.user_id ?? null,
      nome: body.nome,
      email: body.email ?? null,
      programa: body.programa ?? null,
      perfil: body.perfil ?? null,
      cor: body.cor ?? "#C9A84C",
      foco: body.foco ?? [],
      respostas: body.respostas ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
