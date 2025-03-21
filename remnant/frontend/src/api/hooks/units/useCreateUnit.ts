import { useMutation } from '@tanstack/react-query';

import type { createUnitsParams } from '@/api/requests';
import { createUnit } from '@/api/requests';

export const useCreateUnit = (settings?: MutationSettings<createUnitsParams, typeof createUnit>) =>
  useMutation({
    mutationFn: (params: createUnitsParams) => createUnit(params),
    ...settings?.options
  });
