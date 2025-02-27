import { useMutation } from '@tanstack/react-query';

import { editProduct } from '@/api/requests';
import type { editProductParams } from '@/api/requests';

export const useEditProduct = (
  settings?: MutationSettings<editProductParams, typeof editProduct>
) =>
  useMutation({
    mutationFn: (params: editProductParams) => editProduct(params),
    ...settings?.options
  });
