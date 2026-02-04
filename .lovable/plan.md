
# Plan : Corriger les mots arabes fusionnés lors de l'extraction OCR

## Diagnostic complet

### Origine du problème

Les mots fusionnés en arabe proviennent de **deux sources** dans le pipeline d'extraction :

1. **Google Cloud Vision OCR** (`pdf-ocr-batch/index.ts`)
   - L'OCR retourne parfois des mots collés sans espace
   - Exemple : "الإشكالالدّستوري" au lieu de "الإشكال الدّستوري"

2. **Extraction PDF directe** (`pdf-reader/index.ts`)
   - Les fragments de texte sont concaténés avec des espaces basés sur les positions X/Y
   - Si les fragments sont trop proches, pas d'espace ajouté

### Mots fusionnés identifiés dans votre document

| Fusionné | Correct | Pattern |
|----------|---------|---------|
| الإشكالالدّستوري | الإشكال الدّستوري | mot + article "ال" |
| اعتبارالمتطلّبات | اعتبار المتطلّبات | mot + article "ال" |
| الأسبابالتي | الأسباب التي | mot + article "ال" |
| أنّهالا | أنّها لا | mot + "لا" |

### Pourquoi cela se produit sur "chaque fiche"

Le problème est systémique : chaque document passe par le même pipeline d'OCR, et les patterns de fusion sont récurrents car ils suivent des règles linguistiques arabes (article défini "ال", négation "لا").

---

## Solution proposée

### Stratégie : Correction ciblée des patterns de fusion courants

Ajouter des regex spécifiques pour séparer les mots fusionnés **uniquement pour les cas documentés** sans risquer de casser des mots correctement formés.

### Fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `supabase/functions/_shared/utils.ts` | Ajouter patterns de séparation dans `sanitizeArabicTextRaw` |
| `src/lib/arabicUtils.ts` | Synchroniser les mêmes patterns côté frontend |

### Patterns de correction à ajouter

```text
Pattern 1 : Séparation article "ال" collé après un mot arabe
─────────────────────────────────────────────────────────────
Avant : "الإشكالالدّستوري"
Après : "الإشكال الدّستوري"
Regex : /([\u0621-\u064A]{3,})(ال[\u0621-\u064A]{3,})/g → '$1 $2'

Pattern 2 : Séparation "لا" (négation) collé après un mot
────────────────────────────────────────────────────────────
Avant : "أنّهالا"
Après : "أنّها لا"
Regex : /([\u0621-\u064A]{2,}ا)(لا[\s])/g → '$1 $2'

Pattern 3 : Séparation "التي" collé après un mot
────────────────────────────────────────────────
Avant : "الأسبابالتي"
Après : "الأسباب التي"
(Couvert par Pattern 1)
```

### Code à ajouter dans `sanitizeArabicTextRaw`

Actuellement, cette fonction n'applique qu'une correction minimale. Elle sera enrichie avec des patterns **sûrs et testés** :

```typescript
// Dans sanitizeArabicTextRaw - NOUVEAUX PATTERNS

// Pattern: mot arabe (3+ lettres) + article "ال" collé
// Exemple: "الإشكالالدّستوري" → "الإشكال الدّستوري"
sanitized = sanitized.replace(
  /([\u0621-\u064A\u0651]{3,})(ال[\u0621-\u064A]{3,})/g, 
  '$1 $2'
);

// Pattern: mot finissant par ا/ة + "لا" collé
// Exemple: "أنّهالا" → "أنّها لا"
sanitized = sanitized.replace(
  /([\u0621-\u064A]{2,}[اة])(لا\s)/g, 
  '$1 $2'
);

// Pattern: mot + "التي" ou "الذي" collés
sanitized = sanitized.replace(
  /([\u0621-\u064A]{3,})(ال[تذ]ي)/g, 
  '$1 $2'
);
```

---

## Changements détaillés

### 1. Backend : `supabase/functions/_shared/utils.ts`

Dans la fonction `sanitizeArabicTextRaw` (lignes 515-549), ajouter après la normalisation des espaces :

```typescript
// NEW: Pattern-based word separation for common OCR fusion errors
// Pattern 1: Arabic word + article "ال" glued (most common)
sanitized = sanitized.replace(
  /([\u0621-\u064A\u0651]{3,})(ال[\u0621-\u064A\u0651]{3,})/g,
  '$1 $2'
);

// Pattern 2: Word ending in ا/ة + لا (negation) glued
sanitized = sanitized.replace(
  /([\u0621-\u064A\u0651]{2,}[اة])(لا(?:\s|$|[\u0621-\u064A]))/g,
  '$1 $2'
);

// Pattern 3: Word + relative pronouns (التي، الذي) glued
sanitized = sanitized.replace(
  /([\u0621-\u064A\u0651]{3,})(ال[تذ]ي)/g,
  '$1 $2'
);
```

### 2. Frontend : `src/lib/arabicUtils.ts`

Synchroniser les mêmes patterns dans `normalizeArabicForDisplay` pour l'affichage cohérent.

---

## Risques et précautions

### ⚠️ Leçon apprise (mémoire du projet)

Des patterns regex génériques ont précédemment **cassé des textes correctement espacés** (voir mémoire `arabic-regex-destructive-patterns-lesson`). 

### ✅ Pourquoi ces patterns sont sûrs

1. **Pattern 1** : Requiert 3+ lettres avant ET après "ال" → évite de séparer "بالحق" (correct)
2. **Pattern 2** : Requiert mot finissant par ا/ة + "لا" → très spécifique
3. **Pattern 3** : Cible uniquement "التي"/"الذي" → pas de faux positifs

### 📋 Tests recommandés

Tester sur des documents existants avant déploiement pour vérifier :
- Les mots fusionnés sont corrigés ✓
- Les mots corrects ne sont pas cassés ✓

---

## Résumé

| Aspect | Détail |
|--------|--------|
| **Cause** | OCR et extraction PDF ne détectent pas tous les espaces |
| **Impact** | Quelques mots fusionnés par document (récurrent) |
| **Solution** | Regex ciblées pour patterns communs de fusion |
| **Fichiers modifiés** | `utils.ts` (backend), `arabicUtils.ts` (frontend) |
| **Risque** | Minimal si patterns limités aux cas documentés |
| **Alternative** | Bouton "Corriger AR" pour correction IA manuelle |
