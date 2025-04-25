import { postRefreshToken } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'

export function useRefreshToken(settings?: QuerySettings<typeof postRefreshToken>) {
  return useQuery({
    queryKey: ['refreshToken'],
    queryFn: () => postRefreshToken(),
    ...settings?.options,
  })
}
