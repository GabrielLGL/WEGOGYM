# refactor(assistant) — AssistantScreen découpé en 3 fichiers
Date : 2026-02-28 21:00

## Instruction
AssistantScreen refactor ← Groupe C (>972 lignes — refactor complexe planifié séparément)

## Rapport source
`docs/bmad/verrif/20260228-1911/03-code-review.md` — problème restant #3

## Classification
Type : refactor
Fichiers créés :
- `mobile/src/hooks/useAssistantWizard.ts` — (nouveau) 546 lignes
- `mobile/src/components/WizardStepContent.tsx` — (nouveau) 276 lignes

Fichiers modifiés :
- `mobile/src/screens/AssistantScreen.tsx` — 972 → 280 lignes (-71%)

## Ce qui a été fait

### Problème identifié
`AssistantScreenInner` contenait 670 lignes de logique métier + 207 lignes de styles dans un seul composant. Code difficile à maintenir et à tester.

### Solution : Extract hook + sub-component

**`hooks/useAssistantWizard.ts`** (logique pure, testable)
- Types exportés : `WizardStep`, `WizardStepKind`, `StepOption`, `FormValue`
- Données statiques : `SPLIT_VALID_DAYS`, `getDaysForSplit`, `MUSCLES_FOCUS_OPTIONS`
- Option arrays traduits (useMemo sur `t`)
- `buildSteps` — construit les étapes selon le mode (programme vs séance)
- État wizard complet (currentStep, formData, isGenerating, animations, etc.)
- Tous les callbacks (handleSelect, toggle*, triggerGenerate, etc.)
- Retourne `UseAssistantWizardResult` — interface claire et documentée

**`components/WizardStepContent.tsx`** (rendu des étapes)
- Anciennement `renderStepContent()` inline dans AssistantScreenInner
- Composant fonctionnel pur qui reçoit step + formData + handlers + option arrays
- Gère les 5 types d'étapes : `single`, `multi`, `multi-focus`, `multi-muscle`, `multi-injuries`
- Appelle `useColors()` et `useLanguage()` directement
- Styles propres (chips, options, nextBtn)

**`screens/AssistantScreen.tsx`** (réduit à la coquille)
- Appelle `useAssistantWizard({ user, sessionMode, navigation })`
- Rend le header, progress bar, scroll, WizardStepContent, AlertDialogs
- `AssistantScreenInner` export préservé (tests)
- `useStyles` garde uniquement les styles de structure screen

### Compatibilité tests garantie
- `AssistantScreenInner` reste exporté nommément depuis `AssistantScreen.tsx`
- 30/30 tests AssistantScreen passent sans modification

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1559 passed / 93 suites — 0 régression
- Nouveau test créé : non (logique inchangée — couverte par les 30 tests existants)

## Documentation mise à jour
Aucune — les hooks existants suivent les mêmes conventions JSDoc que `useSessionManager.ts`

## Statut
✅ Résolu — 20260228-2100

## Commit
`9a969b4` — `refactor(assistant): extract useAssistantWizard hook + WizardStepContent`
