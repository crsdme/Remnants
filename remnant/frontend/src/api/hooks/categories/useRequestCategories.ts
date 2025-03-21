import { useSuspenseQuery } from '@tanstack/react-query';

import type { getCategoriesParams } from '@/api/requests';
import { getCategories } from '@/api/requests';

export const useRequestCategories = (params: getCategoriesParams) =>
  useSuspenseQuery({
    queryKey: ['categories', 'get', params.pagination.current],
    queryFn: () => getCategories(params),
    staleTime: 60000
  });
