import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarAcessoExtraordinaria } from "@/lib/criar-acesso-extraordinaria";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("evento_ingressos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("evento_ingressos")
    .insert({
      nome:           body.nome,
      email:          body.email          ?? null,
      telefone:       body.telefone       ?? null,
      whatsapp:       body.whatsapp       ?? null,
      evento_nome:    body.eventoNome     ?? null,
      tipo_ingresso:  body.tipoIngresso   ?? "normal",
      status:         body.status         ?? "confirmado",
      data_ingresso:  body.dataIngresso   ?? new Date().toISOString().split("T")[0],
      notas:          body.notas          ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cria acesso de Extraordinária automaticamente (best-effort)
  criarAcessoExtraordinaria(body.email, body.nome, "evento").catch(() => null);

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const update: Record<string, unknown> = {};
  if (campos.nome          !== undefined) update.nome          = campos.nome;
  if (campos.email         !== undefined) update.email         = campos.email;
  if (campos.telefone      !== undefined) update.telefone      = campos.telefone;
  if (campos.whatsapp      !== undefined) update.whatsapp      = campos.whatsapp;
  if (campos.eventoNome    !== undefined) update.evento_nome   = campos.eventoNome;
  if (campos.tipoIngresso  !== undefined) update.tipo_ingresso = campos.tipoIngresso;
  if (campos.status        !== undefined) update.status        = campos.status;
  if (campos.dataIngresso  !== undefined) update.data_ingresso = campos.dataIngresso;
  if (campos.notas         !== undefined) update.notas         = campos.notas;

  const { data, error } = await supabaseAdmin
    .from("evento_ingressos")
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
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("evento_ingressos")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
