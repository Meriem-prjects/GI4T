-- Create categories table for legal document classification
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  parent_id UUID REFERENCES public.categories(id),
  description TEXT,
  description_ar TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document types table
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table for storing processed documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  summary TEXT,
  summary_ar TEXT,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  keywords_ar TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'fr',
  category_id UUID REFERENCES public.categories(id),
  document_type_id UUID REFERENCES public.document_types(id),
  original_filename TEXT NOT NULL,
  file_url TEXT,
  pdf_url TEXT,
  file_size INTEGER,
  page_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (readable by all authenticated users, modifiable by admins)
CREATE POLICY "Categories are viewable by authenticated users" 
ON public.categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categories can be managed by authenticated users" 
ON public.categories 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for document types (same as categories)
CREATE POLICY "Document types are viewable by authenticated users" 
ON public.document_types 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Document types can be managed by authenticated users" 
ON public.document_types 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for documents (user-specific)
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insert default document types
INSERT INTO public.document_types (name, name_ar, description, description_ar) VALUES
('Jurisprudence', 'اجتهاد قضائي', 'Décisions de justice et arrêts de cours', 'قرارات المحاكم وأحكام المحاكم'),
('Analyse Juridique', 'تحليل قانوني', 'Analyses et commentaires juridiques', 'تحليلات وتعليقات قانونية'),
('Texte Législatif', 'نص تشريعي', 'Lois, décrets et règlements', 'قوانين ومراسيم ولوائح'),
('Doctrine', 'فقه قانوني', 'Ouvrages et articles doctrinaux', 'أعمال ومقالات فقهية قانونية');

-- Insert default categories
INSERT INTO public.categories (name, name_ar, description, description_ar, color) VALUES
('Droit Civil', 'القانون المدني', 'Droit des personnes, biens et obligations', 'قانون الأشخاص والأموال والالتزامات', '#3B82F6'),
('Droit Pénal', 'القانون الجنائي', 'Droit pénal général et spécial', 'القانون الجنائي العام والخاص', '#EF4444'),
('Droit Commercial', 'القانون التجاري', 'Droit des affaires et du commerce', 'قانون الأعمال والتجارة', '#10B981'),
('Droit Administratif', 'القانون الإداري', 'Organisation et fonctionnement administratif', 'التنظيم والعمل الإداري', '#F59E0B'),
('Droit Constitutionnel', 'القانون الدستوري', 'Organisation des pouvoirs publics', 'تنظيم السلطات العامة', '#8B5CF6'),
('Droits de l''Homme', 'حقوق الإنسان', 'Protection des droits fondamentaux', 'حماية الحقوق الأساسية', '#EC4899');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies for documents
CREATE POLICY "Users can view their own document files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own document files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own document files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own document files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();