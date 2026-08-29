import { useSettingQuery } from './useSettingQuery'

export function useSettingValue(key: string): string | undefined {
  const { settings } = useSettingQuery(
    { pagination: { full: true } },
    { options: { staleTime: 60_000, placeholderData: prevData => prevData } },
  )

  return settings.find(setting => setting.key === key)?.value
}
