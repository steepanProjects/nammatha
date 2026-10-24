export interface Sprint {
  id: number;
  sprint_number: number;
  title: string;
  total_days: number;
  status: 'current' | 'upcoming' | 'completed';
  total_days_count: number;
  active_days: number;
  total_tasks: number;
  completed_tasks: number;
  total_est_minutes: number;
}

export interface Day {
  id: number;
  sprint_id: number;
  day_number: number;
  is_day_off: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface Task {
  id: number;
  day_id: number;
  task_order: number;
  title: string;
  est_minutes: number | null;
  is_completed: number;
  completed_at: string | null;
  is_revision: number;
  day_number?: number;
  sprint_number?: number;
  sprint_title?: string;
}

export interface ProjectMeta {
  project_name: string;
  started_on: string;
  est_completion: string;
}
