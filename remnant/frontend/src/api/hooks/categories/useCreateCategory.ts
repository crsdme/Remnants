import { useMutation } from '@tanstack/react-query';

import type { createCategoriesParams } from '@/api/requests';
import { createCategory } from '@/api/requests';

export const useCreateCategory = (
  settings?: MutationSettings<createCategoriesParams, typeof createCategory>
) =>
  useMutation({
    mutationFn: (params: createCategoriesParams) => createCategory(params),
    ...settings?.options
  });
