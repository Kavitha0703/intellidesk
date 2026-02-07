-- Add database constraints for input validation to enforce data integrity server-side
-- This prevents bypassing client-side validation

-- Complaints table constraints
ALTER TABLE public.complaints 
  ADD CONSTRAINT check_description_length 
    CHECK (length(description) >= 10 AND length(description) <= 5000);

ALTER TABLE public.complaints 
  ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.complaints 
  ADD CONSTRAINT check_user_name_length 
    CHECK (length(user_name) >= 1 AND length(user_name) <= 100);

ALTER TABLE public.complaints 
  ADD CONSTRAINT check_other_issue_length 
    CHECK (other_issue IS NULL OR length(other_issue) <= 200);

ALTER TABLE public.complaints 
  ADD CONSTRAINT check_admin_comment_length 
    CHECK (admin_comment IS NULL OR length(admin_comment) <= 2000);

-- Feedback table constraints
ALTER TABLE public.feedback 
  ADD CONSTRAINT check_message_length 
    CHECK (length(message) >= 10 AND length(message) <= 2000);

ALTER TABLE public.feedback 
  ADD CONSTRAINT check_feedback_user_name_length 
    CHECK (length(user_name) >= 1 AND length(user_name) <= 100);

-- Notices table constraints
ALTER TABLE public.notices 
  ADD CONSTRAINT check_title_length 
    CHECK (length(title) >= 1 AND length(title) <= 200);

ALTER TABLE public.notices 
  ADD CONSTRAINT check_notice_message_length 
    CHECK (length(message) >= 1 AND length(message) <= 5000);

-- Profiles table constraints
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_profile_name_length 
    CHECK (length(name) >= 1 AND length(name) <= 100);

ALTER TABLE public.profiles 
  ADD CONSTRAINT check_profile_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');