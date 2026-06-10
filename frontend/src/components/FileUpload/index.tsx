import { useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'

export function FileUpload({ handleFileChange, accept }: { handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept: string }) {
  const { t } = useLocale()

  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file?.name || null)
    handleFileChange(e)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept={accept}
      />
      <Button variant="outline" type="button" className="w-full justify-start" onClick={() => inputRef.current?.click()}>
        {fileName || t('component.import.dialog.chooseFile')}
      </Button>
    </>
  )
}
