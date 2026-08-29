import { PHONE_DEFAULT_COUNTRY_FALLBACK, PHONE_DEFAULT_COUNTRY_SETTING_KEY } from '@remnant/shared'
import { CountrySelect } from '@/components/CountrySelect'
import { Card, CardContent, CardHeader, CardTitle, Switch } from '@/components/ui'
import { ISO_COUNTRY_CODES } from '@/utils/constants'
import { useLocale } from '@/utils/hooks'
import { SettingRow } from './components/setting-row'
import { useSettingContext } from './context'

type CountryCode = (typeof ISO_COUNTRY_CODES)[number]

function parseCountryCode(value: string | undefined): CountryCode {
  const code = value?.trim().toUpperCase()
  if (code != null && (ISO_COUNTRY_CODES as readonly string[]).includes(code))
    return code as CountryCode
  return PHONE_DEFAULT_COUNTRY_FALLBACK
}

export function MainSettingsPage() {
  const { t, language } = useLocale()
  const { editSetting, isLoading, getSetting } = useSettingContext()

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('page.settings.catalog.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SettingRow
            label={t('page.settings.main.isPropertyGroupRequired.label')}
            hint={t('page.settings.main.isPropertyGroupRequired.description')}
          >
            <Switch
              disabled={isLoading}
              onCheckedChange={value => editSetting({ key: 'productForm:isPropertyGroupRequired', value })}
              checked={getSetting('productForm:isPropertyGroupRequired')?.value === 'true'}
            />
          </SettingRow>

          <SettingRow
            label={t('page.settings.main.isCategoryRequired.label')}
            hint={t('page.settings.main.isCategoryRequired.description')}
          >
            <Switch
              disabled={isLoading}
              onCheckedChange={value => editSetting({ key: 'productForm:isCategoryRequired', value })}
              checked={getSetting('productForm:isCategoryRequired')?.value === 'true'}
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('page.settings.interface.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SettingRow
            label={t('page.settings.interface.phoneCountry.label')}
            hint={t('page.settings.interface.phoneCountry.description')}
          >
            <div className="w-56">
              <CountrySelect
                locale={language}
                disabled={isLoading}
                preferred={['UA', 'US', 'PL', 'DE', 'GB']}
                value={parseCountryCode(getSetting(PHONE_DEFAULT_COUNTRY_SETTING_KEY)?.value)}
                onChange={(value) => {
                  editSetting({
                    key: PHONE_DEFAULT_COUNTRY_SETTING_KEY,
                    value: value ?? PHONE_DEFAULT_COUNTRY_FALLBACK,
                  })
                }}
              />
            </div>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
