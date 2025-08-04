import { api } from '@/api/instance'

export async function startTest(params: { key: string }) {
  return api.post('test/start', params)
}
