# Fix — Review suggestions 20260301-2030

**Date :** 2026-03-01 21:00
**Type :** fix
**Scope :** i18n, ExerciseCatalogScreen, ExercisesScreen

---

## Contexte

Suite au code review `docs/bmad/reviews/20260301-2030-review.md`, 3 suggestions 🟡 ont été corrigées.

---

## Changements

### 1. Navigation title → i18n

**Fichiers :** `fr.ts`, `en.ts`, `navigation/index.tsx`

- Ajout de `catalogueGlobal: 'Catalogue global'` dans `navigation` de `fr.ts`
- Ajout de `catalogueGlobal: 'Global catalog'` dans `navigation` de `en.ts`
- `navigation/index.tsx` ligne 194 : `title: 'Catalogue global'` → `title: t.navigation.catalogueGlobal`

### 2. catch silencieux dans handleImport()

**Fichier :** `ExerciseCatalogScreen.tsx`

- Ajout de `importErrorAlert = useModalState()` dans la section Modals
- Catch remplacé par `importErrorAlert.open()` + log dev conditionnel
- Nouveau `AlertDialog` d'erreur ajouté dans le JSX (après `duplicateAlert`)
- Dépendance `importErrorAlert` ajoutée au `useCallback`

### 3. Test bouton globe

**Fichiers :** `ExercisesScreen.tsx`, `ExercisesScreen.test.tsx`

- `testID="globe-catalog-button"` ajouté au `TouchableOpacity` dans `useLayoutEffect`
- Nouveau test : `'le bouton globe navigue vers ExerciseCatalog'`

---

## Vérification

```
TypeScript : 0 erreur
Tests      : 25/25 ✅ (nouveau test inclus)
```
