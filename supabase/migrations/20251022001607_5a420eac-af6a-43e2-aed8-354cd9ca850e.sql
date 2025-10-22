-- Table pour tracker les vues de documents
CREATE TABLE document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  ip_address text,
  user_agent text,
  read_duration integer DEFAULT 0,
  viewed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_document_views_document_id ON document_views(document_id);
CREATE INDEX idx_document_views_session_id ON document_views(session_id);
CREATE INDEX idx_document_views_viewed_at ON document_views(viewed_at);

-- RLS policies pour document_views
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert views"
  ON document_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read views"
  ON document_views FOR SELECT
  USING (true);

-- Table pour les commentaires
CREATE TABLE document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES document_comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  is_admin_reply boolean DEFAULT false,
  admin_user_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_parent_id ON document_comments(parent_comment_id);
CREATE INDEX idx_document_comments_status ON document_comments(status);
CREATE INDEX idx_document_comments_created_at ON document_comments(created_at);

-- RLS policies pour document_comments
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert comments"
  ON document_comments FOR INSERT
  WITH CHECK (is_admin_reply = false AND status = 'pending');

CREATE POLICY "Public can read approved comments"
  ON document_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can manage all comments"
  ON document_comments FOR ALL
  USING (has_observatoire_role(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON document_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vue agrégée pour statistiques
CREATE OR REPLACE VIEW document_statistics AS
SELECT 
  d.id as document_id,
  d.title,
  d.title_ar,
  COUNT(DISTINCT dv.session_id) as total_views,
  COUNT(DISTINCT dv.id) FILTER (WHERE dv.read_duration > 10) as total_reads,
  ROUND(AVG(dv.read_duration)) as avg_read_duration,
  COUNT(DISTINCT dc.id) FILTER (WHERE dc.status = 'approved' AND dc.parent_comment_id IS NULL) as total_comments,
  COUNT(DISTINCT dc.id) FILTER (WHERE dc.status = 'pending') as pending_comments,
  MAX(dv.viewed_at) as last_viewed_at
FROM documents d
LEFT JOIN document_views dv ON d.id = dv.document_id
LEFT JOIN document_comments dc ON d.id = dc.document_id
WHERE d.published = true
GROUP BY d.id, d.title, d.title_ar;

GRANT SELECT ON document_statistics TO anon, authenticated;