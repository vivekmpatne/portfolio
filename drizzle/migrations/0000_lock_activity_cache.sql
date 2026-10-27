DROP POLICY IF EXISTS "Public can read activity cache" ON public.activity_cache;
REVOKE ALL ON public.activity_cache FROM anon, authenticated;
GRANT ALL ON public.activity_cache TO service_role;