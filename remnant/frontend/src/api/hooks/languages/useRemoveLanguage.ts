import { useMutation } from '@tanstack/react-query';

import { removeLanguage } from '@/api/requests';
import type { removeLanguageParams } from '@/api/requests';

export const useRemoveLanguage = (
  settings?: MutationSettings<removeLanguageParams, typeof removeLanguage>
) =>
  useMutation({
    mutationFn: (params: removeLanguageParams) => removeLanguage(params),
    ...settings?.options
  });
