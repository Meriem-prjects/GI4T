import { supabase } from "@/integrations/supabase/client";

export const setupInitialAdmin = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-initial-admin', {
      body: {}
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error setting up initial admin:', error);
    return { success: false, error };
  }
};
