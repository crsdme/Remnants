export class SiteSyncError extends Error {
  readonly status?: number

  constructor(message: string, __status?: number) {
    super(message)
    this.name = 'SiteSyncError'
    this.status = __status
  }
}
