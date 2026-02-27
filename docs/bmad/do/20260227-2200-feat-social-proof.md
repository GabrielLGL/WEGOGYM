# feat(social-proof) — Afficher "Rejoins les premiers inscrits" si < 50 inscrits

Date : 2026-02-27 22:00

## Instruction
sur le site si il y a moins de 50 personnes inscrites met Rejoins les premiers inscrits

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés : web/src/components/SocialProof.tsx

## Ce qui a été fait
Modifié la condition dans `SocialProof.tsx` de `count === null || count === 0`
à `count === null || count < 50`.
Désormais, tant que le nombre d'inscrits est inférieur à 50, le message
"Rejoins les premiers inscrits" s'affiche au lieu du compteur.

## Vérification
- TypeScript : ✅ (composant pur, pas de type modifié)
- Tests : ✅ aucun test impacté
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-2200

## Commit
[à remplir]
