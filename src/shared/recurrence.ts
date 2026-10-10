// Days mapping for BYDAY rule (Sunday=0, Monday=1, ..., Saturday=6)
const DAY_CODES: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
}

function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateStr(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function expandRecurrenceRule(
  rule: string | null | undefined,
  startDateStr: string,
  endDateStr: string,
  ruleOriginDateStr?: string
): string[] {
  if (!startDateStr || !endDateStr) return []

  const start = parseDateStr(startDateStr)
  const end = parseDateStr(endDateStr)
  if (start > end) return []

  // Default to daily if no rule provided
  const ruleStr = (rule || 'FREQ=DAILY').trim().toUpperCase()

  // Parse FREQ, INTERVAL, BYDAY, BYMONTHDAY
  const parts = ruleStr.split(';')
  const params: Record<string, string> = {}
  for (const part of parts) {
    const [k, v] = part.split('=')
    if (k && v) params[k.trim()] = v.trim()
  }

  const freq = params.FREQ || 'DAILY'
  const interval = Math.max(1, parseInt(params.INTERVAL || '1', 10))

  const originDate = ruleOriginDateStr ? parseDateStr(ruleOriginDateStr) : start
  const dates: string[] = []

  const curr = new Date(start.getTime())

  while (curr <= end) {
    let matches = false

    if (freq === 'DAILY') {
      const diffDays = Math.floor((curr.getTime() - originDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays % interval === 0) {
        matches = true
      }
    } else if (freq === 'WEEKLY') {
      const dayOfWeek = curr.getUTCDay()
      if (params.BYDAY) {
        const targetDays = params.BYDAY.split(',').map((d) => DAY_CODES[d]).filter((d) => d !== undefined)
        if (targetDays.includes(dayOfWeek)) {
          matches = true
        }
      } else {
        // Default to same day of week as origin
        if (dayOfWeek === originDate.getUTCDay()) {
          matches = true
        }
      }
    } else if (freq === 'MONTHLY') {
      const monthDay = curr.getUTCDate()
      const targetDay = params.BYMONTHDAY ? parseInt(params.BYMONTHDAY, 10) : originDate.getUTCDate()
      if (monthDay === targetDay) {
        matches = true
      }
    }

    if (matches) {
      dates.push(formatDateStr(curr))
    }

    // Move to next day
    curr.setUTCDate(curr.getUTCDate() + 1)
  }

  return dates
}
