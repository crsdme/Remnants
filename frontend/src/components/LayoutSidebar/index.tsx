import {
  Sidebar,
  SidebarContent,
  // SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'

import {
  Banknote,
  BarChart3,
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
import { NavMain } from './navMain'

import { NavUser } from './navUser'

export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
      {
        title: t('layout.sidemenu.label.dashboard'),
        url: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: t('layout.sidemenu.label.orders'),
        url: '/orders',
        icon: ShoppingCart,
      },
      {
        title: t('layout.sidemenu.label.leades'),
        url: '/leades',
        icon: Users,
      },
      {
        title: t('layout.sidemenu.label.chats'),
        url: '/chats',
        icon: MessageSquare,
      },
      {
        title: t('layout.sidemenu.label.tasks'),
        url: '/tasks',
        icon: ListChecks,
      },
      {
        title: t('layout.sidemenu.label.catalog'),
        icon: Package,
        items: [
          { title: t('layout.sidemenu.label.products'), url: '/products' },
          { title: t('layout.sidemenu.label.categories'), url: '/categories' },
          { title: t('layout.sidemenu.label.attributes'), url: '/attributes' },
          { title: t('layout.sidemenu.label.attributesGroup'), url: '/attributes-group' },
          { title: t('layout.sidemenu.label.barcodes'), url: '/barcodes' },
        ],
      },
      {
        title: t('layout.sidemenu.label.statistic'),
        icon: BarChart3,
        items: [
          { title: t('layout.sidemenu.label.orderStatistic'), url: '/statistic/order' },
          { title: t('layout.sidemenu.label.productStatistic'), url: '/statistic/product' },
          { title: t('layout.sidemenu.label.stockStatistic'), url: '/statistic/stock' },
          { title: t('layout.sidemenu.label.productionStatistic'), url: '/statistic/production' },
          { title: t('layout.sidemenu.label.metrics'), url: '/statistic/metrics' },
        ],
      },
      {
        title: t('layout.sidemenu.label.marketing'),
        icon: Tag,
        items: [
          { title: t('layout.sidemenu.label.clients'), url: '/clients' },
          { title: t('layout.sidemenu.label.promocodes'), url: '/promocodes' },
          { title: t('layout.sidemenu.label.coupons'), url: '/coupons' },
          { title: t('layout.sidemenu.label.bonuses'), url: '/bonuses' },
        ],
      },
      {
        title: t('layout.sidemenu.label.stocks'),
        icon: Warehouse,
        items: [
          { title: t('layout.sidemenu.label.stocks'), url: '/stocks' },
          { title: t('layout.sidemenu.label.purchases'), url: '/purchases' },
          { title: t('layout.sidemenu.label.procurements'), url: '/procurements' },
          { title: t('layout.sidemenu.label.production'), url: '/production' },
          { title: t('layout.sidemenu.label.inventories'), url: '/inventories' },
        ],
      },
      {
        title: t('layout.sidemenu.label.money'),
        icon: Banknote,
        items: [
          { title: t('layout.sidemenu.label.cashregisters'), url: '/cashregisters' },
          {
            title: t('layout.sidemenu.label.cashregistersAccounts'),
            url: '/cashregisters/accounts',
          },
          { title: t('layout.sidemenu.label.expenses'), url: '/expenses' },
          { title: t('layout.sidemenu.label.investors'), url: '/investors' },
          { title: t('layout.sidemenu.label.providers'), url: '/providers' },
        ],
      },
      {
        title: t('layout.sidemenu.label.socials'),
        icon: Globe,
        items: [
          { title: t('layout.sidemenu.label.news'), url: '/socials/news' },
          { title: t('layout.sidemenu.label.updates'), url: '/updates' },
          { title: t('layout.sidemenu.label.tour'), url: '/tour' },
        ],
      },
      {
        title: t('layout.sidemenu.label.users'),
        icon: Users,
        items: [
          { title: t('layout.sidemenu.label.users'), url: '/users' },
          { title: t('layout.sidemenu.label.timetable'), url: '/users/timetable' },
        ],
      },
      {
        title: t('layout.sidemenu.label.settings'),
        icon: Settings,
        items: [
          { title: t('layout.sidemenu.label.languages'), url: '/settings/languages' },
          { title: t('layout.sidemenu.label.currencies'), url: '/settings/currencies' },
          { title: t('layout.sidemenu.label.sources'), url: '/settings/sources' },
          { title: t('layout.sidemenu.label.orderStatuses'), url: '/settings/order-statuses' },
          {
            title: t('layout.sidemenu.label.deliveryServices'),
            url: '/settings/delivery-services',
          },
          { title: t('layout.sidemenu.label.units'), url: '/settings/units' },
          { title: t('layout.sidemenu.label.settings'), url: '/settings' },
          { title: t('layout.sidemenu.label.logs'), url: '/settings/logs' },
        ],
      },
      {
        title: 'Documents',
        url: '/documents',
        icon: FileText,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader></SidebarHeader> */}
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
