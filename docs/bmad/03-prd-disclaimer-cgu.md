# PRD — Disclaimer santé + CGU — 2026-03-09

## User Stories

### MUST HAVE

| ID | Story | Critères d'acceptation |
|----|-------|----------------------|
| S1 | En tant qu'utilisateur, au premier lancement je vois un disclaimer santé (step 0) avec un lien vers les CGU et un bouton "Je certifie avoir lu et approuvé les CGU" | - Écran affiché avant le choix de langue<br>- Texte disclaimer santé visible<br>- Lien cliquable vers les CGU (ouvre LegalScreen)<br>- Bouton "Je certifie avoir lu et approuvé les CGU"<br>- `disclaimer_accepted = true` + `cgu_version_accepted = CGU_VERSION` persistés en DB |
| S2 | En tant qu'utilisateur, je peux consulter les CGU depuis les réglages | - Lien "Conditions d'utilisation" dans SettingsScreen<br>- WebView charge `https://kore-app.net/cgu`<br>- Si offline → fallback texte local<br>- Accessible en < 2 taps |
| S3 | En tant que dev, le schéma DB supporte le disclaimer + versioning | - Migration v32 → v33<br>- `disclaimer_accepted` (boolean) dans `users`<br>- `cgu_version_accepted` (string, default `"0"`) dans `users`<br>- Model User mis à jour |
| S4 | En tant qu'utilisateur FR/EN, les textes sont traduits | - Disclaimer + CGU fallback dans fr.ts et en.ts |
| S5 | En tant qu'utilisateur existant, si CGU_VERSION > cgu_version_accepted, je revois le disclaimer | - Migration met `disclaimer_accepted = true` + `cgu_version_accepted = "1.0"` pour users existants<br>- Si app bumpe CGU_VERSION → re-affiche step 0 au prochain lancement |
| S6 | Page `/cgu` sur kore-app.net | - Page Next.js avec le texte complet des CGU<br>- Responsive, lisible sur mobile |

## Flow UX

### Step 0 — Disclaimer (onboarding)
```
┌─────────────────────────────────┐
│         ● ○ ○ ○                 │
│                                 │
│  ⚕️  Avertissement santé        │
│                                 │
│  Kore est un outil de suivi     │
│  d'entraînement. Les programmes │
│  et suggestions proposés ne     │
│  constituent pas un avis        │
│  médical. Consultez un          │
│  professionnel de santé avant   │
│  de commencer ou modifier un    │
│  programme d'exercice physique. │
│  Vous êtes seul responsable     │
│  de votre pratique sportive.    │
│                                 │
│  📄 Lire les CGU complètes →   │
│                                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Je certifie avoir lu et     │ │
│ │ approuvé les CGU            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Settings → CGU
```
Réglages
├── ...
├── Conditions d'utilisation  →  [LegalScreen WebView]
├── ...
```

## Scope technique

| Fichier | Modification |
|---------|-------------|
| `model/schema.ts` | v33 — `disclaimer_accepted` + `cgu_version_accepted` |
| `model/models/User.ts` | 2 nouveaux décorateurs `@field` |
| `model/constants.ts` | `CGU_VERSION = "1.0"`, `CGU_URL = "https://kore-app.net/cgu"` |
| `screens/OnboardingScreen.tsx` | Step 0 disclaimer (4 steps total) |
| `screens/LegalScreen.tsx` | **Nouveau** — WebView + fallback local |
| `screens/SettingsScreen.tsx` | Lien vers LegalScreen |
| `navigation/index.tsx` | Route `Legal` + logique re-disclaimer |
| `i18n/fr.ts` + `en.ts` | Textes disclaimer + CGU fallback |
| `web/` | Page `/cgu` Next.js |

## WON'T HAVE
- Avertissement récurrent avant chaque séance
- Acceptation par checkbox (on utilise un bouton de certification)
