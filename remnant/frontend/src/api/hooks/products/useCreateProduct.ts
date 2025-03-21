import { useMutation } from '@tanstack/react-query';

import type { createProductParams } from '@/api/requests';
import { createProduct } from '@/api/requests';

export const useCreateProduct = (
  settings?: MutationSettings<createProductParams, typeof createProduct>
) =>
  useMutation({
    mutationFn: (params: createProductParams) => createProduct(params),
    ...settings?.options
  });
