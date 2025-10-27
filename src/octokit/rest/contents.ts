/**
 * GitHub Contents API proxy for file operations.
 */
import { GitHubCore } from '../core'
import { encodeBase64 } from '../../utils/base64'

export class ContentsAPI {
  constructor(private core: GitHubCore) {}

  async createOrUpdate(owner: string, repo: string, path: string, text: string, message: string) {
    const content = encodeBase64(text)
    this.core.log('createOrUpdate', { owner, repo, path })
    return await this.core.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
    })
  }
}
