import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("aulas_bw")
    .select("*")
    .order("modulo", { ascending: true })
    .order("ordem", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("aulas_bw")
    .insert({
      titulo: body.titulo,
      descricao: body.descricao ?? null,
      duracao: body.duracao ?? null,
      modulo: body.modulo ?? null,
      ordem: body.ordem ?? 1,
      status: body.status ?? "rascunho",
      link: body.link ?? null,
      thumbnail: body.thumbnail ?? "✝️",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const updates: Record<string, unknown> = {};
  if ("titulo" in campos) updates.titulo = campos.titulo;
  if ("descricao" in campos) updates.descricao = campos.descricao;
  if ("duracao" in campos) updates.duracao = campos.duracao;
  if ("modulo" in campos) updates.modulo = campos.modulo;
  if ("ordem" in campos) updates.ordem = campos.ordem;
  if ("status" in campos) updates.status = campos.status;
  if ("link" in campos) updates.link = campos.link;
  if ("thumbnail" in campos) updates.thumbnail = campos.thumbnail;

  const { data, error } = await supabaseAdmin
    .from("aulas_bw")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin.from("aulas_bw").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
