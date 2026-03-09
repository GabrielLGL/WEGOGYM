# Passe 6/8 — Code mort & qualité

## Résumé : 0 CRIT, 1 WARN, 4 SUGGESTIONS

### Conformités
- ✅ Zero `any` en code de production
- ✅ Zero `<Modal>` natif React Native
- ✅ Console.log/warn correctement gardés par `__DEV__`
- ✅ Zero couleur hardcodée en production
- ✅ withObservables systématique
- ✅ Validation centralisée

### Violations détectées

| # | Sévérité | Fichier:Ligne | Problème |
|---|----------|---------------|----------|
| 1 | 🟡 WARN | `ChartsScreen.tsx:362` | `marginTop: 50` magic number (aucun token spacing ne correspond) |
| 2 | 🔵 SUGG | `theme/index.ts:108` | Export `intensityColors` standalone jamais importé |
| 3 | 🔵 SUGG | `theme/index.ts:250-261` | Export `neuShadowParams` jamais importé |
| 4 | 🔵 SUGG | `theme/index.ts:110` | Import `Platform` au milieu du fichier |
| 5 | 🔵 SUGG | `useAssistantWizard.ts:75` | `UseAssistantWizardResult` exporté mais jamais importé ailleurs |
