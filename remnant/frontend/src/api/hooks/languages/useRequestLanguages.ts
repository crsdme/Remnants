import { useSuspenseQuery } from '@tanstack/react-query';

import { getLanguages } from '@/api/requests';
import type { getLanguagesParams } from '@/api/requests';

export const useRequestLanguages = (params: getLanguagesParams) =>
  useSuspenseQuery({
    queryKey: ['languages', 'get', params.pagination.current],
    queryFn: () => getLanguages(params),
    staleTime: 60000
  });
