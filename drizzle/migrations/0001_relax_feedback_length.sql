ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_message_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_message_check CHECK (char_length(message) BETWEEN 1 AND 4000);