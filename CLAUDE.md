# CLAUDE.md
> **Guidance for WEGOGYM Project**

## 0. Règle d'or

- **Ne JAMAIS réintroduire un bug listé dans la section 3.1 Known Pitfalls.**
- Après chaque modification de code → sauvegarder un rapport dans le dossier approprié (cf section 7).
- Si tu découvres un nouveau pattern de bug récurrent → signale-le pour ajout en section 3.1.

## 1. Stack & Environment
- **Core:** React Native (Expo 52) + TypeScript + Fabric (New Arch).
- **State:** WatermelonDB (SQLite/JSI). **NO Redux/Context for data.**
- **Nav:** React Navigation 7 (Native Stack only — no Bottom Tabs). HomeScreen dashboard is the navigation hub.
- **Target:** Android Priority. Dark Mode Only (`#121212` bg, `#1C1C1E` cards).
- **Lang:** App language is French (fr-FR).

## 2. Architecture & Data Flow
- **Pattern:** Offline-first, Reactive.
- **Data Access:** MUST use `withObservables` HOC from `@nozbe/with-observables`.
- **Schema:** v17 (`mobile/src/model/schema.ts`).
- **Models:**
  - `Program` (1:N) `Session` (1:N) `SessionExercise`
  - `History` (Soft-delete `deleted_at`) -> `Set`
  - `User` (Single row preferences, `name` field)
  - `Exercise` -> `PerformanceLog` (historical data)
  - `BodyMeasurement` (weight, waist, hips, chest, arms)
- **Updates:** Data changes propagate automatically. Do not manually refresh UI.

### 2.1 Project Structure
```
mobile/src/
├── components/           # Reusable UI components
│   ├── AlertDialog.tsx   # Confirmation dialogs (uses Portal)
│   ├── BottomSheet.tsx   # Bottom sheet modals (uses Portal)
│   ├── Button.tsx        # Unified button (primary/danger/secondary/ghost)
│   ├── ChipSelector.tsx  # Filter chips (muscle/equipment)
│   └── CustomModal.tsx   # Base modal component
├── hooks/                # Custom React hooks
│   ├── useModalState.ts  # Modal state management (open/close/toggle)
│   ├── useHaptics.ts     # Semantic haptic feedback API
│   └── useKeyboardAnimation.ts  # Keyboard show/hide animations
├── model/
│   ├── models/           # WatermelonDB model classes
│   ├── utils/            # Database & validation utilities
│   │   ├── databaseHelpers.ts    # getNextPosition, filterExercises, etc.
│   │   └── validationHelpers.ts  # validateWorkoutInput, isValidText, etc.
│   ├── schema.ts         # Database schema v17
│   ├── index.ts          # Database initialization
│   └── constants.ts      # MUSCLES_LIST, EQUIPMENT_LIST
├── navigation/           # React Navigation setup
├── screens/              # Main app screens (Home, SessionDetail, etc.)
└── theme/                # Centralized theme
    └── index.ts          # colors, spacing, borderRadius, commonStyles
```

### 2.2 Key Patterns
- **Modals:** MUST use `<Portal>` from `@gorhom/portal` (PortalProvider in navigation/index.tsx).
- **Modal State:** Use `useModalState()` hook for modal open/close/toggle state management.
- **Haptics:** Use `useHaptics()` hook for semantic feedback (`onPress`, `onDelete`, `onSuccess`, `onSelect`).
- **Validation:** Use helpers from `model/utils/validationHelpers.ts` (never inline).
- **DB Operations:** Use helpers from `model/utils/databaseHelpers.ts` (getNextPosition, filterExercises, etc.).

