// Database row types (snake_case matches Supabase columns)

export interface User {
  id: string;
  phone_number: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  notification_radius: number; // miles; -1 = unlimited
  is_verified: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string; // WCA competition ID e.g. "BostonSpring2026"
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string; // ISO date
  end_date: string;
  events: string[];
  information: string | null;
  website_url: string | null;
  is_canceled: boolean;
  announced_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  competition_id: string;
  sent_at: string;
}

export interface CronLog {
  id: string;
  run_at: string;
  competitions_found: number;
  competitions_new: number;
  notifications_sent: number;
  error: string | null;
  status: "success" | "error" | "partial";
}

// WCA REST API response types
export interface WcaCompetition {
  id: string;
  name: string;
  city: string;
  country: string;
  date: {
    from: string;
    till: string;
    numberOfDays: number;
  };
  isCanceled: boolean;
  events: string[];
  wcaDelegates: { name: string; email: string }[];
  organisers: { name: string; email: string }[];
  venue: {
    name: string;
    address: string;
    details: string | null;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  information: string | null;
  externalWebsite: string | null;
}

export interface WcaApiResponse {
  pagination: {
    page: number;
    size: number;
  };
  total: number;
  items: WcaCompetition[];
}

// App-level types
export const NOTIFICATION_RADII = [25, 50, 100, 250, -1] as const;
export type NotificationRadius = (typeof NOTIFICATION_RADII)[number];

export const RADIUS_LABELS: Record<number, string> = {
  25: "25 miles",
  50: "50 miles",
  100: "100 miles",
  250: "250 miles",
  [-1]: "Anywhere",
};

export interface RegisterPayload {
  phone_number: string;
  city: string;
  state: string;
  country: string;
  notification_radius: number;
}

export interface UpdateUserPayload {
  phone_number?: string;
  city?: string;
  state?: string;
  country?: string;
  notification_radius?: number;
  is_paused?: boolean;
}

export interface VerifyOtpPayload {
  phone_number: string;
  code: string;
}

export interface AdminStats {
  total_users: number;
  verified_users: number;
  active_users: number;
  total_competitions: number;
  total_notifications: number;
  recent_competitions: Competition[];
  recent_cron_logs: CronLog[];
}
