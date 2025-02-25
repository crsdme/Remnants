import { useMutation } from '@tanstack/react-query';

import { editCategory } from '../../requests';
import type { editCategoryParams } from '../../requests';

export const useEditCategory = (
  settings?: MutationSettings<editCategoryParams, typeof editCategory>
) =>
  useMutation({
    mutationFn: (params: editCategoryParams) => editCategory(params),
    ...settings?.options
  });
