/**
 * Core Octokit GitHub client wrapper for authentication, retries, and logging.
 */
import { Octokit } from '@octokit/rest'

export class GitHubCore {
  octokit: Octokit
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }

  log(...args: any[]) {
    console.log('[GitHubCore]', ...args)
  }
}
