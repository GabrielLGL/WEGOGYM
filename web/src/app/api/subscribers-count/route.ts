export const revalidate = 3600;

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
