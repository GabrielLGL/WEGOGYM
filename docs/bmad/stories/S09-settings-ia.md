# S09 — Section IA dans Settings
> Priorité : Should | Dépend de : S01 | Bloque : —

## Objectif
Permettre à l'utilisateur de configurer son provider IA et sa clé API depuis SettingsScreen.

## Tâches techniques
Modifier `screens/SettingsScreen.tsx` :

1. Ajouter une section "Intelligence Artificielle" en bas des paramètres existants
2. Sélecteur provider : `BottomSheet` avec 4 options (Offline / Claude / OpenAI / Gemini)
3. Champ clé API : `TextInput` avec `secureTextEntry={true}` (masquée)
4. Bouton "Tester la connexion" : appelle le provider sélectionné avec un prompt minimal, affiche succès/erreur via `AlertDialog`
5. Sauvegarde via `database.write()` sur le modèle `User` (`aiProvider`, `aiApiKey`)
6. Le provider actif est affiché dans AssistantScreen (indicateur bas d'écran)

### Règles UX
- Si provider = "Offline" → champ clé API masqué/désactivé
- Validation : clé API non vide si provider ≠ "Offline"
- Message de confirmation après sauvegarde

## Critères d'acceptation
- [ ] Section IA visible dans Settings
- [ ] Sélecteur provider fonctionne (4 options)
- [ ] Clé API masquée par défaut
- [ ] "Tester la connexion" retourne un résultat clair (succès ou message d'erreur)
- [ ] Clé API sauvegardée en DB sur le User
- [ ] Champ clé désactivé en mode Offline
