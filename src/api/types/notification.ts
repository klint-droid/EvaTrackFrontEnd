import type { User } from './user';
import type { Household } from './household';
import type { UrgencyLevel } from './urgencyLevel';

/**
 * Represents an individual target recipient record for an alert.
 * Maps the notification to a specific household and tracks read and acknowledgement timestamps.
 */
export interface NotificationRecipient {
  id: number;
  notification_id: number;
  household_id: string;
  read_at: string | null;
  acknowledged_at: string | null;
  household: Household;
}

/**
 * Represents a system delivery channel option (e.g., SMS, Push Notification, Email).
 */
export interface NotificationChannel {
  channel_id: number;
  channel_key: string;
  channel_label: string;
}

/**
 * Represents the status of a specific delivery log (e.g., sent, failed, pending).
 */
export interface NotificationStatus {
  status_id: number;
  status_key: string;
  status_label: string;
}

/**
 * Represents an individual delivery log record, tracking the communication channel,
 * delivery status, retry count, and external SMS/Push gateway message IDs.
 */
export interface NotificationLog {
  log_id: number;
  notification_id: number;
  household_id: string | null;
  channel_id: number;
  status_id: number;
  sent_at: string | null;
  retry_count: number | null;
  external_message_id: string | null;
  channel: string | null; 
  status: string | null;
}

/**
 * Base properties shared by all notification objects in the system.
 * Houses all the core columns from the `notifications` table, keeping the code DRY (Don't Repeat Yourself).
 */
export interface NotificationBase {
  notif_id: number;
  message: string | null;
  sent_by: string | null;
  evacuation_event_id: string | null;
  evacuation_center_id: string | null;
  urgency_level_id: number | null;
  scheduled_at: string | null;
  is_recurring: boolean;
  recurrence_type_id: number | null;
  recurrence_end_at: string | null;
  last_sent_at: string | null;
  created_at: string | null;
  channel: string | null;
  status: 'sent' | 'failed' | 'scheduled' | 'pending' | 'cancelled' | null;
  target_filter: string | null;
  recurrence_type: string | null;
  sender: User | null;
  urgency_level: UrgencyLevel | null;
}

/**
 * Represents a detailed view of a single notification.
 * Eager-loads all associated recipients and delivery logs. Used in the Alert Details Modal.
 */
export interface NotificationDetail extends NotificationBase {
  recipients: NotificationRecipient[];
  logs: NotificationLog[];
}

/**
 * Generic paginated response wrapper mapping Laravel's standard LengthAwarePaginator format.
 * Generically typed so it can be reused for other paginated endpoints across the system.
 */
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

/**
 * A lightweight notification object returned inside a paginated list API response.
 * Excludes heavy recipient lists/logs to optimize performance, but includes the recipient count.
 */
export interface NotificationItem extends NotificationBase {
  recipients_count?: number; 
}
