import { supabase } from "@/integrations/supabase/client";

export const setupAccesDroitsAdmin = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-acces-droits-admin', {
      body: {}
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error setting up accès aux droits admin:', error);
    return { success: false, error };
  }
};
