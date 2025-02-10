import { useQueryClient } from '@tanstack/react-query';

import { getCategories } from '../../requests';
import type { getCategoriesParams } from '../../requests';

export const useSearchCategories = () => {
  const queryClient = useQueryClient();

  const fetchCategories = async (params: getCategoriesParams) => {
    return queryClient.fetchQuery({
      queryKey: ['categories', 'search', params.filters],
      queryFn: () => getCategories(params),
      staleTime: 60000
    });
  };

  return fetchCategories;
};
