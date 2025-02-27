import { useMutation } from '@tanstack/react-query';

import { removeLanguage } from '../../requests';
import type { removeLanguageParams } from '../../requests';

export const useRemoveLanguage = (
  settings?: MutationSettings<removeLanguageParams, typeof removeLanguage>
) =>
  useMutation({
    mutationFn: (params: removeLanguageParams) => removeLanguage(params),
    ...settings?.options
  });
