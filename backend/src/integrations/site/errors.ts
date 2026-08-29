export class SiteSyncError extends Error {
  readonly status?: number
  readonly outdated: boolean

  constructor(message: string, status?: number, outdated = false) {
    super(message)
    this.name = 'SiteSyncError'
    this.status = status
    this.outdated = outdated
  }
}
