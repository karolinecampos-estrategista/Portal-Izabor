import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mentoradaId = searchParams.get("mentorada_id");
  const mentoradaNome = searchParams.get("mentorada_nome");

  // Requer pelo menos um filtro — sem filtro, nenhum dado é retornado
  if (!mentoradaId && !mentoradaNome) return NextResponse.json([]);

  let query = supabaseAdmin.from("tarefas").select("*").order("criado_em", { ascending: false });

  if (mentoradaId) query = query.eq("mentorada_id", mentoradaId);
  else if (mentoradaNome) query = query.eq("mentorada_nome", mentoradaNome);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let mentorada_nome: string | null = body.mentorada_nome ?? null;
  let mentorada_id: string | null = body.mentorada_id ?? null;

  if (!mentorada_id && body.email) {
    const { data: m } = await supabaseAdmin.from("mentoradas").select("id, nome").eq("email", body.email).maybeSingle();
    if (m) { mentorada_id = m.id; if (!mentorada_nome) mentorada_nome = m.nome; }
  }
  if (mentorada_id && !mentorada_nome) {
    const { data: m } = await supabaseAdmin.from("mentoradas").select("nome").eq("id", mentorada_id).maybeSingle();
    if (m) mentorada_nome = m.nome;
  }

  const insertData: Record<string, unknown> = {
    titulo:         body.titulo,
    descricao:      body.descricao   ?? null,
    status:         body.status      ?? "Pendente",
    tipo:           body.tipo        ?? "acao",
    mentorada_nome: mentorada_nome,
    data_entrega:   body.data_entrega ?? null,
  };
  if (mentorada_id) insertData.mentorada_id = mentorada_id;

  const { data, error } = await supabaseAdmin
    .from("tarefas")
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
  if ("status"         in campos) updates.status         = campos.status;
  if ("titulo"         in campos) updates.titulo         = campos.titulo;
  if ("descricao"      in campos) updates.descricao      = campos.descricao;
  if ("tipo"           in campos) updates.tipo           = campos.tipo;
  if ("mentorada_nome" in campos) updates.mentorada_nome = campos.mentorada_nome;
  if ("data_entrega"   in campos) updates.data_entrega   = campos.data_entrega;
  // Só inclui mentorada_id se foi explicitamente fornecido com valor
  if (campos.mentorada_id) updates.mentorada_id = campos.mentorada_id;

  // Sincroniza nome quando vem mentorada_id
  if (campos.mentorada_id) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome")
      .eq("id", campos.mentorada_id)
      .maybeSingle();
    if (m) updates.mentorada_nome = m.nome;
  }

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
