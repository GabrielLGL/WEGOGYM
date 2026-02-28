# Rapport — Nettoyage du code mort
> Date : 2026-02-28 17:30
> Statut : ✅ Résolu
> TypeScript : 0 erreur après modifications

---

## A — Écran supprimé

| Fichier | Raison |
|---------|--------|
| `mobile/src/screens/StatsRepartitionScreen.tsx` | Non importé dans `navigation/index.tsx` ni ailleurs — écran orphelin |
| `mobile/src/screens/__tests__/StatsRepartitionScreen.test.tsx` | Test de l'écran supprimé ci-dessus |

**Vérification** : `grep -r "StatsRepartition" mobile/src` → aucun résultat après suppression.

---

## B — Tokens de thème supprimés (`theme/index.ts`)

### Dans `colors` (palette dark)
| Token | Valeur | Raison |
|-------|--------|--------|
| `neuShadowLight` | `'#3c4558'` | Aucun import dans tout le codebase |
| `secondaryAccent` | `'#6c5ce7'` | Aucun import dans tout le codebase |
| `cardGradientStart` | `'#262d3a'` | Aucun import dans tout le codebase |
| `cardGradientEnd` | `'#1a1d24'` | Aucun import dans tout le codebase |
| `input` | `'#16181e'` | Aucun import dans tout le codebase |

### Dans `lightColors` (palette light)
| Token | Valeur | Raison |
|-------|--------|--------|
| `neuShadowLight` | `'#ffffff'` | Inaccessible via `ThemeColors` après suppression dans `colors` |
| `secondaryAccent` | `'#a29bfe'` | Inaccessible via `ThemeColors` après suppression dans `colors` |
| `cardGradientStart` | `'#edf1f5'` | Inaccessible via `ThemeColors` après suppression dans `colors` |
| `cardGradientEnd` | `'#dde5ee'` | Inaccessible via `ThemeColors` après suppression dans `colors` |
| `input` | `'#ffffff'` | Inaccessible via `ThemeColors` après suppression dans `colors` |

### Dans `fontSize`
| Token | Valeur | Raison |
|-------|--------|--------|
| `fontSize.hero` | `32` | Aucun import dans tout le codebase |

**Vérification** : `grep -r "neuShadowLight\|secondaryAccent\|cardGradientStart\|cardGradientEnd\|colors\.input\|fontSize\.hero" mobile/src` → uniquement `theme/index.ts`.

---

## C — Scripts/logs orphelins supprimés (racine du repo)

Tous non trackés par git (hors `run-verrif.ps1` qui est le script CI actif — **conservé**).

| Fichier | Type |
|---------|------|
| `commit_vague1.js` | Script de commit ponctuel |
| `commit_vague1_output.txt` | Log |
| `do_git.bat` | Script git ponctuel |
| `git_commit2.js` | Script de commit ponctuel |
| `git_commit_coverage.js` | Script de couverture ponctuel |
| `git_commit_coverage.ps1` | Script PowerShell ponctuel |
| `jest_full_output.txt` | Log Jest |
| `jest_output.txt` | Log Jest |
| `jest_results.json` | Log Jest |
| `jest_results_new.txt` | Log Jest |
| `jest_run_summary.txt` | Log Jest |
| `mobile/jest_output.txt` | Log Jest |
| `mobile/run_jest.bat` | Script test ponctuel |
| `mobile/run_simple_test.bat` | Script test ponctuel |
| `mobile/run_tsc.bat` | Script TypeScript ponctuel |
| `parse_jest.js` | Script analyse Jest |
| `ps_output.txt` | Log PowerShell |
| `run_checks.bat` | Script vérification ponctuel |
| `run_git.sh` | Script git ponctuel |
| `run_git2.sh` | Script git ponctuel |
| `run_git2_output.txt` | Log |
| `run_git_output.txt` | Log |
| `run_jest.bat` | Script Jest ponctuel |
| `run_jest_target.bat` | Script Jest ponctuel |
| `test_output.txt` | Log |

**Total** : 25 fichiers orphelins supprimés.

---

## Ce qui N'a PAS été touché

- Tous les composants (29/29 utilisés)
- Tous les hooks (9/9 utilisés)
- Toutes les screens actives dans la navigation (20/20 utilisées)
- Tous les utilitaires `model/utils/` (tous importés)
- `web/` (zéro code mort)
- `run-verrif.ps1` (script CI actif — conservé)
- Tokens `bgGradientStart`, `bgGradientEnd`, `primaryGradientStart`, `primaryGradientEnd` (utilisés dans les composants)
