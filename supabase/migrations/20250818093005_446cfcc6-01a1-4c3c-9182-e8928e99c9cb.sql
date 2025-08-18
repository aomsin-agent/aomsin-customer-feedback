-- Add RLS policy for branch_ref table to allow public read access
CREATE POLICY "Allow public read access for branch_ref" 
ON public.branch_ref 
FOR SELECT 
USING (true);