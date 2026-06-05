import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("eventos")
    .select("*")
    .order("data_evento", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("eventos")
    .insert({
      nome:            body.nome,
      descricao:       body.descricao       ?? null,
      data_evento:     body.dataEvento      ?? null,
      horario:         body.horario         ?? null,
      local:           body.local           ?? null,
      endereco:        body.endereco        ?? null,
      tipo:            body.tipo            ?? "presencial",
      status:          body.status          ?? "ativo",
      link_inscricao:  body.linkInscricao   ?? null,
      vagas_total:     body.vagasTotal      ?? null,
      vagas_vip:       body.vagasVip        ?? null,
      notas:           body.notas           ?? null,
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
  if (campos.nome           !== undefined) update.nome           = campos.nome;
  if (campos.descricao      !== undefined) update.descricao      = campos.descricao;
  if (campos.dataEvento     !== undefined) update.data_evento    = campos.dataEvento;
  if (campos.horario        !== undefined) update.horario        = campos.horario;
  if (campos.local          !== undefined) update.local          = campos.local;
  if (campos.endereco       !== undefined) update.endereco       = campos.endereco;
  if (campos.tipo           !== undefined) update.tipo           = campos.tipo;
  if (campos.status         !== undefined) update.status         = campos.status;
  if (campos.linkInscricao  !== undefined) update.link_inscricao = campos.linkInscricao;
  if (campos.vagasTotal     !== undefined) update.vagas_total    = campos.vagasTotal;
  if (campos.vagasVip       !== undefined) update.vagas_vip      = campos.vagasVip;
  if (campos.notas          !== undefined) update.notas          = campos.notas;

  const { data, error } = await supabaseAdmin
    .from("eventos")
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
    .from("eventos")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
