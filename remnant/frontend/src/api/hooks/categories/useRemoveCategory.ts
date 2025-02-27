import { useMutation } from '@tanstack/react-query';

import { removeCategory } from '@/api/requests';
import type { removeCategoryParams } from '@/api/requests';

export const useRemoveCategory = (
  settings?: MutationSettings<removeCategoryParams, typeof removeCategory>
) =>
  useMutation({
    mutationFn: (params: removeCategoryParams) => removeCategory(params),
    ...settings?.options
  });
