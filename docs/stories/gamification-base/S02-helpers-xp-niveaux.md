# S02 — Helpers XP & Niveaux

## Story
**En tant que** systeme,
**je veux** des helpers pour calculer l'XP gagne par seance et le niveau correspondant,
**afin que** la progression soit calculee de maniere fiable et testee.

## Taches techniques
1. Creer `mobile/src/model/utils/gamificationHelpers.ts`
2. Implementer constantes : `BASE_XP_PER_SESSION` (80), `BONUS_XP_PER_PR` (20), `BONUS_XP_COMPLETION` (15), `XP_LEVEL_BASE` (150), `XP_LEVEL_EXPONENT` (1.5)
3. Implementer `xpForLevel(level)` : XP requis pour un niveau donne
4. Implementer `xpCumulativeForLevel(level)` : XP cumule du niveau 1 au niveau N
5. Implementer `calculateLevel(totalXp)` : niveau actuel depuis le total XP
6. Implementer `xpToNextLevel(totalXp, currentLevel)` : { current, required, percentage }
7. Implementer `calculateSessionXP(prCount, isComplete)` : XP gagne pour une seance
8. Tests unitaires complets

## Formules
- `xpForLevel(N)` = `Math.floor(150 * Math.pow(N, 1.5))`
- `calculateSessionXP` = 80 + (prCount * 20) + (isComplete ? 15 : 0)
- Calibrage : niveau 100 en ~500 seances (~3 ans a 3x/semaine)

## Criteres d'acceptation
- [ ] Fichier `gamificationHelpers.ts` cree
- [ ] 6 fonctions implementees et exportees
- [ ] Tests unitaires couvrant niveaux 1, 10, 25, 50, 75, 100
- [ ] Tests pour calculateSessionXP : base seul, avec PRs, avec completion, combinaison
- [ ] `npx tsc --noEmit` passe

## Depend de
- S01

## Estimation
M (~1h)
