import { NavLink } from 'react-router-dom'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib'

const NAV_ITEMS = [
  { to: '/settings', end: true, key: 'catalog' },
  { to: '/settings/delivery', key: 'delivery' },
  { to: '/settings/diagnostics', key: 'diagnostics' },
] as const

export function SettingsNav() {
  const { t } = useLocale()

  return (
    <nav className="flex flex-col gap-1 w-52 shrink-0">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.key}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn(
            'rounded-md px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          {t(`page.settings.navigation.${item.key}`)}
        </NavLink>
      ))}
    </nav>
  )
}
