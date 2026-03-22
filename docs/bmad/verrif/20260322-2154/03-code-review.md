# Passe 3/8 — Code Review

**Date :** 2026-03-22

## Problèmes trouvés

### 🔴 CRIT-1 — Boucle infinie HistoryDetailScreen en test
- **Fichier :** `__mocks__/UnitContextMock.ts`
- **Description :** `useUnits()` crée une nouvelle référence `convertWeight` à chaque appel. Le `useEffect` de `HistoryDetailScreen.tsx:88` dépend de `convertWeight`, causant une boucle infinie render → setEdits → re-render → OOM.
- **Impact :** Suite de tests HistoryDetailScreen crash (OOM), bloque le CI.

### 🟡 WARN-1 — Commentaire schema version obsolète
- **Fichier :** `mobile/src/model/schema.ts:4`
- **Description :** Le commentaire dit "Version actuelle : 39" mais le schéma est v42.
- **Impact :** Documentation trompeuse pour les développeurs.

### 🟡 WARN-2 — Couleur hardcodée favChipActive
- **Fichier :** `mobile/src/screens/ExercisesScreen.tsx:490`
- **Description :** `rgba(255, 107, 107, 0.15)` au lieu d'utiliser `colors.danger` avec opacity.
- **Impact :** Inconsistance avec le système de thème.

### 🟡 WARN-3 — Couleur hardcodée OnboardingCard
- **Fichier :** `mobile/src/components/OnboardingCard.tsx:87`
- **Description :** `rgba(0, 206, 201, 0.2)` au lieu d'utiliser `colors.primary` avec opacity.
- **Impact :** Inconsistance avec le système de thème.

### 🔵 SUGG-1 — CLAUDE.md schema version
- **Fichier :** `CLAUDE.md` section 2
- **Description :** Indique "Schema: v39" mais la version actuelle est v42.
- **Impact :** Documentation projet désynchronisée.

## Positif
- Architecture withObservables cohérente
- Portal pattern respecté partout (aucun `<Modal>` natif)
- Toutes les mutations DB dans `database.write()`
- Tous les setTimeout/setInterval ont des cleanups
- console.* gardés par `__DEV__`
- `any` absent du code production (uniquement dans les tests)
