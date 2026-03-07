# Configurer submit.production dans eas.json

## Statut : 🟡 Partiellement résolu — 20260307

## Contexte
`eas.json` a besoin d'une section `submit.production` pour automatiser la soumission au Play Store via `eas submit`.

### Avancement
- `submit.production: {}` existe déjà dans `eas.json` (squelette vide)
- **Reste** : ajouter le bloc `android` (serviceAccountKeyPath, track, releaseStatus)
- **Pré-requis** : créer/obtenir le Google service account key

## Actions
1. Lire `eas.json`
2. Ajouter la section `submit` :
   ```json
   {
     "submit": {
       "production": {
         "android": {
           "serviceAccountKeyPath": "./google-service-account.json",
           "track": "internal",
           "releaseStatus": "draft"
         }
       }
     }
   }
   ```
3. Verifier que le service account key est dans `.gitignore`
4. Documenter la procedure de soumission
5. Commit : `chore(eas): configure submit.production for Play Store`

## Pre-requis
- Google Play Console developer account
- Service account key avec permissions de publication
- App signee avec upload key (configuree dans EAS)

## Risques
- Le service account key ne doit JAMAIS etre commite
- `track: "internal"` pour commencer (testing interne avant production)

## Priorite : NICE-TO-HAVE
Facilite la soumission mais peut etre fait manuellement via la console.
