import { useSuspenseQuery } from '@tanstack/react-query';

import { getCurrencies } from '../../requests';
import type { getCurrenciesParams } from '../../requests';

export const useRequestCurrencies = (params: getCurrenciesParams) =>
  useSuspenseQuery({
    queryKey: ['currencies', 'get', params.pagination.current],
    queryFn: () => getCurrencies(params),
    staleTime: 60000
  });
