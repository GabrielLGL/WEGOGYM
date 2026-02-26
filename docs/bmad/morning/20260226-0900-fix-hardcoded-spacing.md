# Rapport — Fix hardcoded spacing (50+ valeurs) — 2026-02-26

## Problème
Issue qualité 🟡 identifiée dans verrif 20260223-0943 (Qualité 18/20) jamais corrigée :
50+ valeurs de spacing/sizing hardcodées dans 10+ composants au lieu des tokens theme.

Exemples typiques :
- `padding: 16` → devrait être `spacing.md`
- `margin: 8` → devrait être `spacing.sm`
- `borderRadius: 12` → devrait être `borderRadius.md`
- Couleurs hardcodées dans tests (ex : AlertDialog.test.tsx:167 → `#FF0000`)

## Fichiers concernés
À identifier exactement au moment de l'exécution — chercher :
```
grep -rn "padding:\s*[0-9]\|margin:\s*[0-9]\|borderRadius:\s*[0-9]" mobile/src/ --include="*.tsx" --include="*.ts"
```
Fichiers connus : 10+ composants dans mobile/src/components/ et mobile/src/screens/

## Commande à lancer
/do docs/bmad/morning/20260226-0900-fix-hardcoded-spacing.md

## Contexte
- Theme tokens : `spacing.xs`(4), `spacing.sm`(8), `spacing.ms`(12), `spacing.md`(16), `spacing.lg`(24), `spacing.xl`(32), `spacing.xxl`(40)
- `borderRadius.sm`, `borderRadius.md`, `borderRadius.lg`
- Import : `import { spacing, borderRadius } from '../theme'`
- Ne remplacer QUE les valeurs qui correspondent exactement à un token (ex: 16→spacing.md, pas 15)
- Ne pas toucher aux valeurs non couvertes par un token (ex: 2, 3, 6...)
- ChartsScreen.tsx:32-33 : RGB dupliqué de `colors.primary`/`colors.text` → remplacer par les variables

## Critères de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 1186+ pass, 0 fail
- Qualité score → 20/20 (plus de hardcoded spacing signalé)

## Statut
⏳ En attente
