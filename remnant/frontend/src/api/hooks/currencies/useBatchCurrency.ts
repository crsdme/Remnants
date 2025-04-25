import { useMutation } from '@tanstack/react-query';

import type { batchCurrencyParams } from '@/api/requests';
import { batchCurrency } from '@/api/requests';

export const useBatchCurrency = (
  settings?: MutationSettings<batchCurrencyParams, typeof batchCurrency>
) =>
  useMutation({
    mutationFn: (params: batchCurrencyParams) => batchCurrency(params),
    ...settings?.options
  });
