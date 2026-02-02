-- Insert initial admin role for testing
-- Note: You'll need to first sign up a user, then manually run this to make them admin
-- This creates a function that can be called to promote a user to admin

CREATE OR REPLACE FUNCTION public.promote_to_admin(_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user ID from profiles by email
  SELECT id INTO _user_id FROM public.profiles WHERE email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Update profile status to approved
  UPDATE public.profiles SET status = 'approved' WHERE id = _user_id;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
  
  -- Delete any 'user' role if exists
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'user';
END;
$$;