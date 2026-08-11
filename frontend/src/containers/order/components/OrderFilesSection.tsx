import type { Dispatch, SetStateAction } from 'react'
import { FileImage } from 'lucide-react'
import { FileUploadDnd, ORDER_FILE_ACCEPT, type UploadedFile } from '@/components/FileUploadDnd'
import { Separator } from '@/components/ui'
import { useLocale } from '@/utils/hooks'

interface OrderFilesSectionProps {
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  isLoading?: boolean
  readOnly?: boolean
  titlePrefix: 'create-order' | 'edit-order' | 'view-order'
}

export function OrderFilesSection({
  files,
  setFiles,
  isLoading,
  readOnly,
  titlePrefix,
}: OrderFilesSectionProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <FileImage className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t(`page.${titlePrefix}.form.files`)}</p>
        <Separator className="flex-1" />
      </div>

      <FileUploadDnd
        files={files}
        setFiles={setFiles}
        isLoading={isLoading}
        readOnly={readOnly}
        variant="dropzone"
        accept={ORDER_FILE_ACCEPT}
        maxSizeMb={10}
        hint={t(`page.${titlePrefix}.form.files-hint`)}
      />
    </div>
  )
}
