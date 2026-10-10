export interface ParsedResourceItem {
  title: string
  estimatedMinutes: number
  orderIndex: number
}

// Convert Arabic numerals to standard Latin digits
function convertArabicDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return str.replace(/[٠-٩]/g, (w) => String(arabicDigits.indexOf(w)))
}

// Parse duration string into minutes (e.g. "35m", "1h 30m", "42 min", "90", "1.5h")
export function parseDurationMinutes(raw: string): number {
  if (!raw) return 0
  const normalized = convertArabicDigits(raw.trim().toLowerCase())

  // Match pattern "1h 30m" or "1.5h" or "90m" or "90"
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours|ساعة|ساعات)/)
  const minMatch = normalized.match(/(\d+)\s*(?:m|min|minute|minutes|دقيقة|دقائق)/)

  let totalMinutes = 0

  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60
  }
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10)
  }

  // If no h/m units found, try standalone number
  if (!hourMatch && !minMatch) {
    const numOnly = normalized.match(/^(\d+(?:\.\d+)?)$/)
    if (numOnly) {
      totalMinutes = Math.round(parseFloat(numOnly[1]))
    }
  }

  return isNaN(totalMinutes) ? 0 : Math.round(totalMinutes)
}

export function parseBulkResourceText(rawText: string): ParsedResourceItem[] {
  if (!rawText) return []

  const lines = rawText.split(/\r?\n/)
  const results: ParsedResourceItem[] = []

  let currentIndex = 0

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue // skip empty lines

    // Try separators in order: '|', '—', '–', '-', ':'
    const separators = ['|', '—', '–', '-', ':']
    let titlePart = line
    let durationPart = ''

    for (const sep of separators) {
      if (line.includes(sep)) {
        const lastIdx = line.lastIndexOf(sep)
        const left = line.substring(0, lastIdx).trim()
        const right = line.substring(lastIdx + 1).trim()
        if (left && right) {
          titlePart = left
          durationPart = right
          break
        }
      }
    }

    const title = titlePart.trim()
    const estimatedMinutes = parseDurationMinutes(durationPart)

    results.push({
      title,
      estimatedMinutes,
      orderIndex: currentIndex++
    })
  }

  return results
}
