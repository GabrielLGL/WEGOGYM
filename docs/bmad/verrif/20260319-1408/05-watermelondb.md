# Passe 5/8 — Cohérence WatermelonDB

## Résultat : 2 problèmes trouvés (1 CRIT, 1 WARN)

| # | Sévérité | Type | Fichier | Ligne |
|---|----------|------|---------|-------|
| 1 | CRIT | Type relation manquant | ProgressPhoto.ts | 17 |
| 2 | WARN | Optional mismatch | User.ts | 58 |

### Détail

**#1 CRIT — ProgressPhoto relation type**
`bodyMeasurement!: BodyMeasurement` devrait être `bodyMeasurement!: Relation<BodyMeasurement>`.
Import `Relation` manquant.

**#2 WARN — User.friendCode optional mismatch**
Schema : `friend_code` isOptional=true → model devrait être `string | null`.
Actuellement déclaré comme `string` non-nullable.

### Patterns OK
- Schema v38 = migrations v38 ✅
- Toutes les colonnes schema ont un decorator correspondant ✅
- Tous les decorators ont une colonne schema ✅
- Relations Set, SessionExercise, Session utilisent correctement Relation<T> ✅
- JSON muscles avec try/catch ✅
