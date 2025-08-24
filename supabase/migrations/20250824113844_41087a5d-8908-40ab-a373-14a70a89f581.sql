-- Enable RLS on link_ref table (if not already enabled)
ALTER TABLE public.link_ref ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access for link_ref" 
ON public.link_ref 
FOR SELECT 
USING (true);

-- Create policy to allow public update access
CREATE POLICY "Allow public update access for link_ref" 
ON public.link_ref 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_link_ref_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_link_ref_updated_at
  BEFORE UPDATE ON public.link_ref
  FOR EACH ROW
  EXECUTE FUNCTION public.update_link_ref_updated_at_column();