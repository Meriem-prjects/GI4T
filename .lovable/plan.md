
## Plan: Ameliorer l'interface de recherche - Style Actualites/Assistant

### Objectif
Redessiner la barre de recherche de la page SearchResults pour qu'elle ressemble davantage aux pages Actualites et Assistant Virtuel avec un design plus propre et immersif.

---

### Modifications prevues

#### 1. Hero Section - Nouveau Design
**Fichier**: `src/pages/SearchResults.tsx`

**Changements**:
- Ajouter un titre centre "Recherche" / "بحث" au-dessus de la barre de recherche
- Ajouter une description explicative sous le titre
- Remonter la barre de recherche dans une card centree avec fond blanc et ombre
- Integrer le toggle IA dans la barre de maniere plus elegante
- Ajouter une section avec les tags populaires comme sur Observatoire.tsx

**Design vise**:
```text
┌─────────────────────────────────────────┐
│        نتائج البحث / Résultats          │  <- Titre centre
│   Recherchez dans notre base de         │  <- Description
│   documents juridiques                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [🔍] Rechercher...      [IA]  →│   │  <- Barre de recherche
│  └─────────────────────────────────┘   │
│                                         │
│  Tags: RGPD | Liberté | Travail |...   │  <- Tags populaires
└─────────────────────────────────────────┘
```

---

#### 2. Style de la barre de recherche
- Hauteur plus grande (`h-14 sm:h-16`)
- Fond blanc avec bordure jaune comme la page d'accueil
- Icone de recherche a gauche dans un conteneur dedie
- Toggle IA positionne proprement avec label visible
- Bouton de recherche a droite avec texte visible

---

#### 3. Ajout des tags populaires
Reprendre le composant des tags depuis `Observatoire.tsx`:
- Tags dynamiques selon la langue (FR/AR)
- Style: boutons arrondis avec fond leger
- Scroll horizontal sur mobile

---

#### 4. Optimisation mobile
- Titre et description adaptes (taille reduite)
- Barre de recherche pleine largeur
- Tags en scroll horizontal
- Espacement reduit pour economiser l'espace vertical

---

### Structure du code modifie

```tsx
{/* Hero Search Section - Nouveau Design */}
<div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-b">
  <div className="container mx-auto px-4 py-6 sm:py-10">
    {/* Breadcrumb */}
    ...
    
    {/* Titre et Description */}
    <div className="text-center mb-6">
      <h1>{t('searchResults')}</h1>
      <p>{t('searchDescription')}</p>
    </div>
    
    {/* Barre de recherche stylisee */}
    <div className="max-w-3xl mx-auto">
      <div className="relative bg-white rounded-xl shadow-lg border-2 border-yellow-400">
        <Search icon />
        <Input className="h-14 sm:h-16 rounded-xl" />
        <AI Toggle />
        <Button>Rechercher</Button>
      </div>
    </div>
    
    {/* Tags populaires */}
    <div className="flex justify-center gap-2 mt-4">
      {popularTags.map(...)}
    </div>
  </div>
</div>
```

---

### Traductions a ajouter
Si necessaires dans le fichier de traductions:
- `searchPageTitle`: "Recherche" / "بحث"
- `searchPageDescription`: "Recherchez dans notre base de documents juridiques" / "ابحث في قاعدة وثائقنا القانونية"

---

### Resume technique

| Element | Modification |
|---------|-------------|
| Hero section | Ajout titre + description centres |
| Barre de recherche | Style card blanc avec bordure jaune, hauteur augmentee |
| Toggle IA | Design plus elegant avec label visible |
| Tags populaires | Reprendre le style Observatoire |
| Mobile | Optimisation des espacements et scroll horizontal |

---

### Fichiers a modifier
- `src/pages/SearchResults.tsx` - Refonte du hero section avec nouveau design
