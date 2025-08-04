import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useSiteCreate,
  useSiteEdit,
  useSiteRemove,
} from '@/api/hooks'

interface SiteContextType {
  selectedSite: Site
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (site?: Site) => void
  closeModal: () => void
  submitSiteForm: (params) => void
  removeSite: (params: { ids: string[] }) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

interface SiteProviderProps {
  children: ReactNode
}

export function SiteProvider({ children }: SiteProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(
        z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      ),
      url: z.string().trim(),
      key: z.string().trim(),
      priority: z.number().optional().default(0),
      active: z.boolean().optional().default(true),
      warehouses: z.array(z.string()).optional().default([]),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      url: '',
      key: '',
      priority: 0,
      active: true,
      warehouses: [],
    },
  })

  const queryClient = useQueryClient()

  function getSiteFormValues(site) {
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
      names: site.names,
      url: site.url,
      key: site.key,
      priority: site.priority,
      active: site.active,
      warehouses: site.warehouses,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedSite(null)
    form.reset()
  }

  const openModal = (site) => {
    setIsModalOpen(true)
    setIsEdit(!!site)
    setSelectedSite(site)
    form.reset(getSiteFormValues(site))
  }

  const useMutateCreateSite = useSiteCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['sites'] })
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
        queryClient.invalidateQueries({ queryKey: ['sites'] })
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
        queryClient.invalidateQueries({ queryKey: ['sites'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeSite = (params) => {
    useMutateRemoveSite.mutate(params)
  }

  const submitSiteForm = (params) => {
    setIsLoading(true)
    if (!selectedSite)
      return useMutateCreateSite.mutate(params)

    return useMutateEditSite.mutate({ ...params, id: selectedSite.id })
  }

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
