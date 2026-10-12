/**
 * Domain types for Dots schedules, items, and execution states.
 */

export type DomainStatus =
  | 'protected'
  | 'flexible'
  | 'routine'
  | 'proposed'
  | 'moved'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'overdue'
  | 'unavailable';

export interface ScheduleItem {
  id: string;
  title: string;
  subtitle?: string;
  startTime: string; // "10:00" or "Tomorrow 09:30"
  endTime?: string;   // "11:30"
  durationMinutes: number;
  status: DomainStatus;
  category: 'fixed' | 'focus' | 'routine' | 'urgent';
  reason?: string;
  isUrgent?: boolean;
}

export interface DayCapacity {
  totalHours: number;
  availableHours: number;
  protectedHours: number;
  flexibleHours: number;
  realityBufferHours: number;
}

export interface ScheduleDay {
  date: string;       // "2026-10-14"
  dayName: string;    // "Tuesday, Oct 14"
  capacity: DayCapacity;
  items: ScheduleItem[];
  activeProposalCount: number;
}
