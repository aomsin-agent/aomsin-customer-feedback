-- Create policies to allow reading reference data for category_ref table
CREATE POLICY "Allow public read access for category_ref" 
ON public.category_ref 
FOR SELECT 
USING (true);

-- Create policies to allow reading reference data for branch_ref table
CREATE POLICY "Allow public read access for branch_ref" 
ON public.branch_ref 
FOR SELECT 
USING (true);

-- Create policies to allow reading reference data for raw_comment table
CREATE POLICY "Allow public read access for raw_comment" 
ON public.raw_comment 
FOR SELECT 
USING (true);

-- Create policies to allow reading reference data for sentence_category table
CREATE POLICY "Allow public read access for sentence_category" 
ON public.sentence_category 
FOR SELECT 
USING (true);