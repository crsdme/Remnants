import { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProfileContext } from '../context'

function todayWorkDate() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function ProfileAdjustmentSheet() {
  const { t } = useLocale()
  const {
    adjustmentOpen,
    setAdjustmentOpen,
    createAdjustment,
    isMutating,
    selectedDay,
    canEdit,
  } = useProfileContext()

  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [workDate, setWorkDate] = useState(todayWorkDate())

  useEffect(() => {
    if (!adjustmentOpen)
      return
    setAmount('')
    setComment('')
    setWorkDate(selectedDay || todayWorkDate())
  }, [adjustmentOpen, selectedDay])

  return (
    <Sheet open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>{t('page.profile.adjustment.title')}</SheetTitle>
          <SheetDescription>{t('page.profile.adjustment.description')}</SheetDescription>
        </SheetHeader>

        <div className="w-full space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label>{t('page.profile.adjustment.date')}</Label>
            <Input
              type="date"
              value={workDate}
              disabled={isMutating}
              onChange={e => setWorkDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('page.profile.adjustment.amount')}</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              disabled={isMutating}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('page.profile.adjustment.comment')}</Label>
            <Input
              value={comment}
              disabled={isMutating}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isMutating}
              onClick={() => setAdjustmentOpen(false)}
            >
              {t('button.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!canEdit || isMutating || !amount || !workDate}
              loading={isMutating}
              onClick={() => void createAdjustment({
                amountMajor: Number(amount) || 0,
                comment,
                workDate,
              })}
            >
              {t('button.submit')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
