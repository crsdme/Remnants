import { toast } from 'sonner'
import { useTestStart } from '@/api/hooks/test/useTestStart'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { SettingRow } from './components/setting-row'

export function DiagnosticsSettingsPage() {
  const { t } = useLocale()

  const { mutate: startTest } = useTestStart({
    options: {
      onSuccess: () => {
        toast.success(t('page.settings.main.startTestSuccess'))
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
            <Button type="button" variant="outline" onClick={() => startTest({ key: 'addProductCategories' })}>
              {t('page.settings.diagnostics.run')}
            </Button>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
