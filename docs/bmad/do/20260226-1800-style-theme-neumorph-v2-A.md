# style(theme) — Neumorphisme v2 Groupe A — Contraste + Gradients
Date : 2026-02-26 18:00

## Instruction
docs/bmad/prompts/20260226-1800-neumorph-v2-A.md

## Rapport source
docs/bmad/prompts/20260226-1800-neumorph-v2-A.md

## Classification
Type : style
Fichiers modifiés : mobile/src/theme/index.ts

## Ce qui a été fait

### 1. `colors` — 2 tokens modifiés + 6 tokens ajoutés
- `neuShadowDark` : `#16181d` → `#060809` (quasi-noir, contraste maximal)
- `neuShadowLight` : `#2c3039` → `#3c4558` (reflet nettement plus clair)
- Ajout : `cardGradientStart/End`, `bgGradientStart/End`, `primaryGradientStart/End`

### 2. `neuShadow` (dark mode) — export entièrement remplacé
- `shadowColor` : `#0a0c10` → `#020304`
- `elevated` : offset 8→12, radius 16→24, opacity 0.9→1.0, elevation 10→14, borderColor → `#4a5570`
- `elevatedSm` : offset 4→6, radius 8→12, opacity 0.8→0.95, elevation 5→7, borderColor → `#404a62`
- `pressed` : offset 1→2, radius 3→4, opacity 0.4→0.5, elevation 1→2, borderColor → `#1e2330`

### 3. `lightColors` — 1 token modifié + 6 tokens ajoutés
- `neuShadowDark` : `#b0b8c1` → `#8a9bb0` (plus sombre, meilleur contraste)
- Ajout : `cardGradientStart/End`, `bgGradientStart/End`, `primaryGradientStart/End`

### 4. `neuShadowLight` (light mode) — export entièrement remplacé
- `shadowColor` : `#b0b8c1` → `#8a9bb0`
- `elevated` : offset 8→12, radius 16→24, opacity 0.9→1.0, elevation 10→14
- `elevatedSm` : offset 4→6, radius 8→12, opacity 0.8→0.95, elevation 5→7
- `pressed` : offset 1→2, radius 3→4, opacity 0.4→0.5, elevation 1→2, borderColor → `#d0d7e0`

### 5. `ThemeColors` type
Mis à jour automatiquement via `typeof colors` — nouveaux tokens gradient accessibles via `useColors()`.

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1255 passed (4 failures pré-existantes dans Exercise.ts/models.test — hors scope)
- Nouveau test créé : non (changements de constantes uniquement)

## Documentation mise à jour
aucune (pas de nouveau composant/hook/pattern)

## Statut
✅ Résolu — 20260226-1800

## Commit
[sera rempli]
