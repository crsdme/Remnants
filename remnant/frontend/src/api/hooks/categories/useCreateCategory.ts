import { useMutation } from '@tanstack/react-query';

import { createCategory } from '@/api/requests';
import type { createCategoriesParams } from '@/api/requests';

export const useCreateCategory = (
  settings?: MutationSettings<createCategoriesParams, typeof createCategory>
) =>
  useMutation({
    mutationFn: (params: createCategoriesParams) => createCategory(params),
    ...settings?.options
  });
