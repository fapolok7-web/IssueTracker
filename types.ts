
export type Priority = string;
export type Status = string;
export type IssueType = string;
export type SystemType = string;

export interface SettingItem {
  id: string;
  category: 'issue_type' | 'priority' | 'status' | 'assigned_person' | 'system_name';
  name: string;
  created_at: string;
}

export interface Issue {
  id: string;
  client_name: string;
  issue_date: string;
  issue_type: IssueType;
  priority: Priority;
  status: Status;
  assigned_person: string;
  issue_details: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyEntry {
  id: string;
  month: string; // YYYY-MM
  total_issues: number;
  system_bugs: number;
  device_issues: number;
  awareness: number;
  help_requests: number;
  created_at: string;
}

export interface SystemDowntime {
  id: string;
  date: string;
  system_name: SystemType;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  created_at: string;
}

export interface UptimeSettings {
  id: string;
  target_url: string;
  check_interval_seconds: number;
  updated_at: string;
}

export interface UptimeLog {
  id: string;
  timestamp: string;
  http_status: number | null;
  response_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  status: 'UP' | 'DOWN';
  incident_state: 'NONE' | 'NEW INCIDENT' | 'ONGOING INCIDENT' | 'RECOVERED';
  alert_required: boolean;
  recovery_notice: boolean;
  message: string;
  summary: string;
}

export type ViewType =
  | 'Dashboard'
  | 'IssueEntry'
  | 'IssueReports'
  | 'MonthlyEntry'
  | 'MonthlyReports'
  | 'UptimeMonitoring'
  | 'DowntimeEntry'
  | 'DowntimeReports'
  | 'Settings';
