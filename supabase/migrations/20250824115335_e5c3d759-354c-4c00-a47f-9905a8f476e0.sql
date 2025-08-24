-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.update_link_ref_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;