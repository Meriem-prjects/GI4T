

## Plan: Ameliorer la page Droits Fondamentaux

### Problemes identifies

1. **Cartes trop hautes** - Hauteur fixe de 280px creant beaucoup d'espace vide
2. **Cartes vides** - Pas de compteur de documents, juste un badge "Droit fondamental" inutile
3. **Espacement excessif** - Trop de marges entre les sections
4. **Design peu attractif** - Manque de couleurs et d'informations utiles

### Solution proposee

Transformer les cartes des categories pour qu'elles ressemblent au style de la page AnalysesOpinions avec:

#### 1. Nouveau design des cartes

**Avant:**
```text
┌─────────────────────────────────┐
│  ○ icone      [Droit fondamental]│
│                                   │  <- 280px de hauteur fixe
│  Titre de la categorie           │
│  Description courte...           │
│                                   │
│  [    Explorer    ]              │
└─────────────────────────────────┘
```

**Apres:**
```text
┌─────────────────────────────────┐
│  ■ icone coloree        [23]    │  <- Badge avec nombre de documents
│  Titre de la categorie          │
│  Description courte...          │  <- Hauteur automatique, plus compact
│  [    Consulter    ]            │
└─────────────────────────────────┘
```

#### 2. Modifications techniques

**Fichier:** `src/pages/TextesFondamentaux.tsx`

- **Supprimer la hauteur fixe** : Retirer `h-[280px]` des cartes
- **Ajouter le compteur de documents** : Recuperer et afficher le nombre de fiches par categorie dans un Badge colore
- **Reduire les espacements** : 
  - Hero section: `mb-12` -> `mb-6`
  - Section title: `mb-6` -> `mb-4`
  - Grid gap: `gap-6` -> `gap-4`
  - Container padding: `py-6` -> `py-4`
- **Ameliorer le style des cartes** :
  - Ajouter une couleur de fond legere basee sur `category.color`
  - Icone dans un conteneur carre colore (12x12 au lieu de 8x8 rond)
  - Badge avec le nombre de documents au lieu de "Droit fondamental"
- **Bouton colore** : Style hover avec la couleur de la categorie

#### 3. Recuperation des compteurs

Modifier la requete Supabase pour inclure le nombre de documents par categorie:

```typescript
// Ajouter un state pour stocker les compteurs
const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

// Dans fetchJurisprudenceCategories, compter les documents par categorie
const counts = docsData.reduce((acc, doc) => {
  doc.document_categories?.forEach(dc => {
    acc[dc.category_id] = (acc[dc.category_id] || 0) + 1;
  });
  return acc;
}, {} as Record<string, number>);
setCategoryCounts(counts);
```

#### 4. Resultat attendu

- Cartes plus compactes et informatives
- Nombre de documents visible pour chaque categorie
- Interface plus moderne et coloree
- Meilleure utilisation de l'espace
- Coherence avec le style de AnalysesOpinions

