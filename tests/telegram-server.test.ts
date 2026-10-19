import { describe, expect, it } from 'vitest'
import http from 'node:http'
import { createTelegramWebhookHandler } from '../src/integration/telegram/server'

describe('Telegram Webhook Server Handler', () => {
  const dummyConfig = {
    supabaseUrl: 'https://test-dots.supabase.co',
    supabaseServiceRoleKey: 'test-service-key',
    telegramWebhookSecret: 'test-secret-12345'
  }

  it('responds with 200 OK on GET /health', async () => {
    const handler = createTelegramWebhookHandler(dummyConfig)

    let statusCode = 0
    let responseBody = ''
    const req = {
      method: 'GET',
      url: '/health',
      headers: { host: 'localhost' }
    } as unknown as http.IncomingMessage

    const res = {
      writeHead(code: number) {
        statusCode = code
      },
      end(body: string) {
        responseBody = body
      }
    } as unknown as http.ServerResponse

    await handler(req, res)

    expect(statusCode).toBe(200)
    expect(JSON.parse(responseBody)).toEqual({ status: 'ok', service: 'dots-telegram-webhook' })
  })

  it('rejects non-POST methods with 405 Method Not Allowed', async () => {
    const handler = createTelegramWebhookHandler(dummyConfig)

    let statusCode = 0
    let responseBody = ''
    const req = {
      method: 'DELETE',
      url: '/webhook',
      headers: { host: 'localhost' }
    } as unknown as http.IncomingMessage

    const res = {
      writeHead(code: number) {
        statusCode = code
      },
      end(body: string) {
        responseBody = body
      }
    } as unknown as http.ServerResponse

    await handler(req, res)

    expect(statusCode).toBe(405)
    expect(JSON.parse(responseBody).error).toBe('Method Not Allowed')
  })

  it('rejects unauthorized requests with 401 when secret header is missing or wrong', async () => {
    const handler = createTelegramWebhookHandler(dummyConfig)

    let statusCode = 0
    let responseBody = ''
    const req = {
      method: 'POST',
      url: '/webhook',
      headers: {
        host: 'localhost',
        'x-telegram-bot-api-secret-token': 'wrong-secret-token'
      },
      async *[Symbol.asyncIterator]() {
        yield Buffer.from(JSON.stringify({ update_id: 123 }))
      }
    } as unknown as http.IncomingMessage

    const res = {
      writeHead(code: number) {
        statusCode = code
      },
      end(body: string) {
        responseBody = body
      }
    } as unknown as http.ServerResponse

    await handler(req, res)

    expect(statusCode).toBe(401)
    expect(JSON.parse(responseBody).error).toContain('Invalid Telegram secret token header')
  })
})
