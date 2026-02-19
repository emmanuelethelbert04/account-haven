import { supabase } from './supabase';

/**
 * Send a notification email by invoking the edge function directly.
 * Use this as a fallback when database triggers cannot reach the edge function
 * (e.g., missing app.settings configuration).
 */
export async function sendNotificationEmail(
  eventType: string,
  record: Record<string, unknown>,
  oldRecord?: Record<string, unknown>
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        event_type: eventType,
        record,
        old_record: oldRecord || null,
      },
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error invoking notification email function:', err);
    return { success: false, error: err };
  }
}
