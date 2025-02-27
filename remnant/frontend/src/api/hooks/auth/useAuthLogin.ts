import { useMutation } from '@tanstack/react-query';

import { postAuthLogin } from '@/api/requests';
import type { postAuthLoginParams } from '@/api/requests';

export const useAuthLogin = (
  settings?: MutationSettings<postAuthLoginParams, typeof postAuthLogin>
) =>
  useMutation({
    mutationFn: (params: postAuthLoginParams) => postAuthLogin(params),
    ...settings?.options
  });
