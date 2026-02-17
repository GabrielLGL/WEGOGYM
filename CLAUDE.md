# CLAUDE.md
> **Guidance for WEGOGYM Project**

## 1. Stack & Environment
- **Core:** React Native (Expo 52) + TypeScript + Fabric (New Arch).
- **State:** WatermelonDB (SQLite/JSI). **NO Redux/Context for data.**
- **Nav:** React Navigation 7 (Native Stack + Bottom Tabs).
- **Target:** Android Priority. Dark Mode Only (`#121212` bg, `#1C1C1E` cards).
- **Lang:** App language is French (fr-FR).

## 2. Architecture & Data Flow
- **Pattern:** Offline-first, Reactive.
- **Data Access:** MUST use `withObservables` HOC from `@nozbe/with-observables`.
- **Schema:** v14 (`mobile/src/model/schema.ts`).
- **Models:**
  - `Program` (1:N) `Session` (1:N) `SessionExercise`
  - `History` (Soft-delete `deleted_at`) -> `Set`
  - `User` (Single row preferences)
  - `Exercise` -> `PerformanceLog` (historical data)
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
│   ├── useModalState.ts  # Modal state + auto tab bar sync
│   ├── useHaptics.ts     # Semantic haptic feedback API
│   └── useKeyboardAnimation.ts  # Keyboard show/hide animations
├── model/
│   ├── models/           # WatermelonDB model classes
│   ├── utils/            # Database & validation utilities
│   │   ├── databaseHelpers.ts    # getNextPosition, filterExercises, etc.
│   │   └── validationHelpers.ts  # validateWorkoutInput, isValidText, etc.
│   ├── schema.ts         # Database schema v14
│   ├── index.ts          # Database initialization
│   └── constants.ts      # MUSCLES_LIST, EQUIPMENT_LIST
├── navigation/           # React Navigation setup
├── screens/              # Main app screens (Home, SessionDetail, etc.)
└── theme/                # Centralized theme
    └── index.ts          # colors, spacing, borderRadius, commonStyles
```

### 2.2 Key Patterns
- **Modals:** MUST use `<Portal>` from `@gorhom/portal` (PortalProvider in navigation/index.tsx).
- **State Sync:** Use `useMultiModalSync()` hook to auto-hide tab bar when modals open.
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
- **`useModalState()`**: Manages modal state with auto tab bar sync.
  ```tsx
  const modal = useModalState()
  // Returns: { isOpen, open, close, toggle, setIsOpen }
  ```

- **`useMultiModalSync(states: boolean[])`**: Syncs multiple modals with tab bar.
  ```tsx
  useMultiModalSync([isAlertVisible, isBottomSheetVisible])
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

## 6. Commands (Root: `mobile/`)
- `npm start` (Expo)
- `npm run android` (Build)
- `eas build --platform android --profile production` (Release)