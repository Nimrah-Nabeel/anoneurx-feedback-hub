DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit valid feedback" ON public.feedback
FOR INSERT TO anon, authenticated
WITH CHECK (
  project = 'lynx'
  AND category IN ('bug','feature','search_quality','privacy','other')
  AND rating BETWEEN 1 AND 5
  AND char_length(btrim(message)) BETWEEN 1 AND 4000
  AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND created_at >= now() - interval '1 minute' AND created_at <= now() + interval '1 minute'
);