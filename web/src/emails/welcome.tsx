import * as React from "react";

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const greeting = name ? `Salut ${name}` : "Salut";

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#121212",
        color: "#FFFFFF",
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#1C1C1E",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              margin: "0 0 4px 0",
              letterSpacing: "-0.5px",
            }}
          >
            KO
            <span style={{ color: "#007AFF" }}>RE</span>
          </h1>
          <p style={{ color: "#8E8E93", fontSize: "14px", margin: 0 }}>
            Ton compagnon de musculation
          </p>
        </div>

        {/* Body */}
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          {greeting} !
        </h2>

        <p style={{ color: "#8E8E93", lineHeight: "1.6", fontSize: "16px" }}>
          Merci de rejoindre Kore ! Tu fais maintenant partie de la
          communaute de sportifs qui veulent progresser serieusement.
        </p>

        <p style={{ color: "#8E8E93", lineHeight: "1.6", fontSize: "16px" }}>
          Voici ce qui t&apos;attend :
        </p>

        <ul
          style={{
            color: "#FFFFFF",
            lineHeight: "2",
            fontSize: "16px",
            paddingLeft: "20px",
          }}
        >
          <li>
            <strong>Programmes personnalises</strong> — Cree tes propres
            routines
          </li>
          <li>
            <strong>Suivi de performance</strong> — Chaque serie, chaque rep
          </li>
          <li>
            <strong>100% offline</strong> — Pas besoin de wifi a la salle
          </li>
          <li>
            <strong>Progression visible</strong> — Graphiques et stats
          </li>
        </ul>

        {/* CTA Button */}
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href="https://play.google.com/store"
            style={{
              backgroundColor: "#007AFF",
              color: "#FFFFFF",
              padding: "14px 32px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "16px",
              display: "inline-block",
            }}
          >
            Telecharger l&apos;app
          </a>
        </div>

        <p
          style={{
            color: "#8E8E93",
            fontSize: "14px",
            textAlign: "center",
            marginTop: "32px",
          }}
        >
          A tres vite sur Kore !
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "24px",
          color: "#8E8E93",
          fontSize: "12px",
        }}
      >
        <p>
          Tu recois cet email car tu t&apos;es inscrit sur kore-app.com
          <br />
          <a href="%unsubscribe_url%" style={{ color: "#8E8E93" }}>
            Se desinscrire
          </a>
        </p>
      </div>
    </div>
  );
}
