import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTestStart } from '@/api/hooks/test/useTestStart'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/components/ui'
import { useSettingContext } from '@/contexts/SettingContext'

export function MainSettingsPage() {
  const { t } = useTranslation()
  const { editSetting, isLoading, getSetting } = useSettingContext()

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
          <CardTitle className="text-2xl font-bold">{t('page.settings.main.card.title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('page.settings.main.card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">{t('page.settings.main.isPropertyGroupRequired.label')}</p>
              <p className="text-sm text-muted-foreground ">{t('page.settings.main.isPropertyGroupRequired.description')}</p>
            </div>
            <Switch
              disabled={isLoading}
              onCheckedChange={value => editSetting({ key: 'productForm:isPropertyGroupRequired', value })}
              checked={getSetting('productForm:isPropertyGroupRequired')?.value === 'true'}
            />
          </div>

          <div className="flex justify-between">
            <div>
              <p className="text-sm">{t('page.settings.main.isCategoryRequired.label')}</p>
              <p className="text-sm text-muted-foreground ">{t('page.settings.main.isCategoryRequired.description')}</p>
            </div>
            <Switch
              disabled={isLoading}
              onCheckedChange={value => editSetting({ key: 'productForm:isCategoryRequired', value })}
              checked={getSetting('productForm:isCategoryRequired')?.value === 'true'}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('page.settings.main.card.title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('page.settings.main.card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">{t('page.settings.main.isPropertyGroupRequired.label')}</p>
              <p className="text-sm text-muted-foreground ">{t('page.settings.main.isPropertyGroupRequired.description')}</p>
            </div>
            <Button onClick={() => startTest({ key: 'createProducts' })}>{t('page.settings.main.createProducts')}</Button>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm">{t('page.settings.main.isPropertyGroupRequired.label')}</p>
              <p className="text-sm text-muted-foreground ">{t('page.settings.main.isPropertyGroupRequired.description')}</p>
            </div>
            <Button onClick={() => startTest({ key: 'createTelegramProducts' })}>{t('page.settings.main.createTelegramProducts')}</Button>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm">{t('page.settings.main.isPropertyGroupRequired.label')}</p>
              <p className="text-sm text-muted-foreground ">{t('page.settings.main.isPropertyGroupRequired.description')}</p>
            </div>
            <Button onClick={() => startTest({ key: 'quantityProducts' })}>{t('page.settings.main.quantityProducts')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
