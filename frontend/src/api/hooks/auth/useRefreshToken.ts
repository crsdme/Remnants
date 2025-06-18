import { useQuery } from '@tanstack/react-query'

import { postRefreshToken } from '@/api/requests'

export function useRefreshToken(settings?: QuerySettings<typeof postRefreshToken>) {
  return useQuery({
    queryKey: ['refreshToken'],
    queryFn: postRefreshToken,
    ...settings?.options,
  })
}
