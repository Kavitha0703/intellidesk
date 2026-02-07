-- Fix 1: Update storage policy to enforce folder ownership
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Authenticated users can upload complaint images" ON storage.objects;

-- Create new policy that enforces users can only upload to their own folder
CREATE POLICY "Users can only upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix 2: Set file size limit on the bucket (5MB)
UPDATE storage.buckets 
SET file_size_limit = 5242880
WHERE id = 'complaint-images';

-- Add allowed MIME types for images only
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'complaint-images';

-- Fix 3: Recreate has_role function with explicit schema qualification for defense in depth
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE public.user_roles.user_id = _user_id
      AND public.user_roles.role = _role
  )
$$;

-- Fix 4: Recreate promote_to_admin with consistent search_path syntax and explicit schema qualification
CREATE OR REPLACE FUNCTION public.promote_to_admin(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- SECURITY: Only allow admins to promote users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can promote users to admin role';
  END IF;

  -- Get user ID from profiles by email
  SELECT id INTO _user_id FROM public.profiles WHERE public.profiles.email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
  
  -- Delete any 'user' role if exists
  DELETE FROM public.user_roles WHERE public.user_roles.user_id = _user_id AND public.user_roles.role = 'user';
END;
$$;

-- Fix 5: Recreate handle_new_user with explicit schema qualification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to 'user'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user'::app_role);
  
  -- Create profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  
  -- Assign role based on registration choice
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;