# S04 — Helpers Tonnage & Formatage

## Story
**En tant que** systeme,
**je veux** des helpers pour calculer le tonnage d'une seance et formater le tonnage total,
**afin que** le tonnage lifetime soit affiche correctement.

## Taches techniques
1. Ajouter dans `gamificationHelpers.ts` :
   - `calculateSessionTonnage(sets)` : somme de (weight * reps) pour chaque set
   - `formatTonnage(totalKg)` : formate en "X.X t" si >= 1000, sinon "X kg"
2. Tests unitaires

## Criteres d'acceptation
- [ ] `calculateSessionTonnage` calcule correctement la somme poids * reps
- [ ] `calculateSessionTonnage` retourne 0 si sets vide
- [ ] `formatTonnage(500)` → "500 kg"
- [ ] `formatTonnage(1000)` → "1.0 t"
- [ ] `formatTonnage(32500)` → "32.5 t"
- [ ] `formatTonnage(0)` → "0 kg"
- [ ] Tests unitaires complets

## Depend de
- S01

## Estimation
S (~30min)
