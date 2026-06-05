import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("eventos_agenda")
    .select("*")
    .order("data", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("eventos_agenda")
    .insert({
      titulo:    body.titulo,
      data:      body.data,
      horario:   body.horario   || null,
      duracao:   body.duracao   || null,
      descricao: body.descricao || null,
      tipo:      body.tipo      ?? "outro",
      cor:       body.cor       ?? "#C9A84C",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const update: Record<string, unknown> = {};
  if (campos.titulo     !== undefined) update.titulo     = campos.titulo;
  if (campos.data       !== undefined) update.data       = campos.data;
  if (campos.horario    !== undefined) update.horario    = campos.horario;
  if (campos.duracao    !== undefined) update.duracao    = campos.duracao;
  if (campos.descricao  !== undefined) update.descricao  = campos.descricao;
  if (campos.tipo       !== undefined) update.tipo       = campos.tipo;
  if (campos.cor        !== undefined) update.cor        = campos.cor;

  const { data, error } = await supabaseAdmin
    .from("eventos_agenda")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("eventos_agenda").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
