import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { WelcomeEmail } from "@/emails/welcome";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 req/hour/IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(rateLimit.limit),
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
    };

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        {
          status: 429,
          headers: { ...rateLimitHeaders, "Retry-After": String(retryAfter) },
        }
      );
    }

    const { email, name } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedName = typeof name === "string" ? name.trim() || null : null;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from("subscribers")
      .insert({ email: trimmedEmail, name: trimmedName });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Cet email est déjà inscrit." },
          { status: 409, headers: rateLimitHeaders }
        );
      }
      if (process.env.NODE_ENV !== "production") console.error("Supabase error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    // Send welcome email via Resend
    try {
      const resend = getResend();
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Kore <contact@kore-app.net>",
        to: trimmedEmail,
        subject: "Bienvenue sur Kore !",
        react: WelcomeEmail({ name: trimmedName ?? undefined, email: trimmedEmail }),
      });
    } catch (emailErr) {
      if (process.env.NODE_ENV !== "production") console.error("Resend error:", emailErr);
      // Don't fail the request if email fails — user is still subscribed
    }

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
