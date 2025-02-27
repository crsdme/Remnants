import { useMutation } from '@tanstack/react-query';

import { createCurrency } from '../../requests';
import type { createCurrenciesParams } from '../../requests';

export const useCreateCurrency = (
  settings?: MutationSettings<createCurrenciesParams, typeof createCurrency>
) =>
  useMutation({
    mutationFn: (params: createCurrenciesParams) => createCurrency(params),
    ...settings?.options
  });
