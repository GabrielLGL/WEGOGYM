import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

function computeToken(email: string): string {
  const secret = process.env.RESEND_API_KEY ?? "";
  return createHmac("sha256", secret).update(email).digest("hex");
}

export async function GET(request: NextRequest) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kore-app.net";
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!email || !token || token !== computeToken(email)) {
    return NextResponse.redirect(`${siteUrl}/unsubscribe?error=true`);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("subscribers")
      .delete()
      .eq("email", email);

    if (error) {
      if (process.env.NODE_ENV !== "production")
        console.error("Supabase unsubscribe error:", error);
      return NextResponse.redirect(`${siteUrl}/unsubscribe?error=true`);
    }

    return NextResponse.redirect(`${siteUrl}/unsubscribe?success=true`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/unsubscribe?error=true`);
  }
}
