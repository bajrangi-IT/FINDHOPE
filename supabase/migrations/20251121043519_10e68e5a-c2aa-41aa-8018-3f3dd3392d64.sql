-- Add optional fields to cases table
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS social_media_links text,
ADD COLUMN IF NOT EXISTS qr_code_link text,
ADD COLUMN IF NOT EXISTS health_notes text,
ADD COLUMN IF NOT EXISTS full_body_photo_url text,
ADD COLUMN IF NOT EXISTS last_online_activity text,
ADD COLUMN IF NOT EXISTS recovered_belongings text,
ADD COLUMN IF NOT EXISTS known_routes text,
ADD COLUMN IF NOT EXISTS community_contacts text,
ADD COLUMN IF NOT EXISTS cctv_footage_info text;