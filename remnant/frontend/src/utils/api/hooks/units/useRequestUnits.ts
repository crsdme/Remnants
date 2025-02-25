import { useSuspenseQuery } from '@tanstack/react-query';

import { getUnits } from '../../requests';
import type { getUnitsParams } from '../../requests';

export const useRequestUnits = (params: getUnitsParams) =>
  useSuspenseQuery({
    queryKey: ['units', 'get', params.pagination.current],
    queryFn: () => getUnits(params),
    staleTime: 60000
  });
