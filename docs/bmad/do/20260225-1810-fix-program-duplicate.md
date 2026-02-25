# fix(program) — duplicate() copie equipment et frequency
Date : 2026-02-25 18:10

## Instruction
fix duplicate() dans Program.ts — copier equipment et frequency

## Rapport source
docs/bmad/reviews/20260225-1800-review.md — problème #1

## Classification
Type : fix
Fichiers modifiés : mobile/src/model/models/Program.ts

## Ce qui a été fait
Ajout de `p.equipment = this.equipment` et `p.frequency = this.frequency` dans le callback `create` de `duplicate()` (ligne 29-30). Corrige le Known Pitfall CLAUDE.md §3.1 : "duplicate() methods must copy ALL fields and child relations."

## Vérification
- TypeScript : ✅
- Tests : ✅ 1186 passed
- Nouveau test créé : non (logique existante, pas de changement de contrat)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260225-1810

## Commit
4f0d1a4 fix(program): copy equipment & frequency in duplicate()
