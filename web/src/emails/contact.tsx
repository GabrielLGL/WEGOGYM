import * as React from "react";

interface ContactEmailProps {
  name?: string;
  email: string;
  message: string;
}

export function ContactEmail({ name, email, message }: ContactEmailProps) {
  const bg = "#ebf0f7";
  const textMain = "#2d3436";
  const textMuted = "#636e72";
  const accent = "#6c5ce7";
  const teal = "#00cec9";
  const shadowOut =
    "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.7)";

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
        style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}
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
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${accent} 0%, ${teal} 100%)`,
                  borderRadius: "24px 24px 0 0",
                  padding: "28px",
                  textAlign: "center",
                }}
              >
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    margin: "0",
                    color: "#FFFFFF",
                    lineHeight: "1.2",
                  }}
                >
                  Nouveau message de contact
                </h1>
              </div>

              {/* Body */}
              <div style={{ padding: "28px" }}>
                <table
                  role="presentation"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "100%", marginBottom: "20px" }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          color: textMuted,
                          fontSize: "13px",
                          fontWeight: 700,
                          paddingBottom: "4px",
                        }}
                      >
                        Nom
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: textMain,
                          fontSize: "15px",
                          paddingBottom: "16px",
                        }}
                      >
                        {name || "Non renseigné"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: textMuted,
                          fontSize: "13px",
                          fontWeight: 700,
                          paddingBottom: "4px",
                        }}
                      >
                        Email
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingBottom: "16px" }}>
                        <a
                          href={`mailto:${email}`}
                          style={{
                            color: accent,
                            fontSize: "15px",
                            textDecoration: "none",
                          }}
                        >
                          {email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: textMuted,
                          fontSize: "13px",
                          fontWeight: 700,
                          paddingBottom: "4px",
                        }}
                      >
                        Message
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: textMain,
                          fontSize: "15px",
                          lineHeight: "1.7",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Reply CTA */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <a
                    href={`mailto:${email}`}
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${teal})`,
                      color: "#FFFFFF",
                      padding: "12px 32px",
                      borderRadius: "50px",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "14px",
                      display: "inline-block",
                      boxShadow: "0 4px 15px rgba(108,92,231,0.4)",
                    }}
                  >
                    Répondre
                  </a>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
