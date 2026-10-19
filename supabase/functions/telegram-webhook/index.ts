// ============================================================================
// Dots Platform — Telegram Webhook Edge Function (Hardened Phase 4 + Onboarding)
// Runtime: Supabase Edge Functions (Deno)
// Project: Dots (xpqkiourfuvasxkogtyb)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || ""
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || ""

// ----------------------------------------------------------------------------
// Telegram API Helpers
// ----------------------------------------------------------------------------
async function sendTelegram(chatId: number | string, text: string, replyMarkup?: any) {
  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  }
  if (replyMarkup) {
    payload.reply_markup = replyMarkup
  }
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  return res.json().catch(() => ({}))
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text })
  }).catch(() => ({}))
}

// ----------------------------------------------------------------------------
// Time & Math Utilities
// ----------------------------------------------------------------------------
function parseTimeToMinutes(t: string): number {
  if (!t) return 0
  const timePart = t.includes(" ") ? t.split(" ")[1] : t
  const [h, m] = timePart.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

function formatMinutesToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function getUserDateTimeInTimezone(d: Date, timezone = "Africa/Cairo"): { dateStr: string; timeStr: string; minutes: number } {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
    const parts = formatter.formatToParts(d)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    const dateStr = `${map.year}-${map.month}-${map.day}`
    const rawH = parseInt(map.hour, 10)
    const hour = rawH === 24 ? 0 : rawH
    const minute = parseInt(map.minute, 10)
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    return { dateStr, timeStr, minutes: hour * 60 + minute }
  } catch {
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    const hour = d.getUTCHours()
    const minute = d.getUTCMinutes()
    return {
      dateStr: `${year}-${month}-${day}`,
      timeStr: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      minutes: hour * 60 + minute
    }
  }
}

function getTomorrowDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + 1)
  const ny = dt.getUTCFullYear()
  const nm = String(dt.getUTCMonth() + 1).padStart(2, "0")
  const nd = String(dt.getUTCDate()).padStart(2, "0")
  return `${ny}-${nm}-${nd}`
}

function findAvailableSlotInDay(
  existingSlots: any[],
  fixedEvents: any[],
  durationMinutes: number,
  earliestAllowedStart: number,
  workdayEnd = 1080 // 18:00
): { start: number; end: number } | null {
  const occupied: Array<{ start: number; end: number }> = []

  for (const slot of existingSlots || []) {
    occupied.push({ start: parseTimeToMinutes(slot.start_time || slot.startTime), end: parseTimeToMinutes(slot.end_time || slot.endTime) })
  }
  for (const fe of fixedEvents || []) {
    occupied.push({ start: parseTimeToMinutes(fe.start_time || fe.startTime), end: parseTimeToMinutes(fe.end_time || fe.endTime) })
  }

  occupied.sort((a, b) => a.start - b.start)

  let cursor = earliestAllowedStart

  for (const occ of occupied) {
    if (cursor + durationMinutes <= occ.start && cursor + durationMinutes <= workdayEnd) {
      return { start: cursor, end: cursor + durationMinutes }
    }
    if (cursor < occ.end) {
      cursor = Math.max(cursor, occ.end)
    }
  }

  if (cursor + durationMinutes <= workdayEnd) {
    return { start: cursor, end: cursor + durationMinutes }
  }

  return null
}

// ----------------------------------------------------------------------------
// Arabic & English Natural Language Parsers
// ----------------------------------------------------------------------------
function parseArabicAndEnglishDuration(text: string): { duration: number; textRemaining: string } {
  let duration = 30
  let matched = false
  let cleaned = text

  if (/\b(ساعتين|ساعتان)\b/i.test(cleaned)) {
    duration = 120
    cleaned = cleaned.replace(/\b(ساعتين|ساعتان)\b/gi, "")
    matched = true
  } else if (/\b(ساعة ونص|ساعة ونصف)\b/i.test(cleaned)) {
    duration = 90
    cleaned = cleaned.replace(/\b(ساعة ونص|ساعة ونصف)\b/gi, "")
    matched = true
  } else if (/\b(ساعة)\b/i.test(cleaned) && !/\b(نص|ربع)\b/i.test(cleaned)) {
    duration = 60
    cleaned = cleaned.replace(/\b(ساعة)\b/gi, "")
    matched = true
  } else if (/\b(نص ساعة|نصف ساعة)\b/i.test(cleaned)) {
    duration = 30
    cleaned = cleaned.replace(/\b(نص ساعة|نصف ساعة)\b/gi, "")
    matched = true
  } else if (/\b(ربع ساعة)\b/i.test(cleaned)) {
    duration = 15
    cleaned = cleaned.replace(/\b(ربع ساعة)\b/gi, "")
    matched = true
  }

  if (!matched) {
    const numMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(دقيقة|دقائق|دقايق|د|ساعات|ساعة|س|m|min|minutes|mins|h|hr|hours)\b/i)
    if (numMatch) {
      const val = parseFloat(numMatch[1])
      const unit = numMatch[2].toLowerCase()
      if (unit.startsWith("h") || unit === "ساعة" || unit === "ساعات" || unit === "س") {
        duration = Math.round(val * 60)
      } else {
        duration = Math.round(val)
      }
      cleaned = cleaned.replace(numMatch[0], "")
    }
  }

  return { duration, textRemaining: cleaned.trim() }
}

