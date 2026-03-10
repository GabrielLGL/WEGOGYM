# Passe 6/8 — Code mort & qualité

## Résultat : 1 warning trouvé

### 🟡 W1 — Hardcoded locale 'fr-FR' dans ExerciseHistoryScreen

**Fichier :** `screens/ExerciseHistoryScreen.tsx:67`
**Problème :** Même que 03-code-review W1 — locale hardcodée pour les labels de chart.

### ✅ Vérifications clean

| Critère | Résultat |
|---------|----------|
| `any` TypeScript | ✅ 0 dans le code production |
| console.log hors `__DEV__` | ✅ 0 (sentry.ts:21 est dans un `if (__DEV__)`) |
| Couleurs hardcodées | ✅ 0 dans les écrans (uniquement dans les mocks de test) |
| Imports inutilisés | ✅ 0 détectés (TSC passe sans erreur) |
| Code commenté | ✅ Aucun bloc commenté à supprimer |
| Code mort | ✅ Aucune fonction non référencée détectée |
