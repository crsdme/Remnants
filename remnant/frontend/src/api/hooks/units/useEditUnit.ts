import { useMutation } from '@tanstack/react-query';

import { editUnit } from '@/api/requests';
import type { editUnitParams } from '@/api/requests';

export const useEditUnit = (settings?: MutationSettings<editUnitParams, typeof editUnit>) =>
  useMutation({
    mutationFn: (params: editUnitParams) => editUnit(params),
    ...settings?.options
  });