function parseArabicAndEnglishPriority(text: string): { priority: string; textRemaining: string } {
  let priority = "medium"
  let cleaned = text

  if (/\b(urgent|critical|p1|asap|عاجل|طارئ|ضروري جدا|ضروري|أولوية قصوى)\b/i.test(cleaned)) {
    priority = "critical"
    cleaned = cleaned.replace(/\b(urgent|critical|p1|asap|عاجل|طارئ|ضروري جدا|ضروري|أولوية قصوى)\b/gi, "")
  } else if (/\b(high|important|p2|مهم|أولوية عالية|هام)\b/i.test(cleaned)) {
    priority = "high"
    cleaned = cleaned.replace(/\b(high|important|p2|مهم|أولوية عالية|هام)\b/gi, "")
  } else if (/\b(low|someday|p4|منخفض|مش مستعجل|غير عاجل|بسيط)\b/i.test(cleaned)) {
    priority = "low"
    cleaned = cleaned.replace(/\b(low|someday|p4|منخفض|مش مستعجل|غير عاجل|بسيط)\b/gi, "")
  } else if (/\b(medium|متوسط|عادي)\b/i.test(cleaned)) {
    priority = "medium"
    cleaned = cleaned.replace(/\b(medium|متوسط|عادي)\b/gi, "")
  }

  return { priority, textRemaining: cleaned.trim() }
}

function parseArabicAndEnglishDate(text: string, userDt: { dateStr: string }): { targetDate: string; textRemaining: string } {
  let targetDate = userDt.dateStr
  let cleaned = text

  if (/\b(tomorrow|بكره|بكرا|غدا|غداً)\b/i.test(cleaned)) {
    targetDate = getTomorrowDateStr(userDt.dateStr)
    cleaned = cleaned.replace(/\b(tomorrow|بكره|بكرا|غدا|غداً)\b/gi, "")
  } else if (/\b(today|النهارده|النهاردة|اليوم)\b/i.test(cleaned)) {
    targetDate = userDt.dateStr
    cleaned = cleaned.replace(/\b(today|النهارده|النهاردة|اليوم)\b/gi, "")
  }

  return { targetDate, textRemaining: cleaned.trim() }
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^[-•*–—\d\.\)\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim() || "New Task"
}

