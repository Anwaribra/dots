import type { TaskCaptureInput } from '../../engine/types'

export type ParseTaskResult =
  | { type: 'task'; task: TaskCaptureInput; targetDate: string }
  | { type: 'clarification'; message: string }
  | { type: 'greeting'; message: string }

function formatDateInTimezone(d: Date, timezone = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const parts = formatter.formatToParts(d)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    return `${map.year}-${map.month}-${map.day}`
  } catch {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

function getTomorrowInTimezone(d: Date, timezone = 'UTC'): string {
  const tomorrow = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  return formatDateInTimezone(tomorrow, timezone)
}

export function parseTelegramTaskText(
  text: string,
  referenceDate = new Date(),
  userTimezone = 'UTC'
): ParseTaskResult {
  const trimmed = text.trim()

  if (!trimmed) {
    return {
      type: 'clarification',
      message: 'Please send a task description, for example: "Review architecture design for 45 mins tomorrow"'
    }
  }

  // Greetings & Help
  const lower = trimmed.toLowerCase()
  if (['/start', 'start', 'hello', 'hi', 'hey', 'help', '/help'].includes(lower)) {
    return {
      type: 'greeting',
      message:
        '👋 Welcome to **Dots**.\n\nSend me any task in plain text, and I will check your capacity and propose an optimal schedule block with reality buffers.\n\nExamples:\n• "Draft investor deck 90m tomorrow high priority"\n• "Urgent bugfix for production 45m today"\n• "Team sync 30m at 14:00"'
    }
  }

  // Check for vague commands that need clarification
  if (['add', 'schedule', 'new task', 'urgent', 'replan', 'task'].includes(lower)) {
    return {
      type: 'clarification',
      message: 'What task would you like to schedule? (e.g. "Prepare client demo for 60m today")'
    }
  }

  // 1. Extract Duration (e.g. 45m, 1h, 1.5h, 30 mins, 2 hours)
  let estimatedMinutes = 30
  let workingText = trimmed

  const hourMatch = workingText.match(/\b(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i)
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1])
    estimatedMinutes = Math.round(hours * 60)
    workingText = workingText.replace(hourMatch[0], ' ')
  } else {
    const minMatch = workingText.match(/\b(\d+)\s*(?:m|min|mins|minute|minutes)\b/i)
    if (minMatch) {
      estimatedMinutes = parseInt(minMatch[1], 10)
      workingText = workingText.replace(minMatch[0], ' ')
    }
  }

  // 2. Extract Priority
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  if (/\b(?:urgent|critical|emergency|asap)\b/i.test(workingText)) {
    priority = 'critical'
    workingText = workingText.replace(/\b(?:urgent|critical|emergency|asap)\b/gi, ' ')
  } else if (/\b(?:high\s+priority|important|high)\b/i.test(workingText)) {
    priority = 'high'
    workingText = workingText.replace(/\b(?:high\s+priority|important|high)\b/gi, ' ')
  } else if (/\b(?:low\s+priority|low)\b/i.test(workingText)) {
    priority = 'low'
    workingText = workingText.replace(/\b(?:low\s+priority|low)\b/gi, ' ')
  }

  // 3. Extract Date (today, tomorrow, or explicit date)
  let targetDate = formatDateInTimezone(referenceDate, userTimezone)
  if (/\btomorrow\b/i.test(workingText)) {
    targetDate = getTomorrowInTimezone(referenceDate, userTimezone)
    workingText = workingText.replace(/\btomorrow\b/gi, ' ')
  } else if (/\btoday\b/i.test(workingText)) {
    targetDate = formatDateInTimezone(referenceDate, userTimezone)
    workingText = workingText.replace(/\btoday\b/gi, ' ')
  }

  // 4. Extract Preferred Time (e.g. "at 14:00", "at 2pm")
  let preferredStartTime: string | undefined
  const time24Match = workingText.match(/\bat\s+(\d{1,2}):(\d{2})\b/i)
  if (time24Match) {
    const h = String(parseInt(time24Match[1], 10)).padStart(2, '0')
    const m = String(parseInt(time24Match[2], 10)).padStart(2, '0')
    preferredStartTime = `${h}:${m}`
    workingText = workingText.replace(time24Match[0], ' ')
  } else {
    const time12Match = workingText.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
    if (time12Match) {
      let h = parseInt(time12Match[1], 10)
      const m = time12Match[2] ? parseInt(time12Match[2], 10) : 0
      const mer = time12Match[3].toLowerCase()
      if (mer === 'pm' && h < 12) h += 12
      if (mer === 'am' && h === 12) h = 0
      preferredStartTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      workingText = workingText.replace(time12Match[0], ' ')
    }
  }

  // Clean title
  const cleanTitle = workingText
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '')

  if (!cleanTitle || cleanTitle.length < 2) {
    return {
      type: 'clarification',
      message: 'Could you give your task a title? (e.g. "Finish slide presentation")'
    }
  }

  return {
    type: 'task',
    targetDate,
    task: {
      title: cleanTitle,
      estimatedMinutes,
      priority,
      preferredDate: targetDate,
      preferredStartTime,
      flexibility: 'flexible'
    }
  }
}
