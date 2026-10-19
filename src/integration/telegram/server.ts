import http from 'node:http'
import { createDotsServerClient } from '../supabase/client'
import { SupabaseScheduleRepository } from '../supabase/store'
import { processTelegramWebhookUpdate } from './webhook'
import type { TelegramUpdate } from './types'

export interface ServerConfig {
  supabaseUrl: string
  supabaseServiceRoleKey: string
  telegramBotToken?: string
  telegramWebhookSecret?: string
  port?: number
}

export function createTelegramWebhookHandler(config: ServerConfig) {
  const supabase = createDotsServerClient(config.supabaseUrl, config.supabaseServiceRoleKey)
  const repository = new SupabaseScheduleRepository(supabase)

  return async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    // Health check endpoint
    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', service: 'dots-telegram-webhook' }))
      return
    }

    // Only allow POST for webhook handling
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Method Not Allowed' }))
      return
    }

    // Gather request body
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const rawBody = Buffer.concat(chunks).toString('utf8')

    let update: TelegramUpdate
    try {
      update = JSON.parse(rawBody)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }))
      return
    }

    const secretHeader = req.headers['x-telegram-bot-api-secret-token'] as string | undefined

    try {
      const result = await processTelegramWebhookUpdate(
        update,
        {
          repository,
          secretToken: config.telegramWebhookSecret
        },
        secretHeader
      )

      if (result.status === 'unauthorized') {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: result.errorMessage }))
        return
      }

      // If we have a bot token and an outgoing message, dispatch to Telegram API
      if (config.telegramBotToken) {
        if (result.outgoingMessage) {
          await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.outgoingMessage)
          }).catch((err) => {
            console.error('[Dots Telegram Webhook] Failed to dispatch sendMessage:', err)
          })
        }

        if (result.callbackAnswer) {
          await fetch(
            `https://api.telegram.org/bot${config.telegramBotToken}/answerCallbackQuery`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result.callbackAnswer)
            }
          ).catch((err) => {
            console.error('[Dots Telegram Webhook] Failed to dispatch answerCallbackQuery:', err)
          })
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, status: result.status }))
    } catch (err: any) {
      console.error('[Dots Telegram Webhook] Processing error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error', message: err?.message }))
    }
  }
}

export function startWebhookServer(config: ServerConfig): http.Server {
  const handler = createTelegramWebhookHandler(config)
  const port = config.port || 3000
  const server = http.createServer(handler)

  server.listen(port, () => {
    console.log(`[Dots Telegram Webhook Server] Listening on port ${port}`)
  })

  return server
}

// Allow standalone execution via `node` / `tsx`
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  const port = Number(process.env.PORT) || 3000

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Dots Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.')
  }

  startWebhookServer({
    supabaseUrl,
    supabaseServiceRoleKey: supabaseKey,
    telegramBotToken: botToken,
    telegramWebhookSecret: webhookSecret,
    port
  })
}
