-- Delete the "Offre - Projet ODF" document and its processing job
DELETE FROM documents WHERE title = 'Offre - Projet ODF' AND original_filename = 'Offre - Projet ODF.pdf';
DELETE FROM processing_jobs WHERE file_name = 'Offre - Projet ODF.pdf';