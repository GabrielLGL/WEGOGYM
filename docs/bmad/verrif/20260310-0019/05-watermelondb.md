# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-10 00:19

## Points conformes
- Schema v33 = Migration v33 — synchronisation parfaite
- 10 tables = 10 modèles = 10 classes dans modelClasses
- Toutes colonnes ont un decorator correspondant — zéro orphelin
- Toutes relations (FK, index, associations) cohérentes
- tsconfig : experimentalDecorators + useDefineForClassFields correct
- Program.duplicate() copie tous les champs y compris superset
- Soft-delete sur histories et sessions

## Violations mineures

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🟡 WARN | Session.ts | 16 | `position` typé `number` mais `isOptional: true` dans le schéma — devrait être `number \| null` |
| 2 | 🟡 WARN | BodyMeasurement.ts | 7 | `date` utilise `@field` au lieu de `@date` — timestamp brut au lieu de Date |

## Bilan
- 🔴 CRIT : 0
- 🟡 WARN : 2 (mineurs, pas de crash)
