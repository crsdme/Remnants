import { useQuery } from '@tanstack/react-query';

import { getProducts } from '../../requests';
import type { GetProductsParams } from '../../requests';

export const useRequestProducts = (params: GetProductsParams) =>
  useQuery({
    queryKey: ['products', 'get'],
    queryFn: () => getProducts({ params })
  });
