<!-- v1.0 — 2026-02-21 -->
# Rapport — Masquer les providers cloud IA — Groupe A — 20260221-1215

## Objectif
Les utilisateurs ne configurent pas de clé API en pratique. On simplifie l'UI :
1. **SettingsScreen** : supprimer Claude/OpenAI/Gemini de la liste des providers. Garder seulement "Offline". Ajouter une entrée non-cliquable "Prochainement — IA cloud disponible".
2. **AssistantScreen** : le badge provider dans le header affiche toujours "🔌 Offline" → aucune modification de logique, juste vérifier que ça reste cohérent.

Le moteur offline continue de fonctionner normalement. Les fichiers provider (claudeProvider.ts, openaiProvider.ts, geminiProvider.ts) restent en place — ne pas les supprimer.

## Fichiers concernés
1. `mobile/src/screens/SettingsScreen.tsx`
2. `mobile/src/screens/AssistantScreen.tsx` (lecture seule pour vérification — probablement aucune modif nécessaire)

## Contexte technique
- CLAUDE.md §4.4 : couleurs → toujours `colors.*` du theme, jamais hardcodées
- CLAUDE.md §3 : pas de `<Modal>` natif. La section IA est dans un `<ScrollView>` normal — pas de modal.
- Langue : français (fr-FR) pour tous les textes utilisateur

### État actuel SettingsScreen.tsx
```typescript
// Ligne 12-17 — à modifier
const PROVIDERS: { key: AIProviderName; label: string }[] = [
  { key: 'offline', label: 'Offline (défaut)' },
  { key: 'claude',  label: 'Claude (Anthropic)' },   // ← supprimer
  { key: 'openai',  label: 'OpenAI (GPT-4o)' },      // ← supprimer
  { key: 'gemini',  label: 'Gemini (Google)' },       // ← supprimer
]
```

```tsx
// Lignes 192-234 — section IA à remplacer
// Actuellement : liste de radio buttons + input clé API + bouton test
// → Remplacer par : 1 item offline (actif) + 1 entrée "prochainement" non-cliquable
```

### État actuel AssistantScreen.tsx
```typescript
// Ligne 119-124 — PROVIDER_LABELS
const PROVIDER_LABELS: Record<string, string> = {
  offline: 'Offline',
  claude:  'Claude',
  openai:  'GPT-4o',
  gemini:  'Gemini',
}
// Ligne 185 : const providerLabel = PROVIDER_LABELS[user?.aiProvider ?? 'offline'] ?? 'Offline'
// Le badge affiche toujours "🔌 Offline" → pas de modification nécessaire
```

## Étapes

### Fichier 1 : `mobile/src/screens/SettingsScreen.tsx`

**Étape 1 — Simplifier PROVIDERS (ligne 12)**
```typescript
const PROVIDERS: { key: AIProviderName; label: string }[] = [
  { key: 'offline', label: 'Offline' },
]
```

**Étape 2 — Remplacer la section provider UI (lignes ~192-235)**

Remplacer le bloc actuel (liste radio + API key input + test button) par :
```tsx
{/* Provider actif */}
<View style={styles.providerList}>
  <View style={[styles.providerRow, styles.providerRowActive]}>
    <View style={[styles.radioCircle, styles.radioCircleActive]} />
    <Text style={[styles.providerLabel, styles.providerLabelActive]}>
      Offline — Génération locale
    </Text>
  </View>

  {/* Prochainement — non cliquable */}
  <View style={[styles.providerRow, styles.providerRowDisabled]}>
    <View style={styles.radioCircle} />
    <View style={styles.providerRowContent}>
      <Text style={[styles.providerLabel, styles.providerLabelDisabled]}>
        IA cloud
      </Text>
      <Text style={styles.providerComingSoon}>Prochainement</Text>
    </View>
  </View>
</View>
```

**Étape 3 — Ajouter les styles manquants** dans `StyleSheet.create` :
```typescript
providerRowDisabled: {
  opacity: 0.4,
},
providerRowContent: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
providerLabelDisabled: {
  color: colors.textSecondary,
},
providerComingSoon: {
  fontSize: 11,
  color: colors.textSecondary,
  fontStyle: 'italic',
},
```

**Étape 4 — Supprimer les fonctions et states liés aux providers cloud**
- Supprimer `isTesting` state et `setIsTesting`
- Supprimer `handleTestConnection` function
- Supprimer `handleApiKeyBlur` function
- Garder `aiProvider` et `aiApiKey` states pour compatibilité avec le modèle User (pas besoin de migrer le schéma)
- Simplifier `handleSaveAI` si nécessaire (elle reste utile car on sauvegarde toujours 'offline')
- Supprimer l'import `ActivityIndicator` si plus utilisé
- Supprimer l'import `testProviderConnection` si plus utilisé

**Étape 5 — Supprimer les styles devenus orphelins** (si plus référencés) :
- `testButton`, `testButtonDisabled`, `testButtonText`
- `apiKeyInput`
- Vérifier avec TypeScript qu'aucune ref manquante

### Fichier 2 : `mobile/src/screens/AssistantScreen.tsx`
- Lire le fichier et vérifier que le badge provider (ligne ~185-186) fonctionne bien avec provider='offline'
- Si `PROVIDER_LABELS` a des clés inutilisées (claude/openai/gemini), les supprimer pour nettoyer
- Ne pas modifier la logique de génération — l'offline engine continue de fonctionner normalement

## Contraintes
- Ne pas supprimer les fichiers `claudeProvider.ts`, `openaiProvider.ts`, `geminiProvider.ts`, `aiService.ts` — ils restent pour usage futur
- Ne pas modifier le schéma WatermelonDB (schema.ts, User.ts) — les champs `ai_provider` et `ai_api_key` restent
- Ne pas casser l'offline engine (`offlineEngine.ts`) — il reste le seul moteur actif
- Respecter : couleurs `colors.*` uniquement, jamais hardcodées
- TypeScript strict, zéro `any`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- SettingsScreen section IA : affiche "Offline" actif + "IA cloud / Prochainement" non-cliquable
- AssistantScreen badge : affiche "🔌 Offline"
- Aucune mention de clé API dans l'UI

## Dépendances
Aucune dépendance externe.

## Statut
⏳ En attente
