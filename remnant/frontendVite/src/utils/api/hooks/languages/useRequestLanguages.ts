import { useSuspenseQuery } from '@tanstack/react-query';

import { getLanguages } from '../../requests';
import type { getLanguagesParams } from '../../requests';

export const useRequestLanguages = (params: getLanguagesParams) =>
  useSuspenseQuery({
    queryKey: ['languages', 'get'],
    queryFn: () => getLanguages(params)
  });
