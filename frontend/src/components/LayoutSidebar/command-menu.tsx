import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Barcode,
  ClipboardList,
  Package,
  Search,
  ShoppingCart,
} from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { NAV_MENU_ITEMS } from '@/utils/constants'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'

import { SIDEMENU_ICONS } from './icons'

interface CommandNavItem {
  id: string
  title: string
  url: string
  icon?: LucideIcon
}

interface QuickAction {
  id: string
  url: string
  permissions: string[]
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'createOrder',
    url: '/orders/create',
    permissions: ['order.create'],
    icon: ShoppingCart,
  },
  {
    id: 'createProcurement',
    url: '/procurements/create',
    permissions: ['procurement.create'],
    icon: Package,
  },
  {
    id: 'createInventory',
    url: '/inventories/create',
    permissions: ['inventory.create'],
    icon: ClipboardList,
  },
  {
    id: 'createWarehouseTransaction',
    url: '/warehouse-transactions/create',
    permissions: ['warehouseTransaction.create'],
    icon: ArrowLeftRight,
  },
  {
    id: 'createBarcode',
    url: '/barcodes/create',
    permissions: ['barcode.create'],
    icon: Barcode,
  },
]

function flattenNavItems(
  items: typeof NAV_MENU_ITEMS,
  permissions: string[],
  t: (key: string) => string,
): CommandNavItem[] {
  const result: CommandNavItem[] = []

  for (const item of items) {
    if (item.items?.length) {
      result.push(...flattenNavItems(item.items as typeof NAV_MENU_ITEMS, permissions, t))
      continue
    }

    if (item.url && hasPermission(permissions, item.permissions || [])) {
      const iconKey = 'icon' in item ? item.icon : undefined
      const icon = iconKey
        ? SIDEMENU_ICONS[iconKey as keyof typeof SIDEMENU_ICONS]
        : undefined

      result.push({
        id: item.id,
        title: t(`component.sidemenu.label.${item.id}`),
        url: item.url,
        icon,
      })
    }
  }

  return result
}

function useIsMac() {
  return React.useMemo(() => {
    if (typeof navigator === 'undefined')
      return false
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  }, [])
}

export function SidebarCommandMenu() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { permissions } = useAuthContext()
  const { isMobile, setOpenMobile } = useSidebar()
  const isMac = useIsMac()

  const [open, setOpen] = React.useState(false)

  const navItems = React.useMemo(
    () => flattenNavItems(NAV_MENU_ITEMS, permissions, t),
    [permissions, t],
  )

  const actions = React.useMemo(
    () => QUICK_ACTIONS.filter(action => hasPermission(permissions, action.permissions)),
    [permissions],
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // event.code — физическая клавиша, не зависит от раскладки (ru/en)
      if (event.code !== 'KeyK' || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
        return

      event.preventDefault()
      event.stopPropagation()
      setOpen(prev => !prev)
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  const runCommand = React.useCallback((url: string) => {
    setOpen(false)
    if (isMobile)
      setOpenMobile(false)
    void navigate(url)
  }, [isMobile, navigate, setOpenMobile])

  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K'

  return (
    <>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2 z-10 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
          <SidebarInput
            readOnly
            value=""
            placeholder={t('component.commandMenu.search')}
            onClick={() => setOpen(true)}
            onFocus={(event) => {
              event.currentTarget.blur()
              setOpen(true)
            }}
            className="h-8 cursor-pointer border-sidebar-border bg-background pl-8 pr-16 shadow-none"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border border-sidebar-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            {shortcutLabel}
          </kbd>
        </SidebarGroupContent>

        <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t('component.commandMenu.search')}
              onClick={() => setOpen(true)}
            >
              <Search />
              <span>{t('component.commandMenu.search')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('component.commandMenu.title')}
        description={t('component.commandMenu.description')}
      >
        <CommandInput placeholder={t('component.commandMenu.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('component.commandMenu.empty')}</CommandEmpty>

          {navItems.length > 0 && (
            <CommandGroup heading={t('component.commandMenu.navigation')}>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={`nav-${item.id}`}
                    value={`${item.title} ${item.url}`}
                    onSelect={() => runCommand(item.url)}
                  >
                    {Icon ? <Icon /> : <span className="size-4 shrink-0" />}
                    <span>{item.title}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {navItems.length > 0 && actions.length > 0 && <CommandSeparator />}

          {actions.length > 0 && (
            <CommandGroup heading={t('component.commandMenu.actions')}>
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={`action-${action.id}`}
                    value={`${t(`component.commandMenu.action.${action.id}`)} ${action.url}`}
                    onSelect={() => runCommand(action.url)}
                  >
                    <Icon />
                    <span>{t(`component.commandMenu.action.${action.id}`)}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
