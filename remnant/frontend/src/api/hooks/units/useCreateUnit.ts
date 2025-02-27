import { useMutation } from '@tanstack/react-query';

import { createUnit } from '@/api/requests';
import type { createUnitsParams } from '@/api/requests';

export const useCreateUnit = (settings?: MutationSettings<createUnitsParams, typeof createUnit>) =>
  useMutation({
    mutationFn: (params: createUnitsParams) => createUnit(params),
    ...settings?.options
  });
