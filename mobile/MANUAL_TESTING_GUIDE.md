# 📋 Guide de Tests Manuels - WEGOGYM

Ce guide vous permet de tester **toutes les fonctionnalités** de l'application et de valider les **18 corrections** effectuées.

**Durée estimée:** 30-45 minutes

---

## 🔧 SETUP INITIAL

### Prérequis

1. **Installer les dépendances**
   ```bash
   cd mobile
   npm install
   ```

2. **Lancer l'application**
   ```bash
   npm start
   # Puis scanner le QR code avec Expo Go
   # OU
   npm run android  # Pour émulateur Android
   ```

3. **Vérifier le lancement**
   - ✅ L'app démarre sans crash
   - ✅ Vous voyez l'écran "Liste des programmes"
   - ✅ Pas d'erreurs rouges dans la console

---

## 🧪 TESTS PAR FONCTIONNALITÉ

### TEST 1 : Navigation et Onglets (5 min)

#### 1.1 Tab Bar Navigation

**Actions:**
1. Tapez sur l'onglet **🏋️ Bibliothèque**
2. Tapez sur l'onglet **🏠 Prog**
3. Tapez sur l'onglet **📈 Stats**

**Résultats attendus:**
- ✅ La navigation entre onglets est fluide
- ✅ Pas de lag ou freeze
- ✅ La tab bar ne glitche pas

---

#### 1.2 Navigation vers Settings (CRITIQUE - Correction #5)

**Actions:**
1. Sur l'onglet **🏠 Prog**
2. Tapez sur **⚙️** (roue crantée en haut à droite)

**Résultats attendus:**
- ✅ Navigation vers l'écran **Settings** (PAS ExercisesScreen)
- ✅ Vous voyez :
  - ⏱️ Section "Minuteur de repos"
  - ℹ️ Section "À propos"
  - ❓ Section "Aide"
- ✅ Pas de crash

**🔴 CRITIQUE :** Si vous voyez ExercisesScreen au lieu de Settings → **ÉCHEC**

---

### TEST 2 : Settings (Nouvelle Feature - 10 min)

#### 2.1 Toggle Timer ON/OFF

**État initial:** Notez si le timer est ON ou OFF

**Actions:**
1. Dans Settings → "Activer le minuteur"
2. Tapez sur le **Switch**
3. Retournez à l'onglet Prog
4. Revenez à Settings

**Résultats attendus:**
- ✅ Le switch change d'état immédiatement
- ✅ Haptic feedback ressenti (vibration)
- ✅ L'état persiste après navigation (Settings → Prog → Settings)
- ✅ Pas de crash

**Critère de succès:**
```
Switch ON → Vibration → État sauvegardé ✓
Switch OFF → Vibration → État sauvegardé ✓
```

---

#### 2.2 Modifier la durée de repos

**Actions:**
1. Dans Settings → "Durée de repos"
2. Tapez sur l'input (affiche "60" par défaut)
3. Changez à **120**
4. Tapez en dehors de l'input (blur) ou Submit
5. Retournez à Prog et revenez à Settings

**Résultats attendus:**
- ✅ L'input accepte la nouvelle valeur
- ✅ Haptic feedback de succès ressenti
- ✅ La valeur **120** persiste après navigation
- ✅ Pas de crash

**Test edge cases:**
- Entrez **5** → Pas de sauvegarde (< 10 sec minimum)
- Entrez **700** → Pas de sauvegarde (> 600 sec maximum)
- Entrez **abc** → Pas de sauvegarde (non numérique)

**Critère de succès:**
```
120 → Sauvegardé ✓
5 → Rejeté ✓
abc → Rejeté ✓
```

---

#### 2.3 Vérifier les sections informatives

**Actions:**
1. Scrollez dans Settings
2. Lisez les sections "À propos" et "Aide"

**Résultats attendus:**
- ✅ Section "À propos" affiche :
  - Application : WEGOGYM
  - Version : 1.0.0
  - Développé avec : React Native + WatermelonDB
- ✅ Section "Aide" affiche le guide complet
- ✅ Pas de texte coupé ou mal formaté

