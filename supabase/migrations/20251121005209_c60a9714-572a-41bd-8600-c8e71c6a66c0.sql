-- Fix function security: Set search_path for notify_case_subscribers
CREATE OR REPLACE FUNCTION notify_case_subscribers()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('case_updated', json_build_object(
    'case_id', NEW.id,
    'status', NEW.status,
    'priority', NEW.priority
  )::text);
  RETURN NEW;
END;
$$;