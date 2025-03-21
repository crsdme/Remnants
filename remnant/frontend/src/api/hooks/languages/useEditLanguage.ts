import { useMutation } from '@tanstack/react-query';

import type { editLanguageParams } from '@/api/requests';
import { editLanguage } from '@/api/requests';

export const useEditLanguage = (
  settings?: MutationSettings<editLanguageParams, typeof editLanguage>
) =>
  useMutation({
    mutationFn: (params: editLanguageParams) => editLanguage(params),
    ...settings?.options
  });
