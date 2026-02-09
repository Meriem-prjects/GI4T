

## Plan: Ameliorer l'indicateur IA et les tags populaires

### 1. Deplacer l'indicateur IA dans la barre de recherche

Actuellement, "Mode recherche intelligente active" s'affiche en dessous de la barre comme un badge separe. Il sera integre directement dans la barre de recherche, sous forme d'un petit texte explicatif.

**Changement dans `SearchResults.tsx`** :
- Supprimer le badge "Mode recherche intelligente active" qui est en dessous de la barre (lignes 366-374)
- Ajouter un texte explicatif a l'interieur de la barre de recherche, sous l'input, qui explique ce que l'IA fait

```text
┌──────────────────────────────────────────────────────────┐
│ [🔍] Rechercher...                        [✨ IA] [→]  │
│  ✨ L'IA analyse le sens de votre question              │
│     pour trouver les documents les plus pertinents       │
└──────────────────────────────────────────────────────────┘
```

Le texte explicatif sera :
- FR : "L'IA analyse le sens de votre recherche pour trouver les documents les plus pertinents"
- AR : "يحلل الذكاء الاصطناعي معنى بحثك للعثور على الوثائق الأكثر صلة"

Ce texte n'apparait que quand le toggle IA est active, en petit sous l'input, toujours a l'interieur de la card blanche.

---

### 2. Tags populaires - Deja fonctionnels

Les tags affiches sont deja des mots-cles reels extraits des fiches publiees via le hook `useDocumentKeywords`. Ce hook :
- Interroge la table `documents` pour les fiches publiees (`published = true`)
- Extrait les champs `keywords` (FR) et `keywords_ar` (AR)
- Compte la frequence de chaque mot-cle
- Affiche les 50 plus frequents tries par nombre d'occurrences

**Amelioration** : Reduire le `staleTime` du cache de 30 minutes a 5 minutes pour que les tags se mettent a jour plus rapidement quand de nouvelles fiches sont publiees.

---

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/SearchResults.tsx` | Deplacer l'indicateur IA dans la barre, ajouter texte explicatif |
| `src/hooks/useDocumentKeywords.ts` | Reduire staleTime de 30min a 5min |

