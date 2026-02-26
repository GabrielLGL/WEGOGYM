# Brainstorm — Récap Post-Séance — 2026-02-26

## Idée reformulée
En tant qu'utilisateur qui vient de terminer une séance, je veux voir le détail de chaque exercice (séries/reps/poids), comparer mes perfs avec la dernière fois, et recevoir un message motivant avec les muscles travaillés — pour ressentir ma progression concrète et rester motivé.

## Persona cible
**Intermédiaire** (6-24 mois) — pratique régulière, veut voir sa progression exercice par exercice et comparer dans le temps. Débutant profite aussi du feedback motivant.

## Idées explorées
1. Détail exercice par exercice (log complet de la séance)
2. Muscles travaillés (chips visuelles)
3. Comparaison avec la dernière séance identique (volume, durée)
4. Barre de progression XP animée
5. Message de motivation contextuel (local, sans IA)
6. Suggestion pour la prochaine séance
7. Carte récap partageable (expo-sharing)
8. Timeline chronologique des sets
9. Score de qualité de séance
10. Récap accessible depuis l'historique (rétro)

## Direction retenue
**A + B + C** : Détail exo par exo + Comparaison avec la dernière fois + Message motivant + Muscles travaillés

## Top 5 Insights
1. **Détail exercice par exercice** — L'utilisateur a besoin de voir CE QU'IL a fait, pas seulement des totaux abstraits. La récap actuelle est trop globale. | Risque : trop d'infos = scroll fatigue si longue séance
2. **Comparaison avec la dernière fois** — "Tu as progressé" est la récompense intrinsèque #1 de la musculation. Sans comparaison, les stats sont vides de sens. | Risque : requête DB par exercice → perf à surveiller
3. **Message contextuel motivant** — Un message personnalisé (local, pas IA) crée un sentiment que l'app "te comprend". Coût faible, impact émotionnel fort. | Risque : messages répétitifs → lassitude si même séance chaque semaine
4. **Muscles travaillés** — Chips visuelles = feedback immédiat "j'ai bien ciblé pec/triceps aujourd'hui". Renforce la sensation d'utilité du programme. | Risque : données `muscles` sur exercices pas toujours renseignées → fallback gracieux
5. **Score de qualité de séance** — (écarté du scope v1) Transforme chaque séance en "défi à battre". | Risque : calcul subjectif → frustration si score perçu injuste

## Questions ouvertes
- Amélioration du WorkoutSummarySheet existant OU extension avec sections scrollables supplémentaires ?
- Récaps passées depuis l'historique (scope v1 ou v2) ?

## Contraintes techniques identifiées
- Pas de migration schéma (v17 suffit — histories + sets + exercises)
- Requête sets filtrée par history_id (séance courante)
- getLastNSetsForExercise() pour la comparaison (helper existant)
- exercises.muscles = string CSV ("Pectoraux,Épaules") → parsing côté JS
- exercises.muscles peut être vide → fallback "—"
- Tout offline-first, pas d'API

## Prêt pour Phase 2 ?
OUI
