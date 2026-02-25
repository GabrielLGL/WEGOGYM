# S09 — Milestones & Celebrations

## Story
**En tant que** pratiquant,
**je veux** etre celebre quand j'atteins un palier important (seances, tonnage, niveau),
**afin de** vivre des moments de fierte et de motivation.

## Taches techniques
1. Ajouter dans `gamificationHelpers.ts` :
   - Constantes : `SESSION_MILESTONES`, `TONNAGE_MILESTONES_KG`
   - Interface `MilestoneEvent { type, value, emoji, title, message }`
   - `detectMilestones(before, after)` : compare before/after et retourne les milestones franchis
   - Messages pre-definis pour chaque milestone
2. Creer composant celebration ou reutiliser BottomSheet :
   - Emoji grand format (48px)
   - Titre du milestone
   - Message de felicitation
   - Bouton "OK" (Button variant primary)
   - Haptic `onSuccess` a l'ouverture
3. Integrer dans le flow de fin de seance (apres S05) :
   - Si milestones detectes → afficher BottomSheet celebration apres le resume
   - Level-up = milestone aussi

## Messages milestones

### Seances
| Seuil | Emoji | Titre | Message |
|-------|-------|-------|---------|
| 10 | 💪 | "10 seances !" | "Tu as pris le rythme." |
| 25 | 🔥 | "25 seances !" | "Un quart de centenaire." |
| 50 | ⭐ | "50 seances !" | "Tu es un habitue." |
| 100 | 🏆 | "100 seances !" | "Niveau dedicace." |
| 250 | 👑 | "250 seances !" | "Force et perseverance." |
| 500 | 🦾 | "500 seances !" | "Legendaire." |

### Tonnage
| Seuil | Emoji | Titre | Message |
|-------|-------|-------|---------|
| 10t | 🏗️ | "10 tonnes soulevees !" | "Ca commence a compter." |
| 50t | 🚗 | "50 tonnes !" | "Le poids d'un camion." |
| 100t | 🏠 | "100 tonnes !" | "Le poids d'une maison." |
| 500t | ✈️ | "500 tonnes !" | "Le poids d'un avion." |
| 1000t | 🚀 | "1 000 tonnes !" | "Interstellaire." |

## Criteres d'acceptation
- [ ] `detectMilestones()` detecte les paliers franchis
- [ ] BottomSheet celebration s'affiche avec le bon message
- [ ] Haptic `onSuccess` au moment de l'affichage
- [ ] Ne s'affiche qu'une fois par milestone (comparaison before/after)
- [ ] Level-up declenche aussi une celebration
- [ ] Si plusieurs milestones en meme temps : afficher le plus important
- [ ] Tests unitaires pour `detectMilestones()`
- [ ] `npx tsc --noEmit` passe

## Depend de
- S05

## Estimation
M (~1h)

## Priorite
SHOULD (P1)
