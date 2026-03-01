<!-- v1.0 — 2026-03-01 -->
# Rapport — workout-ui-colors — Groupe A — 20260301-2000

## Objectif
Corriger les couleurs du bouton "Terminer la séance" et du texte dans l'AlertDialog de confirmation de fin de séance.

## Fichiers concernés
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/components/AlertDialog.tsx`

## Contexte technique
- Theme dynamique : `useColors()` / `useTheme()` depuis `mobile/src/contexts/ThemeContext.tsx`
- `colors.primaryText` = `#ffffff` (blanc pur) — à utiliser pour les textes sur fond coloré (primary/danger)
- `colors.text` = `#dfe6e9` (gris clair) — à utiliser pour les textes sur fond neutre
- `colors.primary` = `#00cec9` (cyan) en dark, `#6c5ce7` (violet) en light
- `colors.success` = `#00cec9` en dark (même valeur que primary) — mais sémantiquement incorrect pour un bouton d'action principal
- JAMAIS de couleurs hardcodées — toujours via `colors.*` du thème

## Étapes

### WorkoutScreen.tsx (lignes 506-516)
1. Dans `useStyles()`, style `endButton` :
   - Changer `backgroundColor: colors.success` → `backgroundColor: colors.primary`
   - Raison : le bouton "Terminer" est une action primaire, pas un état de succès
2. Dans `useStyles()`, style `endButtonText` :
   - Changer `color: colors.text` → `color: colors.primaryText`
   - Raison : texte sur fond coloré (primary) → doit être blanc pur (`colors.primaryText`)

### AlertDialog.tsx (lignes 123-129 + 187-192)
1. Dans `useStyles()`, renommer le style `buttonText` existant en `cancelButtonText` (il reste `color: colors.text` — correct pour fond `secondaryButton` neutre)
2. Ajouter un nouveau style `confirmButtonText` :
   ```ts
   confirmButtonText: {
     color: colors.primaryText,
     fontWeight: 'bold',
     fontSize: fontSize.md,
   }
   ```
3. Sur le bouton "cancel" (ligne ~114-121) : changer `styles.buttonText` → `styles.cancelButtonText`
4. Sur le bouton "confirm" (ligne ~123-129) : changer `styles.buttonText` → `styles.confirmButtonText`
5. Vérifier les TypeScript types — aucune erreur

## Contraintes
- Ne PAS toucher la logique (handlers, animations, props)
- Ne PAS modifier les couleurs du bouton annuler (`cancelButton` reste `secondaryButton`, texte reste `colors.text`)
- Pas de couleurs hardcodées
- L'AlertDialog est un composant partagé — le fix s'applique à tous ses usages (correct car tous les boutons confirm ont un fond coloré)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Le bouton "Terminer la séance" affiche un fond `primary` (cyan/violet selon thème) avec texte **blanc pur**
- L'AlertDialog de confirmation affiche le texte du bouton confirm en **blanc pur**
- Le texte du bouton Annuler reste inchangé (couleur `colors.text`)

## Dépendances
Aucune — indépendant des groupes B et C

## Statut
✅ Résolu — 20260301-2000

## Résolution
Rapport do : docs/bmad/do/20260301-2000-style-workout-end-button.md
