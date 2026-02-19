-- Email Notification Database Triggers
-- Run this SQL in your Supabase SQL editor to set up automatic email notifications.
--
-- Prerequisites:
--   1. Deploy the send-notification-email edge function
--   2. Set RESEND_API_KEY and ADMIN_EMAIL as Supabase secrets
--   3. Configure app.settings.supabase_url and app.settings.service_role_key
--      OR use the frontend fallback (notifications are sent from app code)

-- Enable pg_net extension for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper function to invoke the edge function
CREATE OR REPLACE FUNCTION notify_email_event(
  event_type TEXT,
  record JSONB,
  old_record JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  IF supabase_url IS NULL OR supabase_url = '' THEN
    RAISE NOTICE 'Supabase URL not configured. Email skipped for: %', event_type;
    RETURN;
  END IF;

  edge_function_url := supabase_url || '/functions/v1/send-notification-email';

  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'event_type', event_type,
      'record', record,
      'old_record', old_record
    )
  );
END;
$$;

-- Trigger: Welcome email on new profile
CREATE OR REPLACE FUNCTION trigger_welcome_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM notify_email_event('user_created', to_jsonb(NEW));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON profiles FOR EACH ROW
  EXECUTE FUNCTION trigger_welcome_email();

-- Trigger: Email on new order
CREATE OR REPLACE FUNCTION trigger_order_created_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM notify_email_event('order_created', to_jsonb(NEW));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created_send_email ON orders;
CREATE TRIGGER on_order_created_send_email
  AFTER INSERT ON orders FOR EACH ROW
  EXECUTE FUNCTION trigger_order_created_email();

-- Trigger: Email on order status change
CREATE OR REPLACE FUNCTION trigger_order_status_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'payment_submitted' THEN
      PERFORM notify_email_event('order_payment_submitted', to_jsonb(NEW), to_jsonb(OLD));
    END IF;
    IF NEW.status = 'delivered' THEN
      PERFORM notify_email_event('order_delivered', to_jsonb(NEW), to_jsonb(OLD));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_status_change_send_email ON orders;
CREATE TRIGGER on_order_status_change_send_email
  AFTER UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION trigger_order_status_email();
