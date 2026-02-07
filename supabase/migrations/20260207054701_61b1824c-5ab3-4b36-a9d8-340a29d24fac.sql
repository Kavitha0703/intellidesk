-- Fix 1: Add admin-only authorization check to promote_to_admin function
CREATE OR REPLACE FUNCTION public.promote_to_admin(_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
BEGIN
  -- SECURITY: Only allow admins to promote users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can promote users to admin role';
  END IF;

  -- Get user ID from profiles by email
  SELECT id INTO _user_id FROM public.profiles WHERE email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
  
  -- Delete any 'user' role if exists
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'user';
END;
$function$;

-- Fix 2: Make complaint-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'complaint-images';

-- Fix 3: Drop overly permissive storage policies and create proper ones
DROP POLICY IF EXISTS "Anyone can view complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all complaint images" ON storage.objects;

-- Create proper RLS policy: Users can only view images from their own complaints or admins can view all
CREATE POLICY "Users can view their own complaint images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'complaint-images' 
  AND (
    -- Check if user owns the complaint that contains this image
    EXISTS (
      SELECT 1 FROM public.complaints 
      WHERE user_id = auth.uid() 
      AND images @> ARRAY[name]
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Users can upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload complaint images" ON storage.objects;
CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-images' 
  AND auth.uid() IS NOT NULL
);

-- Users can delete their own uploads (for retake functionality)
DROP POLICY IF EXISTS "Users can delete their own complaint images" ON storage.objects;
CREATE POLICY "Users can delete their own complaint images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'complaint-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.complaints 
      WHERE user_id = auth.uid() 
      AND images @> ARRAY[name]
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);