/**
 * @file src/index.ts
 * @description This is the main entry point for the Cloudflare Worker.
 * @owner AI-Builder
*/

import { OpenAPIHono } from '@hono/zod-openapi'
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
  const payloadSize = c.req.header('content-length') || '0'

  console.log(
    JSON.stringify({
      level: 'info',
      message: `[route] ${c.req.method} ${c.req.path}`,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      latency: `${latency}ms`,
      payloadSize: `${payloadSize} bytes`,
      correlationId,
      timestamp: new Date().toISOString(),
    })
  )
})


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
