import { supabase } from "@/integrations/supabase/client";

export const setupObservatoireAdmin = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-observatoire-admin', {
      body: {}
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error setting up observatoire admin:', error);
    return { success: false, error };
  }
};
