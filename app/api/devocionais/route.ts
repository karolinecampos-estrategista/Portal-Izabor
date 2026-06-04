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

  const { data, error } = await supabaseAdmin
    .from("devocionais")
    .insert({
      titulo: body.titulo,
      tipo: body.tipo ?? "texto",
      conteudo: body.conteudo ?? null,
      versiculo: body.versiculo ?? null,
      categoria: body.categoria ?? "Fe",
      link_video: body.link_video ?? null,
      publicado: body.publicado ?? false,
      destaque: body.destaque ?? false,
      destino: body.destino ?? "todas-bw",
      mentorada_nome: body.mentorada_nome ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const updates: Record<string, unknown> = {};
  if ("publicado" in campos) updates.publicado = campos.publicado;
  if ("destaque" in campos) updates.destaque = campos.destaque;
  if ("titulo" in campos) updates.titulo = campos.titulo;
  if ("tipo" in campos) updates.tipo = campos.tipo;
  if ("conteudo" in campos) updates.conteudo = campos.conteudo;
  if ("versiculo" in campos) updates.versiculo = campos.versiculo;
  if ("categoria" in campos) updates.categoria = campos.categoria;
  if ("link_video" in campos) updates.link_video = campos.link_video;
  if ("destino" in campos) updates.destino = campos.destino;
  if ("mentorada_nome" in campos) updates.mentorada_nome = campos.mentorada_nome;

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
