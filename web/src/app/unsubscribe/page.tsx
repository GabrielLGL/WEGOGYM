import Link from "next/link";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "true";
  const isError = params.error === "true";

  const bg = "#ebf0f7";
  const textMain = "#2d3436";
  const textMuted = "#636e72";
  const accent = "#6c5ce7";
  const teal = "#00cec9";
  const shadowOut =
    "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.7)";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily:
          'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: bg,
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: shadowOut,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>
          {isSuccess ? "✅" : "❌"}
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: textMain,
            margin: "0 0 12px 0",
            letterSpacing: "-0.3px",
          }}
        >
          {isSuccess
            ? "Tu es désinscrit"
            : isError
              ? "Lien invalide"
              : "Désinscription"}
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: textMuted,
            lineHeight: "1.6",
            margin: "0 0 32px 0",
          }}
        >
          {isSuccess
            ? "Tu ne recevras plus d'emails de notre part. On espère te revoir un jour !"
            : isError
              ? "Ce lien est invalide ou a déjà été utilisé. Si le problème persiste, contacte-nous."
              : "Paramètres manquants."}
        </p>

        <Link
          href="/"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${teal})`,
            color: "#FFFFFF",
            padding: "12px 32px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "14px",
            display: "inline-block",
            boxShadow: "0 4px 15px rgba(108,92,231,0.35)",
          }}
        >
          Retour au site
        </Link>
      </div>
    </main>
  );
}
