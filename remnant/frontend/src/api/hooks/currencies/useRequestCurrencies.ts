import { useSuspenseQuery } from '@tanstack/react-query';

import { getCurrencies } from '@/api/requests';
import type { getCurrenciesParams } from '@/api/requests';

export const useRequestCurrencies = (params: getCurrenciesParams) =>
  useSuspenseQuery({
    queryKey: [
      'currencies',
      'get',
      params.pagination.current,
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters)
    ],
    queryFn: () => getCurrencies(params),
    staleTime: 60000
  });
