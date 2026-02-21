<!-- v1.0 — 2026-02-21 -->
# Rapport — Algo Programme — Groupe B : Enrichissement métadonnées exercices — 20260221-1559

## Objectif
Enrichir `exerciseMetadata.ts` avec de nouvelles propriétés par exercice pour permettre
à l'algorithme de générer des programmes plus intelligents : score SFR, zone d'étirement,
risque blessure par zone, et compatibilité unilateral/bilateral.

## Fichiers concernés
- `mobile/src/services/ai/exerciseMetadata.ts`

## Contexte technique
- Chaque entrée dans `exerciseMetadata.ts` décrit un exercice par son nom (string key)
- Structure actuelle : `{ type, minLevel, isUnilateral, primaryMuscle, secondaryMuscles }`
- Ces métadonnées sont utilisées dans `offlineEngine.ts` pour sélectionner/trier les exercices
- Le fichier contient 100+ exercices — ne modifier QUE la structure de type + ajouter les champs
- Voir CLAUDE.md section 3.1 (Known Pitfalls) — No any, No hardcoded colors
- Lang : fr-FR pour les labels utilisateur mais les propriétés restent en anglais

## Nouvelles propriétés à ajouter dans le type `ExerciseMetadata`

```typescript
// Propriétés à ajouter à l'interface ExerciseMetadata
sfr: 'high' | 'medium' | 'low'
// SFR = Stimulus-to-Fatigue Ratio
// high = exercices très efficaces (ex: curl biceps → peu fatiguant, stimulus isolé)
// medium = compromis (ex: développé couché)
// low = exercices très fatigants pour le stimulus produit (ex: deadlift classique pour biceps)

stretchFocus: boolean
// true = exercice sollicite le muscle en position d'étirement (hypertrophie +++)
// ex: curl incliné, fly pec, pull-over → true
// ex: curl barre debout, développé couché → false

injuryRisk: string[]
// zones potentiellement sollicitées en cas de mauvaise form ou surcharge
// values: 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque' | 'none'
// ex: Squat: ['genoux', 'bas_dos'], Curl biceps: ['poignets'], Développé couché: ['epaules']

progressionType: 'linear' | 'wave' | 'auto'
// linear = exercice facile à progresser en charge (compound_heavy)
// wave = meilleur avec ondulation (compound accessory)
// auto = l'algorithme choisit
```

## Valeurs à assigner (exemples — compléter pour tous)

```typescript
'Développé Couché Barre': {
  ...existing,
  sfr: 'medium',
  stretchFocus: false,
  injuryRisk: ['epaules', 'poignets'],
  progressionType: 'linear'
}

'Curl Incliné Haltères': {
  ...existing,
  sfr: 'high',
  stretchFocus: true,
  injuryRisk: ['poignets'],
  progressionType: 'wave'
}

'Squat Barre': {
  ...existing,
  sfr: 'medium',
  stretchFocus: false,
  injuryRisk: ['genoux', 'bas_dos'],
  progressionType: 'linear'
}

'Soulevé de Terre': {
  ...existing,
  sfr: 'low',
  stretchFocus: false,
  injuryRisk: ['bas_dos', 'nuque'],
  progressionType: 'linear'
}
```

## Règles d'assignation des valeurs

**SFR (sfr) :**
- `high` → exercices isolation ou compound léger à faible fatigue systémique
- `medium` → compound classiques (bench, row, OHP)
- `low` → exercices très demandants (DL, Squat, SQ back, Romanian DL)

**stretchFocus :**
- `true` → si le muscle est en position d'étirement maximale à l'extension
- Exemples `true` : curl incliné, fly cable bas, pull-over, leg curl allongé, hip thrust
- Exemples `false` : curl barre, développé couché plat, lat pulldown

**injuryRisk :**
- Identifier les articulations sous stress lors de l'exécution standard
- Exercices d'épaule → souvent `['epaules']`
- Exercices overhead → `['epaules', 'nuque']`
- Deadlifts → `['bas_dos', 'nuque']`
- Leg press profond → `['genoux']`

## Contraintes
- Ne PAS modifier les propriétés existantes (`type`, `minLevel`, `isUnilateral`, `primaryMuscle`, `secondaryMuscles`)
- Ajouter les 4 nouvelles propriétés à TOUS les exercices existants (pas seulement quelques-uns)
- Valeurs par défaut acceptables si incertain : `sfr: 'medium'`, `stretchFocus: false`, `injuryRisk: ['none']`, `progressionType: 'auto'`
- No `any` TypeScript — le type `ExerciseMetadata` doit être mis à jour en conséquence
- Respecter l'ordre alphabétique ou l'ordre actuel du fichier

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- Tous les exercices existants ont les 4 nouvelles propriétés assignées
- Le type `ExerciseMetadata` compile correctement avec les nouvelles propriétés

## Dépendances
Aucune dépendance amont. Peut être exécuté en parallèle avec le Groupe A.
Le Groupe C (algorithme) dépend de ce groupe.

## Statut
⏳ En attente
