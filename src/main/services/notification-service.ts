import { Notification } from 'electron'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/database'
import { habits, habitLogs, routines, scheduledItems } from '../db/schema'
import { getSettings } from './settings-service'
import { getDueReviewsList } from './review-service'

const recentNotifications = new Map<string, number>()
const DEDUPE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export function showDesktopNotification(title: string, body: string, key?: string): void {
  const dedupeKey = key || `${title}:${body}`
  const now = Date.now()
  const lastSent = recentNotifications.get(dedupeKey)

  if (lastSent && now - lastSent < DEDUPE_WINDOW_MS) {
    // Suppress duplicate within window
    return
  }

  recentNotifications.set(dedupeKey, now)

  if (Notification.isSupported()) {
    const notif = new Notification({
      title,
      body,
      silent: false
    })
    notif.show()
  }
}

let schedulerTimer: NodeJS.Timeout | null = null

function getMinuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Checks triggers and emits notifications if conditions are met.
 */
export function checkAndTriggerNotifications(): void {
  try {
    const settings = getSettings()
    if (!settings.notificationsEnabled) return

    const now = new Date()
    const todayStr = formatDateString(now)
    const timeStr = formatTimeString(now)
    const currentMinute = getMinuteOfDay(now)
    const leadTime = (settings as any).notificationLeadTimeMinutes ?? 5

    const db = getDatabase()

    // 1. Scheduled item start reminders (within leadTime minutes)
    const todaysScheduled = db
      .select({
        id: scheduledItems.id,
        title: scheduledItems.title,
        startTime: scheduledItems.startTime
      })
      .from(scheduledItems)
      .where(eq(scheduledItems.date, todayStr))
      .all()

    for (const item of todaysScheduled) {
      if (!item.startTime) continue
      const [sh, sm] = item.startTime.split(':').map(Number)
      if (Number.isNaN(sh) || Number.isNaN(sm)) continue
      const itemStartMinute = sh * 60 + sm
      const diff = itemStartMinute - currentMinute
      if (diff >= 0 && diff <= leadTime) {
        showDesktopNotification(
          'Upcoming Task',
          diff === 0 ? `Starting now: "${item.title}"` : `Starting in ${diff}m: "${item.title}"`,
          `sched:${item.id}:${todayStr}`
        )
      }
    }

    // 2. Routine start reminders
    const activeRoutines = db
      .select({ id: routines.id, name: routines.name, preferredTime: routines.preferredTime })
      .from(routines)
      .where(eq(routines.active, true))
      .all()

    for (const r of activeRoutines) {
      if (r.preferredTime && r.preferredTime === timeStr) {
        showDesktopNotification(
          'Routine Reminder',
          `Time for routine: "${r.name}"`,
          `routine:${r.id}:${todayStr}`
        )
      }
    }

    // 3. Habit reminder (Evening check between 17:00 and 20:00)
    if (now.getHours() >= 17 && now.getHours() <= 20) {
      const activeHabits = db.select({ id: habits.id, name: habits.name }).from(habits).all()
      if (activeHabits.length > 0) {
        const loggedToday = db
          .select({ habitId: habitLogs.habitId })
          .from(habitLogs)
          .where(eq(habitLogs.date, todayStr))
          .all()
        const loggedSet = new Set(loggedToday.map((l) => l.habitId))
        const remainingCount = activeHabits.filter((h) => !loggedSet.has(h.id)).length

        if (remainingCount > 0) {
          showDesktopNotification(
            'Habit Reminder',
            `You have ${remainingCount} habits remaining to complete today.`,
            `habits:${todayStr}`
          )
        }
      }
    }

    // 4. Due review items reminder (once a day in the afternoon)
    if (now.getHours() >= 10 && now.getHours() <= 18) {
      const dueReviewsResult = getDueReviewsList(Date.now())
      const totalDue = dueReviewsResult.allDueOrOverdue.length
      if (totalDue > 0) {
        showDesktopNotification(
          'Spaced Reviews Due',
          `${totalDue} items are due for spaced repetition review today.`,
          `reviews:${todayStr}`
        )
      }
    }

    // 5. Daily Planning Prompt (default 08:00)
    const planPromptTime = (settings as any).dailyPlanningPromptTime ?? '08:00'
    if (timeStr === planPromptTime) {
      showDesktopNotification(
        'Daily Planning',
        'Good morning! Take a moment to review and plan your schedule for today.',
        `daily-plan:${todayStr}`
      )
    }

    // 6. Daily Wrap-up Prompt (default 18:00)
    const wrapupPromptTime = (settings as any).dailyWrapupPromptTime ?? '18:00'
    if (timeStr === wrapupPromptTime) {
      showDesktopNotification(
        'Daily Wrap-up',
        'Time for daily wrap-up: check off completed work and reflect on your progress.',
        `daily-wrapup:${todayStr}`
      )
    }
  } catch (err) {
    console.error('Error during notification check:', err)
  }
}

/**
 * Starts background notification interval (every 60 seconds).
 */
export function startNotificationScheduler(): void {
  if (schedulerTimer) return
  // Run once on startup
  checkAndTriggerNotifications()
  // Run every 60 seconds
  schedulerTimer = setInterval(() => {
    checkAndTriggerNotifications()
  }, 60 * 1000)
}

export function stopNotificationScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
  }
}
