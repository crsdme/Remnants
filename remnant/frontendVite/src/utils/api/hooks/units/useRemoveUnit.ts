import { useMutation } from '@tanstack/react-query';

import { removeUnit } from '../../requests';
import type { removeUnitParams } from '../../requests';

export const useRemoveUnit = (settings?: MutationSettings<removeUnitParams, typeof removeUnit>) =>
  useMutation({
    mutationFn: (params: removeUnitParams) => removeUnit(params),
    ...settings?.options
  });
