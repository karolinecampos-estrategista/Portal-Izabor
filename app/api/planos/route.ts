import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — lista planos com marcos aninhados
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("planos")
    .select(`
      *,
      marcos ( id, texto, feito, semana, ordem )
    `)
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — cria plano + marcos
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Busca mentorada_id pelo nome se não vier
  let mentoradaId = body.mentorada_id ?? null;
  let cor = body.cor ?? "#C9A84C";

  if (!mentoradaId && body.mentorada_nome) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("id, cor")
      .eq("nome", body.mentorada_nome)
      .single();
    if (m) { mentoradaId = m.id; cor = m.cor; }
  }

  const { data: plano, error: planoError } = await supabaseAdmin
    .from("planos")
    .insert({
      mentorada_id: mentoradaId,
      mentorada_nome: body.mentorada_nome,
      cor,
      programa: body.programa ?? null,
    })
    .select()
    .single();

  if (planoError) return NextResponse.json({ error: planoError.message }, { status: 500 });

  // Insere marcos
  const marcos = (body.marcos ?? []) as { texto: string; semana?: string; ordem?: number }[];
  if (marcos.length > 0) {
    await supabaseAdmin.from("marcos").insert(
      marcos.map((m, i) => ({
        plano_id: plano.id,
        texto: m.texto,
        feito: false,
        semana: m.semana ?? "A definir",
        ordem: m.ordem ?? i,
      }))
    );
  }

  // Retorna plano com marcos
  const { data: planoCompleto } = await supabaseAdmin
    .from("planos")
    .select("*, marcos ( id, texto, feito, semana, ordem )")
    .eq("id", plano.id)
    .single();

  return NextResponse.json(planoCompleto);
}

// PATCH — toggle feito de um marco OU atualiza plano
export async function PATCH(req: NextRequest) {
  const body = await req.json();

  // Toggle marco
  if (body.marco_id !== undefined) {
    const { data, error } = await supabaseAdmin
      .from("marcos")
      .update({ feito: body.feito })
      .eq("id", body.marco_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Atualiza plano
  const { id, ...campos } = body;
  const { data, error } = await supabaseAdmin
    .from("planos")
    .update({
      mentorada_nome: campos.mentorada_nome,
      programa: campos.programa,
      cor: campos.cor,
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

  const { error } = await supabaseAdmin.from("planos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
