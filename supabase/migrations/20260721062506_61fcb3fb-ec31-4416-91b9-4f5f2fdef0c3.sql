
CREATE TABLE public.activity_cache (
  platform text NOT NULL,
  username text NOT NULL,
  year int NOT NULL,
  calendar jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (platform, username, year)
);

GRANT SELECT ON public.activity_cache TO anon, authenticated;
GRANT ALL ON public.activity_cache TO service_role;

ALTER TABLE public.activity_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read activity cache"
  ON public.activity_cache FOR SELECT
  TO anon, authenticated
  USING (true);
-- No INSERT/UPDATE/DELETE policies: only service_role (server functions) can write.

CREATE OR REPLACE FUNCTION public.touch_activity_cache_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER activity_cache_touch_updated_at
  BEFORE UPDATE ON public.activity_cache
  FOR EACH ROW EXECUTE FUNCTION public.touch_activity_cache_updated_at();
