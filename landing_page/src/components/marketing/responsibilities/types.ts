export type PriorityIconType = 'target' | 'calendar' | 'capacity';

export interface PrioritySignal {
  id: string;
  iconType: PriorityIconType;
  label: string;
  value: string;
}

export type CalendarBlockVariant = 'fixed' | 'flexible' | 'highlight' | 'purple';

export interface CalendarBlock {
  id: string;
  dayIndex: number; // 0: Mon 21, 1: Tue 22, 2: Wed 23, 3: Thu 24, 4: Fri 25
  title: string;
  timeRange: string;
  startHour: number; // e.g. 9, 10, 11, 13, 14, 15
  durationHours: number; // e.g. 1, 2, 3
  variant: CalendarBlockVariant;
}

export type AdaptationIconType = 'urgent' | 'moved';

export interface AdaptationSignal {
  id: string;
  iconType: AdaptationIconType;
  label: string;
  detail: string;
  time: string;
}
