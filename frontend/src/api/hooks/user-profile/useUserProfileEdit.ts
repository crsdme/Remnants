import type { EditUserProfileRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editUserProfile } from '@/api/requests'

export function useUserProfileEdit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: EditUserProfileRequest) => editUserProfile(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