function parseWorkingHours(text: string): { start: string; end: string } | null {
  const cleaned = text.toLowerCase().trim()
  const regex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|ص|م)?\s*(?:to|-|حتى|إلى|لـ|ل)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|ص|م)?/i
  const match = cleaned.match(regex)
  if (!match) return null

  let startH = parseInt(match[1], 10)
  const startM = match[2] ? parseInt(match[2], 10) : 0
  const startMod = match[3]

  let endH = parseInt(match[4], 10)
  const endM = match[5] ? parseInt(match[5], 10) : 0
  const endMod = match[6]

  if (startMod === "pm" || startMod === "م") {
    if (startH < 12) startH += 12
  }
  if (endMod === "pm" || endMod === "م") {
    if (endH < 12) endH += 12
  } else if (!endMod) {
    if (endH < startH || (startH >= 7 && endH <= 11 && endH < 12)) {
      endH += 12
    }
  }

  const startStr = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`
  const endStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
  return { start: startStr, end: endStr }
}

function parseMultipleTasks(rawText: string, userDt: { dateStr: string }) {
  const lines = rawText
    .split(/\n|\r\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const tasks: Array<{ title: string; estimatedMinutes: number; priority: string; targetDate: string }> = []

  for (const line of lines) {
    const { duration, textRemaining: afterDur } = parseArabicAndEnglishDuration(line)
    const { priority, textRemaining: afterPri } = parseArabicAndEnglishPriority(afterDur)
    const { targetDate, textRemaining: afterDate } = parseArabicAndEnglishDate(afterPri, userDt)
    const title = cleanTitle(afterDate)

    if (title && title.length >= 2) {
      tasks.push({
        title,
        estimatedMinutes: duration,
        priority,
        targetDate
      })
    }
  }

  return tasks
}

// ----------------------------------------------------------------------------
// Onboarding Step Prompts
// ----------------------------------------------------------------------------
async function sendOnboardingStep1(chatId: number, userName: string) {
  const text =
    `👋 *أهلاً بك يا ${userName} في Dots — مساعدك الذكي لتنظيم يومك وجدولك!* 🎯\n\n` +
    `عشان أقدر أرتبلك يومك وأعملك جدول واقعي يناسب وقتك وطاقتك، هسألك ٣ أسئلة سريعة جداً:\n\n` +
    `1️⃣ *ساعات يومك وشغلك:*\n` +
    `بتصحى وتبدأ تركيزك وشغلك الساعة كام، ويومك بينتهي الساعة كام؟\n\n` +
    `_اختر من المواعيد الجاهزة بالأسفل أو اكتب بنفسك (مثلاً: \`من 9 ص لـ 5 م\`):_`

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🕘 9:00 ص - 5:00 م (دوام قياسي)", callback_data: "onboard:hours:09:00-17:00" }
      ],
      [
        { text: "🕙 10:00 ص - 6:00 م (صباحي مرن)", callback_data: "onboard:hours:10:00-18:00" }
      ],
      [
        { text: "🕗 8:00 ص - 4:00 م (صباحي باكر)", callback_data: "onboard:hours:08:00-16:00" }
      ],
      [
        { text: "🌙 12:00 م - 8:00 م (مسائي / فريلانسر)", callback_data: "onboard:hours:12:00-20:00" }
      ]
    ]
  }

  await sendTelegram(chatId, text, keyboard)
}

async function sendOnboardingStep2(chatId: number, start: string, end: string) {
  const text =
    `ممتاز! ⏰ تم تحديد ساعات عملك: من *${start}* إلى *${end}*.\n\n` +
    `2️⃣ *المواعيد والاجتماعات الثابتة:*\n` +
    `هل عندك أي مواعيد أو ميتنجات ثابتة النهارده أو الأسبوع ده ما ينفعش تتغير؟\n\n` +
    `📌 تقدر تكتبها بالتفصيل، مثلاً:\n` +
    `• \`ميتنج الفريق الساعة 12 الظهر 45 دقيقة\`\n` +
    `• \`تمرين الجيم الساعة 5 مساءً لمدة ساعة\`\n\n` +
    `_لو ما عندكش أي مواعيد ثابتة حالياً، اضغط على الزرار بالأسفل:_`

  const keyboard = {
    inline_keyboard: [
      [{ text: "⏩ ما عنديش مواعيد ثابتة حالياً", callback_data: "onboard:skip_meetings" }]
    ]
  }

  await sendTelegram(chatId, text, keyboard)
}

async function sendOnboardingStep3(chatId: number) {
  const text =
    `تمام جداً! 🚀\n\n` +
    `3️⃣ *أهم المهام والتاسكات:*\n` +
    `إيه أهم ٢ أو ٣ مهام محتاج تنجزهم اليومين دول؟\n\n` +
    `📌 تقدر تكتبهم ورا بعض في رسالة واحدة، مثلاً:\n` +
    `• \`كتابة تقرير المشروع 60 دقيقة عاجل\`\n` +
    `• \`مراجعة تصميم الموقع 45 دقيقة مهم\`\n` +
    `• \`إرسال إيميلات العملاء 30 دقيقة\`\n\n` +
    `_أو اضغط لتجربة مهام مقترحة فوراً:_`

  const keyboard = {
    inline_keyboard: [
      [{ text: "⚡ جدولة مهام تجريبية للتجربة فوراً", callback_data: "onboard:sample_tasks" }]
    ]
  }

  await sendTelegram(chatId, text, keyboard)
}

