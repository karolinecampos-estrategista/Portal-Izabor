import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tarefas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("tarefas")
    .insert({
      titulo: body.titulo,
      descricao: body.descricao ?? null,
      status: body.status ?? "Pendente",
      prioridade: body.prioridade ?? "Media",
      pilar: body.pilar ?? null,
      mentorada_nome: body.mentorada_nome ?? null,
      data_entrega: body.data_entrega ?? null,
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
  if ("status" in campos) updates.status = campos.status;
  if ("titulo" in campos) updates.titulo = campos.titulo;
  if ("descricao" in campos) updates.descricao = campos.descricao;
  if ("prioridade" in campos) updates.prioridade = campos.prioridade;
  if ("pilar" in campos) updates.pilar = campos.pilar;
  if ("mentorada_nome" in campos) updates.mentorada_nome = campos.mentorada_nome;
  if ("data_entrega" in campos) updates.data_entrega = campos.data_entrega;

  const { data, error } = await supabaseAdmin
    .from("tarefas")
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

  const { error } = await supabaseAdmin.from("tarefas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
