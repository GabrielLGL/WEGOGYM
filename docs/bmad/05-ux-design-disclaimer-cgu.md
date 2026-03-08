# UX Design — Disclaimer santé + CGU — 2026-03-09

## Step 0 — Disclaimer (onboarding)

```
┌─────────────────────────────────┐
│         ● ○ ○ ○                 │
│                                 │
│  Avertissement santé            │
│                                 │
│  Kore est un outil de suivi     │
│  d'entraînement. Les programmes │
│  et suggestions proposés ne     │
│  constituent pas un avis        │
│  médical.                       │
│                                 │
│  Consultez un professionnel de  │
│  santé avant de commencer ou    │
│  modifier un programme          │
│  d'exercice physique.           │
│                                 │
│  Vous êtes seul responsable de  │
│  votre pratique sportive.       │
│                                 │
│  Lire les CGU complètes →      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  Je certifie avoir lu et    │ │
│ │  approuvé les CGU           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

- Lien CGU = couleur `colors.primary`, ouvre LegalScreen
- Bouton = `<Button variant="primary" size="lg" fullWidth>`
- Dots : 4 au lieu de 3

## LegalScreen (WebView + fallback)

```
┌─────────────────────────────────┐
│  ← Retour    Conditions d'util. │
│ ─────────────────────────────── │
│  [WebView: kore-app.net/cgu]    │
│  OU si offline : texte local    │
└─────────────────────────────────┘
```

- ActivityIndicator pendant le chargement
- Si erreur réseau → affiche texte local (ScrollView)

## Settings — Lien CGU

```
SYSTÈME
├── Données
├── À propos
└── Conditions d'utilisation  →
```

## Re-disclaimer (CGU mises à jour)

Même step 0, mais après acceptation → retour direct Home (pas d'onboarding complet).
