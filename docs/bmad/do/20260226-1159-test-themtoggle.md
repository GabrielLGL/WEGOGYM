# TEST(web) — ThemeToggle.test.tsx
Date : 2026-02-26 11:59

## Instruction
docs/bmad/prompts/20260226-1745-tests-web-B.md

## Rapport source
docs/bmad/prompts/20260226-1745-tests-web-B.md

## Classification
Type : test
Fichiers modifiés :
- web/src/components/__tests__/ThemeToggle.test.tsx (nouveau)

## Ce qui a été fait
Création du fichier de tests Vitest + @testing-library/react pour le composant `ThemeToggle.tsx`.
5 cas de test couvrant :
1. Rendu du bouton avec aria-label correct
2. Affichage ☀️ par défaut (thème light)
3. Toggle → dark mode (data-theme + localStorage)
4. Double toggle → retour light mode
5. Lecture de data-theme="dark" existant au montage (useEffect)

Adaptation mineure : utilisation de `waitFor` de @testing-library/react (au lieu de `vi.waitFor`)
pour cohérence avec l'API standard de la lib.

## Vérification
- TypeScript : ✅ (inféré via vitest run, 0 erreur)
- Tests : ✅ 11 passed (5 ThemeToggle + 5 route + 1 smoke)
- Nouveau test créé : oui

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-1159

## Commit
[sera rempli à l'étape 7]
