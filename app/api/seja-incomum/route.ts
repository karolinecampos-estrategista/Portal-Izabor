import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarAcessoExtraordinaria } from "@/lib/criar-acesso-extraordinaria";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seja_incomum_compradores")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("seja_incomum_compradores")
    .insert({
      nome:             body.nome,
      email:            body.email            ?? null,
      whatsapp:         body.whatsapp         ?? null,
      instagram:        body.instagram        ?? null,
      data_compra:      body.dataCompra       ?? new Date().toISOString().split("T")[0],
      status_acesso:    body.statusAcesso     ?? "ativo",
      progresso:        body.progresso        ?? 0,
      notas:            body.notas            ?? null,
      status_pagamento: body.statusPagamento  ?? "pendente",
      valor:            body.valor            ?? null,
      forma_pagamento:  body.formaPagamento   ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const produtos = Array.isArray(body.produtos) && body.produtos.length > 0
    ? body.produtos
    : ["seja_incomum"];
  const acesso = await criarAcessoExtraordinaria(body.email, body.nome, produtos).catch(() => null);

  return NextResponse.json({ ...data, _acesso: acesso });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const { data, error } = await supabaseAdmin
    .from("seja_incomum_compradores")
    .update({
      nome:             campos.nome,
      email:            campos.email,
      whatsapp:         campos.whatsapp,
      instagram:        campos.instagram,
      data_compra:      campos.dataCompra,
      status_acesso:    campos.statusAcesso,
      progresso:        campos.progresso,
      notas:            campos.notas,
      status_pagamento: campos.statusPagamento,
      valor:            campos.valor,
      forma_pagamento:  campos.formaPagamento,
    })
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
    .from("seja_incomum_compradores")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
