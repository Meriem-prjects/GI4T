-- Create news table for managing articles/actualités
CREATE TABLE public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  excerpt TEXT NOT NULL,
  excerpt_ar TEXT,
  content TEXT,
  content_ar TEXT,
  category TEXT NOT NULL CHECK (category IN ('jurisprudence', 'odf', 'event', 'publication', 'acces_droits')),
  tags TEXT[] DEFAULT '{}',
  tags_ar TEXT[] DEFAULT '{}',
  image_url TEXT,
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Enable Row-Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public can read published news
CREATE POLICY "Public can read published news" ON public.news
  FOR SELECT USING (is_published = true);

-- Admin (observatoire) can manage all news
CREATE POLICY "Observatoire admin can manage all news" ON public.news
  FOR ALL USING (has_observatoire_role(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();