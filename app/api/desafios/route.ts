import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("desafios")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let mentorada_nome = body.mentorada_nome ?? null;
  if (body.mentorada_id && !mentorada_nome) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome")
      .eq("id", body.mentorada_id)
      .maybeSingle();
    if (m) mentorada_nome = m.nome;
  }

  const insertData: Record<string, unknown> = {
    titulo:         body.titulo,
    descricao:      body.descricao      ?? null,
    pilar:          body.pilar          ?? "Fe",
    prazo:          body.prazo          ?? null,
    destino:        body.destino        ?? "todas-bw",
    mentorada_nome: mentorada_nome,
  };
  if (body.mentorada_id) insertData.mentorada_id = body.mentorada_id;

  const { data, error } = await supabaseAdmin
    .from("desafios")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if ("titulo"         in campos) updates.titulo         = campos.titulo;
  if ("descricao"      in campos) updates.descricao      = campos.descricao;
  if ("pilar"          in campos) updates.pilar          = campos.pilar;
  if ("prazo"          in campos) updates.prazo          = campos.prazo;
  if ("destino"        in campos) updates.destino        = campos.destino;
  if ("mentorada_nome" in campos) updates.mentorada_nome = campos.mentorada_nome;
  if (campos.mentorada_id) updates.mentorada_id = campos.mentorada_id;

  if (campos.mentorada_id) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome")
      .eq("id", campos.mentorada_id)
      .maybeSingle();
    if (m) updates.mentorada_nome = m.nome;
  }

  const { data, error } = await supabaseAdmin
    .from("desafios")
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

  const { error } = await supabaseAdmin.from("desafios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
