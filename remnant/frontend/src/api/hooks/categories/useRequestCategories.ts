import { useSuspenseQuery } from '@tanstack/react-query';

import { getCategories } from '@/api/requests';
import type { getCategoriesParams } from '@/api/requests';

export const useRequestCategories = (params: getCategoriesParams) =>
  useSuspenseQuery({
    queryKey: ['categories', 'get', params.pagination.current],
    queryFn: () => getCategories(params),
    staleTime: 60000
  });
