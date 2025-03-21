import { useMutation } from '@tanstack/react-query';

import type { createCurrenciesParams } from '@/api/requests';
import { createCurrency } from '@/api/requests';

export const useCreateCurrency = (
  settings?: MutationSettings<createCurrenciesParams, typeof createCurrency>
) =>
  useMutation({
    mutationFn: (params: createCurrenciesParams) => createCurrency(params),
    ...settings?.options
  });
