# Neumorphisme Dark Mobile — Index Global

**Date** : 2026-02-26
**Objectif** : Appliquer le style neumorphique dark du site web Kore à l'app mobile React Native.

## Palette de référence

| Token           | Valeur        |
|-----------------|---------------|
| Background      | `#21242b`     |
| Shadow dark     | `#16181d`     |
| Shadow light    | `#2c3039`     |
| Accent (cyan)   | `#00cec9`     |
| Accent 2 (purple)| `#6c5ce7`   |
| Danger          | `#ff6b6b`     |
| Success         | `#00cec9`     |
| Text            | `#dfe6e9`     |
| Text muted      | `#b2bec3`     |

## Groupes exécutés

| Groupe | Statut | Fichiers |
|--------|--------|---------|
| A — Theme | ✅ Fait | `mobile/src/theme/index.ts` |
| B — Composants interactifs | ✅ Fait | Button, ChipSelector, BottomSheet, AlertDialog |
| C — Composants d'affichage | ✅ Fait | SessionItem, WorkoutExerciseCard, SetItem, WorkoutHeader, ProgramSection |

## Validation TypeScript

```
cd mobile && npx tsc --noEmit → 0 erreurs ✅
```

## Notes d'implémentation

- `neuShadow` exporte 3 niveaux : `elevated`, `elevatedSm`, `pressed`
- iOS : shadowColor + shadowOffset + shadowOpacity + shadowRadius
- Android : elevation uniquement (pas de dual shadow)
- borderColor simule le reflet clair (second shadow CSS)
- Éviter l'import circulaire : borderColor dans neuShadow utilise des valeurs en dur
- Button.tsx switché de TouchableOpacity → Pressable pour le pressed state
- Toutes les borders séparateurs supprimées (ombre fait office de délimiteur)
