-- Create storage buckets for media and photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('album-photos', 'album-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin insert media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- Storage policies for album-photos bucket
CREATE POLICY "Public read album-photos" ON storage.objects FOR SELECT USING (bucket_id = 'album-photos');
CREATE POLICY "Admin insert album-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'album-photos');
CREATE POLICY "Admin update album-photos" ON storage.objects FOR UPDATE USING (bucket_id = 'album-photos');
CREATE POLICY "Admin delete album-photos" ON storage.objects FOR DELETE USING (bucket_id = 'album-photos');

-- photo_albums table
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  date TEXT,
  location TEXT,
  location_ar TEXT,
  governorate TEXT,
  category TEXT NOT NULL DEFAULT 'Campagnes',
  cover_image_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  photo_count INT DEFAULT 0,
  views INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read albums" ON public.photo_albums FOR SELECT USING (published = true);
CREATE POLICY "Admin all albums" ON public.photo_albums FOR ALL USING (true);

-- media_items table
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  type TEXT NOT NULL DEFAULT 'Vidéo', -- Vidéo, Audio, Webinaire
  category TEXT NOT NULL DEFAULT 'Campagnes terrain',
  category_id TEXT,
  governorate TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media_items" ON public.media_items FOR SELECT USING (published = true);
CREATE POLICY "Admin all media_items" ON public.media_items FOR ALL USING (true);
