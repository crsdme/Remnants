import { useMutation } from '@tanstack/react-query';

import { editLanguage } from '../../requests';
import type { editLanguageParams } from '../../requests';

export const useEditLanguage = (
  settings?: MutationSettings<editLanguageParams, typeof editLanguage>
) =>
  useMutation({
    mutationFn: (params: editLanguageParams) => editLanguage(params),
    ...settings?.options
  });
