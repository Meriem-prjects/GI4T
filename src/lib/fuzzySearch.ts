/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = more similar strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Check if searchTerm fuzzy matches the target string
 * Returns a score from 0 to 1 (higher is better match)
 */
export function fuzzyMatch(searchTerm: string, target: string, threshold: number = 0.6): number {
  const search = searchTerm.toLowerCase().trim();
  const text = target.toLowerCase().trim();

  // Exact match or contains - highest priority
  if (text === search) return 1;
  if (text.includes(search)) return 0.95;

  // Check if search words are in target (for multi-word searches)
  const searchWords = search.split(/\s+/);
  const targetWords = text.split(/\s+/);
  
  if (searchWords.length > 1) {
    // Multi-word search: check if all words match with fuzzy logic
    let totalScore = 0;
    let matchedWords = 0;
    
    for (const searchWord of searchWords) {
      let bestWordScore = 0;
      
      for (const targetWord of targetWords) {
        const score = similarityScore(searchWord, targetWord);
        if (score > bestWordScore) {
          bestWordScore = score;
        }
      }
      
      if (bestWordScore >= threshold) {
        matchedWords++;
        totalScore += bestWordScore;
      }
    }
    
    if (matchedWords === searchWords.length) {
      return totalScore / searchWords.length * 0.9; // Slightly lower than exact match
    }
  }

  // Single word or no multi-word match: check similarity with each word
  let bestScore = 0;
  for (const targetWord of targetWords) {
    const score = similarityScore(search, targetWord);
    if (score > bestScore) {
      bestScore = score;
    }
  }

  // Check similarity with full text for partial matches
  const fullTextScore = similarityScore(search, text);
  bestScore = Math.max(bestScore, fullTextScore);

  return bestScore >= threshold ? bestScore : 0;
}

/**
 * Sort items by fuzzy match score
 */
export function fuzzySort<T>(
  items: T[],
  searchTerm: string,
  getText: (item: T) => string,
  threshold: number = 0.6
): Array<T & { _score: number }> {
  return items
    .map(item => ({
      ...item,
      _score: fuzzyMatch(searchTerm, getText(item), threshold)
    }))
    .filter(item => item._score > 0)
    .sort((a, b) => b._score - a._score);
}
