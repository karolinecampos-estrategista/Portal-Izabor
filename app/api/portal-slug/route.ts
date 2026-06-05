import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ nome: null });

  const { data } = await supabaseAdmin
    .from("mentoradas")
    .select("nome")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ nome: data?.nome ?? null });
}
