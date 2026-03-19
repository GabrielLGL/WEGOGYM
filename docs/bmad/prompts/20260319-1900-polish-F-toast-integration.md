# Tache F — Integrer useToast() dans les actions cles — 20260319-1900

## Objectif
Le composant Toast et le hook `useToast()` existent mais ne sont utilises nulle part. Integrer des toasts de confirmation sur les actions utilisateur cles (creer, dupliquer, supprimer, importer, exporter).

## Fichiers a modifier
- `mobile/src/screens/ProgramsScreen.tsx` — creer/dupliquer/supprimer programme
- `mobile/src/screens/ExerciseCatalogScreen.tsx` — importer exercice depuis catalogue
- `mobile/src/screens/SessionDetailScreen.tsx` — ajouter/supprimer exercice de la seance
- `mobile/src/screens/SettingsScreen.tsx` — exporter/importer donnees JSON
- `mobile/src/hooks/useExerciseManager.ts` — creer/supprimer exercice custom

## Fichiers a modifier (i18n)
- `mobile/src/i18n/fr.ts` — ajouter section `toasts`
- `mobile/src/i18n/en.ts` — ajouter section `toasts`

## Contexte technique

### API du hook
```tsx
import { useToast } from '../contexts/ToastContext'

const { showToast } = useToast()
showToast({ message: 'Programme cree', variant: 'success' })
showToast({ message: 'Erreur de suppression', variant: 'error' })
```

Variants : `'success'` | `'error'` | `'info'`

### Patterns obligatoires (CLAUDE.md)
- `useLanguage()` hook pour les textes → `{ t }`
- Pas de strings hardcodes — tous les messages dans i18n
- `fr.ts` ne doit PAS avoir `as const`

### Textes i18n a ajouter

```typescript
toasts: {
  programCreated: 'Programme cree',
  programDuplicated: 'Programme duplique',
  programDeleted: 'Programme supprime',
  exerciseCreated: 'Exercice cree',
  exerciseDeleted: 'Exercice supprime',
  exerciseImported: 'Exercice importe',
  exerciseAdded: 'Exercice ajoute',
  exerciseRemoved: 'Exercice retire',
  dataExported: 'Donnees exportees',
  dataImported: 'Donnees importees',
  error: 'Une erreur est survenue',
}
```

### Integration par fichier

**ProgramsScreen.tsx :**
- Apres creation reussie d'un programme → `showToast({ message: t.toasts.programCreated })`
- Apres duplication reussie → `showToast({ message: t.toasts.programDuplicated })`
- Apres suppression reussie → `showToast({ message: t.toasts.programDeleted })`
- En cas d'erreur → `showToast({ message: t.toasts.error, variant: 'error' })`

**ExerciseCatalogScreen.tsx :**
- Apres import reussi d'un exercice → `showToast({ message: t.toasts.exerciseImported })`

**SessionDetailScreen.tsx :**
- Apres ajout d'un exercice a la seance → `showToast({ message: t.toasts.exerciseAdded })`
- Apres suppression d'un exercice → `showToast({ message: t.toasts.exerciseRemoved })`

**SettingsScreen.tsx :**
- Apres export JSON reussi → `showToast({ message: t.toasts.dataExported })`
- Apres import JSON reussi → `showToast({ message: t.toasts.dataImported })`

**useExerciseManager.ts :**
- Ce hook est utilise par ExercisesScreen. Si le hook expose les fonctions de creation/suppression, ajouter le toast LA ou dans le screen qui appelle le hook.
- Verifier : si le hook retourne une Promise, le toast va dans le `.then()` du screen. Si le hook gere tout en interne, il faut accepter un callback `onSuccess` ou utiliser `useToast()` dans le hook.

## Etapes
1. Ajouter section `toasts` dans `fr.ts` et `en.ts`
2. Pour chaque fichier : importer `useToast`, appeler `showToast` apres l'action reussie
3. Ajouter `variant: 'error'` dans les blocs catch
4. Verifier : `npx tsc --noEmit` → 0 erreur
5. Verifier : `npm test` → 0 fail

## Contraintes
- NE PAS modifier Toast.tsx ou ToastContext.tsx
- NE PAS modifier les composants Home (deja touches par d'autres taches)
- Toast APRES l'action reussie uniquement, pas avant
- Garder le haptic feedback existant (le toast s'ajoute, ne remplace pas)

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Chaque action cle affiche un toast de confirmation

## Dependances
Necessite la tache A (Toast) — DEJA FAITE ✅

## Statut
⏳ En attente
