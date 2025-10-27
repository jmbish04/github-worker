/**
 * @file src/index.ts
 * @description This is the main entry point for the Cloudflare Worker.
 * @owner AI-Builder
*/

import { OpenAPIHono } from '@hono/zod-openapi'
import type { MiddlewareHandler } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import { app, Bindings } from './utils/hono'

// Import routes
import octokitApi from './octokit'
import toolsApi from './tools'

// --- 1. Middleware ---

// Logging middleware
app.use('*', async (c, next) => {
  const startTime = Date.now()
  const correlationId = c.req.header('X-Correlation-ID') || crypto.randomUUID()
  c.set('correlationId', correlationId)

  await next()

  c.res.headers.set('X-Correlation-ID', correlationId)
  const endTime = Date.now()
  const latency = endTime - startTime
  const payloadSizeHeader = c.req.header('content-length') || '0'
  const payloadSizeBytes = Number.parseInt(payloadSizeHeader, 10) || 0
  const logEntry = {
    level: 'info' as const,
    message: `[route] ${c.req.method} ${c.req.path}`,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    latency,
    payloadSizeBytes,
    correlationId,
    timestamp: new Date().toISOString(),
  }

  console.log(
    JSON.stringify({
      ...logEntry,
      latency: `${latency}ms`,
      payloadSize: `${payloadSizeBytes} bytes`,
    })
  )

  try {
    await c.env.CORE_GITHUB_API.prepare(
      `INSERT INTO request_logs (
        timestamp,
        level,
        message,
        method,
        path,
        status,
        latency_ms,
        payload_size_bytes,
        correlation_id,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        logEntry.timestamp,
        logEntry.level,
        logEntry.message,
        logEntry.method,
        logEntry.path,
        logEntry.status,
        logEntry.latency,
        logEntry.payloadSizeBytes,
        logEntry.correlationId,
        JSON.stringify({
          userAgent: c.req.header('user-agent') || null,
          referer: c.req.header('referer') || null,
          host: c.req.header('host') || null,
        })
      )
      .run()
  } catch (error) {
    console.error('Failed to persist request log to D1', error)
  }
})

const requireApiKey: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    await next()
    return
  }

  const expectedApiKey = c.env.WORKER_API_KEY

  if (!expectedApiKey) {
    console.error('WORKER_API_KEY is not configured')
    return c.json({ error: 'Service misconfigured' }, 500)
  }

  const providedApiKey = c.req.header('x-api-key')
    || (c.req.header('authorization')?.startsWith('Bearer ')
      ? c.req.header('authorization')?.slice('Bearer '.length)
      : undefined)

  if (providedApiKey !== expectedApiKey) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}

app.use('/api/*', requireApiKey)
app.use('/mcp/*', requireApiKey)
app.use('/a2a/*', requireApiKey)


// --- 2. Route Definitions ---

// Health check endpoint
app.get(
  '/healthz',
  (c) => {
    return c.json({ ok: true })
  },
)

// The OpenAPI documentation will be available at /doc
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Cloudflare Worker GitHub Proxy',
  },
  servers: [
    { url: '/api', description: 'API Interface' },
    { url: '/mcp', description: 'Machine-to-Cloud Interface' },
    { url: '/a2a', description: 'Agent-to-Agent Interface' },
  ],
})

// Optional: Add swagger UI
app.get('/doc', swaggerUI({ url: '/openapi.json' }))

// --- 3. API Routes ---

// Create ONE shared router instance for all business logic
const sharedApi = new OpenAPIHono<{ Bindings: Bindings }>()
sharedApi.route('/octokit', octokitApi)
sharedApi.route('/tools', toolsApi)

// Mount the shared router under all three top-level paths
app.route('/api', sharedApi)
app.route('/mcp', sharedApi)
app.route('/a2a', sharedApi)


// --- 4. Export the app ---

export default app

/**
 * @extension_point
 * This is a good place to add new top-level routes or middleware.
 * For example, you could add an authentication middleware here.
 */
