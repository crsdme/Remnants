import { useMutation } from '@tanstack/react-query';

import { editCategory } from '@/api/requests';
import type { editCategoryParams } from '@/api/requests';

export const useEditCategory = (
  settings?: MutationSettings<editCategoryParams, typeof editCategory>
) =>
  useMutation({
    mutationFn: (params: editCategoryParams) => editCategory(params),
    ...settings?.options
  });
