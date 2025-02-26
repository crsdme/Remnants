import { useMutation } from '@tanstack/react-query';

import { editProduct } from '../../requests';
import type { editProductParams } from '../../requests';

export const useEditProduct = (
  settings?: MutationSettings<editProductParams, typeof editProduct>
) =>
  useMutation({
    mutationFn: (params: editProductParams) => editProduct(params),
    ...settings?.options
  });
