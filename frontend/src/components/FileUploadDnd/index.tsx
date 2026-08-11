import type { DragEndEvent } from '@dnd-kit/core'

import type { ChangeEvent, Dispatch, DragEvent, SetStateAction } from 'react'

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { FileText, GripVertical, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib'

export interface UploadedFile {
  id: string
  file: File | string
  preview: string
  name: string
  type: string
  path: string
  filename?: string
  isNew: boolean
}

interface SortableFileItemProps {
  file: UploadedFile
  onDelete: (id: string) => void
  isLoading: boolean
  readOnly?: boolean
}

function isImageType(type: string, name: string) {
  if (type.startsWith('image/'))
    return true
  return /\.(png|jpe?g|webp|gif)$/i.test(name)
}

function fileExtension(name: string) {
  const match = name.match(/\.([^.]+)$/)
  return match?.[1]?.toUpperCase() ?? 'FILE'
}

function SortableFileItem({ file, onDelete, isLoading, readOnly }: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
    disabled: readOnly || isLoading,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const showImage = isImageType(file.type, file.name) && Boolean(file.preview)

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-lg border bg-background p-2">
      {!readOnly && (
        <div
          {...attributes}
          {...listeners}
          className={cn('cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing', isLoading && 'cursor-not-allowed')}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="shrink-0">
        {showImage
          ? (
              <img
                src={file.preview || '/placeholder.svg'}
                alt={file.name}
                className="h-12 w-12 rounded border object-cover"
              />
            )
          : (
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded border bg-muted/50 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="mt-0.5 text-[9px] font-semibold leading-none">{fileExtension(file.name)}</span>
              </div>
            )}
      </div>

      <div className="min-w-0 flex-1">
        {file.path && !file.isNew
          ? (
              <a
                href={file.path}
                target="_blank"
                rel="noreferrer"
                className="block w-[70%] truncate text-sm font-medium text-primary hover:underline"
              >
                {file.name}
              </a>
            )
          : (
              <p className="w-[70%] truncate text-sm font-medium">{file.name}</p>
            )}
      </div>

      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(file.id)}
          disabled={isLoading}
          className="h-8 w-8 shrink-0 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

interface FileUploadDndProps {
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  isLoading?: boolean
  accept?: string
  maxSizeMb?: number
  hint?: string
  variant?: 'button' | 'dropzone'
  readOnly?: boolean
}

const DEFAULT_ACCEPT = 'image/*'
const ORDER_ACCEPT = '.pdf,.txt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/csv'

function isAcceptedFile(file: File, accept: string) {
  if (!accept || accept === '*/*')
    return true

  const tokens = accept.split(',').map(token => token.trim().toLowerCase()).filter(Boolean)
  const fileName = file.name.toLowerCase()
  const mime = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token.startsWith('.'))
      return fileName.endsWith(token)
    if (token.endsWith('/*'))
      return mime.startsWith(token.replace('/*', '/'))
    return mime === token
  })
}

function createUploadedFile(file: File, preview: string): UploadedFile {
  return {
    id: crypto.randomUUID(),
    file,
    path: '',
    type: file.type || 'application/octet-stream',
    preview,
    name: file.name,
    isNew: true,
  }
}

export function FileUploadDnd({
  files,
  setFiles,
  isLoading = false,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 10,
  hint,
  variant = 'button',
  readOnly = false,
}: FileUploadDndProps) {
  const { t } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const addFiles = useCallback((selectedFiles: FileList | File[]) => {
    if (isLoading || readOnly)
      return

    const maxBytes = maxSizeMb * 1024 * 1024

    Array.from(selectedFiles).forEach((file) => {
      if (!isAcceptedFile(file, accept))
        return
      if (file.size > maxBytes)
        return

      if (isImageType(file.type, file.name)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFiles(prev => [...prev, createUploadedFile(file, e.target?.result as string)])
        }
        reader.readAsDataURL(file)
        return
      }

      setFiles(prev => [...prev, createUploadedFile(file, '')])
    })
  }, [accept, isLoading, maxSizeMb, readOnly, setFiles])

  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles)
      return

    addFiles(selectedFiles)
    event.target.value = ''
  }, [addFiles])

  const handleDeleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }, [setFiles])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id)
      return

    setFiles((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1)
        return items

      return arrayMove(items, oldIndex, newIndex)
    })
  }, [setFiles])

  const handleOpenFileDialog = useCallback(() => {
    if (isLoading || readOnly)
      return
    inputRef.current?.click()
  }, [isLoading, readOnly])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (isLoading || readOnly)
      return
    setIsDraggingOver(true)
  }, [isLoading, readOnly])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    if (isLoading || readOnly)
      return
    if (event.dataTransfer.files?.length)
      addFiles(event.dataTransfer.files)
  }, [addFiles, isLoading, readOnly])

  const fileList = files.length > 0 && (
    <div className={cn('space-y-2', variant === 'dropzone' ? 'mt-3' : 'mt-2')}>
      {!isLoading
        ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {files.map(file => (
                  <SortableFileItem
                    key={file.id}
                    file={file}
                    onDelete={handleDeleteFile}
                    isLoading={isLoading}
                    readOnly={readOnly}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )
        : files.map(file => (
            <SortableFileItem
              key={file.id}
              file={file}
              onDelete={handleDeleteFile}
              isLoading={isLoading}
              readOnly={readOnly}
            />
          ))}
    </div>
  )

  if (variant === 'dropzone') {
    return (
      <div>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-dropzone"
          ref={inputRef}
          disabled={isLoading || readOnly}
        />

        {!readOnly && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleOpenFileDialog}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ')
                handleOpenFileDialog()
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors',
              isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 bg-muted/20',
              (isLoading || readOnly) && 'pointer-events-none opacity-60',
            )}
          >
            <Upload className="mb-3 h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-foreground">
              {t('component.fileUploadDnd.dropOrSelect')}
              {' '}
              <span className="font-medium text-primary">{t('component.fileUploadDnd.select')}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hint || t('component.fileUploadDnd.hint', { size: maxSizeMb })}
            </p>
          </div>
        )}

        {fileList}

        {files.length === 0 && readOnly && (
          <div className="my-2 flex h-[66px] flex-col items-center justify-center rounded-lg border text-center text-muted-foreground">
            <Upload className="mx-auto mb-2 h-4 w-4 opacity-50" />
            <p className="text-sm">{t('component.fileUploadDnd.noFilesUploaded')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          ref={inputRef}
          disabled={isLoading || readOnly}
        />
        {!readOnly && (
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              type="button"
              disabled={isLoading}
              loading={isLoading}
              onClick={handleOpenFileDialog}
            >
              <Upload className="h-4 w-4" />
              {t('component.fileUploadDnd.upload')}
            </Button>
          </label>
        )}
      </div>

      {fileList}

      {files.length === 0 && (
        <div className="my-2 flex h-[66px] flex-col items-center justify-center rounded-lg border text-center text-muted-foreground">
          <Upload className="mx-auto mb-2 h-4 w-4 opacity-50" />
          <p className="text-sm">{t('component.fileUploadDnd.noFilesUploaded')}</p>
        </div>
      )}
    </div>
  )
}

export const ORDER_FILE_ACCEPT = ORDER_ACCEPT
