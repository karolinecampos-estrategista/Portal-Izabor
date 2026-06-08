import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mentoradaId = searchParams.get("mentorada_id");
  const mentoradaNome = searchParams.get("mentorada_nome");

  let query = supabaseAdmin
    .from("planos")
    .select(`*, marcos ( id, texto, feito, semana, ordem )`)
    .order("criado_em", { ascending: false });

  if (mentoradaId) query = query.eq("mentorada_id", mentoradaId);
  else if (mentoradaNome) query = query.eq("mentorada_nome", mentoradaNome);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let mentoradaId: string | null = body.mentorada_id ?? null;
  let mentoradaNome: string = body.mentorada_nome ?? "";
  let cor: string = body.cor ?? "#C9A84C";

  if (mentoradaId && !mentoradaNome) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome, cor")
      .eq("id", mentoradaId)
      .maybeSingle();
    if (m) { mentoradaNome = m.nome; cor = m.cor ?? cor; }
  } else if (!mentoradaId) {
    if (body.email) {
      const { data: m } = await supabaseAdmin.from("mentoradas").select("id, nome, cor").eq("email", body.email).maybeSingle();
      if (m) { mentoradaId = m.id; if (!mentoradaNome) mentoradaNome = m.nome; cor = m.cor ?? cor; }
    }
    if (!mentoradaId && mentoradaNome) {
      const { data: m } = await supabaseAdmin.from("mentoradas").select("id, cor").eq("nome", mentoradaNome).maybeSingle();
      if (m) { mentoradaId = m.id; cor = m.cor ?? cor; }
    }
  }

  const insertData: Record<string, unknown> = {
    mentorada_nome: mentoradaNome,
    cor,
  };
  if (mentoradaId) insertData.mentorada_id = mentoradaId;

  const { data: plano, error: planoError } = await supabaseAdmin
    .from("planos")
    .insert(insertData)
    .select()
    .single();

  if (planoError) return NextResponse.json({ error: planoError.message }, { status: 500 });

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

  const { data: planoCompleto } = await supabaseAdmin
    .from("planos")
    .select("*, marcos ( id, texto, feito, semana, ordem )")
    .eq("id", plano.id)
    .single();

  return NextResponse.json(planoCompleto);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  // Toggle feito de um marco
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

  // Edição completa do plano
  const { id, marcos_update, marcos_delete, ...campos } = body;
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const updates: Record<string, unknown> = {};

  if (campos.mentorada_id) {
    updates.mentorada_id = campos.mentorada_id;
    // Auto-sync nome
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome, cor")
      .eq("id", campos.mentorada_id)
      .maybeSingle();
    if (m) { updates.mentorada_nome = m.nome; updates.cor = m.cor; }
  } else if ("mentorada_nome" in campos) {
    updates.mentorada_nome = campos.mentorada_nome;
  }
  if ("cor" in campos) updates.cor = campos.cor;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabaseAdmin.from("planos").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deletar marcos removidos
  if (Array.isArray(marcos_delete) && marcos_delete.length > 0) {
    await supabaseAdmin.from("marcos").delete().in("id", marcos_delete);
  }

  // Upsert marcos (novos e editados)
  if (Array.isArray(marcos_update) && marcos_update.length > 0) {
    const novos = marcos_update.filter((m: { id?: string }) => !m.id);
    const existentes = marcos_update.filter((m: { id?: string }) => !!m.id);

    if (novos.length > 0) {
      await supabaseAdmin.from("marcos").insert(
        novos.map((m: { texto: string; semana?: string; ordem?: number }, i: number) => ({
          plano_id: id,
          texto: m.texto,
          feito: false,
          semana: m.semana ?? "A definir",
          ordem: m.ordem ?? i,
        }))
      );
    }

    for (const m of existentes as { id: string; texto: string; semana: string; ordem: number }[]) {
      await supabaseAdmin.from("marcos").update({ texto: m.texto, semana: m.semana, ordem: m.ordem }).eq("id", m.id);
    }
  }

  const { data: planoCompleto } = await supabaseAdmin
    .from("planos")
    .select("*, marcos ( id, texto, feito, semana, ordem )")
    .eq("id", id)
    .single();

  return NextResponse.json(planoCompleto);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin.from("planos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
