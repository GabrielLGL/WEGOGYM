<!-- v1.0 — 2026-03-13 -->
# Rapport — Finalisation Share Feature — Groupe B — 20260313-1930

## Objectif
Commiter la feature "Partage" (Share) : les composants Share et le service sont prêts dans le working tree mais pas encore committés. WorkoutSummarySheet a été mis à jour pour intégrer le partage de récap d'entraînement. Il faut vérifier que tout compile, que les tests passent, et créer un commit propre.

## Contexte du projet
- App React Native + Expo 52 + TypeScript strict + WatermelonDB (SQLite/JSI)
- Branche courante : `develop`
- i18n (fr.ts/en.ts) section `share` déjà committée (clés : workoutTitle, shareAsText, shareAsImage, shareButton, appName, branding, etc.)
- `react-native-view-shot` utilisé pour capturer la ShareCard en image

## Fichiers à commiter (ce groupe uniquement)

### Fichiers NOUVEAUX (non trackés) :
- `mobile/src/components/ShareCard.tsx` — Carte visuelle partageable (variants: workout, badge, pr)
- `mobile/src/components/ShareBottomSheet.tsx` — BottomSheet avec options "Partager texte" / "Partager image"
- `mobile/src/services/shareService.ts` — Fonctions generateWorkoutShareText, generateBadgeShareText, generatePRShareText, shareText, shareImage
- `mobile/__mocks__/react-native-view-shot.js` — Mock Jest pour ViewShot (retourne un uri factice)

### Fichiers MODIFIÉS :
- `mobile/src/components/WorkoutSummarySheet.tsx` — Intégration du bouton "Partager" + ShareCard + ShareBottomSheet + viewShotRef
- `mobile/jest.config.js` — Ajout de `react-native-view-shot` dans moduleNameMapper pour pointer vers le mock

## Étapes

1. **Vérifier TypeScript** :
   ```
   cd mobile && npx tsc --noEmit
   ```
   - Si erreur dans ShareCard.tsx/shareService.ts → corriger (types stricts, pas de `any`)
   - Si erreur dans WorkoutSummarySheet.tsx (ViewShot ref type) → importer `RefObject` depuis React
   - Toléré : erreur préexistante dans `healthKitService.ts`

2. **Vérifier que le mock ViewShot est bien configuré** :
   - Lire `mobile/jest.config.js`
   - Chercher une entrée `react-native-view-shot` dans `moduleNameMapper`
   - Si absente → ajouter :
     ```js
     'react-native-view-shot': '<rootDir>/__mocks__/react-native-view-shot.js'
     ```

3. **Vérifier les tests** :
   ```
   cd mobile && npm test -- --testPathPattern="WorkoutSummary|HomeScreen"
   ```
   - Si fail lié à ViewShot → vérifier que le mock fonctionne
   - Si fail lié à ShareBottomSheet/ShareCard → vérifier les mocks i18n/ThemeContext

4. **Créer le commit** (UNIQUEMENT ces fichiers) :
   ```bash
   git add mobile/src/components/ShareCard.tsx
   git add mobile/src/components/ShareBottomSheet.tsx
   git add mobile/src/services/shareService.ts
   git add mobile/__mocks__/react-native-view-shot.js
   git add mobile/src/components/WorkoutSummarySheet.tsx
   git add mobile/jest.config.js
   git diff --cached --name-only  # Vérifier que SEULEMENT ces fichiers sont staged
   git commit -m "feat(share): ShareCard + ShareBottomSheet + service + WorkoutSummarySheet integration"
   ```

5. **Push** :
   ```bash
   git push origin develop
   ```
   - Si push échoue (remote ahead) → `git pull --rebase` puis re-push

## Contraintes STRICTES
- `git add` UNIQUEMENT les fichiers listés ci-dessus — NE PAS faire `git add .`
- Ne pas toucher : BadgesScreen.tsx, BadgeCard.tsx, BadgeCelebration.tsx, HomeScreen.tsx, navigation/index.tsx, FriendSnapshot.ts
- Pas de `<Modal>` natif — utiliser `<BottomSheet>` via Portal
- Toutes couleurs via `colors.*` du thème
- Pas de `any` TypeScript
- `useColors()` et `useLanguage()` pour toutes les couleurs/traductions

## Critères de validation
- `npx tsc --noEmit` → 0 nouvelles erreurs
- `npm test` → 0 fail (le mock ViewShot évite l'erreur native)
- `git diff --cached --name-only` → exactement les 6 fichiers listés

## Dépendances
Aucune dépendance — ce groupe peut être lancé en parallèle avec Groupe A.
**Groupe C dépend de ce groupe** (BadgesScreen importe ShareBottomSheet).

## Statut
⏳ En attente
