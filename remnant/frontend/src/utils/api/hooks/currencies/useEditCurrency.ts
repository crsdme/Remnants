import { useMutation } from '@tanstack/react-query';

import { editCurrency } from '../../requests';
import type { editCurrencyParams } from '../../requests';

export const useEditCurrency = (
  settings?: MutationSettings<editCurrencyParams, typeof editCurrency>
) =>
  useMutation({
    mutationFn: (params: editCurrencyParams) => editCurrency(params),
    ...settings?.options
  });
