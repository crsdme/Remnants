import { useMutation } from '@tanstack/react-query';

import { removeCurrency } from '../../requests';
import type { removeCurrencyParams } from '../../requests';

export const useRemoveCurrency = (
  settings?: MutationSettings<removeCurrencyParams, typeof removeCurrency>
) =>
  useMutation({
    mutationFn: (params: removeCurrencyParams) => removeCurrency(params),
    ...settings?.options
  });
