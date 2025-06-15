import type { DragEndEvent } from '@dnd-kit/core'
import type React from 'react'

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

import { GripVertical, Upload, X } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'

interface UploadedFile {
  id: string
  file: File
  preview: string
  name: string
  type: string
  path: string
  isNew: boolean
}

interface SortableFileItemProps {
  file: UploadedFile
  onDelete: (id: string) => void
}

function SortableFileItem({ file, onDelete }: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-2 border rounded-lg bg-background">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-shrink-0">
        <img
          src={file.preview || '/placeholder.svg'}
          alt={file.name}
          className="w-12 h-12 object-cover rounded border"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(file.id)}
        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function FileUploadDnd({ files, setFiles, disabled = false }: {
  files
  setFiles
  disabled
}) {
  const { t } = useTranslation()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles)
      return

    Array.from(selectedFiles).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newFile: UploadedFile = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            path: '',
            type: file.type,
            preview: e.target?.result as string,
            name: file.name,
            isNew: true,
          }
          setFiles(prev => [...prev, newFile])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset input
    event.target.value = ''
  }, [])

  const handleDeleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  return (
    <div>
      <div>
        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label htmlFor="file-upload">
          <Button variant="outline" className="w-full cursor-pointer" asChild disabled={disabled}>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('component.fileUploadDnd.upload')}
            </div>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {files.map(file => (
                <SortableFileItem key={file.id} file={file} onDelete={handleDeleteFile} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {files.length === 0 && (
        <div className="text-center text-muted-foreground border rounded-lg my-2 h-[66px] flex flex-col items-center justify-center">
          <Upload className="h-4 w-4 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('component.fileUploadDnd.noFilesUploaded')}</p>
        </div>
      )}
    </div>
  )
}
