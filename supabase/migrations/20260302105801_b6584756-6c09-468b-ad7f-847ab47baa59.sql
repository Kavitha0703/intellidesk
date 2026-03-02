-- Add image_notes column to store notes per image path
-- Format: {"image_path": "note text", ...}
ALTER TABLE public.complaints ADD COLUMN image_notes jsonb DEFAULT '{}'::jsonb;