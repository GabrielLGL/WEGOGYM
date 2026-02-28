# Passe 3 — Code Review

**Run :** 20260228-1500
**Fichiers audités :** BadgeCard.tsx, BadgeCelebration.tsx, ErrorBoundary.tsx, LevelBadge.tsx, WorkoutSummarySheet.tsx, StatsCalendarScreen.tsx, gamificationHelpers.ts, badgeConstants.ts

---

## 🔴 Critiques (corrigés ce run)

### C1 — BadgeCard.tsx : `badge.icon as any`
- **Ligne :** 21 (avant fix)
- **Problème :** `badge.icon` est typé `string` dans `BadgeDefinition.icon`. L'utilisation de `as any` pour le passer à `Ionicons.name` viole la règle "no any".
- **Fix :** `badge.icon as ComponentProps<typeof Ionicons>['name']`
- **Statut :** ✅ Corrigé

### C2 — BadgeCelebration.tsx : `badge.icon as any`
- **Ligne :** 21 (avant fix)
- **Problème :** Même violation que C1.
- **Fix :** `badge.icon as ComponentProps<typeof Ionicons>['name']`
- **Statut :** ✅ Corrigé

### C3 — BadgeCelebration.tsx : Import statique `colors`
- **Ligne :** 6 (avant fix) — `import { colors, ... } from '../theme'`
- **Problème :** Le composant utilisait l'objet `colors` statique du thème (dark mode fixe) au lieu du hook `useColors()`. L'app supporte light/dark dynamique via `ThemeContext`.
- **Fix :** Migration vers `useColors()` hook + pattern `useStyles(colors)` pour StyleSheet dynamique.
- **Statut :** ✅ Corrigé

---

## 🟡 Warnings (corrigés ce run)

### W1 — BadgeCard.tsx : `unlockedAt?: Date` inutilisé dans le body
- **Ligne :** 12
- **Problème :** Le champ est déclaré dans l'interface mais non destructuré dans le composant.
- **Décision :** ⏭️ Non supprimé — les tests passent cette prop (`BadgeCard.test.tsx:42`). Elle fait partie de l'API publique du composant, sera utilisée dans une version future (affichage date de déblocage).

### W2 — StatsCalendarScreen.tsx : Blocs `catch` vides
- **Lignes :** ~319, ~321, ~348, ~368
- **Problème :** 4 blocs catch sans logging. Rend le débogage difficile en développement.
- **Fix :** Ajout de `if (__DEV__) console.error(...)` dans chaque catch avec message contextuel.
- **Statut :** ✅ Corrigé

### W3 — gamificationHelpers.ts : Accès `translations[language]` sans guard
- **Ligne :** 229
- **Problème :** Pas de vérification que `language` est bien une clé valide de `translations` avant accès.
- **Fix :** `const lang = translations[language] ? language : 'fr'`
- **Statut :** ✅ Corrigé

### W4 — WorkoutSummarySheet.tsx : Styles inline dans JSX
- **Lignes :** 156-237
- **Problème :** Plusieurs styles inline `{ flexDirection: 'row', alignItems: 'center', gap: 4 }` répétés.
- **Décision :** ⏭️ Non corrigé — optionnel selon le plan, risque de régression sur un composant complexe. A traiter dans un commit dédié.

---

## ℹ️ Accepté / Exception documentée

### ErrorBoundary.tsx : Classe + couleurs hardcodées
- **Problème initial :** Violation règle "functional only" + "no hardcoded colors"
- **Décision :** Exception légitime. React impose un class component pour `componentDidCatch`. `StyleSheet.create` hors du render ne peut pas appeler `useColors()`.
- **Fix appliqué :** Ajout commentaire JSDoc explicatif.
- **Statut :** ✅ Commentaire ajouté
