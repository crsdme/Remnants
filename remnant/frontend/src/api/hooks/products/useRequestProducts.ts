import { useSuspenseQuery } from '@tanstack/react-query';

import type { GetProductsParams } from '@/api/requests';
import { getProducts } from '@/api/requests';

export const useRequestProducts = (params: GetProductsParams) =>
  useSuspenseQuery({
    queryKey: ['products', 'get', params.pagination.current],
    queryFn: () => getProducts(params),
    staleTime: 60000
  });
