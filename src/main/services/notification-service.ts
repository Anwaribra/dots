import { Notification } from 'electron'

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
