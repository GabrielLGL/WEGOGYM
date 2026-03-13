<!-- v1.0 — 2026-03-13 -->
# Rapport — Finalisation Badge Detail + Share Badge — Groupe C — 20260313-1930

## Objectif
Commiter la feature "Badge Detail" (clic sur badge → BottomSheet détail) et "Share Badge" (appui long sur badge déverrouillé → partage). Ces changements modifient BadgeCard, BadgeCelebration et BadgesScreen. Ce groupe DOIT être lancé APRÈS que Groupe B soit committé (BadgesScreen importe ShareBottomSheet et ShareCard).

## Contexte du projet
- App React Native + Expo 52 + TypeScript strict + WatermelonDB (SQLite/JSI)
- Branche courante : `develop`
- i18n (fr.ts/en.ts) sections `badges.conditions` et `share` déjà committées
- `ShareBottomSheet.tsx`, `ShareCard.tsx`, `shareService.ts` committés par Groupe B (dépendance)

## Ce que font les changements

### BadgeCard.tsx (modifié)
- Ajout prop `onPress?: () => void`
- `disabled` changé : `!onPress && !onLongPress` (avant : `!onLongPress`)
- Passe `onPress` au `<Pressable>`

### BadgesScreen.tsx (modifié)
- Fonction `getBadgeConditionText()` : génère le texte de condition selon catégorie et threshold
- Composant `BadgeDetailContent` : icône grande + description + condition 🎯 + statut obtenu/verrouillé
- State : `detailSheet = useModalState()`, `detailBadge` useState
- Handler `handleBadgePress` : haptics.onPress() + setDetailBadge + open sheet
- `BadgeCard` reçoit `onPress={() => handleBadgePress(badge)}` pour TOUS les badges
- `BadgeCard` reçoit `onLongPress={() => handleLongPress(badge)}` pour les badges DÉVERROUILLÉS
- `handleLongPress` : haptics.onSelect() + setShareBadge + open share sheet
- `ViewShot` wrapping autour de `ShareCard` variant `'badge'` pour partage image
- `ShareBottomSheet` avec `onShareText` et `onShareImage`
- Import : ViewShot, ShareCard, ShareBottomSheet, shareService fonctions

### BadgeCelebration.tsx (modifié)
- Probablement ajout d'un bouton "Partager" dans le sheet de célébration post-unlock
- Vérifier le contenu exact du diff

## Fichiers à commiter (ce groupe uniquement)
- `mobile/src/components/BadgeCard.tsx` (modifié)
- `mobile/src/components/BadgeCelebration.tsx` (modifié)
- `mobile/src/screens/BadgesScreen.tsx` (modifié)

## Étapes

1. **S'assurer que Groupe B est committé** :
   ```bash
   git log --oneline -5
   ```
   - Doit voir le commit "feat(share): ShareCard + ShareBottomSheet + service..."
   - Si non → attendre que Groupe B finisse

2. **Lire les fichiers modifiés** pour comprendre les changements :
   - `mobile/src/components/BadgeCard.tsx`
   - `mobile/src/components/BadgeCelebration.tsx`
   - `mobile/src/screens/BadgesScreen.tsx`

3. **Vérifier TypeScript** :
   ```
   cd mobile && npx tsc --noEmit
   ```
   - Erreurs communes : mauvais type sur `detailBadge` (utiliser `BadgeDefinition | null`)
   - Si `BadgeShareCardProps` pas importé correctement → importer depuis `../components/ShareCard`
   - Toléré : erreur préexistante dans `healthKitService.ts`

4. **Vérifier les tests** :
   ```
   cd mobile && npm test
   ```
   - Si fail dans BadgesScreen → probablement mock manquant pour ViewShot
   - Si fail → ajouter dans le test : `jest.mock('react-native-view-shot', ...)`

5. **Créer le commit** (UNIQUEMENT ces fichiers) :
   ```bash
   git add mobile/src/components/BadgeCard.tsx
   git add mobile/src/components/BadgeCelebration.tsx
   git add mobile/src/screens/BadgesScreen.tsx
   git diff --cached --name-only  # Vérifier que SEULEMENT ces fichiers sont staged
   git commit -m "feat(badges): badge detail sheet on press + share badge on long press"
   ```

6. **Push** :
   ```bash
   git push origin develop
   ```
   - Si push échoue (remote ahead) → `git pull --rebase` puis re-push

7. **Commit des docs leaderboard/badge** (une fois A et B aussi committés) :
   ```bash
   git add docs/bmad/do/20260311-2200-leaderboard-amis-A.md
   git add docs/bmad/do/20260311-2200-leaderboard-amis-B.md
   git add docs/bmad/do/20260311-2200-leaderboard-amis-C.md
   git add docs/bmad/do/20260311-2215-badge-detail-A.md
   git commit -m "docs(do): leaderboard amis + badge detail — rapports d'implémentation"
   git push origin develop
   ```

## Contraintes STRICTES
- `git add` UNIQUEMENT les fichiers listés ci-dessus — NE PAS faire `git add .`
- Ne pas toucher : ShareCard.tsx, ShareBottomSheet.tsx, shareService.ts (déjà committés par B)
- Pas de `<Modal>` natif — `<BottomSheet>` via Portal uniquement
- Appui long → badge déverrouillé uniquement (pas de share sur badge verrouillé)
- Clic simple → detail pour TOUS les badges (verrouillés inclus)
- Toutes couleurs via `colors.*` du thème
- Pas de `any` TypeScript

## Critères de validation
- `npx tsc --noEmit` → 0 nouvelles erreurs
- `npm test` → 0 fail
- Comportement attendu : clic badge → BottomSheet détail / appui long badge débloqué → ShareBottomSheet

## Dépendances
**Ce groupe dépend de Groupe B** (ShareBottomSheet + ShareCard + shareService).
Lancer ce groupe uniquement après que Groupe B soit committé et pushé.

## Statut
⏳ En attente — bloqé par Groupe B
