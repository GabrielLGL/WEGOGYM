import * as React from "react";
import { createHmac } from "crypto";

interface WelcomeEmailProps {
  name?: string;
  email: string;
}

export function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const greeting = name ? `Salut ${name}` : "Salut";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kore-app.com";
  const token = createHmac("sha256", process.env.RESEND_API_KEY ?? "")
    .update(email)
    .digest("hex");
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

  /* ---- Palette neumorphisme (light, from site/shared.css) ---- */
  const bg = "#ebf0f7";
  const cardBg = "#e2e8f0";
  const textMain = "#2d3436";
  const textMuted = "#636e72";
  const accent = "#6c5ce7";
  const teal = "#00cec9";
  const shadowOut =
    "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.7)";
  const shadowInset =
    "inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.7)";

  return (
    <div
      style={{
        fontFamily:
          'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: bg,
        color: textMain,
        padding: "32px 16px",
        margin: "0",
        width: "100%",
      }}
    >
      <table
        role="presentation"
        cellPadding="0"
        cellSpacing="0"
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <tbody>
          {/* Logo */}
          <tr>
            <td style={{ textAlign: "center", paddingBottom: "28px" }}>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: bg,
                  borderRadius: "50px",
                  padding: "14px 28px",
                  boxShadow: shadowOut,
                }}
              >
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: accent,
                    letterSpacing: "2px",
                  }}
                >
                  KORE
                </span>
              </div>
            </td>
          </tr>

          {/* Main Card */}
          <tr>
            <td
              style={{
                backgroundColor: bg,
                borderRadius: "24px",
                padding: "0",
                boxShadow: shadowOut,
              }}
            >
              {/* Gradient Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${accent} 0%, ${teal} 100%)`,
                  borderRadius: "24px 24px 0 0",
                  padding: "36px 28px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "14px" }}>
                  &#127947;
                </div>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: 900,
                    margin: "0 0 8px 0",
                    color: "#FFFFFF",
                    lineHeight: "1.2",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {greeting} !
                </h1>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                    lineHeight: "1.4",
                    fontWeight: 500,
                  }}
                >
                  Bienvenue dans la communauté Kore
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: "28px" }}>
                <p
                  style={{
                    color: textMuted,
                    lineHeight: "1.7",
                    fontSize: "15px",
                    margin: "0 0 24px 0",
                  }}
                >
                  Merci de nous rejoindre ! Tu fais partie des premiers à suivre
                  Kore. On te tiendra au courant dès qu&apos;on lance.
                </p>

                {/* Feature Cards — neumorphic inset */}
                <table
                  role="presentation"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "100%", marginBottom: "24px" }}
                >
                  <tbody>
                    {[
                      {
                        emoji: "\u{1F4AA}",
                        title: "Programmes sur mesure",
                        desc: "Crée tes propres routines",
                      },
                      {
                        emoji: "\u{1F4C8}",
                        title: "Suivi de performance",
                        desc: "Chaque serie, chaque rep",
                      },
                      {
                        emoji: "\u26A1",
                        title: "100% Offline",
                        desc: "Pas besoin de wifi à la salle",
                      },
                      {
                        emoji: "\u{1F3AF}",
                        title: "Progression visible",
                        desc: "Graphiques et stats détaillés",
                      },
                    ].map((item, i) => (
                      <tr key={i}>
                        <td style={{ paddingBottom: "10px" }}>
                          <div
                            style={{
                              backgroundColor: cardBg,
                              borderRadius: "14px",
                              padding: "14px 16px",
                              boxShadow: shadowInset,
                            }}
                          >
                            <span
                              style={{ fontSize: "16px", marginRight: "10px" }}
                            >
                              {item.emoji}
                            </span>
                            <span
                              style={{
                                color: textMain,
                                fontSize: "14px",
                                fontWeight: 700,
                              }}
                            >
                              {item.title}
                            </span>
                            <span
                              style={{
                                color: textMuted,
                                fontSize: "13px",
                                display: "block",
                                marginTop: "3px",
                                paddingLeft: "26px",
                              }}
                            >
                              {item.desc}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Divider */}
                <div
                  style={{
                    height: "2px",
                    borderRadius: "1px",
                    background: `linear-gradient(90deg, transparent, ${accent}40, ${teal}40, transparent)`,
                    margin: "8px 0 28px 0",
                  }}
                />

                {/* CTA — neumorphic raised button */}
                <div style={{ textAlign: "center" }}>
                  <a
                    href="https://kore-app.com"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${teal})`,
                      color: "#FFFFFF",
                      padding: "14px 40px",
                      borderRadius: "50px",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "15px",
                      display: "inline-block",
                      boxShadow: `0 4px 15px rgba(108,92,231,0.4)`,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Découvrir Kore
                  </a>
                </div>
              </div>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                textAlign: "center",
                paddingTop: "28px",
                color: textMuted,
                fontSize: "12px",
                lineHeight: "1.6",
              }}
            >
              <p style={{ margin: "0 0 4px 0" }}>
                Tu reçois cet email car tu t&apos;es inscrit sur Kore.
              </p>
              <a
                href={unsubscribeUrl}
                style={{
                  color: textMuted,
                  textDecoration: "underline",
                  fontSize: "12px",
                }}
              >
                Se désinscrire
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
