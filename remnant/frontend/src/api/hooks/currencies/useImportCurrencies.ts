import { useMutation } from '@tanstack/react-query';

import type { importCurrenciesParams } from '@/api/requests';
import { importCurrencies } from '@/api/requests';

export const useImportCurrencies = (
  settings?: MutationSettings<importCurrenciesParams, typeof importCurrencies>
) =>
  useMutation({
    mutationFn: (params: importCurrenciesParams) => importCurrencies(params),
    ...settings?.options
  });