// ----------------------------------------------------------------------------
// Core Scheduling & Proposal Creator for Multiple Tasks
// ----------------------------------------------------------------------------
async function createAndSendScheduleProposal(
  supabase: any,
  user: any,
  chatId: number,
  tasks: Array<{ title: string; estimatedMinutes: number; priority: string; targetDate: string }>,
  workStart = "09:00",
  workEnd = "17:00"
) {
  const userTimezone = user.timezone || "Africa/Cairo"
  const userLocal = getUserDateTimeInTimezone(new Date(), userTimezone)

  const workStartMin = parseTimeToMinutes(workStart) || 540
  const workEndMin = parseTimeToMinutes(workEnd) || 1080

  const primaryDate = tasks[0]?.targetDate || userLocal.dateStr
  const isPrimaryToday = primaryDate === userLocal.dateStr

  // Earliest allowed start is at least 5 mins in the future if today, else workStartMin
  let cursorMin = isPrimaryToday ? Math.max(workStartMin, userLocal.minutes + 5) : workStartMin

  // Fetch existing schedule & fixed events
  let { data: existingSlots } = await supabase
    .from("dots_scheduled_slots")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", primaryDate)
    .order("start_time", { ascending: true })

  let { data: fixedEvents } = await supabase
    .from("dots_fixed_events")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", primaryDate)

  const accumulatedSlots = [...(existingSlots || [])]
  const proposedSlots: any[] = []
  const summaryLines: string[] = []

  let currentDate = primaryDate

  for (const t of tasks) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    // Insert work item into DB
    await supabase.from("dots_work_items").insert({
      id: taskId,
      user_id: user.id,
      title: t.title,
      estimated_minutes: t.estimatedMinutes,
      priority: t.priority,
      preferred_date: currentDate,
      status: "todo"
    })

    let slot = findAvailableSlotInDay(accumulatedSlots, fixedEvents || [], t.estimatedMinutes, cursorMin, workEndMin)

    // Fallback to tomorrow if today has no room
    if (!slot && currentDate === userLocal.dateStr) {
      currentDate = getTomorrowDateStr(userLocal.dateStr)
      cursorMin = workStartMin

      const { data: tomSlots } = await supabase
        .from("dots_scheduled_slots")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", currentDate)
        .order("start_time", { ascending: true })

      const { data: tomFixed } = await supabase
        .from("dots_fixed_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", currentDate)

      accumulatedSlots.length = 0
      if (tomSlots) accumulatedSlots.push(...tomSlots)
      fixedEvents = tomFixed || []

      slot = findAvailableSlotInDay(accumulatedSlots, fixedEvents, t.estimatedMinutes, cursorMin, workEndMin)
    }

    if (!slot) {
      slot = { start: cursorMin, end: cursorMin + t.estimatedMinutes }
    }

    const startStr = formatMinutesToTime(slot.start)
    const endStr = formatMinutesToTime(slot.end)

    const proposedSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workItemId: taskId,
      title: t.title,
      date: currentDate,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: t.estimatedMinutes,
      sessionIndex: 1,
      totalSessions: 1,
      isSplit: false,
      locked: false,
      reason: "Placed by Dots adaptive engine"
    }

    proposedSlots.push(proposedSlot)
    accumulatedSlots.push({ start_time: startStr, end_time: endStr })
    cursorMin = slot.end + 5 // 5m buffer between tasks

    summaryLines.push(`• *${t.title}*\n  ⏰ \`${startStr} - ${endStr}\` (${t.estimatedMinutes} دقيقة) | ⚡ أولوية: \`${t.priority}\``)
  }

  const baseSnapshot = (existingSlots || []).map((s: any) => ({
    id: s.id,
    startTime: s.start_time,
    endTime: s.end_time,
    durationMinutes: s.duration_minutes
  }))

  const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const proposedSchedule = [
    ...(existingSlots || []).map((s: any) => ({
      id: s.id,
      workItemId: s.work_item_id,
      title: s.title,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      durationMinutes: s.duration_minutes,
      sessionIndex: s.session_index,
      totalSessions: s.total_sessions,
      isSplit: s.is_split,
      locked: s.locked,
      reason: s.reason
    })),
    ...proposedSlots
  ]

  const humanSummary = `جدولة ${tasks.length} مهام ليوم ${primaryDate}`

  await supabase.from("dots_schedule_proposals").insert({
    id: proposalId,
    user_id: user.id,
    target_date: primaryDate,
    trigger_type: "onboarding_or_batch",
    status: "pending",
    base_schedule_snapshot: baseSnapshot,
    proposed_schedule: proposedSchedule,
    human_summary: humanSummary
  })

  const replyText =
    `🎉 *تم تجهيز مقترح جدولك الذكي بواسطة Dots!* 📅\n\n` +
    `بناءً على ساعات عملك ومواعيدك، إليك الترتيب الأمثل لمهامك:\n\n` +
    summaryLines.join("\n\n") +
    `\n\n_اضغط بالأسفل لاعتماد الجدول وتثبيته فوراً ومزامنته مع الويب:_`

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ اعتماد وتثبيت الجدول", callback_data: `approve:${proposalId}` },
        { text: "❌ رفض", callback_data: `reject:${proposalId}` }
      ]
    ]
  }

  await sendTelegram(chatId, replyText, keyboard)
}

