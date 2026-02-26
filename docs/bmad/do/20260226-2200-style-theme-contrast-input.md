# style(theme) — Contraste couleurs dark/light + token input
Date : 2026-02-26 22:00

## Instruction
docs/bmad/prompts/20260226-2200-ui-polish-A.md

## Rapport source
docs/bmad/prompts/20260226-2200-ui-polish-A.md (description directe)

## Classification
Type : style
Fichiers modifiés : mobile/src/theme/index.ts

## Ce qui a été fait
1. **Dark mode** — `background` `#21242b` → `#181b21` (plus sombre), `cardSecondary` `#252830` → `#282d38`, `border`/`separator` `#2c3039` → `#363d4d`
2. **Light mode** — `background` `#e8ecef` → `#d8dde6`, `card` `#e8ecef` → `#eef1f5` (les cartes flottent), `cardSecondary` → `#e4e9f0`, `primary`/`success` `#00cec9` → `#006d6b` (ratio 6.8:1), `border`/`separator` → `#b8c1cc`, `primaryBg`/`successBg` adaptés au nouveau primary
3. **Token `input`** — ajouté dans `colors` (`#16181e`) et `lightColors` (`#ffffff`) pour distinguer les TextInput des cartes
4. **neuShadowLight** — `borderColor` renforcés : `elevated` `#ffffff` → `#f5f8fc`, `elevatedSm` `#ffffff` → `#f0f4f8`, `pressed` `#d0d7e0` → `#c8d0da`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1259 passed (75 suites)
- Nouveau test créé : non (changements purement visuels)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-2200

## Commit
23610dc style(theme): improve dark/light contrast + add input token
