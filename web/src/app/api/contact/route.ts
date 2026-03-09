import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { ContactEmail } from "@/emails/contact";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`contact:${ip}`, 3);
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

    const { name, email, message } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedName = typeof name === "string" ? name.trim().slice(0, 100) || null : null;
    const trimmedMessage = typeof message === "string" ? message.trim().slice(0, 5000) : "";

    if (!trimmedEmail || trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return NextResponse.json(
        { error: "Le message doit contenir au moins 10 caractères." },
        { status: 400 }
      );
    }

    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Kore <contact@kore-app.net>",
      to: "contact@kore-app.net",
      replyTo: trimmedEmail,
      subject: `[Kore Contact] ${trimmedName ?? "Anonyme"} — ${trimmedMessage.slice(0, 50)}`,
      react: ContactEmail({
        name: trimmedName ?? undefined,
        email: trimmedEmail,
        message: trimmedMessage,
      }),
    });

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
