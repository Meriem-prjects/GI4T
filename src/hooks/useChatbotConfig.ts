import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatbotConfig {
  id: string;
  tone: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  system_prompt: string;
  welcome_message: string;
  created_at: string;
  updated_at: string;
}

export const useChatbotConfig = () => {
  return useQuery({
    queryKey: ['chatbot-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as ChatbotConfig;
    }
  });
};

export const useChatbotTrainingDocuments = () => {
  return useQuery({
    queryKey: ['chatbot-training-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_training_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};
