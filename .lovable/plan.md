

# Plan : Appliquer les couleurs thématiques aux boutons et pages

## Problème identifié

### 1. Bouton "Consulter" (AnalysesOpinions.tsx)
- Actuellement : `variant="outline"` → hover jaune par défaut
- Attendu : hover avec la couleur de l'icône de chaque carte

### 2. Pages individuelles
- **Analyses juridiques** (AnalysesJuridiques.tsx) : utilise `text-primary` générique
- **Commentaires** (Commentaires.tsx) : utilise `text-primary` générique  
- **Blogs** (Blogs.tsx) : utilise `text-primary` générique
- Attendu : chaque page utilise sa couleur thématique

## Thème de couleurs par type

| Type | Couleur icône | Couleur fond | Couleur texte |
|------|---------------|--------------|---------------|
| Analyses juridiques | `bg-blue-600` | `bg-blue-50` | `text-blue-600` |
| Commentaires | `bg-emerald-600` | `bg-emerald-50` | `text-emerald-600` |
| Blogs | `bg-amber-500` | `bg-amber-50` | `text-amber-500` |

---

## Fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `src/pages/AnalysesOpinions.tsx` | Ajouter `hoverColor` à chaque carte et l'appliquer au bouton |
| `src/pages/AnalysesJuridiques.tsx` | Appliquer thème bleu à l'icône et éléments clés |
| `src/pages/Commentaires.tsx` | Appliquer thème vert émeraude |
| `src/pages/Blogs.tsx` | Appliquer thème amber |

---

## Détails techniques

### 1. AnalysesOpinions.tsx - Boutons colorés

Ajouter une propriété `hoverColor` pour chaque catégorie et l'appliquer au bouton :

```tsx
// Définition
{ 
  title: t('deepAnalyses'), 
  iconColor: "bg-blue-600",
  hoverColor: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  ...
},
{ 
  title: t('opinionArticles'), 
  iconColor: "bg-emerald-600",
  hoverColor: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  ...
},
{ 
  title: t('policyBriefs'), 
  iconColor: "bg-amber-500",
  hoverColor: "hover:bg-amber-500 hover:text-white hover:border-amber-500",
  ...
}

// Application
<Button 
  variant="outline" 
  className={`w-full ${category.hoverColor}`}
  asChild
>
```

### 2. AnalysesJuridiques.tsx - Thème bleu

```tsx
// Hero Section - icône
<FileText className="w-12 h-12 text-blue-600" />

// Titre avec accent
<h1 className="text-3xl md:text-4xl font-bold mb-4">
  <span className="text-blue-600">{t('deepAnalyses')}</span>
</h1>
```

### 3. Commentaires.tsx - Thème vert émeraude

```tsx
// Hero Section - icône
<Pen className="w-12 h-12 text-emerald-600" />
```

### 4. Blogs.tsx - Thème amber

```tsx
// Hero Section - icône
<TrendingUp className="w-12 h-12 text-amber-500" />
```

---

## Résultat attendu

| Élément | Avant | Après |
|---------|-------|-------|
| Bouton "Consulter" Analyses | Hover jaune | Hover bleu |
| Bouton "Consulter" Commentaires | Hover jaune | Hover vert |
| Bouton "Consulter" Blogs | Hover jaune | Hover amber |
| Icône page Analyses | Bleu primary | Bleu-600 |
| Icône page Commentaires | Bleu primary | Emerald-600 |
| Icône page Blogs | Bleu primary | Amber-500 |

