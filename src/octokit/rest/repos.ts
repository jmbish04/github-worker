/**
 * GitHub Repos API proxy.
 */
import { GitHubCore } from '../core'

export class ReposAPI {
  constructor(private core: GitHubCore) {}
  async listForUser(user: string) {
    this.core.log('list repos for', user)
    const res = await this.core.octokit.repos.listForUser({ username: user })
    return res.data
  }
}
