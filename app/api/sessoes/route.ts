import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sessoes")
    .select("*")
    .order("data", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("sessoes")
    .insert({
      mentorada_id: body.mentorada_id ?? null,
      mentorada_nome: body.mentorada_nome,
      cor: body.cor ?? "#C9A84C",
      data: body.data,
      duracao: body.duracao ?? "60 min",
      status: body.status ?? "agendada",
      resumo: body.resumo ?? null,
      acoes: body.acoes ?? [],
      gravacao: body.gravacao ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const { data, error } = await supabaseAdmin
    .from("sessoes")
    .update({
      mentorada_id: campos.mentorada_id,
      mentorada_nome: campos.mentorada_nome,
      cor: campos.cor,
      data: campos.data,
      duracao: campos.duracao,
      status: campos.status,
      resumo: campos.resumo,
      acoes: campos.acoes,
      gravacao: campos.gravacao,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
