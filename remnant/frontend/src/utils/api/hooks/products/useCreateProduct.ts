import { useMutation } from '@tanstack/react-query';

import { createProduct } from '../../requests';
import type { createProductParams } from '../../requests';

export const useCreateProduct = (
  settings?: MutationSettings<createProductParams, typeof createProduct>
) =>
  useMutation({
    mutationFn: (params: createProductParams) => createProduct(params),
    ...settings?.options
  });
