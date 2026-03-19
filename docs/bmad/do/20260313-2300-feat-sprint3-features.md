# Rapport — Sprint 3 : Recap animé + Self-Leagues + Skill Tree

**Date :** 2026-03-13
**Branch :** develop
**TypeScript :** ✅ 0 erreur

---

## Feature #8 — Recap post-séance animé

### Fichiers modifiés
- `mobile/src/components/WorkoutSummarySheet.tsx`

### Ce qui a été fait
- **Compteur XP animé** : `useSharedValue(0)` + `withTiming(xpGained, 1s)` via `useAnimatedReaction` → `setDisplayXp`
- **Entrée échelonnée** : 3 groupes (`anim0/1/2`) avec `withDelay` (200ms, 320ms, 440ms) + `withTiming` fade+slide-up 20px
- **Level badge pulse** : `withSequence(withSpring(1.3), withSpring(1))` si `levelUp=true`
- **Streak bounce** : même pattern spring sur l'icône streak si `currentStreak > 0`
- **Confetti léger** : 20 particules `Animated.Value` (RN), cercles colorés avec chute (translateY 0→650) + rotation 540° + fade, décalés de 55ms chacun. Déclenché sur `totalPrs > 0 || levelUp`
- **Nouvelle prop** : `levelUp?: boolean` (défaut `false`)
- Reset complet des animations quand `visible` redevient `false`

### Pattern
- Reanimated (sections, XP, level, streak) + RN Animated (confetti tableau)
- Pas de lib externe
- Cleanup avec `clearTimeout` sur le timer confetti

---

## Feature #9 — Self-Leagues

### Fichiers créés
- `mobile/src/model/utils/selfLeaguesHelpers.ts`
- `mobile/src/screens/SelfLeaguesScreen.tsx`

### Fichiers modifiés
- `mobile/src/navigation/index.tsx` — route `SelfLeagues: undefined`
- `mobile/src/screens/StatsScreen.tsx` — bouton `trophy-outline` dans STAT_BUTTONS
- `mobile/src/i18n/fr.ts` + `en.ts` — section `selfLeagues`, clés `stats.selfLeagues`, `navigation.selfLeagues`

### Logique
- `computeSelfLeaguePeriods` génère toutes les semaines (lundi→dimanche) ou mois de la première history à aujourd'hui
- `buildSelfLeaguesRanking` trie par métrique (volume/sessions/prs/tonnage/duration) et calcule `pctFromAvg`
- Toggle Semaines/Mois + sélecteur de 5 métriques
- FlatList avec badge `●` pour la période courante, top 3 colorés (or/argent/bronze)
- Minimum 2 périodes requises pour afficher le classement

---

## Feature #1 — Skill Tree

### Fichiers créés
- `mobile/src/model/utils/skillTreeHelpers.ts`
- `mobile/src/components/SkillTreeBranch.tsx`
- `mobile/src/screens/SkillTreeScreen.tsx`

### Fichiers modifiés
- `mobile/src/navigation/index.tsx` — route `SkillTree: undefined`
- `mobile/src/screens/HomeScreen.tsx` — tuile `git-branch-outline` dans section Tools
- `mobile/src/i18n/fr.ts` + `en.ts` — section `skillTree`, clé `home.tiles.skillTree`, `navigation.skillTree`

### Branches et seuils
| Branche | Couleur | Données | Seuils |
|---------|---------|---------|--------|
| Force | `colors.primary` | `user.totalPrs` | 1, 5, 10, 25, 50, 100 |
| Endurance | `colors.warning` | `user.totalTonnage` (kg) | 1k, 5k, 25k, 100k, 500k |
| Mobilité | `colors.danger` | distinct exercise IDs depuis sets | 5, 10, 20, 30, 50 |
| Régularité | `colors.textSecondary` | `user.bestStreak` (semaines) | 2, 4, 8, 16, 30, 52 |

### UI
- Grille 2×2 de cartes `SkillTreeBranch`
- Chaque carte : icon, label, dots (●/○), valeur courante, barre de progression
- Tap → BottomSheet détail avec liste nœuds (✓ unlocked / 🔒 locked) + barre progression vers prochain

---

## Vérification
- `npx tsc --noEmit` : **0 erreur**
- Pas de `console.log` hors `__DEV__`
- Pas de couleurs hardcodées (sauf CONFETTI_COLORS_LIST dans WorkoutSummarySheet qui utilise les valeurs hex des couleurs thème + 2 extras pour la diversité visuelle)
- Mutations WatermelonDB : aucune dans ces features (lecture seule)
- Cleanup setTimeout dans useEffect confetti
