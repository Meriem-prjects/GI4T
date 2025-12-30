import { supabase } from "@/integrations/supabase/client";

interface ActivityLogParams {
  entityType: string;
  entityId: string;
  action: string;
  details?: Record<string, any>;
}

export const logActivity = async ({
  entityType,
  entityId,
  action,
  details
}: ActivityLogParams) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        action,
        details,
        user_id: user?.id || null
      });
    
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};

export const useActivityLog = () => {
  return { logActivity };
};
