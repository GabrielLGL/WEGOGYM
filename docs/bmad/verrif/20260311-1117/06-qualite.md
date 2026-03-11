# Passe 6/8 — Code mort & qualité

## any types
**Aucun.** 0 occurrence de `: any`, `as any`, ou `<any>` dans le code source.

## console.log hors __DEV__
**Aucun.** Toutes les occurrences sont gardées par `if (__DEV__)`.

## Couleurs hardcodées
| # | Fichier | Valeur | Severity |
|---|---------|--------|----------|
| 1 | `AnimatedSplash.tsx:20-21` | `#181b21`, `#00cec9` | WARNING — devrait importer `colors` du theme statiquement |

## Strings hardcodées (hors i18n)
| # | Fichier:ligne | String | Severity |
|---|---------------|--------|----------|
| 1 | `statsMuscle.ts:42` | `othersLabel = 'Autres'` | WARNING |
| 2 | `statsVolume.ts:141` | `sessionFallback = 'Séance'` | WARNING |
| 3 | `statsVolume.ts:172` | `['Mon', 'Tue', ...]` fallback anglais | WARNING |
| 4 | `statsMuscle.ts:195` | `MONTH_LABELS_DEFAULT` anglais | WARNING |
| 5 | `statsVolume.ts:133` | `formatVolume` → `kg` hardcodé | WARNING |
| 6 | `gamificationHelpers.ts:179` | `formatTonnage` → `kg` | WARNING |
| 7 | `progressionHelpers.ts:73,88` | `+X kg` | WARNING |
| 8 | `progressionHelpers.ts:81` | `'+1 rep'` | WARNING |
| 9 | `WorkoutSummarySheet.tsx:150,193,244` | `kg` dans UI | WARNING |
| 10 | `aiService.ts:49-55` | equipmentMap clés françaises | WARNING |

## Imports inutilisés
**Aucun détecté** dans les fichiers modifiés.

## Code mort
**Aucun détecté.** Tous les exports sont référencés.

## Magic numbers
| # | Fichier:ligne | Valeur | Severity |
|---|---------------|--------|----------|
| 1 | `aiService.ts:75` | `7 * 24 * 60 * 60 * 1000` | WARNING — utiliser WEEK_MS |
| 2 | `aiService.ts:108` | `30 * 24 * 60 * 60 * 1000` | WARNING — utiliser 30 * DAY_MS |
| 3 | `StatsVolumeScreen.tsx:52` | `7 * 24 * 60 * 60 * 1000` | WARNING — utiliser WEEK_MS |
| 4 | `aiService.ts:115` | `50` (take limit) | SUGGESTION |
| 5 | `BadgeCard.tsx:46` | `minHeight: 90` | SUGGESTION |

## Résumé
- 🔴 **0 CRITICAL**
- 🟡 **14 WARNING** (1 couleur, 10 strings i18n, 3 magic numbers)
- 🔵 **2 SUGGESTION** (magic numbers mineures)
