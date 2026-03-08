# Architecture — Disclaimer santé + CGU — 2026-03-09

## 1. Schema migration v32 → v33

**`model/schema.ts`** — Ajout de 2 colonnes dans `users` :
```
disclaimer_accepted  boolean  (default false)
cgu_version_accepted string   (default "0")
```

**`model/migrations.ts`** — Migration :
- Ajouter les 2 colonnes
- Pour les users existants : `disclaimer_accepted = true`, `cgu_version_accepted = "1.0"` (ils ont déjà utilisé l'app)

## 2. Model User

**`model/models/User.ts`** — 2 nouveaux décorateurs :
```ts
@field('disclaimer_accepted') disclaimerAccepted!: boolean
@text('cgu_version_accepted') cguVersionAccepted!: string | null
```

## 3. Constantes

**`model/constants.ts`** — Ajout :
```ts
export const CGU_VERSION = '1.0'
export const CGU_URL = 'https://kore-app.net/cgu'
```

## 4. Navigation — Logique de routage

**`navigation/index.tsx`** — Modifier le useEffect initial :
```
Si !user || !user.onboardingCompleted → 'Onboarding'
Si user.cguVersionAccepted < CGU_VERSION → 'Onboarding' (re-disclaimer)
Sinon → 'Home'
```

Note : quand les CGU sont mises à jour (bump CGU_VERSION), l'utilisateur existant revoit le step 0 uniquement, puis est renvoyé vers Home (pas tout l'onboarding).

## 5. OnboardingScreen — Step 0

**`screens/OnboardingScreen.tsx`** — 4 steps (0→3) :
- **Step 0** : Disclaimer santé + lien CGU + bouton "Je certifie avoir lu et approuvé les CGU"
- **Step 1** : Langue (existant)
- **Step 2** : Niveau (existant)
- **Step 3** : Objectif (existant)

Props optionnelle `disclaimerOnly` : si user existant avec CGU outdated, afficher seulement step 0 puis retour Home.

## 6. LegalScreen (nouveau)

**`screens/LegalScreen.tsx`** :
- WebView charge `CGU_URL` (https://kore-app.net/cgu)
- Si erreur réseau → fallback texte local (depuis i18n)
- Header avec bouton retour

## 7. SettingsScreen

**`screens/SettingsScreen.tsx`** — Dans le groupe SYSTÈME / SettingsAboutSection :
- Ajouter un item "Conditions d'utilisation" → navigation vers LegalScreen

## 8. i18n

**`i18n/fr.ts` + `en.ts`** — Nouvelles clés :
```
disclaimer.title
disclaimer.body
disclaimer.cguLink
disclaimer.acceptButton
legal.title
legal.fallbackContent (texte CGU complet pour mode offline)
settings.legal (label du lien dans Settings)
```

## 9. Page web /cgu

**`web/app/cgu/page.tsx`** (ou `web/pages/cgu.tsx` selon la structure Next.js) :
- Page statique avec le texte complet des CGU
- 8 sections (objet, acceptation, santé, responsabilité, données, PI, modification, contact)
- Responsive, lisible sur mobile (le WebView l'affichera)

## Dépendances entre stories

```
S3 (schema) → S1 (onboarding step 0) → S5 (re-disclaimer)
S3 (schema) → S4 (i18n)
S4 (i18n) → S1 (onboarding step 0)
S4 (i18n) → S2 (LegalScreen)
S6 (page web) → S2 (LegalScreen WebView)
```
