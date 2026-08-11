import type { SiteDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useSiteCreate,
  useSiteEdit,
  useSiteRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface SiteContextType {
  selectedSite: SiteDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<SiteFormValues>
  openModal: (site?: SiteDTO) => void
  closeModal: () => void
  submitSiteForm: (params: SiteFormValues) => void
  removeSite: (params: { ids: string[] }) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

interface SiteFormValues {
  names: Record<string, string>
  url: string
  key: string
  priority: number
  active: boolean
  warehouses: string[]
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createSiteFormSchema(t), [t])

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(formSchema) as Resolver<SiteFormValues>,
    defaultValues: getSiteFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedSite(undefined)
    form.reset()
  }

  const openModal = (site?: SiteDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!site)
    setSelectedSite(site)
    form.reset(getSiteFormValues(site))
  }

  const useMutateCreateSite = useSiteCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['sites'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditSite = useSiteEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['sites'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveSite = useSiteRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['sites'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeSite = (params: { ids: string[] }) => {
    useMutateRemoveSite.mutate(params)
  }

  const submitSiteForm = (params: SiteFormValues) => {
    if (!selectedSite || !isEdit)
      return useMutateCreateSite.mutate(params)

    return useMutateEditSite.mutate({ ...params, id: selectedSite.id })
  }

  const isLoading = useMutateCreateSite.isPending || useMutateEditSite.isPending || useMutateRemoveSite.isPending

  const value: SiteContextType = useMemo(
    () => ({
      selectedSite,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitSiteForm,
      removeSite,
    }),
    [selectedSite, isModalOpen, isLoading, isEdit, form],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteContext(): SiteContextType {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSiteContext - SiteContext')
  }
  return context
}

function createSiteFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(
      z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
    ),
    url: z.string().trim(),
    key: z.string().trim(),
    priority: z.number().optional().default(0),
    active: z.boolean().optional().default(true),
    warehouses: z.array(z.string()).optional().default([]),
  })
}

function getSiteFormValues(site?: SiteDTO): SiteFormValues {
  if (!site) {
    return {
      names: {},
      url: '',
      key: '',
      priority: 0,
      active: true,
      warehouses: [],
    }
  }
  return {
    names: { ...site.names },
    url: site.url,
    key: site.key,
    priority: site.priority,
    active: site.active,
    warehouses: [...site.warehouseIds],
  }
}
