import { useSuspenseQuery } from '@tanstack/react-query';

import { getProducts } from '../../requests';
import type { GetProductsParams } from '../../requests';

export const useRequestProducts = (params: GetProductsParams) =>
  useSuspenseQuery({
    queryKey: ['products', 'get', params.pagination.current],
    queryFn: () => getProducts(params),
    staleTime: 60000
  });
