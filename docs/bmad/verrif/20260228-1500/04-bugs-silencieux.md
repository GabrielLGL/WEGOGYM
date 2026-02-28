# Passe 4 — Bugs Silencieux

**Run :** 20260228-1500

---

## 🔴 Bugs potentiels (corrigés)

### B1 — BadgeCelebration.tsx : Thème non réactif
- **Impact :** En mode clair (light mode), les couleurs restaient celles du dark mode statique (`colors` importé depuis `theme/index.ts`).
- **Corrigé :** Migration vers `useColors()` hook.

### B2 — gamificationHelpers.ts : Accès à une clé potentiellement absente
- **Impact :** Si `language` n'est pas une clé valide de `translations` (erreur JS runtime), `translations[language]` serait `undefined`, causant un crash sur `.milestones`.
- **Corrigé :** Guard défensif `const lang = translations[language] ? language : 'fr'`.

---

## ✅ Patterns corrects vérifiés

| Check | Résultat |
|---|---|
| Mutations DB dans `database.write()` | ✅ `handleConfirmDelete` dans StatsCalendarScreen wrappé correctement |
| `setTimeout`/`setInterval` avec cleanup | ✅ Pas de timers non nettoyés dans les fichiers audités |
| Subscriptions avec unsubscribe | ✅ `withObservables` gère le cycle automatiquement |
| `console.log` en production | ✅ Tous les logs sont guardés avec `__DEV__` |

---

## 🟡 Bugs connus non résolus (antérieurs)

| Bug | Suite | Notes |
|---|---|---|
| `useLanguage()` hors LanguageProvider | `BadgesScreen.test.tsx`, `ProgramDetailScreen.test.tsx` | Tests non mis à jour — bug de test, pas de code |
