/**
 * @file src/utils/etagCache.ts
 * @description This file contains utilities for ETag-based caching using a KV namespace.
 * @owner AI-Builder
 */

import { MiddlewareHandler } from 'hono'
import { Bindings } from './hono'

/**
 * Creates a cache key from a request URL.
 * @param {string} url - The request URL.
 * @returns {string} The cache key.
 */
const getCacheKey = (url: string): string => `etag:${url}`

/**
 * A Hono middleware for ETag-based caching.
 * @returns {MiddlewareHandler} The Hono middleware.
 */
export const etagCache = (): MiddlewareHandler<{ Bindings: Bindings }> => {
  return async (c, next) => {
    const cacheKey = getCacheKey(c.req.url)
    const ifNoneMatch = c.req.header('if-none-match')

    // Check if the ETag is in the cache
    if (ifNoneMatch) {
      const cachedEtag = await c.env.ETAG_KV.get(cacheKey)
      if (cachedEtag === ifNoneMatch) {
        return c.newResponse(null, 304)
      }
    }

    await next()

    // If the response has an ETag, store it in the cache
    const etag = c.res.headers.get('etag')
    if (etag) {
      await c.env.ETAG_KV.put(cacheKey, etag)
    }
  }
}

/**
 * @extension_point
 * This is a good place to add more advanced caching strategies,
 * such as TTL (time-to-live) for cached responses.
 */
