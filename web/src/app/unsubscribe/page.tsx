import Link from "next/link";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "true";
  const isError = params.error === "true";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
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
          backgroundColor: "var(--bg)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "var(--shadow-out)",
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
            color: "var(--text-main)",
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
            color: "var(--text-muted)",
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
            background:
              "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
            color: "#FFFFFF",
            padding: "12px 32px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "14px",
            display: "inline-block",
            boxShadow: "0 4px 15px var(--accent-glow)",
          }}
        >
          Retour au site
        </Link>
      </div>
    </main>
  );
}
