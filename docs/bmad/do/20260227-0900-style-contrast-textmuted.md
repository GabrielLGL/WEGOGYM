# style(theme) — Contraste couleurs text-muted (WCAG AA)
Date : 2026-02-27 09:00

## Instruction
/do docs/bmad/prompts/20260227-0900-contrast-textmuted-A.md

## Rapport source
docs/bmad/prompts/20260227-0900-contrast-textmuted-A.md

## Classification
Type : style
Fichiers modifiés : mobile/src/theme/index.ts

## Ce qui a été fait
Corrigé 3 valeurs de couleurs dans le thème pour passer WCAG AA :

| Couleur | Mode | Ancienne valeur | Nouvelle valeur | Ratio avant | Ratio après |
|---------|------|----------------|----------------|-------------|-------------|
| `placeholder` | Dark | `#636e72` | `#8a9299` | 3.29:1 ❌ | 5.47:1 ✅ |
| `textSecondary` | Light | `#636e72` | `#525c61` | 3.85:1 ❌ | 5.03:1 ✅ |
| `placeholder` | Light | `#8a9299` | `#6e7a81` | 2.31:1 ❌ | 3.23:1 ✅ |

`textSecondary` dark (`#b2bec3`, 9.85:1) inchangé — déjà conforme.

La hiérarchie visuelle est préservée dans les deux modes :
- text > textSecondary > placeholder (tous avec des contrastes décroissants)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1270 passed, 75 suites
- Nouveau test créé : non (changements de valeurs hex, aucune logique)

## Documentation mise à jour
Aucune (noms de clés inchangés, aucun nouveau pattern)

## Statut
✅ Résolu — 20260227-0900

## Commit
[sera rempli]
