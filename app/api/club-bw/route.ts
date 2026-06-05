import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarAcessoExtraordinaria } from "@/lib/criar-acesso-extraordinaria";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("club_bw_compradores")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("club_bw_compradores")
    .insert({
      nome:             body.nome,
      email:            body.email            ?? null,
      whatsapp:         body.whatsapp         ?? null,
      instagram:        body.instagram        ?? null,
      data_compra:      body.dataCompra       ?? new Date().toISOString().split("T")[0],
      status_acesso:    body.statusAcesso     ?? "ativo",
      mes_inicio:       body.mesInicio        ?? null,
      mes_fim:          body.mesFim           ?? null,
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
    : ["club_bw"];
  const acesso = await criarAcessoExtraordinaria(body.email, body.nome, produtos).catch(() => null);

  return NextResponse.json({ ...data, _acesso: acesso });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const update: Record<string, unknown> = {};
  if (campos.nome         !== undefined) update.nome          = campos.nome;
  if (campos.email        !== undefined) update.email         = campos.email;
  if (campos.whatsapp     !== undefined) update.whatsapp      = campos.whatsapp;
  if (campos.instagram    !== undefined) update.instagram     = campos.instagram;
  if (campos.dataCompra   !== undefined) update.data_compra   = campos.dataCompra;
  if (campos.statusAcesso !== undefined) update.status_acesso = campos.statusAcesso;
  if (campos.mesInicio        !== undefined) update.mes_inicio       = campos.mesInicio;
  if (campos.mesFim           !== undefined) update.mes_fim          = campos.mesFim;
  if (campos.notas            !== undefined) update.notas            = campos.notas;
  if (campos.statusPagamento  !== undefined) update.status_pagamento = campos.statusPagamento;
  if (campos.valor            !== undefined) update.valor            = campos.valor;
  if (campos.formaPagamento   !== undefined) update.forma_pagamento  = campos.formaPagamento;

  const { data, error } = await supabaseAdmin
    .from("club_bw_compradores")
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
    .from("club_bw_compradores")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
