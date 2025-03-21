import { useMutation } from '@tanstack/react-query';

import type { removeProductParams } from '@/api/requests';
import { removeProduct } from '@/api/requests';

export const useRemoveProduct = (
  settings?: MutationSettings<removeProductParams, typeof removeProduct>
) =>
  useMutation({
    mutationFn: (params: removeProductParams) => removeProduct(params),
    ...settings?.options
  });
