import { GitHubCore } from '../octokit/core'
import { ContentsAPI } from '../octokit/rest/contents'

export class FileTools {
  private contents: ContentsAPI
  constructor(core: GitHubCore) {
    this.contents = new ContentsAPI(core)
  }

  async upsertText(owner: string, repo: string, path: string, message: string, text: string) {
    return this.contents.createOrUpdate(owner, repo, path, text, message)
  }
}
