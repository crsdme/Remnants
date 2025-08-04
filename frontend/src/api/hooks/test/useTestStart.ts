import { useMutation } from '@tanstack/react-query'
import { startTest } from '@/api/requests'

export function useTestStart(settings?: MutationSettings<{ key: string }, typeof startTest>) {
  return useMutation({
    mutationFn: startTest,
    ...settings?.options,
  })
}
