import { api } from '@/api/instance'

export async function startTest() {
  return api.post('test/start')
}
