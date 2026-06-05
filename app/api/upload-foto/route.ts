import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "meu-inicio";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  const { data: perfil } = user
    ? await supabaseAdmin.from("perfis").select("tipo").eq("id", user!.id).single()
    : { data: null };

  if (perfil?.tipo !== "admin") return NextResponse.json({ error: "acesso negado" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const pasta = (formData.get("pasta") as string | null) ?? "geral";

  if (!file) return NextResponse.json({ error: "arquivo obrigatório" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const nomeArquivo = `${pasta}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(nomeArquivo, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(nomeArquivo);

  return NextResponse.json({ url: publicUrl });
}