// ----------------------------------------------------------------------------
// Main HTTP Server Handler
// ----------------------------------------------------------------------------
serve(async (req: Request) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", service: "dots-telegram-edge-webhook", version: "4.5" }), {
      headers: { "Content-Type": "application/json" }
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    })
  }

  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token")
  if (TELEGRAM_WEBHOOK_SECRET && incomingSecret !== TELEGRAM_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  let update: any
  try {
    update = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://xpqkiourfuvasxkogtyb.supabase.co"
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Idempotency check
  if (update.update_id) {
    const { data: existing } = await supabase
      .from("dots_webhook_updates")
      .select("update_id")
      .eq("update_id", update.update_id)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ ok: true, note: "already_processed" }), {
        headers: { "Content-Type": "application/json" }
      })
    }
  }

  // --------------------------------------------------------------------------
  // 1. Handle Callback Queries
  // --------------------------------------------------------------------------
  if (update.callback_query) {
    const cb = update.callback_query
    const chatId = cb.message?.chat?.id || cb.from?.id
    const data = cb.data || ""

    // Resolve user
    let { data: user } = await supabase
      .from("dots_users")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .maybeSingle()

    if (data.startsWith("approve:")) {
      const proposalId = data.replace("approve:", "").trim()
      const { data: rpcRes, error } = await supabase.rpc("dots_approve_proposal", {
        p_proposal_id: proposalId,
        p_chat_id: chatId
      })

      let text =
        `✅ *تم اعتماد وتثبيت جدولك بنجاح!* 🎉\n\n` +
        `جميع المهام تمت جدولتها في تقويمك ومزامنتها فوراً.\n\n` +
        `💡 *لفتح جدولك التفاعلي على الويب:* أرسل \`/link\` للحصول على كود الربط السريع.\n` +
        `💡 *لإضافة أي مهمة لاحقاً:* فقط اكتبها مباشرة هنا في أي وقت (مثلاً: \`مراجعة تقرير 30 دقيقة\`).`

      if (error || !rpcRes?.success) {
        if (rpcRes?.status === "stale") {
          text = "⚠️ *المقترح منتهي الصلاحية*\n\nتغير جدولك قبل الاعتماد. أعد إرسال مهامك لحساب جدول محدث."
        } else {
          text = `❌ تعذر اعتماد الجدول: ${error?.message || rpcRes?.message || "خطأ غير معروف"}`
        }
      }

      await sendTelegram(chatId, text)
      await answerCallbackQuery(cb.id, rpcRes?.success ? "تم الاعتماد!" : "فشل الاعتماد")

      await supabase.from("dots_webhook_updates").insert({
        update_id: update.update_id,
        chat_id: chatId,
        action_type: "approve"
      })

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    if (data.startsWith("reject:")) {
      const proposalId = data.replace("reject:", "").trim()
      await supabase.rpc("dots_reject_proposal", {
        p_proposal_id: proposalId,
        p_chat_id: chatId,
        p_reason: "Rejected by user"
      })

      await sendTelegram(chatId, "❌ *تم إلغاء المقترح*\n\nجدولك الحالي ظل كما هو دون أي تغيير.")
      await answerCallbackQuery(cb.id, "تم الإلغاء")

      await supabase.from("dots_webhook_updates").insert({
        update_id: update.update_id,
        chat_id: chatId,
        action_type: "reject"
      })

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Onboarding: Work hours selected
    if (data.startsWith("onboard:hours:")) {
      const range = data.replace("onboard:hours:", "").trim()
      const [start, end] = range.split("-")

      if (user) {
        // Upsert availability rules
        for (let d = 0; d <= 6; d++) {
          await supabase.from("dots_availability_rules").upsert({
            user_id: user.id,
            day_of_week: d,
            start_time: start,
            end_time: end,
            is_active: d >= 0 && d <= 4, // Sun-Thu active
            planning_capacity_percentage: 75,
            buffer_percentage: 20
          }, { onConflict: "user_id,day_of_week" })
        }

        await supabase.from("dots_users").update({
          onboarding_state: {
            step: "awaiting_fixed",
            work_hours: { start, end }
          }
        }).eq("id", user.id)
      }

      await answerCallbackQuery(cb.id, "تم حفظ ساعات العمل")
      await sendOnboardingStep2(chatId, start, end)

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Onboarding: Skip meetings
    if (data === "onboard:skip_meetings") {
      if (user) {
        const existingState = user.onboarding_state || {}
        await supabase.from("dots_users").update({
          onboarding_state: {
            ...existingState,
            step: "awaiting_tasks",
            fixed_events: []
          }
        }).eq("id", user.id)
      }

      await answerCallbackQuery(cb.id, "تم التخطي")
      await sendOnboardingStep3(chatId)

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Onboarding: Sample tasks
    if (data === "onboard:sample_tasks") {
      await answerCallbackQuery(cb.id, "جاري إنشاء جدول تجريبي...")

      const sampleTasks = [
        { title: "التخطيط للأسبوع ومراجعة الأولويات", estimatedMinutes: 45, priority: "high", targetDate: "" },
        { title: "العمل المركز على المهمة الرئيسية", estimatedMinutes: 60, priority: "critical", targetDate: "" },
        { title: "متابعة الرسائل والإيميلات والردود", estimatedMinutes: 30, priority: "medium", targetDate: "" }
      ]

      const workHours = user?.onboarding_state?.work_hours || { start: "09:00", end: "17:00" }

      await createAndSendScheduleProposal(
        supabase,
        user,
        chatId,
        sampleTasks,
        workHours.start,
        workHours.end
      )

      if (user) {
        await supabase.from("dots_users").update({
          onboarding_state: {
            step: "completed",
            work_hours: workHours,
            completed_at: new Date().toISOString()
          }
        }).eq("id", user.id)
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Onboarding: Restart
    if (data === "onboard:restart") {
      await answerCallbackQuery(cb.id, "إعادة البدء...")
      const userName = user?.display_name || "صديق Dots"
      await sendOnboardingStep1(chatId, userName)
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }
  }

  // --------------------------------------------------------------------------
  // 2. Handle Text Messages
  // --------------------------------------------------------------------------
  if (update.message?.text) {
    const msg = update.message
    const chatId = msg.chat.id
    const text = msg.text.trim()

    let { data: user } = await supabase
      .from("dots_users")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .maybeSingle()

    if (!user) {
      const { data: newUser } = await supabase
        .from("dots_users")
        .insert({
          telegram_chat_id: chatId,
          telegram_username: msg.from?.username || null,
          display_name: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || "Dots User",
          timezone: "Africa/Cairo"
        })
        .select()
        .single()
      user = newUser
    }

    const userName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || user?.display_name || "Dots User"
    const onboardingState = user?.onboarding_state || null

    // Cancel / Reset Command
    if (/^\/(cancel|reset)/i.test(text)) {
      await supabase.from("dots_users").update({ onboarding_state: null }).eq("id", user.id)
      await sendTelegram(chatId, "تم إلغاء الإعداد. يمكنك إرسال أي مهمة مباشرة، أو كتابة `/setup` للبدء من جديد.")
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Link code command: generates secure 6-digit code valid for 15 minutes
    if (/^\/(link|sync|code)/i.test(text)) {
      const linkCode = Math.floor(100000 + Math.random() * 900000).toString()
      await supabase.from("dots_link_codes").insert({
        code: linkCode,
        telegram_chat_id: chatId
      })

      const replyText =
        `🔗 *كود ربط منصة الويب (Dots Web)*\n\n` +
        `الكود: \`${linkCode}\`\n\n` +
        `ادخل هذا الكود في صفحة إعدادات منصة الويب لربط جدول التيليجرام بحسابك فوراً. الكود صالح للاستخدام مرة واحدة لمدة 15 دقيقة.`

      await sendTelegram(chatId, replyText)
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Timezone Command
    if (/^\/(tz|timezone)(\s+.*)?$/i.test(text)) {
      const match = text.match(/^\/(tz|timezone)\s*(.*)$/i)
      const requestedTz = match && match[2] ? match[2].trim() : ""

      if (!requestedTz) {
        const currentTz = user.timezone || "Africa/Cairo"
        const currentLocal = getUserDateTimeInTimezone(new Date(), currentTz)
        const msgText =
          `🌍 *المنطقة الزمنية الحالية:* \`${currentTz}\`\n` +
          `🕒 *التوقيت المحلي الآن:* \`${currentLocal.timeStr}\` (${currentLocal.dateStr})\n\n` +
          `لتغييرها، أرسل: \`/tz <Timezone>\`\n` +
          `*أمثلة:* \`/tz Africa/Cairo\`, \`/tz Asia/Riyadh\`, \`/tz Europe/London\``

        await sendTelegram(chatId, msgText)
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
      }

      try {
        Intl.DateTimeFormat(undefined, { timeZone: requestedTz })
        await supabase.from("dots_users").update({ timezone: requestedTz }).eq("id", user.id)
        const currentLocal = getUserDateTimeInTimezone(new Date(), requestedTz)
        const msgText =
          `✅ *تم تحديث منطقتك الزمنية إلى \`${requestedTz}\`*\n` +
          `🕒 التوقيت المحلي الآن هو *${currentLocal.timeStr}* في تاريخ *${currentLocal.dateStr}*.`

        await sendTelegram(chatId, msgText)
      } catch {
        const msgText =
          `⚠️ *اسم منطقة زمنية غير صالح*\n\n` +
          `يرجى استخدام معرف IANA قياسي مثل:\n` +
          `• \`/tz Africa/Cairo\`\n` +
          `• \`/tz Asia/Riyadh\`\n` +
          `• \`/tz Europe/London\``

        await sendTelegram(chatId, msgText)
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // Start or Setup Command
    if (/^\/(start|setup|onboard)$/i.test(text)) {
      // If user hasn't completed onboarding yet or explicitly typed /setup
      if (!onboardingState || onboardingState.step !== "completed" || /^\/(setup|onboard)$/i.test(text)) {
        await supabase.from("dots_users").update({
          onboarding_state: { step: "awaiting_hours", started_at: new Date().toISOString() }
        }).eq("id", user.id)

        await sendOnboardingStep1(chatId, userName)
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
      }

      // If user already completed onboarding and sent /start
      const welcomeBackText =
        `👋 *أهلاً بك مجدداً في Dots يا ${userName}!* 🚀\n\n` +
        `جدولك نشط ومربوط. يمكنك في أي وقت:\n` +
        `• إرسال أي مهمة باللغة الطبيعية (مثلاً: \`كتابة تقرير 45m عاجل اليوم\`)\n` +
        `• إعادة ضبط المواعيد وساعات العمل: \`/setup\`\n` +
        `• استخراج كود ربط منصة الويب: \`/link\`\n` +
        `• ضبط منطقتك الزمنية: \`/tz\``

      const keyboard = {
        inline_keyboard: [
          [
            { text: "🔄 إعادة ضبط الجدول (/setup)", callback_data: "onboard:restart" },
            { text: "🔗 كود ربط الويب (/link)", callback_data: "onboard:link" }
          ]
        ]
      }

      await sendTelegram(chatId, welcomeBackText, keyboard)
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // ------------------------------------------------------------------------
    // Step 1 In-flight: User typed hours manually
    // ------------------------------------------------------------------------
    if (onboardingState?.step === "awaiting_hours") {
      const parsedHours = parseWorkingHours(text)
      if (parsedHours) {
        for (let d = 0; d <= 6; d++) {
          await supabase.from("dots_availability_rules").upsert({
            user_id: user.id,
            day_of_week: d,
            start_time: parsedHours.start,
            end_time: parsedHours.end,
            is_active: d >= 0 && d <= 4,
            planning_capacity_percentage: 75,
            buffer_percentage: 20
          }, { onConflict: "user_id,day_of_week" })
        }

        await supabase.from("dots_users").update({
          onboarding_state: {
            step: "awaiting_fixed",
            work_hours: parsedHours
          }
        }).eq("id", user.id)

        await sendOnboardingStep2(chatId, parsedHours.start, parsedHours.end)
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
      } else {
        await sendTelegram(
          chatId,
          `عفواً، لم أستطع فهم صيغة الأوقات بدقة. ⏳\n\nيرجى كتابتها مثل: \`من 9 ص لـ 5 م\` أو \`10:00 - 18:00\` أو اختيار أحد الأزرار السريعة بالأعلى.`
        )
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
      }
    }

    // ------------------------------------------------------------------------
    // Step 2 In-flight: User typed fixed commitments or skip
    // ------------------------------------------------------------------------
    if (onboardingState?.step === "awaiting_fixed") {
      const isNegative = /^(معنديش|ما عنديش|لا يوجد|مفيش|لا|skip|none|no|خلاص|تخطي)/i.test(text)
      const userDt = getUserDateTimeInTimezone(new Date(), user.timezone || "Africa/Cairo")

      if (!isNegative) {
        const { duration, textRemaining: afterDur } = parseArabicAndEnglishDuration(text)
        const fixedTitle = cleanTitle(afterDur) || "اجتماع ثابت"
        const startTimeStr = "12:00"
        const startMin = parseTimeToMinutes(startTimeStr)
        const endTimeStr = formatMinutesToTime(startMin + duration)

        await supabase.from("dots_fixed_events").insert({
          id: `fixed-${Date.now()}`,
          user_id: user.id,
          title: fixedTitle,
          date: userDt.dateStr,
          start_time: startTimeStr,
          end_time: endTimeStr,
          duration_minutes: duration,
          locked: true
        })

        await sendTelegram(chatId, `✅ تم تسجيل الموعد الثابت: *${fixedTitle}* (\`${startTimeStr} - ${endTimeStr}\`).`)
      }

      await supabase.from("dots_users").update({
        onboarding_state: {
          ...onboardingState,
          step: "awaiting_tasks"
        }
      }).eq("id", user.id)

      await sendOnboardingStep3(chatId)
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // ------------------------------------------------------------------------
    // Step 3 In-flight: User sent their initial tasks
    // ------------------------------------------------------------------------
    if (onboardingState?.step === "awaiting_tasks") {
      const userDt = getUserDateTimeInTimezone(new Date(), user.timezone || "Africa/Cairo")
      const parsedTasks = parseMultipleTasks(text, userDt)

      if (parsedTasks.length === 0) {
        await sendTelegram(
          chatId,
          `يرجى كتابة مهمة أو أكثر مع مدتها، مثلاً:\n• \`كتابة تقرير 45 دقيقة عاجل\`\n• \`مراجعة الكود 60 دقيقة\`\n\nأو اضغط على زرار المهام التجريبية بالأعلى.`
        )
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
      }

      const workHours = onboardingState?.work_hours || { start: "09:00", end: "17:00" }

      await createAndSendScheduleProposal(
        supabase,
        user,
        chatId,
        parsedTasks,
        workHours.start,
        workHours.end
      )

      await supabase.from("dots_users").update({
        onboarding_state: {
          step: "completed",
          work_hours: workHours,
          completed_at: new Date().toISOString()
        }
      }).eq("id", user.id)

      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    }

    // ------------------------------------------------------------------------
    // 3. Normal Daily Planner Scheduling (Post-Onboarding)
    // ------------------------------------------------------------------------
    const userDt = getUserDateTimeInTimezone(new Date(), user.timezone || "Africa/Cairo")
    const { duration, textRemaining: afterDur } = parseArabicAndEnglishDuration(text)
    const { priority, textRemaining: afterPri } = parseArabicAndEnglishPriority(afterDur)
    const { targetDate, textRemaining: afterDate } = parseArabicAndEnglishDate(afterPri, userDt)
    const title = cleanTitle(afterDate)

    const singleTask = {
      title,
      estimatedMinutes: duration,
      priority,
      targetDate
    }

    const userWorkHours = onboardingState?.work_hours || { start: "09:00", end: "17:00" }

    await createAndSendScheduleProposal(
      supabase,
      user,
      chatId,
      [singleTask],
      userWorkHours.start,
      userWorkHours.end
    )

    await supabase.from("dots_webhook_updates").insert({
      update_id: update.update_id,
      chat_id: chatId,
      action_type: "task_captured"
    })

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
  }

  return new Response(JSON.stringify({ ok: true, status: "ignored" }), {
    headers: { "Content-Type": "application/json" }
  })
})
