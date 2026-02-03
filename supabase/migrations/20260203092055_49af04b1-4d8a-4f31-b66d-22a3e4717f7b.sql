-- Remove approval-based restrictions from RLS policies
-- Drop existing policies that use is_approved()

-- Complaints table
DROP POLICY IF EXISTS "Approved users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can update their own pending complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can delete their own pending complaints" ON public.complaints;

-- Create simpler policies without approval checks
CREATE POLICY "Users can create complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending complaints" 
ON public.complaints 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'Pending'::complaint_status);

CREATE POLICY "Users can delete their own pending complaints" 
ON public.complaints 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'Pending'::complaint_status);

-- Feedback table
DROP POLICY IF EXISTS "Approved users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

CREATE POLICY "Users can submit feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Remove status column from profiles (no longer needed)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS status;

-- Drop the user_status enum if not used elsewhere
DROP TYPE IF EXISTS public.user_status;

-- Drop the is_approved function (no longer needed)
DROP FUNCTION IF EXISTS public.is_approved(uuid);

-- Update handle_new_user to not set status and accept role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;