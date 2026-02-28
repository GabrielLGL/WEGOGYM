# Passe 7 — Corrections
> Run : 20260228-2026

## 7a — Critiques 🔴

### Fix CR-1 : LanguageContext — rollback si DB échoue
- Fichier : `mobile/src/contexts/LanguageContext.tsx`
- `persistLanguage` retourne maintenant `Promise<boolean>`
- `setLanguage` : optimistic update + rollback si `persistLanguage` retourne `false`
- `language` ajouté dans les deps de `setLanguage` (nécessaire pour `previousLang`)
- Même pattern que ThemeContext (fix 20260228-2015)

```typescript
// Avant
const setLanguage = useCallback(async (lang: Language) => {
  setLang(lang)              // pas de rollback possible
  await persistLanguage(lang)
}, [persistLanguage])

// Après
const setLanguage = useCallback(async (lang: Language) => {
  const previousLang = language
  setLang(lang)                          // optimistic update
  const success = await persistLanguage(lang)
  if (!success) setLang(previousLang)   // rollback si DB échoue
}, [language, persistLanguage])
```

## 7b — Warnings 🟡

### Fix CR-2 : MilestoneCelebration — type Ionicons propre
- Fichier : `mobile/src/components/MilestoneCelebration.tsx` ligne 26
- `milestone.icon as any` → `milestone.icon as React.ComponentProps<typeof Ionicons>['name']`
- TypeScript peut maintenant vérifier la compatibilité avec les props Ionicons

## Non corrigés (faux positifs ou hors scope)

| # | Raison |
|---|--------|
| CR-3 SettingsScreen useTheme() vs useColors() | Fonctionnel — pattern style uniquement, hors scope |
| FP-1 GeminiProvider | `Promise<never>` est un pattern TS valide |
| FP-2 useSessionManager repsTarget | `repsTarget?: string` dans le modèle — string est correct |

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1559 passed / 93 suites — 0 régression
