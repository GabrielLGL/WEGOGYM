# Passe 5/8 — Coherence WatermelonDB
**Date:** 2026-03-09 01:11

## Critiques (0)
Aucun. Schema v33 et modeles parfaitement synchronises.

## Warnings (2)
1. **StatsCalendarScreen l.319-399** — 7 acces `_raw` pour lire les FK. Devrait utiliser `relation.id` (ex: `h.session.id`).
2. **deleteAllData** (dataManagementUtils.ts l.49-65) — champs utilisateur non reinitialises : tutorialCompleted, aiProvider, streakTarget, timerEnabled, vibrationEnabled, timerSoundEnabled, restDuration → **CORRIGE**.

## Suggestions (1)
1. **secureKeyStore.ts l.81, 93** — Acces `_raw['ai_api_key']` justifie (migration backward-compat). Planifier suppression en v35+.

## Points conformes
- Schema ↔ Model sync : OK
- Relations : OK
- duplicate() : copie tous les champs + children
- Soft-delete : filtre dans toutes les requetes
- withObservables : 33+ fichiers
