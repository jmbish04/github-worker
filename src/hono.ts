import { Hono } from 'hono'
import { OpenAPIHono, createOpenAPIApp } from '@hono/zod-openapi'
import { z } from 'zod'

const app = new OpenAPIHono()

app.get('/healthz', (c) => c.json({ ok: true }))

// Example schema + endpoint for OpenAPI
const PingSchema = z.object({
  message: z.string().openapi({ example: 'pong' }),
})

app.openapi(
  {
    method: 'get',
    path: '/api/ping',
    request: {},
    responses: {
      200: {
        description: 'Ping',
        content: {
          'application/json': {
            schema: PingSchema,
          },
        },
      },
    },
  },
  (c) => c.json({ message: 'pong' })
)

// OpenAPI endpoints
app.doc('/openapi.json')
app.doc('/openapi.yaml')

export default app
