# Passe 5/8 — Coherence WatermelonDB — 20260319-1009

## Resultat : Schema v38 coherent avec models

### Points conformes
- 13 tables schema ↔ 13 models : sync OK
- Toutes les mutations dans database.write()
- withObservables correct dans les 4 nouveaux ecrans Stats
- HomeScreen withObservables non modifie par Sprint 13-14
- Soft-delete filtering correct partout

### Problemes trouves : 3

| # | Severite | Fichier | Probleme |
|---|----------|---------|----------|
| 1 | WARN | schema.ts:4 + CLAUDE.md | Commentaire dit "v35" mais schema est v38 |
| 2 | WARN | User.ts:63, WearableSyncLog.ts:8 | @field au lieu de @date pour timestamps |
| 3 | WARN | 4 ecrans Stats Sprint 12-14 | Couleurs hardcodees (#10B981, #F59E0B, #FFFFFF) |
