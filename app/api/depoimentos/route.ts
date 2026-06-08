import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const isAdmin = req.headers.get("x-admin") === "true";

  if (isAdmin && token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    const { data: perfil } = user
      ? await supabaseAdmin.from("perfis").select("tipo").eq("id", user.id).single()
      : { data: null };

    if (perfil?.tipo === "admin") {
      const { data: depoimentos, error } = await supabaseAdmin
        .from("depoimentos")
        .select("id, mentorada_id, nome, programa, conteudo, conteudo_editado, tipo, status, criado_em, aprovado_em")
        .order("criado_em", { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Enrich with mentorada info
      const ids = [...new Set(
        (depoimentos ?? []).map((d: Record<string, unknown>) => d.mentorada_id as string).filter(Boolean)
      )];

      const mentoradasMap = new Map<string, Record<string, unknown>>();
      if (ids.length > 0) {
        const { data: ments } = await supabaseAdmin
          .from("mentoradas")
          .select("id, nome, email, acesso, cor")
          .in("id", ids);
        (ments ?? []).forEach((m: Record<string, unknown>) => mentoradasMap.set(m.id as string, m));
      }

      const enriched = (depoimentos ?? []).map((d: Record<string, unknown>) => ({
        ...d,
        mentorada: d.mentorada_id ? (mentoradasMap.get(d.mentorada_id as string) ?? null) : null,
      }));

      return NextResponse.json(enriched);
    }
  }

  // Mentorada ou público — apenas aprovados
  const { data } = await supabaseAdmin
    .from("depoimentos")
    .select("id, nome, programa, conteudo, conteudo_editado, tipo, aprovado_em")
    .eq("status", "aprovado")
    .order("aprovado_em", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "token inválido" }, { status: 401 });

  const { data: mentorada } = await supabaseAdmin
    .from("mentoradas")
    .select("id, nome")
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  if (!mentorada) return NextResponse.json({ error: "mentorada não encontrada" }, { status: 404 });

  const body = await req.json();
  const conteudo = (body.conteudo ?? "").trim();
  if (!conteudo) return NextResponse.json({ error: "conteúdo obrigatório" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("depoimentos")
    .insert({
      mentorada_id: mentorada.id,
      nome: mentorada.nome,
      programa: body.programa ?? null,
      conteudo,
      tipo: body.tipo ?? "texto",
      status: "pendente",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  const { data: perfil } = user
    ? await supabaseAdmin.from("perfis").select("tipo").eq("id", user!.id).single()
    : { data: null };

  if (perfil?.tipo !== "admin") return NextResponse.json({ error: "acesso negado" }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if ("status" in body) {
    updates.status = body.status;
    if (body.status === "aprovado") updates.aprovado_em = new Date().toISOString();
  }
  if ("conteudo_editado" in body) updates.conteudo_editado = body.conteudo_editado;

  const { data, error } = await supabaseAdmin
    .from("depoimentos")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  const { data: perfil } = user
    ? await supabaseAdmin.from("perfis").select("tipo").eq("id", user!.id).single()
    : { data: null };

  if (perfil?.tipo !== "admin") return NextResponse.json({ error: "acesso negado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  await supabaseAdmin.from("depoimentos").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
