import { useMutation } from '@tanstack/react-query';

import { postAuthLogout } from '../../requests';

export const useAuthLogout = (settings?: MutationSettings) =>
  useMutation({
    mutationFn: () => postAuthLogout(),
    ...settings?.options
  });
