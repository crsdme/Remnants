import { useMutation } from '@tanstack/react-query';

import { removeProduct } from '../../requests';
import type { removeProductParams } from '../../requests';

export const useRemoveProduct = (
  settings?: MutationSettings<removeProductParams, typeof removeProduct>
) =>
  useMutation({
    mutationFn: (params: removeProductParams) => removeProduct(params),
    ...settings?.options
  });
