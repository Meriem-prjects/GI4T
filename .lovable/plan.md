

## Plan: Uniformiser le Breadcrumb sur toutes les pages Observatoire

### Probleme
Le breadcrumb (fil d'Ariane) n'est pas au meme niveau sur toutes les pages :
- **Actualites** et **Analyses & Opinions** : correctement place dans `container mx-auto px-4 py-6` avec `mb-6`
- **Search Results** : cache sur mobile (`hidden sm:block`) et enfoui dans la section hero gradient
- **Textes Fondamentaux (Droits fondamentaux)** : utilise `py-4` et `mb-4` au lieu de `py-6` et `mb-6`
- En arabe, le breadcrumb utilise `flex-row-reverse` mais certaines pages manquent de coherence RTL

---

### Corrections

#### 1. SearchResults.tsx
- Retirer `hidden sm:block` du breadcrumb pour le rendre visible sur mobile
- Changer `mb-4 sm:mb-6` en `mb-6` pour etre coherent
- Garder le breadcrumb dans la section hero mais le rendre toujours visible

#### 2. TextesFondamentaux.tsx
- Changer `py-4` en `py-6` sur le container principal
- Changer `mb-4` en `mb-6` sur le wrapper du breadcrumb

#### 3. Verification RTL sur toutes les pages
- S'assurer que le breadcrumb utilise `flex-row-reverse` en mode arabe
- Verifier que le separateur (chevron) pointe dans la bonne direction en RTL

---

### Standard a appliquer partout

```text
Structure coherente :
<div className="container mx-auto px-4 py-6">
  <div className="mb-6 w-full flex justify-start">
    <Breadcrumb>
      <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
        ...
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</div>
```

---

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/SearchResults.tsx` | Retirer `hidden sm:block`, uniformiser espacement |
| `src/pages/TextesFondamentaux.tsx` | `py-4` -> `py-6`, `mb-4` -> `mb-6` |

2 fichiers modifies, corrections mineures mais impactantes pour la coherence visuelle.
