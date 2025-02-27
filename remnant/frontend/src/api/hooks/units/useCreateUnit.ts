import { useMutation } from '@tanstack/react-query';

import { createUnit } from '../../requests';
import type { createUnitsParams } from '../../requests';

export const useCreateUnit = (settings?: MutationSettings<createUnitsParams, typeof createUnit>) =>
  useMutation({
    mutationFn: (params: createUnitsParams) => createUnit(params),
    ...settings?.options
  });
