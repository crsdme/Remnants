import { useMutation } from '@tanstack/react-query';

import { createCategory } from '../../requests';
import type { createCategoriesParams } from '../../requests';

export const useCreateCategory = (
  settings?: MutationSettings<createCategoriesParams, typeof createCategory>
) =>
  useMutation({
    mutationFn: (params: createCategoriesParams) => createCategory(params),
    ...settings?.options
  });
