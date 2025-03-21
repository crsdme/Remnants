import { useMutation } from '@tanstack/react-query';

import type { editCurrencyParams } from '@/api/requests';
import { editCurrency } from '@/api/requests';

export const useEditCurrency = (
  settings?: MutationSettings<editCurrencyParams, typeof editCurrency>
) =>
  useMutation({
    mutationFn: (params: editCurrencyParams) => editCurrency(params),
    ...settings?.options
  });
