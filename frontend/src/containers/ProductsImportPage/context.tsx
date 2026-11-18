import type { PreviewImportProductsResultDTO } from '@remnant/shared'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { useProductDownloadTemplate, useProductImport, useProductImportPreview } from '@/api/hooks'
import { downloadBlob } from '@/utils/helpers/download'
import { useLocale } from '@/utils/hooks'

type ImportStep = 'upload' | 'preview'

interface ProductsImportContextType {
  step: ImportStep
  file: File | null
  preview: PreviewImportProductsResultDTO | null
  isAutoSyncEnabled: boolean
  syncSites: string[]
  isPreviewLoading: boolean
  isImportLoading: boolean
  setFile: (file: File | null) => void
  setIsAutoSyncEnabled: (value: boolean) => void
  setSyncSites: (value: string[]) => void
  downloadTemplate: () => void
  runPreview: () => void
  cancelPreview: () => void
  confirmImport: () => void
}

const ProductsImportContext = createContext<ProductsImportContextType | undefined>(undefined)

export function ProductsImportProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFileState] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewImportProductsResultDTO | null>(null)
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true)
  const [syncSites, setSyncSites] = useState<string[]>([])

  const downloadTemplateMutation = useProductDownloadTemplate({
    options: {
      onSuccess: ({ data, headers }) => {
        downloadBlob(data, 'products-template.xlsx')
        toast.success(t(`response.title.${headers['x-export-code']}`), {
          description: `${t(`response.description.${headers['x-export-code']}`)} ${headers['x-export-message'] || ''}`,
        })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), {
          description: `${t(`error.description.${error.code}`)} ${error.description || ''}`,
        })
      },
    },
  })

  const previewMutation = useProductImportPreview({
    options: {
      onSuccess: ({ data }) => {
        setPreview(data.data)
        setStep('preview')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), {
          description: `${t(`error.description.${error.code}`)} ${error.description || ''}`,
        })
      },
    },
  })

  const importMutation = useProductImport({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), {
          description: t(`response.description.${data.code}`, {
            created: data.data.created,
            updated: data.data.updated,
            skipped: data.data.skipped,
            synced: data.data.synced,
            failed: data.data.failed,
          }),
        })
        navigate('/products')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), {
          description: `${t(`error.description.${error.code}`)} ${error.description || ''}`,
        })
      },
    },
  })

  const setFile = (nextFile: File | null) => {
    setFileState(nextFile)
    setPreview(null)
    setStep('upload')
  }

  const downloadTemplate = () => {
    downloadTemplateMutation.mutate()
  }

  const runPreview = () => {
    if (!file)
      return
    previewMutation.mutate({ file })
  }

  const cancelPreview = () => {
    setPreview(null)
    setFileState(null)
    setStep('upload')
  }

  const confirmImport = () => {
    if (!file)
      return
    importMutation.mutate({
      file,
      isAutoSyncEnabled,
      syncSites,
    })
  }

  const value = useMemo(
    () => ({
      step,
      file,
      preview,
      isAutoSyncEnabled,
      syncSites,
      isPreviewLoading: previewMutation.isPending,
      isImportLoading: importMutation.isPending,
      setFile,
      setIsAutoSyncEnabled,
      setSyncSites,
      downloadTemplate,
      runPreview,
      cancelPreview,
      confirmImport,
    }),
    [
      step,
      file,
      preview,
      isAutoSyncEnabled,
      syncSites,
      previewMutation.isPending,
      importMutation.isPending,
    ],
  )

  return (
    <ProductsImportContext.Provider value={value}>
      {children}
    </ProductsImportContext.Provider>
  )
}

export function useProductsImportContext() {
  const context = useContext(ProductsImportContext)
  if (!context)
    throw new Error('useProductsImportContext must be used within ProductsImportProvider')
  return context
}
