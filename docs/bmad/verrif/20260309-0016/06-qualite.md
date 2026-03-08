# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-09 00:16

## Résultats du scan

### Points conformes ✅
- **0 `any`** en code de production
- **0 `console.*` non gardé** par `__DEV__`
- **0 `@ts-ignore`** ou `@ts-expect-error`
- **0 `<Modal>` natif** en production
- **0 code commenté**
- **0 couleur en dur** dans écrans/composants
- **0 fontSize en dur** — tous les tokens `fontSize.*` utilisés
- **Tous les setTimeout/setInterval ont leur cleanup**
- **Conventions de nommage cohérentes**

### 🟡 Warnings

| Fichier | Ligne(s) | Type | Description |
|---------|----------|------|-------------|
| constants.ts | 38-48 | Code mort | `USER_LEVEL_LABELS`, `USER_LEVEL_DESCRIPTIONS` — jamais importés |
| constants.ts | 50-62 | Code mort | `USER_GOAL_LABELS`, `USER_GOAL_DESCRIPTIONS` — jamais importés |
| constants.ts | 35-36 | Code mort | `PROGRAM_EQUIPMENT` + `ProgramEquipment` — jamais importés |
| SessionDetailScreen.tsx | 461 | Valeur en dur | `borderRadius: 22` — pas de token correspondant |
| StatsCalendarScreen.tsx | 817, 867 | Valeur en dur | `borderRadius: 6`, `borderRadius: 8` |
| StatsVolumeScreen.tsx | 390, 396 | Valeur en dur | `borderRadius: 3` |
| ChartsScreen.tsx | 360 | Valeur en dur | `marginTop: 50` |
| ExerciseCatalogScreen.tsx | 601 | Valeur en dur | `paddingTop: 80` |
| ProgramsScreen.tsx | 201 | Valeur en dur | `paddingBottom: 150` |
| ProgramDetailScreen.tsx | 275 | Valeur en dur | `paddingBottom: 100` |

### 🔵 Suggestions

- `MUSCLES_LIST` / `EQUIPMENT_LIST` contiennent des chaînes FR utilisées comme identifiants DB. Chantier structurel i18n à terme.
- La gamme `borderRadius` (2, 4, 10, 14, 20, 26) ne couvre pas 3, 6, 8, 22. Enrichir ou arrondir.
- ~200 `as any` dans les tests — créer des factories de mocks typées.

## Résumé quantitatif

| Catégorie | Production | Tests |
|-----------|-----------|-------|
| `any` | **0** | ~200 |
| `console.*` non gardé | **0** | 0 |
| Couleurs en dur | **0** | ~10 |
| Code mort (exports) | **5 exports** | 0 |
| Magic numbers | **~10** | ~3 |
