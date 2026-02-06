-- Add images column to complaints table
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for complaint images bucket
-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view complaint images (public bucket)
CREATE POLICY "Anyone can view complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own complaint images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'complaint-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);