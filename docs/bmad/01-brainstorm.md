# Brainstorm — Animations/Demos exercices — 2026-02-25

## Idee reformulee
En tant qu'utilisateur (surtout debutant), je veux voir une demonstration visuelle de l'execution correcte d'un exercice d'un simple tap pendant ma seance, pour m'assurer que je fais le mouvement correctement — meme sans internet.

## Persona cible
Debutant (prioritaire) — ne connait pas tous les mouvements, a besoin de guidance visuelle. Aussi utile pour les intermediaires decouvrant de nouveaux exercices.

## Idees explorees
1. Animation Lottie bundled (fichiers vectoriels ultra-legers)
2. GIF anime bundled (simple mais plus lourd)
3. SVG anime sequentiel (deux poses alternees)
4. BottomSheet de demonstration (animation + muscles + notes)
5. Fallback texte enrichi (instructions courtes pour exercices sans animation)
6. Icone "?" contextuelle a cote du nom de l'exercice
7. Mode "apprendre" (ecran interstitiel optionnel avant exercice)
8. Progression download (base bundled + supplementaires telechargeable)
9. Contribution communautaire (tips texte par utilisateurs avances)
10. Categorisation par difficulte visuelle (badge "technique complexe")
11. Integration notes exercice (panneau d'info complet avec animation + notes)
12. Animation avec angles/cues (overlay de fleches sur l'animation)

## Top 5 Insights
1. **SVG statique 2 poses** — Ultra-leger, aucune dependance, mais moins fluide | Risque : rendu "cheap"
2. **Bundled-first, download-later** — 20-30 exercices de base bundled, le reste en placeholder | Risque : augmente le bundle initial
3. **BottomSheet info panel** — Reutilise le composant existant, combine animation + muscles + notes | Risque : distraction en pleine seance
4. **Fallback texte obligatoire** — Chaque exercice a au minimum une description textuelle | Risque : texte seul moins efficace pour debutants
5. **Champ animation_key sur Exercise** — String optionnelle mappant vers un asset local | Risque : couplage fort code/assets

## Decision
- **Format : Placeholder (option D)** — Structure complete avec placeholders, prete pour les vrais assets plus tard
- **Scope MVP : 20-30 exercices de base** mappes avec animation_key
- **Assets : a sourcer apres** — le code est pret, les animations viendront dans une phase ulterieure

## Questions ouvertes
- Format final des animations (Lottie vs GIF vs SVG) — a decider quand les assets seront prets
- Source des animations (creation custom, banque libre de droits, generation IA)

## Contraintes techniques identifiees
- Pas de Modal natif (Fabric crash) → BottomSheet via Portal
- Offline-first : assets bundled, pas de fetch reseau
- Schema migration necessaire (ajout animation_key sur exercises)
- Bundle size a surveiller quand les vrais assets arriveront

## Pret pour Phase 2 ?
OUI
