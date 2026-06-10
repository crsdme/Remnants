import { HttpError } from '@/utils/'

export async function start(payload: { key: string }) {
  const actions = {}

  const action = actions[payload.key as keyof typeof actions]

  if (action === undefined)
    throw new HttpError(400, 'Invalid action', 'INVALID_ACTION')

  // await action()

  return { status: 'success', code: 'TEST', message: 'TEST' }
}
