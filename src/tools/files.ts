/**
 * @file src/tools/files.ts
 * @description This file contains the implementation of the file upsert tool.
 * @owner AI-Builder
 */

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { getOctokit } from '../octokit/core'
import { encode } from '../utils/base64'
import { Bindings } from '../utils/hono'

// --- 1. Zod Schema Definitions ---

const UpsertFileRequestSchema = z.object({
  owner: z.string().openapi({ example: 'octocat' }),
  repo: z.string().openapi({ example: 'Hello-World' }),
  path: z.string().openapi({ example: 'test.txt' }),
  content: z.string().openapi({ example: 'Hello, world!' }),
  message: z.string().openapi({ example: 'feat: add test.txt' }),
  sha: z.string().optional().openapi({ example: '95b966ae1c166bd92f8ae7d1c313e738c731dfc3' }),
})

const UpsertFileResponseSchema = z.object({
  content: z.object({
    name: z.string(),
    path: z.string(),
    sha: z.string(),
    size: z.number(),
    url: z.string().url(),
    html_url: z.string().url(),
    git_url: z.string().url(),
    download_url: z.string().url().nullable(),
    type: z.string(),
  }),
  commit: z.object({
    sha: z.string(),
    url: z.string().url(),
    html_url: z.string().url(),
    message: z.string(),
  }),
})

// --- 2. Route Definition ---

const upsertFileRoute = createRoute({
  method: 'post',
  path: '/files/upsert',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpsertFileRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UpsertFileResponseSchema,
        },
      },
      description: 'File created or updated successfully.',
    },
  },
  'x-agent': true,
  description: 'Create or update a file in a GitHub repository.',
})

// --- 3. Hono App and Handler ---

const files = new OpenAPIHono<{ Bindings: Bindings }>()

files.openapi(upsertFileRoute, async (c) => {
  const { owner, repo, path, content, message, sha } = c.req.valid('json')
  const octokit = getOctokit(c.env)

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encode(content),
    sha,
  })

  // The response from Octokit is more verbose than our schema, so we need to map it.
  const response: z.infer<typeof UpsertFileResponseSchema> = {
    content: {
      name: data.content!.name,
      path: data.content!.path,
      sha: data.content!.sha,
      size: data.content!.size,
      url: data.content!.url,
      html_url: data.content!.html_url,
      git_url: data.content!.git_url,
      download_url: data.content!.download_url,
      type: data.content!.type,
    },
    commit: {
      sha: data.commit.sha!,
      url: data.commit.url,
      html_url: data.commit.html_url,
      message: data.commit.message,
    },
  }

  return c.json(response)
})

export default files

/**
 * @extension_point
 * This is a good place to add other file-related tools,
 * such as reading, deleting, or listing files.
 */
