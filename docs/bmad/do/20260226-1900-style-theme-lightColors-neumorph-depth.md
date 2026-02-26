# style(theme) — lightColors : profondeur neumorphique
Date : 2026-02-26 19:00

## Instruction
Dans mobile/src/theme/index.ts, ajuster lightColors (lignes 153-184) pour créer de la profondeur neumorphique. background et card identiques (#e8ecef) donnaient un effet plat.

## Rapport source
Description directe

## Classification
Type : style
Fichiers modifiés : `mobile/src/theme/index.ts`

## Ce qui a été fait
5 valeurs modifiées dans `lightColors` uniquement :
- `background` : `#e8ecef` → `#dde3ea` (fond légèrement plus foncé/saturé)
- `card` : `#e8ecef` → `#edf1f5` (cards plus claires = relief neumorphique)
- `cardSecondary` : `#dde2e6` → `#d5dce5` (cohérence avec le décalage)
- `bgGradientStart` : `#e8ecf0` → `#dde3ea` (aligné avec nouveau background)
- `bgGradientEnd` : `#d5dae0` → `#cdd5de` (gradient légèrement plus sombre)

Dark mode (`colors.*`), `neuShadowLight`, `neuShadowDark` — non touchés.

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ non applicable (changements de valeurs de strings)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-1900

## Commit
[à remplir]
