-- Recherche sémantique exacte sur documents.embedding.
-- L'index ivfflat (approximatif) ne parcourt qu'une partie des vecteurs,
-- choisie d'après des centres calculés à sa création : créé sur une table
-- vide ou avant le remplacement des documents de l'ODF, il ne trouvait
-- plus que quelques résultats. À quelques milliers de documents, la
-- recherche exacte (parcours complet) prend quelques millisecondes.
DROP INDEX IF EXISTS "documents_embedding_idx";
