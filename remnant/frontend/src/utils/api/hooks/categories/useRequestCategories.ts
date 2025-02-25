import { useSuspenseQuery } from '@tanstack/react-query';

import { getCategories } from '../../requests';
import type { getCategoriesParams } from '../../requests';

export const useRequestCategories = (params: getCategoriesParams) =>
  useSuspenseQuery({
    queryKey: ['categories', 'get', params.pagination.current],
    queryFn: () => getCategories(params),
    staleTime: 60000
  });
