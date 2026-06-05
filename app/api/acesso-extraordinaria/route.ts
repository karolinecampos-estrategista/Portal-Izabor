import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarAcessoExtraordinaria, ProdutoAcesso } from "@/lib/criar-acesso-extraordinaria";

// GET /api/acesso-extraordinaria?email=...
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email obrigatório" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("mentoradas")
    .select("id, nome, email, acesso_seja_incomum, acesso_club_bw, acesso_box_livro, acesso_evento, convite_enviado, slug, criado_em")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? null);
}

// PATCH /api/acesso-extraordinaria — atualiza flags de acesso
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { email, ...flags } = body;
  if (!email) return NextResponse.json({ error: "email obrigatório" }, { status: 400 });

  const campos: Record<string, boolean> = {};
  const validos = ["acesso_seja_incomum", "acesso_club_bw", "acesso_box_livro", "acesso_evento"];
  validos.forEach(k => { if (k in flags) campos[k] = Boolean(flags[k]); });

  const { data, error } = await supabaseAdmin
    .from("mentoradas")
    .update(campos)
    .eq("email", email.trim().toLowerCase())
    .select("id, nome, email, acesso_seja_incomum, acesso_club_bw, acesso_box_livro, acesso_evento, convite_enviado, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/acesso-extraordinaria — reenviar convite
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, nome, produto } = body;
  if (!email || !produto) return NextResponse.json({ error: "email e produto obrigatórios" }, { status: 400 });

  const resultado = await criarAcessoExtraordinaria(email, nome ?? email, produto as ProdutoAcesso);
  return NextResponse.json(resultado);
}
