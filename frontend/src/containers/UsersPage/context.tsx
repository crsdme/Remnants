import type { UserPopulatedDTO } from '@remnant/shared'

import type { ReactNode } from 'react'

import type { Resolver, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useUserCreate,
  useUserEdit,
  useUserRemove,
} from '@/api/hooks/'
import { useLocale } from '@/utils/hooks'

interface UserContextType {
  selectedUser: UserPopulatedDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<UserFormValues>
  openModal: (user?: UserPopulatedDTO) => void
  closeModal: () => void
  submitUserForm: (params: UserFormValues) => void
  removeUsers: (params: { ids: string[] }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserFormValues {
  name: string
  login: string
  password: string
  active: boolean
  role: string
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserPopulatedDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createUserFormSchema(t), [t])

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema) as Resolver<UserFormValues>,
    defaultValues: getUserFormValues(),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedUser(undefined)
    form.reset()
  }

  const openModal = (user?: UserPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!user)
    setSelectedUser(user)
    form.reset(getUserFormValues(user))
  }

  const queryClient = useQueryClient()

  const useMutateCreateUser = useUserCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUser = useUserEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUsers = useUserRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUserForm = (params: UserFormValues) => {
    if (!isEdit)
      return useMutateCreateUser.mutate(params)

    if (!selectedUser)
      return

    return useMutateEditUser.mutate({ ...params, id: selectedUser.id })
  }

  const removeUsers = (params: { ids: string[] }) => {
    useMutateRemoveUsers.mutate(params)
  }

  const isLoading = useMutateCreateUser.isPending || useMutateEditUser.isPending || useMutateRemoveUsers.isPending

  const value: UserContextType = useMemo(
    () => ({
      selectedUser,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitUserForm,
      removeUsers,
    }),
    [selectedUser, isModalOpen, isLoading, isEdit, form],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserContext(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext - UserContext')
  }
  return context
}

function createUserFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).trim(),
    login: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).trim(),
    password: z.string().optional(),
    role: z.string({ required_error: t('form.errors.required') }).trim(),
    active: z.boolean().default(true),
  })
}

function getUserFormValues(user?: UserPopulatedDTO): UserFormValues {
  if (!user) {
    return {
      name: '',
      login: '',
      password: '',
      active: true,
      role: '',
    }
  }
  return {
    name: user.name,
    login: user.login,
    password: '',
    active: user.active,
    role: user.role.id,
  }
}
