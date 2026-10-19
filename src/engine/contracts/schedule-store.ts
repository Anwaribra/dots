import type {
  ScheduleItem,
  WorkItemCandidate,
  AvailabilitySlot,
  FixedEventItem,
  TimeBudgetItem,
  RoutineItem,
  CapacitySettings,
  DependencyEdge
} from '../types'
import { DEFAULT_CAPACITY_SETTINGS } from '../capacity'

export interface IScheduleStore {
  getCurrentSchedule(date: string): ScheduleItem[]
  commitSchedule(date: string, items: ScheduleItem[], summary?: string): void
  getCandidateWorkItems(): WorkItemCandidate[]
  addWorkItem(item: WorkItemCandidate): void
  getAvailability(date: string): AvailabilitySlot[]
  getFixedEvents(date: string): FixedEventItem[]
  getTimeBudgets(): TimeBudgetItem[]
  getRoutines(): RoutineItem[]
  getDependencies(): DependencyEdge[]
  getCapacitySettings(): CapacitySettings
}

export class InMemoryScheduleStore implements IScheduleStore {
  private schedules: Map<string, ScheduleItem[]> = new Map()
  private workItems: Map<string, WorkItemCandidate> = new Map()
  private availability: Map<string, AvailabilitySlot[]> = new Map()
  private fixedEvents: Map<string, FixedEventItem[]> = new Map()
  private timeBudgets: TimeBudgetItem[] = []
  private routines: RoutineItem[] = []
  private dependencies: DependencyEdge[] = []
  private capacitySettings: CapacitySettings = { ...DEFAULT_CAPACITY_SETTINGS }
  public history: { date: string; timestamp: number; summary: string; items: ScheduleItem[] }[] = []

  constructor(initialData?: {
    schedules?: Record<string, ScheduleItem[]>
    workItems?: WorkItemCandidate[]
    availability?: Record<string, AvailabilitySlot[]>
    fixedEvents?: Record<string, FixedEventItem[]>
    timeBudgets?: TimeBudgetItem[]
    routines?: RoutineItem[]
    dependencies?: DependencyEdge[]
    capacitySettings?: CapacitySettings
  }) {
    if (initialData) {
      if (initialData.schedules) {
        for (const [d, items] of Object.entries(initialData.schedules)) {
          this.schedules.set(d, [...items])
        }
      }
      if (initialData.workItems) {
        for (const item of initialData.workItems) {
          this.workItems.set(item.id, { ...item })
        }
      }
      if (initialData.availability) {
        for (const [d, slots] of Object.entries(initialData.availability)) {
          this.availability.set(d, [...slots])
        }
      }
      if (initialData.fixedEvents) {
        for (const [d, events] of Object.entries(initialData.fixedEvents)) {
          this.fixedEvents.set(d, [...events])
        }
      }
      if (initialData.timeBudgets) this.timeBudgets = [...initialData.timeBudgets]
      if (initialData.routines) this.routines = [...initialData.routines]
      if (initialData.dependencies) this.dependencies = [...initialData.dependencies]
      if (initialData.capacitySettings) this.capacitySettings = { ...initialData.capacitySettings }
    }
  }

  getCurrentSchedule(date: string): ScheduleItem[] {
    return [...(this.schedules.get(date) || [])]
  }

  commitSchedule(date: string, items: ScheduleItem[], summary = 'Schedule updated'): void {
    this.schedules.set(date, [...items])
    this.history.push({
      date,
      timestamp: Date.now(),
      summary,
      items: [...items]
    })
  }

  getCandidateWorkItems(): WorkItemCandidate[] {
    return Array.from(this.workItems.values())
  }

  addWorkItem(item: WorkItemCandidate): void {
    this.workItems.set(item.id, { ...item })
  }

  getAvailability(date: string): AvailabilitySlot[] {
    return this.availability.get(date) || [
      { date, startTime: '09:00', endTime: '17:00', availableMinutes: 480 }
    ]
  }

  setAvailability(date: string, slots: AvailabilitySlot[]): void {
    this.availability.set(date, [...slots])
  }

  getFixedEvents(date: string): FixedEventItem[] {
    return this.fixedEvents.get(date) || []
  }

  setFixedEvents(date: string, events: FixedEventItem[]): void {
    this.fixedEvents.set(date, [...events])
  }

  getTimeBudgets(): TimeBudgetItem[] {
    return [...this.timeBudgets]
  }

  getRoutines(): RoutineItem[] {
    return [...this.routines]
  }

  getDependencies(): DependencyEdge[] {
    return [...this.dependencies]
  }

  getCapacitySettings(): CapacitySettings {
    return { ...this.capacitySettings }
  }

  setCapacitySettings(settings: CapacitySettings): void {
    this.capacitySettings = { ...settings }
  }
}
