-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read brands" ON public.brands;
DROP POLICY IF EXISTS "Users can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Users can update brands" ON public.brands;
DROP POLICY IF EXISTS "Users can delete brands" ON public.brands;

-- Drop existing certificate policies
DROP POLICY IF EXISTS "Anyone can read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;

-- Create new policies that allow all operations (for manual auth system)
CREATE POLICY "Enable all access for brands" ON public.brands
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for certificates" ON public.certificates
  FOR ALL USING (true) WITH CHECK (true);