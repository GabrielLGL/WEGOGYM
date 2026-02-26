# Product Brief — Récap Post-Séance — 2026-02-26

## Problème
Le WorkoutSummarySheet actuel affiche uniquement des totaux globaux (durée, volume, séries, PRs, XP). L'utilisateur ne sait pas ce qu'il a fait exercice par exercice ni s'il a progressé par rapport à la dernière fois. Après l'effort, la récompense est abstraite.

## Solution
Enrichir le WorkoutSummarySheet avec 3 nouvelles sections sous les stats existantes :
1. Message motivant + chips muscles (contextuel, local)
2. "Ce que tu as fait" — liste exercices + sets validés (reps × poids)
3. "Progression" — delta volume vs dernière séance identique + delta poids max par exo

## Utilisateurs cibles
- Intermédiaire (6-24 mois) — validation concrète de ses efforts
- Débutant — feedback positif pour créer l'habitude

## Périmètre v1

### Must Have
- Liste exercices + sets validés (reps × poids) dans la récap
- Chips des muscles travaillés (parsés depuis exercises.muscles)
- Message motivant contextuel (local) : PR → "Record battu !", volume+ → "En progression 🔺", sinon → "Bonne séance !"
- Comparaison volume total vs dernière séance identique (+X kg / -X kg)

### Should Have
- Delta poids max par exercice ("80 kg → 82.5 kg 🔺")
- Indicateur complétion (séries validées / séries prévues)

### Could Have (v2)
- Récaps passées depuis l'historique
- Score de qualité global
- Timeline chronologique des sets

### Won't Have (v1)
- Partage/export (couvert par heatmap-recap-export S07)
- IA contextuelle

## Métriques de succès
- 100% des séances terminées affichent la récap enrichie
- 0 régression sur le flow WorkoutScreen → WorkoutSummarySheet → Home
- npx tsc --noEmit 0 erreur / tests existants verts

## Prêt pour Phase 3 ?
OUI
