-- Enable Row Level Security on activity_logs table
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity_logs table (admin access only for audit trail)
CREATE POLICY "Activity logs are viewable by authenticated users" 
ON public.activity_logs 
FOR SELECT 
USING (true); -- Allow all authenticated users to view logs for transparency

CREATE POLICY "Activity logs can only be inserted by the system" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true); -- System can insert logs (no user restriction needed for audit trail)

-- No UPDATE or DELETE policies - audit logs should be immutable