# Passe 3 — Code Review
> Run : 20260228-2026

## Problèmes trouvés

### 🔴 Critiques

**CR-1 : LanguageContext — race condition (même pattern que ThemeContext)**
- Fichier : `mobile/src/contexts/LanguageContext.tsx`
- `setLang(lang)` appelé avant `persistLanguage()`. Si DB échoue : UI affiche la nouvelle langue mais DB conserve l'ancienne.
- Même bug que ThemeContext (corrigé en 20260228-2015)
- Fix : appliquer le même pattern `Promise<boolean>` + rollback

### 🟡 Warnings

**CR-2 : MilestoneCelebration — `as any` sur Ionicons name**
- Fichier : `mobile/src/components/MilestoneCelebration.tsx` ligne 26
- `milestone.icon as any` — contourne le typage Ionicons
- Fix : `milestone.icon as React.ComponentProps<typeof Ionicons>['name']`

**CR-3 : SettingsScreen — useTheme() au lieu de useColors()**
- Fichier : `mobile/src/screens/SettingsScreen.tsx`
- Utilise `useTheme()` et destructure `{ colors }` au lieu de `useColors()` directement
- Impact mineur — fonctionnel mais pattern non standard
- Décision : non corrigé (fonctionnel, scope trop large, style uniquement)

### ✅ Faux positifs confirmés

**FP-1 : GeminiProvider — `return throwGeminiError()`**
- `throwGeminiError` est typée `Promise<never>` — `return throwGeminiError()` est un pattern TypeScript valide
- Non corrigé

**FP-2 : useSessionManager — `repsTarget = reps` (string)**
- `SessionExercise.repsTarget` est défini `?: string` dans le modèle — assigner une string est correct
- Non corrigé

## Score
- Critiques : 1 trouvé / 1 corrigé
- Warnings : 2 trouvés / 1 corrigé (CR-3 hors scope)
