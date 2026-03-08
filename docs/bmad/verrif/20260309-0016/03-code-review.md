# Passe 3/8 — Code Review

**Date :** 2026-03-09 00:16

## Problèmes trouvés

### 🔴 Critiques

**1. CLAUDE.md désynchronisé avec le schéma réel — version 32 vs 33**
- **Fichiers** : `CLAUDE.md` (lignes 20, 47) vs `mobile/src/model/schema.ts` (ligne 4)
- **Description** : CLAUDE.md déclare `Schema: v32` mais le schéma réel est v33 (ajout `disclaimer_accepted` + `cgu_version_accepted` dans users). Risque qu'un dev crée une migration v33 en doublon.
- **Fix** : Mettre à jour CLAUDE.md pour indiquer v33.

**2. Comparaison de versions CGU par opérateur `<` sur des chaînes — fragile**
- **Fichier** : `navigation/index.tsx:156`
- **Code** : `(user.cguVersionAccepted ?? '0') < CGU_VERSION`
- **Description** : Comparaison lexicographique. `'9.0' < '10.0'` retourne `false`. Contournement légal potentiel.
- **Fix** : Utiliser une comparaison sémantique de versions.

**3. Constantes de labels hardcodées en français dans constants.ts — non i18n**
- **Fichier** : `model/constants.ts:38-62`
- **Description** : `USER_LEVEL_LABELS`, `USER_LEVEL_DESCRIPTIONS`, `USER_GOAL_LABELS`, `USER_GOAL_DESCRIPTIONS` en FR uniquement. Non importées nulle part → code mort + risque i18n.
- **Fix** : Supprimer ces 4 exports (code mort).

### 🟡 Warnings

**4. Double fetch DB au démarrage dans navigation/index.tsx**
- **Fichier** : `navigation/index.tsx:152,238`
- **Description** : `AppNavigator` et `AppContent` font chacun un fetch `users.query().fetch()`. Deux requêtes SQLite identiques au démarrage.
- **Fix** : Mutualiser en un seul appel.

**5. `Linking.openURL` sans gestion d'erreur dans LegalScreen**
- **Fichier** : `LegalScreen.tsx:14-16`
- **Description** : Promise non catchée → unhandled promise rejection.
- **Fix** : Ajouter try/catch + `Linking.canOpenURL`.

**6. `handleAcceptDisclaimer` — aucun feedback en cas d'échec**
- **Fichier** : `OnboardingScreen.tsx:66,127`
- **Description** : Si la sauvegarde échoue, l'utilisateur ne reçoit aucun feedback.
- **Fix** : Ajouter un Toast ou Alert dans le catch.

**7. CoachMarks — missing dependencies dans useEffect**
- **Fichier** : `CoachMarks.tsx:111,161`
- **Description** : `measureTarget` non listé dans les dépendances useEffect.
- **Fix** : Ajouter `measureTarget` dans les dep arrays.

### 🔵 Suggestions

**8. Code mort dans constants.ts** — 4 dictionnaires non utilisés (cf. #3)

**9. Inline style dans SettingsAboutSection**
- **Fichier** : `SettingsAboutSection.tsx:31` — `style={{ marginLeft: 'auto' }}`
- **Fix** : Extraire dans StyleSheet.

**10. LegalScreen — pas de fetch distant des CGU**
- **Description** : Contenu CGU uniquement en i18n fallback. Si les CGU changent côté serveur, l'app affiche l'ancienne version.
- **Fix** : Envisager un fetch optionnel avec fallback offline.

## Résumé

| # | Sévérité | Fichier | Problème |
|---|----------|---------|----------|
| 1 | 🔴 | CLAUDE.md | Schema version desync (v32 vs v33) |
| 2 | 🔴 | navigation/index.tsx:156 | Comparaison CGU lexicographique |
| 3 | 🔴 | constants.ts:38-62 | Labels FR hardcodés hors i18n (code mort) |
| 4 | 🟡 | navigation/index.tsx:152,238 | Double fetch DB |
| 5 | 🟡 | LegalScreen.tsx:15 | openURL sans catch |
| 6 | 🟡 | OnboardingScreen.tsx:66 | Pas de feedback échec |
| 7 | 🟡 | CoachMarks.tsx:111,161 | Dependencies useEffect |
| 8 | 🔵 | constants.ts:38-62 | Code mort |
| 9 | 🔵 | SettingsAboutSection.tsx:31 | Inline style |
| 10 | 🔵 | LegalScreen.tsx | Pas de fetch distant CGU |
