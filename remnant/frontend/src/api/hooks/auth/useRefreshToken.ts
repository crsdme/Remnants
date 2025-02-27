import { useQuery } from '@tanstack/react-query';

import { postRefreshToken } from '@/api/requests';

export const useRefreshToken = (settings?: QuerySettings<typeof postRefreshToken>) =>
  useQuery({
    queryKey: ['refreshToken'],
    queryFn: () => postRefreshToken(),
    ...settings?.options
  });
