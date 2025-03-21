import { useSuspenseQuery } from '@tanstack/react-query';

import type { getUnitsParams } from '@/api/requests';
import { getUnits } from '@/api/requests';

export const useRequestUnits = (params: getUnitsParams) =>
  useSuspenseQuery({
    queryKey: ['units', 'get', params.pagination.current],
    queryFn: () => getUnits(params),
    staleTime: 60000
  });
