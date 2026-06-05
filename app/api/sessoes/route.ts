import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mentoradaId = searchParams.get("mentorada_id");

  let query = supabaseAdmin
    .from("sessoes")
    .select("*")
    .order("data", { ascending: false });

  if (mentoradaId) query = query.eq("mentorada_id", mentoradaId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("sessoes")
    .insert({
      mentorada_id: body.mentorada_id ?? null,
      mentorada_nome: body.mentorada_nome,
      cor: body.cor ?? "#C9A84C",
      data: body.data,
      horario: body.horario ?? null,
      duracao: body.duracao ?? "60 min",
      status: body.status ?? "agendada",
      link_meet: body.link_meet ?? null,
      resumo: body.resumo ?? null,
      acoes: body.acoes ?? [],
      gravacao: body.gravacao ?? null,
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
  if (campos.mentorada_id  !== undefined) update.mentorada_id   = campos.mentorada_id;
  if (campos.mentorada_nome!== undefined) update.mentorada_nome = campos.mentorada_nome;
  if (campos.cor           !== undefined) update.cor            = campos.cor;
  if (campos.data          !== undefined) update.data           = campos.data;
  if (campos.horario       !== undefined) update.horario        = campos.horario;
  if (campos.duracao       !== undefined) update.duracao        = campos.duracao;
  if (campos.status        !== undefined) update.status         = campos.status;
  if (campos.link_meet     !== undefined) update.link_meet      = campos.link_meet;
  if (campos.resumo        !== undefined) update.resumo         = campos.resumo;
  if (campos.acoes         !== undefined) update.acoes          = campos.acoes;
  if (campos.gravacao      !== undefined) update.gravacao       = campos.gravacao;

  const { data, error } = await supabaseAdmin
    .from("sessoes")
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

  const { error } = await supabaseAdmin.from("sessoes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
