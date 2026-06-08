import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("devocionais")
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
    tipo:           body.tipo           ?? "texto",
    conteudo:       body.conteudo       ?? null,
    versiculo:      body.versiculo      ?? null,
    categoria:      body.categoria      ?? "Fe",
    link_video:     body.link_video     ?? null,
    publicado:      body.publicado      ?? false,
    destaque:       body.destaque       ?? false,
    destino:        body.destino        ?? "todas-bw",
    mentorada_nome: mentorada_nome,
  };
  if (body.mentorada_id) insertData.mentorada_id = body.mentorada_id;

  const { data, error } = await supabaseAdmin
    .from("devocionais")
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
  if ("publicado"      in campos) updates.publicado      = campos.publicado;
  if ("destaque"       in campos) updates.destaque       = campos.destaque;
  if ("titulo"         in campos) updates.titulo         = campos.titulo;
  if ("tipo"           in campos) updates.tipo           = campos.tipo;
  if ("conteudo"       in campos) updates.conteudo       = campos.conteudo;
  if ("versiculo"      in campos) updates.versiculo      = campos.versiculo;
  if ("categoria"      in campos) updates.categoria      = campos.categoria;
  if ("link_video"     in campos) updates.link_video     = campos.link_video;
  if ("destino"        in campos) updates.destino        = campos.destino;
  if ("mentorada_nome" in campos) updates.mentorada_nome = campos.mentorada_nome;
  if (campos.mentorada_id) updates.mentorada_id = campos.mentorada_id;
  // Limpa mentorada_id quando destino muda para todas-bw
  if (campos.destino === "todas-bw") {
    updates.mentorada_nome = null;
    updates.mentorada_id   = null;
  }

  // Auto-sync nome quando vem mentorada_id
  if (campos.mentorada_id) {
    const { data: m } = await supabaseAdmin
      .from("mentoradas")
      .select("nome")
      .eq("id", campos.mentorada_id)
      .maybeSingle();
    if (m) updates.mentorada_nome = m.nome;
  }

  const { data, error } = await supabaseAdmin
    .from("devocionais")
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

  const { error } = await supabaseAdmin.from("devocionais").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
