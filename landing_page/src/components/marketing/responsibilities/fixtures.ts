import { PrioritySignal, CalendarBlock, AdaptationSignal } from './types';

export const PRIORITY_SIGNALS_FIXTURE: PrioritySignal[] = [
  {
    id: 'signal-goals',
    iconType: 'target',
    label: 'Goals',
    value: 'Product launch',
  },
  {
    id: 'signal-deadline',
    iconType: 'calendar',
    label: 'Deadline',
    value: 'Apr 25, 2025',
  },
  {
    id: 'signal-capacity',
    iconType: 'capacity',
    label: 'Capacity',
    value: '20 hrs this week',
  },
];

export const CALENDAR_DAYS_FIXTURE = [
  { name: 'Mon', date: '21', dayIndex: 0 },
  { name: 'Tue', date: '22', dayIndex: 1 },
  { name: 'Wed', date: '23', dayIndex: 2 },
  { name: 'Thu', date: '24', dayIndex: 3 },
  { name: 'Fri', date: '25', dayIndex: 4 },
];

export const CALENDAR_HOURS_FIXTURE = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM'];

export const CALENDAR_BLOCKS_FIXTURE: CalendarBlock[] = [
  {
    id: 'block-deep-work',
    dayIndex: 0,
    title: 'Deep work',
    timeRange: '9–11',
    startHour: 9,
    durationHours: 2,
    variant: 'fixed',
  },
  {
    id: 'block-team-sync',
    dayIndex: 0,
    title: 'Team sync',
    timeRange: '11–12',
    startHour: 11,
    durationHours: 1,
    variant: 'highlight', // Lime highlight
  },
  {
    id: 'block-planning',
    dayIndex: 0,
    title: 'Planning',
    timeRange: '1–2',
    startHour: 13,
    durationHours: 1,
    variant: 'flexible',
  },
  {
    id: 'block-build',
    dayIndex: 1,
    title: 'Build',
    timeRange: '1–4',
    startHour: 13,
    durationHours: 3,
    variant: 'fixed',
  },
  {
    id: 'block-gym',
    dayIndex: 2,
    title: 'Gym',
    timeRange: '9–10',
    startHour: 9,
    durationHours: 1,
    variant: 'purple',
  },
  {
    id: 'block-design',
    dayIndex: 2,
    title: 'Design',
    timeRange: '10–12',
    startHour: 10,
    durationHours: 2,
    variant: 'fixed',
  },
  {
    id: 'block-product-review',
    dayIndex: 3,
    title: 'Product review',
    timeRange: '10–11',
    startHour: 10,
    durationHours: 1,
    variant: 'fixed',
  },
  {
    id: 'block-customer-calls',
    dayIndex: 3,
    title: 'Customer calls',
    timeRange: '1–3',
    startHour: 13,
    durationHours: 2,
    variant: 'fixed',
  },
  {
    id: 'block-write',
    dayIndex: 4,
    title: 'Write',
    timeRange: '3–5',
    startHour: 15,
    durationHours: 2,
    variant: 'flexible',
  },
];

export const ADAPTATION_SIGNALS_FIXTURE: AdaptationSignal[] = [
  {
    id: 'adapt-urgent',
    iconType: 'urgent',
    label: 'New urgent task',
    detail: 'Client request',
    time: 'Today, 2:00 PM',
  },
  {
    id: 'adapt-moved',
    iconType: 'moved',
    label: 'Moved to make space',
    detail: 'Write blog post',
    time: 'Tomorrow, 3:00 PM',
  },
];
