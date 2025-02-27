import { useMutation } from '@tanstack/react-query';

import { removeProduct } from '@/api/requests';
import type { removeProductParams } from '@/api/requests';

export const useRemoveProduct = (
  settings?: MutationSettings<removeProductParams, typeof removeProduct>
) =>
  useMutation({
    mutationFn: (params: removeProductParams) => removeProduct(params),
    ...settings?.options
  });