## 3. Critical Constraints (STRICT)
1.  **NO Native `<Modal>`:** Fabric causes crashes. MUST use Portal pattern with `<AlertDialog>` or `<BottomSheet>` components.
2.  **Decorators:** TS Config uses `experimentalDecorators: true`, `useDefineForClassFields: false`.
3.  **UI Feedback:**
    - **Haptics:** Use `useHaptics()` hook - semantic API (`onPress`, `onDelete`, `onSuccess`, `onSelect`).
    - **Delete Confirmations:** Use `<AlertDialog>` component. Title "Supprimer [Name] ?", Cancel (#3A3A3C), Delete (#FF3B30).
4.  **Inputs:** `keyboardType="numeric"` for performance data. Validate with `validationHelpers.ts` utilities.

### 3.1 Known Pitfalls (from past audits)
These are bugs that have been found and fixed before. **Never reintroduce them:**
- **WatermelonDB mutations MUST be inside `database.write()`** — including `database.batch()`, `destroyPermanently()`, `create()`, `update()`.
- **Every `setTimeout`/`setInterval` MUST have a cleanup** in useEffect return or via refs.
- **Every `.subscribe()`/`.observe()` MUST have an unsubscribe** in useEffect cleanup.
- **Schema ↔ Model sync** — every `@field`/`@text`/`@date` in a model MUST have a matching column in schema.ts and vice versa.
- **No `any` in TypeScript** — use proper types, `Record<string, unknown>`, or type predicates.
- **No `console.log`/`console.warn` in production** — guard with `__DEV__` or remove.
- **No hardcoded colors** — always use `colors.*` from `theme/index.ts`.
- **`duplicate()` methods** must copy ALL fields and child relations, not just create empty shells.
- **Gemini API — Hermes incompatibility** : `AbortSignal.timeout()` n'existe pas sur Hermes (moteur JS React Native). Utiliser `withTimeout(ms)` de `providerUtils.ts` (retourne `{ signal, clear }`, appeler `clear()` dans un bloc `finally`).
- **Gemini API — EU free tier** : Depuis déc 2025, le free tier Gemini a `limit: 0` pour les utilisateurs EU/UK/Suisse. Billing Google Cloud requis. La clé API doit appartenir au même projet Google Cloud que le billing activé.
- **Gemini API — modèle stable** : Utiliser `gemini-2.0-flash` (v1beta). Les modèles `gemini-1.5-flash` (supprimé) et `gemini-2.0-flash-exp` (supprimé) ne fonctionnent plus.
- **Données sensibles — JAMAIS en SQLite** : Clés API, tokens, secrets → `expo-secure-store` via `services/secureKeyStore.ts`. Ne jamais stocker en clair dans WatermelonDB.

## 4. Reusable Components & Hooks

### 4.1 Components (in `components/`)
- **`<AlertDialog>`**: Confirmation dialogs with fade/scale animation.
  ```tsx
  <AlertDialog
    visible={isAlertVisible}
    title="Supprimer l'exercice ?"
    message="Cette action est irréversible."
    onConfirm={handleDelete}
    onCancel={() => setIsAlertVisible(false)}
    confirmText="Supprimer"
    cancelText="Annuler"
  />
  ```

- **`<BottomSheet>`**: Bottom sheet modals with slide-up animation.
  ```tsx
  <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)} title="Options">
    <TouchableOpacity style={styles.sheetOption}>
      <Text>Option 1</Text>
    </TouchableOpacity>
  </BottomSheet>
  ```

- **`<Button>`**: Unified button component with variants.
  ```tsx
  <Button variant="primary" size="md" onPress={handleSubmit}>
    Enregistrer
  </Button>
  // Variants: 'primary' | 'danger' | 'secondary' | 'ghost'
  // Sizes: 'sm' | 'md' | 'lg'
  ```

- **`<ChipSelector>`**: Horizontal scrollable filter chips.
  ```tsx
  <ChipSelector
    items={MUSCLES_LIST}
    selectedValue={filterMuscle}
    onChange={setFilterMuscle}
    noneLabel="Tous muscles"
  />
  ```

### 4.2 Custom Hooks (in `hooks/`)
- **`useModalState()`**: Manages modal state (open/close/toggle).
  ```tsx
  const modal = useModalState()
  // Returns: { isOpen, open, close, toggle, setIsOpen }
  ```

- **`useHaptics()`**: Semantic haptic feedback API.
  ```tsx
  const haptics = useHaptics()
  haptics.onPress()    // Medium impact (buttons)
  haptics.onDelete()   // Heavy impact (destructive)
  haptics.onSuccess()  // Medium impact (success)
  haptics.onSelect()   // Light impact (selection)
  ```

- **`useKeyboardAnimation(offset: number)`**: Animated value for keyboard show/hide.
  ```tsx
  const slideAnim = useKeyboardAnimation(-150)
  <Animated.View style={[styles.footer, { transform: [{ translateY: slideAnim }] }]} />
  ```

### 4.3 Utility Helpers (in `model/utils/`)
- **`databaseHelpers.ts`**:
  - `getNextPosition(collectionName, ...clauses)`: Get next position for ordering.
  - `parseNumericInput(value, fallback)`: Parse string to number with fallback.
  - `filterExercises(exercises, muscle?, equipment?)`: Filter exercises by criteria.
  - `searchExercises(exercises, query)`: Search exercises by name.
  - `buildExerciseStatsFromData(data)`: Build exercise stats (extracted DRY helper).

- **`validationHelpers.ts`**:
  - `isValidText(text)`: Check if text is non-empty after trim.
  - `validateWorkoutInput(sets, reps, weight?)`: Validate workout inputs.
  - `validateExerciseInput(name, muscles, equipment)`: Validate exercise inputs.

### 4.4 Theme (in `theme/index.ts`)
- **Colors**: `colors.background`, `colors.card`, `colors.primary`, `colors.danger`, etc.
- **Spacing**: `spacing.xs`, `spacing.sm`, `spacing.md`, `spacing.lg`, `spacing.xl`
- **BorderRadius**: `borderRadius.sm`, `borderRadius.md`, `borderRadius.lg`
- **Common Styles**: `commonStyles.modalContainer`, `commonStyles.overlay`, etc.

## 5. Coding Standards
- **Components:** Functional components only (except WatermelonDB Models).
- **Typing:** Strict TypeScript. No `any`. Use Interfaces for Props.
- **Files:** Path `mobile/src/`.
- **Babel:** Ensure plugin order: decorators -> worklets -> reanimated.
- **DRY Principle:** Use reusable components and hooks. Never duplicate validation or DB logic.

### 5.1 Commit Conventions
```
type(scope): description concise

Types: feat | fix | refactor | test | docs | chore | style | perf
```
- Un commit par changement logique
- Ne jamais mélanger feat et fix dans le même commit
- Message en anglais, description concise

### 5.2 Git Safety — Travail parallèle
**Plusieurs Claude Code peuvent travailler en même temps. Règles STRICTES :**
- **JAMAIS** `git add .` ou `git add -A` ou `git add --all`
- `git add` UNIQUEMENT les fichiers que TU as modifiés + ton rapport
- Avant de commit, vérifie avec `git diff --cached --name-only` que seuls tes fichiers sont staged
- Si un fichier staged n'est pas de toi → `git reset HEAD [fichier]`
- Si le push échoue (remote ahead) → `git pull --rebase` puis re-push

## 6. Commands (Root: `mobile/`)
- `npm start` (Expo)
- `npm run android` (Build)
- `npm test` (Jest)
- `npx tsc --noEmit` (TypeScript check)
- `eas build --platform android --profile production` (Release)

## 7. Custom Commands Ecosystem

Pour la liste détaillée avec exemples, voir `docs/COMMANDS.md`.

### Workflow quotidien
| Commande | Rôle |
|----------|------|
| `/plan` | Affiche le workflow complet (memo) |
| `/morning` | Briefing du matin |
| `/retro [période]` | Rétrospective : tendances, santé, recommandations |
| `/do [desc]` | Tâche universelle : fix, feat, refactor, style (détecte auto) |
| `/status` | État en 10 secondes |
| `/review` | Review avant push |
| `/ui [cible]` | Review et amélioration UI (écran, composant, theme) |
| `/doc [cible]` | Générer/mettre à jour la doc |
| `/perf` | Analyse performance React Native |
| `/changelog [période]` | Générer un changelog |
| `/backup [nom]` | Branche de sauvegarde locale |
| `/prompt [desc]` | Génère et lance le meilleur prompt |
| `/gitgo` | Commit + push intelligent |

### Développement de features
| Commande | Rôle |
|----------|------|
| `/idee [desc]` | Pipeline BMAD : brainstorming → dev → QA |
| `/idee-continue` | Reprise après /compact |

### Qualité & vérification
| Commande | Rôle |
|----------|------|
| `/verrif` | Scan + correction par niveaux + push |
| `/verrif-continue` | Reprise (lit STATUS.md) |
| `/verrif-build/tests/code-review/bugs/db/qualite` | Passes individuelles |
| `/test-coverage` | Augmenter la couverture |
| `/test-continue` | Reprise coverage |

### Script nuit autonome
```powershell
.\run-verrif.ps1              # full : scan + fix niveaux 1-2-3 + push
.\run-verrif.ps1 -mode safe   # critiques seulement
.\run-verrif.ps1 -mode scan   # scan seul
```

### Rapports et historique
```
docs/bmad/
├── verrif/
│   ├── HEALTH.md              ← Score de santé (0-100) au fil du temps
│   └── [YYYYMMDD-HHmm]/      ← Un dossier horodaté par run
│       ├── 01 → 06            ← Rapports de scan
│       ├── 07-fix-niveau1/2/3 ← Rapports de correction par niveau
│       └── STATUS.md          ← Statut + instructions si échec
├── git-history/               ← Rapport de chaque push
└── brainstorm, prd, etc.      ← Outputs /idee

docs/stories/
├── WEGO-001 → WEGO-007       ← Stories manuelles
└── [nom-feature]/             ← Stories générées par /idee
```

### Gestion du contexte
- "⚠️ Contexte chargé" → `/compact` puis commande `-continue`
- Les `-continue` relisent rapports/STATUS.md pour reprendre sans perte

### Score de santé
Le fichier `docs/bmad/verrif/HEALTH.md` suit l'évolution du projet (0-100) :
- Build (20), Tests (20), Bugs (20), Qualité (20), Coverage (20)
- Mis à jour automatiquement à chaque run verrif