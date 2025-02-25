import { useMutation } from '@tanstack/react-query';

import { createLanguage } from '../../requests';
import type { createLanguagesParams } from '../../requests';

export const useCreateLanguage = (
  settings?: MutationSettings<createLanguagesParams, typeof createLanguage>
) =>
  useMutation({
    mutationFn: (params: createLanguagesParams) => createLanguage(params),
    ...settings?.options
  });
