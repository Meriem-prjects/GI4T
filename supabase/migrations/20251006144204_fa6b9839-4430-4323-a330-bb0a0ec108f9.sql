-- Table pour la configuration du chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tone TEXT NOT NULL DEFAULT 'professionnel',
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  secondary_color TEXT NOT NULL DEFAULT '#10B981',
  font_family TEXT NOT NULL DEFAULT 'Inter, sans-serif',
  system_prompt TEXT NOT NULL DEFAULT 'Vous êtes un assistant juridique virtuel spécialisé dans le droit tunisien. Répondez de manière claire, professionnelle et précise.',
  welcome_message TEXT NOT NULL DEFAULT 'Bonjour ! Je suis votre assistant juridique virtuel. Comment puis-je vous aider aujourd''hui ?',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les documents d'apprentissage du chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour chatbot_config
CREATE POLICY "Public can read chatbot config"
  ON public.chatbot_config
  FOR SELECT
  USING (true);

CREATE POLICY "Acces droits admins can manage chatbot config"
  ON public.chatbot_config
  FOR ALL
  USING (has_acces_droits_role(auth.uid()));

-- RLS Policies pour chatbot_training_documents
CREATE POLICY "Public can read active training documents"
  ON public.chatbot_training_documents
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Acces droits admins can manage training documents"
  ON public.chatbot_training_documents
  FOR ALL
  USING (has_acces_droits_role(auth.uid()));

-- Trigger pour update_at
CREATE TRIGGER update_chatbot_config_updated_at
  BEFORE UPDATE ON public.chatbot_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_training_documents_updated_at
  BEFORE UPDATE ON public.chatbot_training_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer une configuration par défaut
INSERT INTO public.chatbot_config (tone, primary_color, secondary_color, font_family, system_prompt)
VALUES (
  'professionnel',
  '#3B82F6',
  '#10B981',
  'Inter, sans-serif',
  'Vous êtes un assistant juridique virtuel spécialisé dans le droit tunisien. Répondez de manière claire, professionnelle et précise aux questions des citoyens.'
)
ON CONFLICT DO NOTHING;