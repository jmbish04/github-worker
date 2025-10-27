# GitHub Proxy — Cloudflare Worker

A modular Hono + Octokit Cloudflare Worker that proxies GitHub REST and GraphQL APIs and exposes OpenAPI specs.

## Setup

```bash
wrangler secret put GITHUB_TOKEN
wrangler dev
```

## Endpoints
- `/api/octokit/rest/...`
- `/api/octokit/graphql`
- `/api/tools/files/upsert`
- `/openapi.json`
- `/openapi.yaml`
