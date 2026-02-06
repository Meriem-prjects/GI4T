

## Plan: Repositionner le toggle IA et augmenter la hauteur de la barre de recherche

### Objectif
Intégrer le bouton toggle IA directement dans la barre de recherche et augmenter la hauteur de cette dernière pour un design plus ergonomique.

### Changements prévus

#### 1. Nouvelle structure de la barre de recherche

**Avant (actuel):**
```text
┌─────────────────────────────────────────────────────────┐
│  🔍  │  Barre de recherche                    │ Bouton  │
└─────────────────────────────────────────────────────────┘
                          ┌─────────┐
                          │ ✨ IA 🔘│  (séparé en dessous)
                          └─────────┘
```

**Après (proposé):**
```text
┌───────────────────────────────────────────────────────────────────┐
│  🔍  │  Barre de recherche (plus haute)     │ ✨ IA 🔘 │ Bouton  │
└───────────────────────────────────────────────────────────────────┘
```

#### 2. Modifications techniques

**Fichier:** `src/pages/SearchResults.tsx`

- **Augmenter la hauteur de l'Input** : Passer de `py-4 sm:py-6` a `py-5 sm:py-7` (environ +8px de hauteur)

- **Repositionner le toggle IA** : Le placer a l'interieur du conteneur relatif de la barre de recherche, positionne en `absolute` entre l'input et le bouton de recherche

- **Ajuster les paddings** : Augmenter le padding droit de l'Input pour faire place au toggle IA + bouton de recherche

- **Supprimer le conteneur separe** : Retirer le `<div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">` qui contient actuellement le toggle

#### 3. Layout adaptatif (Desktop/Mobile)

- **Desktop** : Toggle IA visible avec label "IA" + switch, positionne avant le bouton de recherche
- **Mobile** : Toggle IA compact (icone + switch seulement) pour economiser l'espace

### Resultat attendu

- Interface plus compacte et professionnelle
- Moins de scroll necessaire
- Toggle IA toujours visible et accessible
- Barre de recherche plus imposante et ergonomique

