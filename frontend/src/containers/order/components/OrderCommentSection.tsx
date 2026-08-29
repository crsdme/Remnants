import type { UseFormReturn } from 'react-hook-form'
import { MessageSquare } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
  Textarea,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'

interface OrderCommentSectionProps {
  form: UseFormReturn<any>
  disabled?: boolean
}

export function OrderCommentSection({ form, disabled }: OrderCommentSectionProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t('page.order.comment.title')}</p>
        <Separator className="flex-1" />
      </div>
      <FormField
        control={form.control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('page.order.comment.label')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('page.order.comment.placeholder')}
                className="w-full"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
