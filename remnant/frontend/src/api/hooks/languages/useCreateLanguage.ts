import { useMutation } from '@tanstack/react-query';

import type { createLanguagesParams } from '@/api/requests';
import { createLanguage } from '@/api/requests';

export const useCreateLanguage = (
  settings?: MutationSettings<createLanguagesParams, typeof createLanguage>
) =>
  useMutation({
    mutationFn: (params: createLanguagesParams) => createLanguage(params),
    ...settings?.options
  });
