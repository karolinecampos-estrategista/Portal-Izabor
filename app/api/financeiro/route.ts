import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data: lancamentos, error } = await supabaseAdmin
    .from("lancamentos_financeiros")
    .select("*")
    .order("data", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with mentorada info (avoid FK join syntax issues)
  const ids = [...new Set(
    (lancamentos ?? [])
      .map((l: Record<string, unknown>) => l.mentorada_id as string)
      .filter(Boolean)
  )];

  const mentoradasMap = new Map<string, Record<string, unknown>>();
  if (ids.length > 0) {
    const { data: ments } = await supabaseAdmin
      .from("mentoradas")
      .select("id, nome, email, valor_negociado, total_parcelas, forma_pagamento, anotacoes_negociacao, cor, acesso")
      .in("id", ids);
    (ments ?? []).forEach((m: Record<string, unknown>) => mentoradasMap.set(m.id as string, m));
  }

  const enriched = (lancamentos ?? []).map((l: Record<string, unknown>) => ({
    ...l,
    mentorada: l.mentorada_id ? (mentoradasMap.get(l.mentorada_id as string) ?? null) : null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("lancamentos_financeiros")
    .insert({
      tipo:           body.tipo           ?? "entrada",
      valor:          body.valor,
      descricao:      body.descricao,
      data:           body.data           ?? new Date().toISOString().split("T")[0],
      categoria:      body.categoria      ?? "outro",
      observacoes:    body.observacoes    ?? null,
      mentorada_id:   body.mentorada_id   ?? null,
      numero_parcela: body.numero_parcela ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optionally sync negotiation data back to mentorada record
  if (body.mentorada_id && body.atualizar_negociacao) {
    const upd: Record<string, unknown> = {};
    if (body.valor_negociado   != null) upd.valor_negociado     = body.valor_negociado;
    if (body.total_parcelas    != null) upd.total_parcelas       = body.total_parcelas;
    if (body.forma_pagamento)           upd.forma_pagamento      = body.forma_pagamento;
    if (body.anotacoes_negociacao)      upd.anotacoes_negociacao = body.anotacoes_negociacao;
    if (Object.keys(upd).length > 0) {
      await supabaseAdmin.from("mentoradas").update(upd).eq("id", body.mentorada_id);
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (campos.tipo           !== undefined) update.tipo           = campos.tipo;
  if (campos.valor          !== undefined) update.valor          = campos.valor;
  if (campos.descricao      !== undefined) update.descricao      = campos.descricao;
  if (campos.data           !== undefined) update.data           = campos.data;
  if (campos.categoria      !== undefined) update.categoria      = campos.categoria;
  if (campos.observacoes    !== undefined) update.observacoes    = campos.observacoes;
  if (campos.mentorada_id   !== undefined) update.mentorada_id   = campos.mentorada_id;
  if (campos.numero_parcela !== undefined) update.numero_parcela = campos.numero_parcela;

  const { data, error } = await supabaseAdmin
    .from("lancamentos_financeiros")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync negotiation data if requested
  if (campos.mentorada_id && campos.atualizar_negociacao) {
    const upd: Record<string, unknown> = {};
    if (campos.valor_negociado   != null) upd.valor_negociado     = campos.valor_negociado;
    if (campos.total_parcelas    != null) upd.total_parcelas       = campos.total_parcelas;
    if (campos.forma_pagamento)           upd.forma_pagamento      = campos.forma_pagamento;
    if (campos.anotacoes_negociacao)      upd.anotacoes_negociacao = campos.anotacoes_negociacao;
    if (Object.keys(upd).length > 0) {
      await supabaseAdmin.from("mentoradas").update(upd).eq("id", campos.mentorada_id);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("lancamentos_financeiros")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