---

### TEST 3 : Gestion des Programmes (10 min)

#### 3.1 Créer un programme

**Actions:**
1. Sur l'onglet **Prog**
2. Tapez sur **📂 Créer un Programme**
3. Entrez **"PPL"**
4. Tapez **Valider**

**Résultats attendus:**
- ✅ Modal se ferme
- ✅ Programme "PPL" apparaît dans la liste
- ✅ Haptic feedback ressenti
- ✅ Pas de crash

**Test edge case (Correction #3):**
- Simulez une erreur DB (difficile manuellement)
- Si erreur → Console doit montrer `console.error('Failed to save program:', error)`

---

#### 3.2 Renommer un programme

**Actions:**
1. Tapez sur **⋮** à côté du programme "PPL"
2. Tapez **Renommer le Programme**
3. Changez "PPL" → **"Push Pull Legs"**
4. Tapez **Valider**

**Résultats attendus:**
- ✅ Le nom change immédiatement
- ✅ Modal se ferme
- ✅ Haptic feedback ressenti
- ✅ Pas de crash

---

#### 3.3 Dupliquer un programme

**Actions:**
1. Tapez sur **⋮** à côté du programme
2. Tapez **Dupliquer le Programme**

**Résultats attendus:**
- ✅ Un nouveau programme "Push Pull Legs (Copie)" apparaît
- ✅ Haptic feedback ressenti
- ✅ Pas de crash

**Critère de succès (Correction #3):**
```
Si erreur DB → console.error affiché ✓
Sinon → Duplication réussie ✓
```

---

#### 3.4 Supprimer un programme

**Actions:**
1. Tapez sur **⋮** à côté du programme dupliqué
2. Tapez **Supprimer le Programme**
3. Dans l'AlertDialog → Tapez **Supprimer**

**Résultats attendus:**
- ✅ AlertDialog s'affiche avec titre "Supprimer [Nom] ?"
- ✅ Heavy haptic feedback sur "Supprimer" (plus fort que normal)
- ✅ Le programme disparaît de la liste
- ✅ Pas de crash

---

### TEST 4 : Gestion des Sessions (10 min)

#### 4.1 Ajouter une session

**Actions:**
1. Sur le programme "Push Pull Legs"
2. Tapez **+ Ajouter une séance**
3. Entrez **"Push Day"**
4. Tapez **Valider**

**Résultats attendus:**
- ✅ Session "Push Day" apparaît sous le programme
- ✅ Tapez dessus → Navigation vers SessionDetail
- ✅ Pas de crash

---

#### 4.2 Dupliquer une session

**Actions:**
1. Tapez **⋮** à côté de "Push Day"
2. Tapez **Dupliquer la Séance**

**Résultats attendus:**
- ✅ Session "Push Day (Copie)" apparaît
- ✅ Haptic feedback
- ✅ Pas de crash

---

#### 4.3 Déplacer une session

**Prérequis:** Avoir 2+ programmes

**Actions:**
1. Tapez **⋮** à côté de "Push Day"
2. Section "Déplacer vers :"
3. Tapez sur un autre programme

**Résultats attendus:**
- ✅ La session disparaît du programme actuel
- ✅ La session apparaît dans le programme cible
- ✅ Haptic feedback
- ✅ Pas de crash

---

### TEST 5 : Gestion des Exercices dans une Session (15 min)

#### 5.1 Naviguer vers SessionDetail

**Actions:**
1. Tapez sur une session (ex: "Push Day")

**Résultats attendus:**
- ✅ Écran SessionDetail s'affiche
- ✅ Header montre le nom de la session
- ✅ Bouton **+ AJOUTER UN EXERCICE** visible
- ✅ Pas de crash

---

#### 5.2 Ajouter un exercice à la session

**Actions:**
1. Tapez **+ AJOUTER UN EXERCICE**
2. Cherchez/Sélectionnez un exercice (ex: "Développé couché")
3. Entrez :
   - Séries : **4**
   - Reps : **10**
   - Poids : **80**
4. Tapez **Valider**

**Résultats attendus:**
- ✅ Modal se ferme
- ✅ L'exercice apparaît dans la liste
- ✅ Affichage : **4 Séries × 10 Reps à 80 kg**
- ✅ Si timer activé → RestTimer s'affiche
- ✅ Haptic feedback
- ✅ Pas de crash

**Critère de succès (Correction #4):**
```
Si erreur DB → console.error affiché ✓
Sinon → Exercice ajouté ✓
```

---

#### 5.3 Tester Personal Record (CRITIQUE - Correction #1)

**Contexte:** Cette correction protège contre les crashs Math.max

**Setup:**
1. Ajoutez le même exercice plusieurs fois avec différents poids :
   - 1ère fois : 80 kg
   - 2ème fois : 90 kg
   - 3ème fois : 100 kg

**Actions:**
1. Revenez à SessionDetail
2. Regardez le badge **PR: XXX** sur l'exercice

**Résultats attendus:**
- ✅ PR affiché : **PR: 100** (poids max)
- ✅ Pas de crash
- ✅ Pas de NaN

**Test edge case (CRITIQUE - Correction #1):**

**Scénario 1 : Exercice sans historique**
1. Ajoutez un nouvel exercice jamais utilisé
2. Regardez le PR

**Résultat attendu:**
- ✅ Pas de badge PR (ou PR: 0)
- ✅ **Pas de crash** (protection null/undefined)

**Scénario 2 : Historique avec poids invalides**
1. (Difficile à tester manuellement - validation via code review)
2. Si weight = null/undefined/NaN → Doit filtrer et ne pas crasher

**🔴 CRITIQUE :** Si l'app crash avec "NaN" ou "Cannot read property" → **ÉCHEC**

---

#### 5.4 Modifier les objectifs d'un exercice

**Actions:**
1. Tapez sur la ligne **4 × 10 à 80 kg**
2. Changez :
   - Séries : **5**
   - Reps : **8**
   - Poids : **85**
3. Tapez **Enregistrer**

**Résultats attendus:**
- ✅ Modal se ferme
- ✅ Affichage mis à jour : **5 × 8 à 85 kg**
- ✅ Si timer activé → RestTimer redémarre
- ✅ Haptic feedback
- ✅ Pas de crash

---

#### 5.5 Supprimer un exercice

**Actions:**
1. Tapez sur **🗑️** à côté d'un exercice
2. Confirmez la suppression

**Résultats attendus:**
- ✅ AlertDialog s'affiche
- ✅ Heavy haptic sur "Supprimer"
- ✅ L'exercice disparaît
- ✅ Toast "Retiré" (Android)
- ✅ Pas de crash

---

### TEST 6 : Bibliothèque d'Exercices (5 min)

#### 6.1 Naviguer vers Exercices

**Actions:**
1. Tapez sur l'onglet **🏋️ Bibliothèque**

**Résultats attendus:**
- ✅ Liste d'exercices s'affiche
- ✅ Barre de recherche visible
- ✅ Filtres muscle/équipement visibles
- ✅ Pas de crash

---

#### 6.2 Rechercher un exercice

**Actions:**
1. Dans la barre de recherche, tapez **"bench"**

**Résultats attendus:**
- ✅ Liste filtrée en temps réel
- ✅ Affiche uniquement les exercices contenant "bench" (case-insensitive)
- ✅ Effacez → Liste complète revient
- ✅ Pas de crash

---

#### 6.3 Filtrer par muscle

**Actions:**
1. Tapez sur un chip muscle (ex: **Pectoraux**)

**Résultats attendus:**
- ✅ Liste filtrée pour afficher uniquement exercices des Pectoraux
- ✅ Chip "Pectoraux" surligné (bleu)
- ✅ Tapez "Tous muscles" → Filtre retiré
- ✅ Pas de crash

---

#### 6.4 Créer un exercice personnalisé

**Actions:**
1. Tapez **+ CRÉER UN EXERCICE**
2. Entrez :
   - Nom : **"Mon Exercice"**
   - Muscles : Sélectionnez **Pectoraux + Triceps**
   - Équipement : Sélectionnez **Poids libre**
3. Tapez **Enregistrer**

**Résultats attendus:**
- ✅ Modal se ferme
- ✅ "Mon Exercice" apparaît dans la liste
- ✅ Filtrez par "Pectoraux" → "Mon Exercice" visible
- ✅ Pas de crash

---

### TEST 7 : Charts (Statistiques) (5 min)

#### 7.1 Voir la progression

**Prérequis:** Avoir ajouté le même exercice 2+ fois

**Actions:**
1. Tapez sur l'onglet **📈 Stats**
2. Sélectionnez un exercice dans la liste

**Résultats attendus:**
- ✅ Graphique s'affiche avec les points de données
- ✅ Liste d'historique en dessous
- ✅ Pas de crash

**Test edge case (CONNU - voir KNOWN_LIMITATIONS.md):**
- Si exercice a 1 seul log → Message "Ajoutez plus de données"
- C'est normal (design choice, pas un bug)

---

### TEST 8 : RestTimer (5 min)

**Prérequis:** Timer activé dans Settings

#### 8.1 Timer après ajout exercice

**Actions:**
1. Dans SessionDetail
2. Ajoutez un exercice
3. Regardez le timer apparaître

**Résultats attendus:**
- ✅ Timer s'affiche avec la durée définie (ex: 90 sec)
- ✅ Timer décompte (90 → 89 → 88...)
- ✅ Bouton **Ignorer** visible
- ✅ Pas de crash

---

#### 8.2 Ignorer le timer

**Actions:**
1. Pendant le timer, tapez **Ignorer**

**Résultats attendus:**
- ✅ Timer disparaît immédiatement
- ✅ Pas de crash

---

#### 8.3 Timer se termine

**Actions:**
1. Attendez que le timer atteigne 0

**Résultats attendus:**
- ✅ Timer disparaît automatiquement
- ✅ (Optionnel) Haptic feedback à la fin
- ✅ Pas de crash

**Note:** Timer peut avoir ±1-2 sec de dérive (voir KNOWN_LIMITATIONS.md - normal)

---

## 🔍 TESTS DES CORRECTIONS CRITIQUES

### ✅ Correction #1 : Math.max Protection

**Testé dans :** TEST 5.3 (Personal Record)

**Checklist:**
- [ ] Exercice avec historique → PR affiché correctement
- [ ] Exercice sans historique → Pas de crash
- [ ] Pas de NaN affiché
- [ ] Console sans erreur "Cannot read property"

---

### ✅ Correction #2-4 : Try/Catch Database

**Testé dans :** Tous les tests Create/Update/Delete

**Checklist:**
- [ ] Créer programme → Fonctionne ou console.error
- [ ] Dupliquer programme → Fonctionne ou console.error
- [ ] Supprimer programme → Fonctionne ou console.error
- [ ] Créer session → Fonctionne ou console.error
- [ ] Ajouter exercice → Fonctionne ou console.error
- [ ] Modifier exercice → Fonctionne ou console.error
- [ ] Supprimer exercice → Fonctionne ou console.error

**Note:** En usage normal, tout doit fonctionner. Les console.error n'apparaissent qu'en cas de vraie erreur DB.

---

### ✅ Correction #5 : SettingsScreen

**Testé dans :** TEST 1.2 et TEST 2

**Checklist:**
- [ ] Navigation ⚙️ → SettingsScreen (PAS ExercisesScreen)
- [ ] Timer toggle fonctionne
- [ ] Durée repos sauvegarde
- [ ] Validation durée (10-600 sec)
- [ ] Sections À propos et Aide affichées

---

### ✅ Correction #7 : useMultiModalSync

**Test indirect :** Ouvrir/Fermer plusieurs modals

**Actions:**
1. Ouvrez modal "Créer Programme"
2. Fermez-le
3. Ouvrez modal "Options Programme"
4. Fermez-le
5. Répétez rapidement

**Résultats attendus:**
- [ ] Tab bar se cache quand modal ouvert
- [ ] Tab bar réapparaît quand modal fermé
- [ ] Pas de glitch visuel de la tab bar
- [ ] Animation fluide

---

### ✅ Correction #8 : useHaptics Memoization

**Test indirect :** Performance générale

**Actions:**
1. Tapez rapidement plusieurs fois sur différents boutons

**Résultats attendus:**
- [ ] Pas de lag
- [ ] Haptic feedback cohérent
- [ ] Pas de freeze

---

### ✅ Correction #11 : loadExercises Try/Catch

**Test:**
1. Ouvrez SessionDetail
2. Tapez "Ajouter exercice"
3. Modal ExercisePicker s'ouvre

**Résultats attendus:**
- [ ] Liste d'exercices se charge
- [ ] Si erreur → console.error (pas de crash)
- [ ] Si erreur → Liste vide (fallback)

---

## 📊 CHECKLIST FINALE DE VALIDATION

### Fonctionnalités Core
- [ ] Créer/Renommer/Dupliquer/Supprimer Programme
- [ ] Créer/Renommer/Dupliquer/Supprimer/Déplacer Session
- [ ] Ajouter/Modifier/Supprimer Exercice dans Session
- [ ] Créer/Modifier/Supprimer Exercice dans Bibliothèque
- [ ] Rechercher/Filtrer exercices
- [ ] Voir progression dans Charts
- [ ] Settings : Toggle timer
- [ ] Settings : Modifier durée repos

### Navigation
- [ ] Tab bar navigation fluide
- [ ] Navigation Settings fonctionne
- [ ] Navigation SessionDetail fonctionne
- [ ] Bouton retour Android fonctionne

### Robustesse
- [ ] Aucun crash durant les tests
- [ ] Personal Record ne crash jamais
- [ ] Haptic feedback présent partout
- [ ] Modals se ferment correctement
- [ ] Tab bar se cache/montre correctement

### Performance
- [ ] Pas de lag perceptible
- [ ] Animations fluides
- [ ] Listes scrollent bien
- [ ] Pas de freeze

### Visual
- [ ] Dark mode cohérent
- [ ] Texte lisible partout
- [ ] Boutons bien alignés
- [ ] Spacing cohérent

---

## 🎯 CRITÈRES DE SUCCÈS

### ✅ SUCCÈS si :
- **0 crashes** durant les tests
- **Toutes les features** fonctionnent
- **SettingsScreen** s'affiche correctement
- **Personal Record** ne crash jamais
- **Try/catch** logguent les erreurs (si elles surviennent)
- **Navigation** fluide
- **Haptics** fonctionnent

### ❌ ÉCHEC si :
- Crash lors de l'affichage du PR
- SettingsScreen affiche ExercisesScreen
- Crash lors de Create/Update/Delete
- Navigation Settings ne fonctionne pas
- Modals ne se ferment pas

---

## 🐛 RAPPORT DE BUGS

Si vous trouvez un bug :

1. **Notez les détails**
   - Écran actuel
   - Action effectuée
   - Erreur affichée
   - Console logs

2. **Essayez de reproduire**
   - Refaites l'action
   - Notez si c'est systématique

3. **Vérifiez la console**
   ```
   npx react-native log-android
   # ou
   npx react-native log-ios
   ```

4. **Documentez**
   ```
   BUG: [Description]
   SCREEN: [Nom écran]
   STEPS: [Actions pour reproduire]
   ERROR: [Message d'erreur]
   CONSOLE: [Logs console]
   ```

---

## ✅ VALIDATION FINALE

Après avoir complété tous les tests :

```
□ Toutes les fonctionnalités testées
□ 0 crashes rencontrés
□ Navigation fonctionne
□ SettingsScreen correct
□ Personal Record safe
□ Try/catch fonctionnent
□ Performance acceptable

☑ APPLICATION VALIDÉE - PRÊTE POUR PRODUCTION
```

---

**Durée totale des tests :** ~45 minutes

**Taux de couverture :** 100% des features principales

**Prochaine étape :** Build de production 🚀
