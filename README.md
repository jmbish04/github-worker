# Cloudflare Worker GitHub Proxy

This is a modular, extensible Cloudflare Worker that proxies the GitHub API, built with Hono and TypeScript. It's designed to be used by AI agents to interact with GitHub.

## 🚀 Usage

The worker exposes three main sets of endpoints:

-   `/api/tools`: High-level tools for common agent workflows, such as creating files and opening pull requests.
-   `/api/octokit/rest`: A generic proxy for the GitHub REST API.
-   `/api/octokit/graphql`: A proxy for the GitHub GraphQL API.

### Tools API

The Tools API is the recommended way for agents to interact with this worker. It provides a simplified interface for common tasks.

-   `POST /api/tools/files/upsert`: Create or update a file.
-   `POST /api/tools/prs/open`: Open a new pull request.
-   `POST /api/tools/issues/create`: Create a new issue.

### REST API Proxy

The REST API proxy allows you to call any method in the [Octokit REST API](https://octokit.github.io/rest.js/v20).

-   `POST /api/octokit/rest/:namespace/:method`: Call a REST API method.

For example, to get a repository's details, you would make a `POST` request to `/api/octokit/rest/repos/get` with the following body:

```json
{
  "owner": "octocat",
  "repo": "Hello-World"
}
```

### GraphQL API Proxy

The GraphQL API proxy allows you to make queries to the GitHub GraphQL API.

-   `POST /api/octokit/graphql`: Execute a GraphQL query.

##  deploying

To deploy this worker, you'll need to have the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) installed and configured.

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Set your GitHub token**: `wrangler secret put GITHUB_TOKEN`
4.  **Deploy**: `npm run deploy`

## 📝 API Documentation

API documentation is available via OpenAPI at the following endpoints:

- `/openapi.json`
- `/openapi.yaml`

You can also view the documentation using Swagger UI at `/doc`.

---

_This project was built by an AI agent._
