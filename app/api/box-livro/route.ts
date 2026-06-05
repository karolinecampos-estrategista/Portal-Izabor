import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarAcessoExtraordinaria } from "@/lib/criar-acesso-extraordinaria";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("box_livro_compradores")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("box_livro_compradores")
    .insert({
      nome:               body.nome,
      email:              body.email              ?? null,
      whatsapp:           body.whatsapp           ?? null,
      instagram:          body.instagram          ?? null,
      data_compra:        body.dataCompra         ?? new Date().toISOString().split("T")[0],
      variante:           body.variante           ?? "completo",
      status_entrega:     body.statusEntrega      ?? "pendente",
      nivel_engajamento:  body.nivelEngajamento   ?? "sem-contato",
      status_upsell:      body.statusUpsell       ?? "nao-abordada",
      tem_acesso_bw:      body.temAcessoBW        ?? false,
      notas:              body.notas              ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  criarAcessoExtraordinaria(body.email, body.nome, "box_livro").catch(() => null);

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const update: Record<string, unknown> = {};
  if (campos.nome             !== undefined) update.nome              = campos.nome;
  if (campos.email            !== undefined) update.email             = campos.email;
  if (campos.whatsapp         !== undefined) update.whatsapp          = campos.whatsapp;
  if (campos.instagram        !== undefined) update.instagram         = campos.instagram;
  if (campos.dataCompra       !== undefined) update.data_compra       = campos.dataCompra;
  if (campos.variante         !== undefined) update.variante          = campos.variante;
  if (campos.statusEntrega    !== undefined) update.status_entrega    = campos.statusEntrega;
  if (campos.nivelEngajamento !== undefined) update.nivel_engajamento = campos.nivelEngajamento;
  if (campos.statusUpsell     !== undefined) update.status_upsell     = campos.statusUpsell;
  if (campos.temAcessoBW      !== undefined) update.tem_acesso_bw     = campos.temAcessoBW;
  if (campos.notas            !== undefined) update.notas             = campos.notas;

  const { data, error } = await supabaseAdmin
    .from("box_livro_compradores")
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
    .from("box_livro_compradores")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
