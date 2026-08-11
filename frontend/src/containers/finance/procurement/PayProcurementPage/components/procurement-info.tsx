import { useTranslation } from 'react-i18next'
import { Badge, Skeleton } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { formatDate } from '@/utils/helpers'
import { usePayProcurementContext } from '../context'

export function PayProcurementInfo() {
  const { t } = useTranslation()
  const { procurement } = usePayProcurementContext()

  if (!procurement) {
    return (
      <div className="flex justify-center items-center h-full">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    )
  }

  return (
    <>
      <Card className="flex-1">
        <CardHeader>{t('page.procurements.pay.title')}</CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.seq')}</p>
              <p className="text-sm text-foreground">{procurement?.seq}</p>
            </div>
            {/* <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.supplier')}</p>
              <p className="text-sm text-foreground">{procurement?.supplier.name}</p>
            </div> */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.status')}</p>
              <Badge variant="outline">{t(`page.procurements.status.${(procurement?.status || '').toLowerCase()}`)}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.createdAt')}</p>
              <div className="flex wrap gap-2">
                {procurement.itemsByCurrency.map(item => (
                  <Badge key={item.currency.id}>
                    {/* {`${item.amount} ${item.currency.symbols[i18n.language] || ''}`} */}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.comment')}</p>
              <p className="text-sm text-foreground">{procurement?.comment}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t('page.procurements.pay.label.createdAt')}</p>
              <p className="text-sm text-foreground">{formatDate(procurement?.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
