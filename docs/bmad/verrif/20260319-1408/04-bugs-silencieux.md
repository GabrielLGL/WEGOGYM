# Passe 4/8 — Bugs silencieux

## Résultat : 1 CRIT trouvé

| # | Sévérité | Type | Fichier | Ligne |
|---|----------|------|---------|-------|
| 1 | CRIT | JSON.parse sans try/catch | widgetDataService.ts | 42 |

### Détail

**#1 CRIT — Unsafe JSON.parse dans loadWidgetData()**
`JSON.parse(raw)` sans try/catch. Si AsyncStorage contient du JSON corrompu, crash non géré.
Le caller (KoreWidgetTaskHandler) a un try/catch, mais la fonction elle-même devrait être safe.

### Patterns bien gérés
- Mutations DB : toutes dans database.write() ✅
- Memory leaks : cleanup correct sur setTimeout/setInterval/listeners ✅
- Soft-delete : tous les queries histories filtrent deleted_at=null ✅
- Division par zéro : guards présents ✅
- Console.log : tous gardés par __DEV__ ✅
