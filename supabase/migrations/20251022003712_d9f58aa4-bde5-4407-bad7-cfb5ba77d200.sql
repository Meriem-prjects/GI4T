-- Fonction pour obtenir les statistiques globales
CREATE OR REPLACE FUNCTION get_global_statistics(period_days integer DEFAULT 30)
RETURNS TABLE (
  total_views bigint,
  total_reads bigint,
  avg_read_duration numeric,
  total_comments bigint,
  pending_comments bigint,
  top_articles_count bigint,
  unique_sessions bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT dv.id) as total_views,
    COUNT(DISTINCT dv.id) FILTER (WHERE dv.read_duration > 60) as total_reads,
    ROUND(AVG(NULLIF(dv.read_duration, 0)), 1) as avg_read_duration,
    (SELECT COUNT(*) FROM document_comments WHERE status = 'approved') as total_comments,
    (SELECT COUNT(*) FROM document_comments WHERE status = 'pending') as pending_comments,
    COUNT(DISTINCT ds.document_id) FILTER (WHERE ds.total_views > 100) as top_articles_count,
    COUNT(DISTINCT dv.session_id) as unique_sessions
  FROM document_views dv
  LEFT JOIN document_statistics ds ON dv.document_id = ds.document_id
  WHERE dv.viewed_at >= NOW() - (period_days || ' days')::interval;
END;
$$;

-- Permission
GRANT EXECUTE ON FUNCTION get_global_statistics TO authenticated, anon;