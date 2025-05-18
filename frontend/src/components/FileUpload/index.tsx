import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function FileUpload({ handleFileChange, accept }) {
  const { t } = useTranslation()

  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef(null)

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
