import { useMutation } from '@tanstack/react-query';

import { removeCategory } from '../../requests';
import type { removeCategoryParams } from '../../requests';

export const useRemoveCategory = (
  settings?: MutationSettings<removeCategoryParams, typeof removeCategory>
) =>
  useMutation({
    mutationFn: (params: removeCategoryParams) => removeCategory(params),
    ...settings?.options
  });
