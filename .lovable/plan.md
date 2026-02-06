

## Plan: Améliorer les couleurs des cartes de catégories

### Problèmes identifiés

En regardant la capture d'écran :

1. **Bordures trop discrètes** - L'opacité à 30% (`#color30`) rend les bordures presque invisibles
2. **Hover du bouton Consulter** - N'a pas de fond coloré au survol, seulement un changement de bordure
3. **Titre au hover** - Utilise `text-primary` générique au lieu de la couleur thématique de la catégorie

### Modifications proposées

**Fichier:** `src/pages/TextesFondamentaux.tsx`

#### 1. Bordure des cartes plus visible

**Avant:**
```tsx
borderColor: categoryColor + '30'  // 30% d'opacité = presque invisible
```

**Après:**
```tsx
borderColor: categoryColor + '60'  // 60% d'opacité = plus visible
// ou mieux : border-2 avec couleur pleine
```

#### 2. Hover du bouton Consulter avec fond coloré

**Avant:**
```tsx
<Button 
  variant="outline" 
  className="w-full group-hover:border-current transition-colors"
  style={{ 
    color: categoryColor,
    borderColor: categoryColor + '50'
  }}
>
```

**Après:**
```tsx
<Button 
  variant="outline" 
  className="w-full transition-all duration-300 hover:text-white"
  style={{ 
    color: categoryColor,
    borderColor: categoryColor,
    '--hover-bg': categoryColor
  } as React.CSSProperties}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = categoryColor}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
```

Ou utiliser une approche CSS avec `group-hover`:
```tsx
// Ajouter une classe personnalisée pour le hover
className="w-full transition-all duration-300 group-hover:text-white"
style={{ 
  color: categoryColor,
  borderColor: categoryColor,
}}
// Avec onMouseEnter/onMouseLeave pour le background
```

#### 3. Titre au hover avec couleur de la catégorie

**Avant:**
```tsx
className="... group-hover:text-primary ..."
```

**Après:**
Utiliser un style inline pour le hover ou une classe dynamique :
```tsx
<CardTitle 
  className="text-lg mb-1 transition-colors"
  style={{ '--hover-color': categoryColor } as React.CSSProperties}
>
  // Avec gestion onMouseEnter/onMouseLeave sur la Card
```

#### 4. Solution technique recommandée

Utiliser un state local pour gérer le hover de chaque carte :

```tsx
// Dans le map des catégories
const [hoveredCard, setHoveredCard] = useState<string | null>(null);

<Card 
  onMouseEnter={() => setHoveredCard(category.id)}
  onMouseLeave={() => setHoveredCard(null)}
  style={{ 
    borderColor: categoryColor,
    backgroundColor: categoryColor + '08'
  }}
>
  <CardTitle style={{ 
    color: hoveredCard === category.id ? categoryColor : undefined 
  }}>
  
  <Button style={{ 
    backgroundColor: hoveredCard === category.id ? categoryColor : 'transparent',
    color: hoveredCard === category.id ? 'white' : categoryColor,
    borderColor: categoryColor
  }}>
```

### Résultat attendu

- Bordures des cartes clairement colorées selon leur thème
- Titre qui prend la couleur de la catégorie au survol
- Bouton "Consulter" avec fond coloré au survol et texte blanc
- Cohérence visuelle entre l'icône, le badge, et les éléments interactifs

