import { useMutation } from '@tanstack/react-query';

import type { removeCurrencyParams } from '@/api/requests';
import { removeCurrency } from '@/api/requests';

export const useRemoveCurrency = (
  settings?: MutationSettings<removeCurrencyParams, typeof removeCurrency>
) =>
  useMutation({
    mutationFn: (params: removeCurrencyParams) => removeCurrency(params),
    ...settings?.options
  });
