import {
  Banknote,
  BarChart3,
  ChevronsUpDown,
  FileText,
  Globe,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import LogoIcon from '@/components/ui/icons/logoIcon'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthContext } from '@/contexts'

import { hasPermission } from '@/utils/helpers/permission'

import { NavMain } from './navMain'
import { NavUser } from './navUser'

export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const authContext = useAuthContext()

  const user = authContext.user || {
    name: '',
    login: '',
  }

  const data = {
    user: {
      name: user.name,
      login: user.login,
    },
    navMain: [
      {
        title: t('component.sidemenu.label.dashboard'),
        url: '/dashboard',
        icon: LayoutDashboard,
        permissions: ['dashboard.read'],
      },
      {
        title: t('component.sidemenu.label.orders'),
        url: '/orders',
        icon: ShoppingCart,
        permissions: ['orders.read'],
      },
      {
        title: t('component.sidemenu.label.leades'),
        url: '/leades',
        icon: Users,
        permissions: ['leades.read'],
      },
      {
        title: t('component.sidemenu.label.chats'),
        url: '/chats',
        icon: MessageSquare,
        permissions: ['chats.read'],
      },
      {
        title: t('component.sidemenu.label.tasks'),
        url: '/tasks',
        icon: ListChecks,
        permissions: ['tasks.read'],
      },
      {
        title: t('component.sidemenu.label.catalog'),
        icon: Package,
        permissions: ['catalog.read', 'product.read', 'attribute.read', 'attributeGroup.read', 'barcode.read', 'category.read'],
        items: [
          { title: t('component.sidemenu.label.products'), url: '/products', permissions: ['product.read'] },
          { title: t('component.sidemenu.label.categories'), url: '/categories', permissions: ['category.read'] },
          { title: t('component.sidemenu.label.attributes'), url: '/attributes', permissions: ['attribute.read'] },
          { title: t('component.sidemenu.label.attributesGroup'), url: '/attributes-group', permissions: ['attributeGroup.read'] },
          { title: t('component.sidemenu.label.barcodes'), url: '/barcodes', permissions: ['barcode.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.statistic'),
        icon: BarChart3,
        permissions: ['statistic.read', 'orderStatistic.read', 'productStatistic.read', 'stockStatistic.read'],
        items: [
          { title: t('component.sidemenu.label.orderStatistic'), url: '/statistic/order', permissions: ['orderStatistic.read'] },
          { title: t('component.sidemenu.label.productStatistic'), url: '/statistic/product', permissions: ['productStatistic.read'] },
          { title: t('component.sidemenu.label.stockStatistic'), url: '/statistic/stock', permissions: ['stockStatistic.read'] },
          { title: t('component.sidemenu.label.productionStatistic'), url: '/statistic/production', permissions: ['productionStatistic.read'] },
          { title: t('component.sidemenu.label.metrics'), url: '/statistic/metrics', permissions: ['metrics.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.marketing'),
        icon: Tag,
        permissions: ['marketing.read', 'client.read', 'promocode.read', 'coupon.read', 'bonus.read'],
        items: [
          { title: t('component.sidemenu.label.clients'), url: '/clients', permissions: ['client.read'] },
          { title: t('component.sidemenu.label.promocodes'), url: '/promocodes', permissions: ['promocode.read'] },
          { title: t('component.sidemenu.label.coupons'), url: '/coupons', permissions: ['coupon.read'] },
          { title: t('component.sidemenu.label.bonuses'), url: '/bonuses', permissions: ['bonus.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.stocks'),
        icon: Warehouse,
        permissions: ['stock.read', 'purchase.read', 'procurement.read', 'production.read', 'inventory.read'],
        items: [
          { title: t('component.sidemenu.label.stocks'), url: '/stocks', permissions: ['stock.read'] },
          { title: t('component.sidemenu.label.purchases'), url: '/purchases', permissions: ['purchase.read'] },
          { title: t('component.sidemenu.label.procurements'), url: '/procurements', permissions: ['procurement.read'] },
          { title: t('component.sidemenu.label.production'), url: '/production', permissions: ['production.read'] },
          { title: t('component.sidemenu.label.inventories'), url: '/inventories', permissions: ['inventory.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.money'),
        icon: Banknote,
        permissions: ['money.read', 'cashregister.read', 'expense.read', 'investor.read', 'provider.read'],
        items: [
          { title: t('component.sidemenu.label.cashregisters'), url: '/cashregisters', permissions: ['cashregister.read'] },
          {
            title: t('component.sidemenu.label.cashregistersAccounts'),
            url: '/cashregisters/accounts',
            permissions: ['cashregisterAccount.read'],
          },
          { title: t('component.sidemenu.label.expenses'), url: '/expenses', permissions: ['expense.read'] },
          { title: t('component.sidemenu.label.investors'), url: '/investors', permissions: ['investor.read'] },
          { title: t('component.sidemenu.label.providers'), url: '/providers', permissions: ['provider.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.socials'),
        icon: Globe,
        permissions: ['social.read', 'news.read', 'update.read', 'tour.read'],
        items: [
          { title: t('component.sidemenu.label.news'), url: '/socials/news', permissions: ['news.read'] },
          { title: t('component.sidemenu.label.updates'), url: '/updates', permissions: ['update.read'] },
          { title: t('component.sidemenu.label.tour'), url: '/tour', permissions: ['tour.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.users'),
        icon: Users,
        permissions: ['user.read', 'timetable.read'],
        items: [
          { title: t('component.sidemenu.label.users'), url: '/users', permissions: ['user.read'] },
          { title: t('component.sidemenu.label.timetable'), url: '/users/timetable', permissions: ['timetable.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.settings'),
        icon: Settings,
        permissions: ['settings.read', 'language.read', 'currency.read', 'source.read', 'orderStatus.read', 'deliveryService.read', 'unit.read', 'log.read', 'userRole.read'],
        items: [
          { title: t('component.sidemenu.label.languages'), url: '/settings/languages', permissions: ['language.read'] },
          { title: t('component.sidemenu.label.currencies'), url: '/settings/currencies', permissions: ['currency.read'] },
          { title: t('component.sidemenu.label.sources'), url: '/settings/sources', permissions: ['source.read'] },
          { title: t('component.sidemenu.label.orderStatuses'), url: '/settings/order-statuses', permissions: ['orderStatus.read'] },
          {
            title: t('component.sidemenu.label.deliveryServices'),
            url: '/settings/delivery-services',
            permissions: ['deliveryService.read'],
          },
          { title: t('component.sidemenu.label.units'), url: '/settings/units', permissions: ['unit.read'] },
          { title: t('component.sidemenu.label.settings'), url: '/settings', permissions: ['settings.read'] },
          { title: t('component.sidemenu.label.logs'), url: '/settings/logs', permissions: ['log.read'] },
          { title: t('component.sidemenu.label.userRoles'), url: '/settings/user-roles', permissions: ['userRole.read'] },
        ],
      },
      {
        title: t('component.sidemenu.label.documents'),
        url: '/documents',
        icon: FileText,
        permissions: ['document.read'],
      },
    ],
  }

  // function filterByPermissions(items, userPermissions) {
  //   return items
  //     .map((item) => {
  //       const hasPermission = item.permissions.every(p => userPermissions.includes(p))

  //       if (item.items) {
  //         const filteredChildren = filterByPermissions(item.items, userPermissions)
  //         if (filteredChildren.length > 0 || hasPermission) {
  //           return { ...item, items: filteredChildren }
  //         }
  //         return null
  //       }

  //       return hasPermission ? item : null
  //     })
  //     .filter(Boolean)
  // }

  // data.navMain = filterByPermissions(data.navMain, authContext.permissions)
  data.navMain = sidebarPermission(data.navMain, authContext.permissions)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
            <LogoIcon className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Remnants</span>
            <span className="truncate text-xs">ERP</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function sidebarPermission(items, permissions) {
  return items
    .map((item) => {
      const hasAccess = hasPermission(permissions, item.permissions || [])

      let children = item.items || []
      if (children.length > 0) {
        children = sidebarPermission(children, permissions)
      }

      if (hasAccess || children.length > 0) {
        return { ...item, items: children }
      }

      return null
    })
    .filter(Boolean)
}
