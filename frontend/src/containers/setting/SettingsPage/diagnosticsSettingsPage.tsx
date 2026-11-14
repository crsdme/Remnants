import { toast } from 'sonner'
import { useTestStart } from '@/api/hooks/test/useTestStart'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { SettingRow } from './components/setting-row'

function DiagnosticsConfirmButton({
  title,
  description,
  onConfirm,
}: {
  title: string
  description: string
  onConfirm: () => void
}) {
  const { t } = useLocale()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline">
          {t('page.settings.diagnostics.run')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('page.settings.diagnostics.run')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DiagnosticsSettingsPage() {
  const { t } = useLocale()

  const { mutate: startTest } = useTestStart({
    options: {
      onSuccess: (response) => {
        toast.success(response.data.message || t('page.settings.main.startTestSuccess'))
      },
    },
  })

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('page.settings.diagnostics.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SettingRow
            label={t('page.settings.main.createProducts')}
            hint={t('page.settings.diagnostics.createProducts.hint')}
          >
            <Button type="button" variant="outline" onClick={() => startTest({ key: 'createProducts' })}>
              {t('page.settings.diagnostics.run')}
            </Button>
          </SettingRow>
          <SettingRow
            label={t('page.settings.main.createTelegramProducts')}
            hint={t('page.settings.diagnostics.createTelegramProducts.hint')}
          >
            <Button type="button" variant="outline" onClick={() => startTest({ key: 'createTelegramProducts' })}>
              {t('page.settings.diagnostics.run')}
            </Button>
          </SettingRow>
          <SettingRow
            label={t('page.settings.main.quantityProducts')}
            hint={t('page.settings.diagnostics.quantityProducts.hint')}
          >
            <Button type="button" variant="outline" onClick={() => startTest({ key: 'quantityProducts' })}>
              {t('page.settings.diagnostics.run')}
            </Button>
          </SettingRow>
          <SettingRow
            label={t('page.settings.main.addProductCategories.label')}
            hint={t('page.settings.main.addProductCategories.description')}
          >
            <DiagnosticsConfirmButton
              title={t('page.settings.diagnostics.addProductCategories.confirmTitle')}
              description={t('page.settings.diagnostics.addProductCategories.confirmDescription')}
              onConfirm={() => startTest({ key: 'addProductCategories' })}
            />
          </SettingRow>
          <SettingRow
            label={t('page.settings.main.recalculateProductPrices')}
            hint={t('page.settings.diagnostics.recalculateProductPrices.hint')}
          >
            <DiagnosticsConfirmButton
              title={t('page.settings.diagnostics.recalculateProductPrices.confirmTitle')}
              description={t('page.settings.diagnostics.recalculateProductPrices.confirmDescription')}
              onConfirm={() => startTest({ key: 'recalculateProductPrices' })}
            />
          </SettingRow>
          <SettingRow
            label={t('page.settings.main.createInventoryCategories')}
            hint={t('page.settings.diagnostics.createInventoryCategories.hint')}
          >
            <Button type="button" variant="outline" onClick={() => startTest({ key: 'createInventoryCategories' })}>
              {t('page.settings.diagnostics.run')}
            </Button>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
