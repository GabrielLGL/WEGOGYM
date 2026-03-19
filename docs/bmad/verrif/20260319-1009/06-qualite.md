# Passe 6/8 — Code mort & Qualite — 20260319-1009

## Points conformes
- 0 `any` en code production (strict TS respecte)
- Tous console.* gardes par __DEV__
- as const absent de en.ts
- Imports propres dans ecrans recents

## Problemes trouves : 3

| # | Severite | Fichier | Probleme |
|---|----------|---------|----------|
| 1 | WARN | 21 fichiers screens | 71 couleurs hardcodees (theme debt) |
| 2 | WARN | overtrainingHelpers.ts | Importe uniquement dans son test — code mort en production |
| 3 | SUGG | 12+ fichiers tests | as any au lieu de testFactories.ts |
