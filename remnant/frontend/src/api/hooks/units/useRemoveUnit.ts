import { useMutation } from '@tanstack/react-query';

import { removeUnit } from '@/api/requests';
import type { removeUnitParams } from '@/api/requests';

export const useRemoveUnit = (settings?: MutationSettings<removeUnitParams, typeof removeUnit>) =>
  useMutation({
    mutationFn: (params: removeUnitParams) => removeUnit(params),
    ...settings?.options
  });
