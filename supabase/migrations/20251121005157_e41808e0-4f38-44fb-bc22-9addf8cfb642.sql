-- Add reward amount to cases table
ALTER TABLE public.cases ADD COLUMN reward_amount numeric DEFAULT 0;

-- Create messages table for anonymous chat
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_anonymous boolean DEFAULT true
);

-- Create volunteers table
CREATE TABLE public.volunteers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  area text NOT NULL,
  latitude numeric,
  longitude numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create camera sightings table for CCTV detections
CREATE TABLE public.camera_sightings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  camera_location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  image_url text,
  confidence_score numeric,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  volunteer_notified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create case subscribers table for alerts
CREATE TABLE public.case_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(case_id, email)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages (anyone can view, authenticated users can send)
CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for volunteers
CREATE POLICY "Anyone can view active volunteers" ON public.volunteers FOR SELECT USING (is_active = true);
CREATE POLICY "Volunteers can update their own profile" ON public.volunteers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can register as volunteers" ON public.volunteers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for camera sightings
CREATE POLICY "Anyone can view sightings" ON public.camera_sightings FOR SELECT USING (true);
CREATE POLICY "Admins can manage sightings" ON public.camera_sightings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for case subscribers
CREATE POLICY "Users can view their subscriptions" ON public.case_subscribers FOR SELECT USING (true);
CREATE POLICY "Anyone can subscribe to case updates" ON public.case_subscribers FOR INSERT WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.camera_sightings;

-- Function to notify subscribers when case is updated
CREATE OR REPLACE FUNCTION notify_case_subscribers()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by an edge function
  PERFORM pg_notify('case_updated', json_build_object(
    'case_id', NEW.id,
    'status', NEW.status,
    'priority', NEW.priority
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_update_notification
AFTER UPDATE ON public.cases
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.priority IS DISTINCT FROM NEW.priority)
EXECUTE FUNCTION notify_case_subscribers();