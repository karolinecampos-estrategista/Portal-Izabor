import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function verificarUsuario(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function ehAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("perfis").select("tipo").eq("id", userId).maybeSingle();
  return data?.tipo === "admin";
}

async function temAcessoClubBW(userId: string) {
  const { data } = await supabaseAdmin
    .from("mentoradas")
    .select("acesso_club_bw")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();
  return !!data?.acesso_club_bw;
}

async function nomeDoUsuario(userId: string): Promise<string> {
  // Tenta primeiro em mentoradas
  const { data: m } = await supabaseAdmin
    .from("mentoradas")
    .select("nome")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();
  if (m?.nome) return m.nome.split(" ")[0];

  // Fallback: perfis
  const { data: p } = await supabaseAdmin.from("perfis").select("nome").eq("id", userId).maybeSingle();
  if (p?.nome) return p.nome.split(" ")[0];

  return "Membro";
}

// GET /api/chat — retorna mensagens do canal
export async function GET(req: NextRequest) {
  const user = await verificarUsuario(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admin = await ehAdmin(user.id);
  if (!admin) {
    const acesso = await temAcessoClubBW(user.id);
    if (!acesso) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("mensagens_chat")
    .select("*")
    .eq("canal", "comunidade")
    .order("criado_em", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/chat — envia mensagem
export async function POST(req: NextRequest) {
  const user = await verificarUsuario(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admin = await ehAdmin(user.id);
  if (!admin) {
    const acesso = await temAcessoClubBW(user.id);
    if (!acesso) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const conteudo = (body.conteudo ?? "").trim();
  if (!conteudo) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  if (conteudo.length > 2000) return NextResponse.json({ error: "Mensagem muito longa" }, { status: 400 });

  const nome = admin ? "Izabor" : await nomeDoUsuario(user.id);

  const { data, error } = await supabaseAdmin
    .from("mensagens_chat")
    .insert({ user_id: user.id, nome, conteudo, canal: "comunidade" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/chat?id=<uuid> — exclui mensagem (admin only)
export async function DELETE(req: NextRequest) {
  const user = await verificarUsuario(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admin = await ehAdmin(user.id);
  if (!admin) return NextResponse.json({ error: "Apenas administradores podem excluir mensagens" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin.from("mensagens_chat").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
