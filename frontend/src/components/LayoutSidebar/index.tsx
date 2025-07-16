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

import { LogoIcon, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarRail } from '@/components/ui'
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
        permissions: ['dashboard.page'],
      },
      {
        title: t('component.sidemenu.label.orders'),
        url: '/orders',
        icon: ShoppingCart,
        permissions: ['orders.page'],
      },
      {
        title: t('component.sidemenu.label.leades'),
        url: '/leades',
        icon: Users,
        permissions: ['leades.page'],
      },
      {
        title: t('component.sidemenu.label.chats'),
        url: '/chats',
        icon: MessageSquare,
        permissions: ['chats.page'],
      },
      {
        title: t('component.sidemenu.label.tasks'),
        url: '/tasks',
        icon: ListChecks,
        permissions: ['tasks.page'],
      },
      {
        title: t('component.sidemenu.label.catalog'),
        icon: Package,
        permissions: ['catalog.page', 'product.page', 'attribute.page', 'attributeGroup.page', 'barcode.page', 'category.page'],
        items: [
          { title: t('component.sidemenu.label.products'), url: '/products', permissions: ['product.page'] },
          { title: t('component.sidemenu.label.categories'), url: '/categories', permissions: ['category.page'] },
          { title: t('component.sidemenu.label.productPropertiesGroups'), url: '/product-properties-groups', permissions: ['product-properties-groups.page'] },
          { title: t('component.sidemenu.label.productProperties'), url: '/product-properties', permissions: ['product-property.page'] },
          { title: t('component.sidemenu.label.barcodes'), url: '/barcodes', permissions: ['barcode.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.statistic'),
        icon: BarChart3,
        permissions: ['statistic.page', 'orderStatistic.page', 'productStatistic.page', 'stockStatistic.page'],
        items: [
          { title: t('component.sidemenu.label.orderStatistic'), url: '/statistic/order', permissions: ['orderStatistic.page'] },
          { title: t('component.sidemenu.label.productStatistic'), url: '/statistic/product', permissions: ['productStatistic.page'] },
          { title: t('component.sidemenu.label.stockStatistic'), url: '/statistic/stock', permissions: ['stockStatistic.page'] },
          { title: t('component.sidemenu.label.productionStatistic'), url: '/statistic/production', permissions: ['productionStatistic.page'] },
          { title: t('component.sidemenu.label.metrics'), url: '/statistic/metrics', permissions: ['metrics.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.marketing'),
        icon: Tag,
        permissions: ['marketing.page', 'client.page', 'promocode.page', 'coupon.page', 'bonus.page'],
        items: [
          { title: t('component.sidemenu.label.clients'), url: '/clients', permissions: ['client.page'] },
          { title: t('component.sidemenu.label.promocodes'), url: '/promocodes', permissions: ['promocode.page'] },
          { title: t('component.sidemenu.label.coupons'), url: '/coupons', permissions: ['coupon.page'] },
          { title: t('component.sidemenu.label.bonuses'), url: '/bonuses', permissions: ['bonus.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.warehouses'),
        icon: Warehouse,
        permissions: ['warehouse.page', 'purchase.page', 'procurement.page', 'production.page', 'inventory.page'],
        items: [
          { title: t('component.sidemenu.label.warehouses'), url: '/warehouses', permissions: ['warehouses.page'] },
          { title: t('component.sidemenu.label.purchases'), url: '/purchases', permissions: ['purchase.page'] },
          { title: t('component.sidemenu.label.procurements'), url: '/procurements', permissions: ['procurement.page'] },
          { title: t('component.sidemenu.label.production'), url: '/production', permissions: ['production.page'] },
          { title: t('component.sidemenu.label.inventories'), url: '/inventories', permissions: ['inventory.page'] },
          { title: t('component.sidemenu.label.warehouseTransactions'), url: '/warehouse-transactions', permissions: ['warehouse-transaction.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.money'),
        icon: Banknote,
        permissions: ['money.page', 'cashregister.page', 'cashregister-account.page', 'expense.page', 'investor.page', 'provider.page', 'money-transaction.page'],
        items: [
          { title: t('component.sidemenu.label.cashregisters'), url: '/cashregisters', permissions: ['cashregister.page'] },
          {
            title: t('component.sidemenu.label.cashregisterAccounts'),
            url: '/cashregister-accounts',
            permissions: ['cashregister-account.page'],
          },
          { title: t('component.sidemenu.label.expenses'), url: '/expenses', permissions: ['expense.page'] },
          { title: t('component.sidemenu.label.investors'), url: '/investors', permissions: ['investor.page'] },
          { title: t('component.sidemenu.label.providers'), url: '/providers', permissions: ['provider.page'] },
          { title: t('component.sidemenu.label.moneyTransactions'), url: '/money-transactions', permissions: ['money-transaction.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.socials'),
        icon: Globe,
        permissions: ['social.page', 'news.page', 'update.page', 'tour.page'],
        items: [
          { title: t('component.sidemenu.label.news'), url: '/socials/news', permissions: ['news.page'] },
          { title: t('component.sidemenu.label.updates'), url: '/updates', permissions: ['update.page'] },
          { title: t('component.sidemenu.label.tour'), url: '/tour', permissions: ['tour.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.users'),
        icon: Users,
        permissions: ['user.page', 'timetable.page', 'userRole.page'],
        items: [
          { title: t('component.sidemenu.label.users'), url: '/users', permissions: ['user.page'] },
          { title: t('component.sidemenu.label.timetable'), url: '/users/timetable', permissions: ['timetable.page'] },
          { title: t('component.sidemenu.label.userRoles'), url: '/users/roles', permissions: ['userRole.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.settings'),
        icon: Settings,
        permissions: ['settings.page', 'language.page', 'currency.page', 'source.page', 'orderStatus.page', 'deliveryService.page', 'unit.page', 'log.page'],
        items: [
          { title: t('component.sidemenu.label.languages'), url: '/settings/languages', permissions: ['language.page'] },
          { title: t('component.sidemenu.label.currencies'), url: '/settings/currencies', permissions: ['currency.page'] },
          { title: t('component.sidemenu.label.sources'), url: '/settings/sources', permissions: ['source.page'] },
          { title: t('component.sidemenu.label.orderStatuses'), url: '/settings/order-statuses', permissions: ['orderStatus.page'] },
          { title: t('component.sidemenu.label.orderSources'), url: '/settings/order-sources', permissions: ['orderSource.page'] },
          {
            title: t('component.sidemenu.label.deliveryServices'),
            url: '/settings/delivery-services',
            permissions: ['deliveryService.page'],
          },
          { title: t('component.sidemenu.label.units'), url: '/settings/units', permissions: ['unit.page'] },
          { title: t('component.sidemenu.label.logs'), url: '/settings/logs', permissions: ['log.page'] },
          { title: t('component.sidemenu.label.settings'), url: '/settings', permissions: ['settings.page'] },
        ],
      },
      {
        title: t('component.sidemenu.label.documents'),
        url: '/documents',
        icon: FileText,
        permissions: ['document.page'],
      },
    ],
  }

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

      let children = item.items || undefined
      if (children?.length > 0) {
        children = sidebarPermission(children, permissions)
      }

      if (hasAccess || children?.length > 0) {
        return { ...item, items: children }
      }

      return null
    })
    .filter(Boolean)
}
