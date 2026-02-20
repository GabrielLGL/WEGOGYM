# Optimisation workflow quotidien — 2026-02-20

## Demande originale
> "je veux que mon workflow soit optimisé, toutes les commandes doivent me proposer les prochaines, et utiliser les derniers rapports, faire les actions, faire un rapport, vérifier les ajouts et si besoin repasser à l'étape modification, commit push uniquement ce que la commande a modifié"

## Analyse
3 besoins identifiés :
1. **Chaining** : chaque commande propose les prochaines étapes
2. **Contexte** : chaque commande lit le dernier rapport du step précédent
3. **Boucle qualité** : action → rapport → vérification → correction si besoin → commit seulement les propres fichiers

## Fichiers modifiés

| Fichier | Modification | Actif |
|---------|-------------|-------|
| `.claude/commands/morning.md` | + section "9. Prochaines étapes" | ✅ local (.gitignore) |
| `.claude/commands/do.md` | + boucle de correction (tsc fail → retour étape 2, max 3x) | ✅ local |
| `.claude/commands/do.md` | + étape 4b vérification du rapport avant commit | ✅ local |
| `.claude/commands/do.md` | + prochaines étapes (→ /review, /gitgo, /do suite) | ✅ local |
| `.claude/commands/review.md` | + étapes 4b/4c : vérification rapport + auto-commit du .md | ✅ local |
| `.claude/commands/review.md` | + prochaines étapes (→ /gitgo si PUSH, /do si CORRIGE) | ✅ local |
| `.claude/commands/gitgo.md` | + étape 0 : lit le dernier rapport /review au démarrage | ✅ local |
| `.claude/commands/gitgo.md` | + étape 6 : prochaines étapes (→ /morning, /do, /verrif) | ✅ local |
| `.claude/commands/status.md` | + prochaines étapes (→ /do, /morning, /review, /gitgo) | ✅ local |

## Flux optimisé

```
/morning
  → Lit : HEALTH.md + verrif + do + reviews
  → Propose : /do [priorité] | /verrif | /status
       ↓
/do [desc]
  → Lit : dernier rapport (verrif/review selon type)
  → Fait : impl → tsc/tests → 🔁 boucle (max 3x) → rapport → vérif rapport → commit
  → Propose : /review | /gitgo | /do [suite]
       ↓
/review
  → Lit : 3 derniers rapports docs/bmad/do/
  → Fait : analyse → verdict → rapport → vérif rapport → commit rapport seul
  → Propose : /gitgo (si PUSH) | /do [correctif] (si CORRIGE)
       ↓
/gitgo
  → Lit : dernier rapport docs/bmad/reviews/ (avertit si CORRIGE non traité)
  → Fait : sécurité → tsc/tests → commits atomiques → push → rapport
  → Propose : /morning | /do [suite] | /verrif | /status
```

## Note importante
`.claude/` est dans `.gitignore` → les commandes sont locales uniquement.
Les modifications sont actives immédiatement dans Claude Code.

## Vérification
- ✅ 5/5 fichiers ont la section "Prochaines étapes"
- ✅ do.md a la boucle de correction (max 3 itérations)
- ✅ gitgo.md lit le dernier rapport /review (étape 0)
- ✅ review.md auto-commit son rapport (étape 4c)
- ✅ do.md vérifie le rapport avant commit (étape 4b)
