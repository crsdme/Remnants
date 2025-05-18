import LogoIcon from '@/components/ui/icons/logoIcon'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthContext } from '@/utils/contexts'

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
      },
      {
        title: t('component.sidemenu.label.orders'),
        url: '/orders',
        icon: ShoppingCart,
      },
      {
        title: t('component.sidemenu.label.leades'),
        url: '/leades',
        icon: Users,
      },
      {
        title: t('component.sidemenu.label.chats'),
        url: '/chats',
        icon: MessageSquare,
      },
      {
        title: t('component.sidemenu.label.tasks'),
        url: '/tasks',
        icon: ListChecks,
      },
      {
        title: t('component.sidemenu.label.catalog'),
        icon: Package,
        items: [
          { title: t('component.sidemenu.label.products'), url: '/products' },
          { title: t('component.sidemenu.label.categories'), url: '/categories' },
          { title: t('component.sidemenu.label.attributes'), url: '/attributes' },
          { title: t('component.sidemenu.label.attributesGroup'), url: '/attributes-group' },
          { title: t('component.sidemenu.label.barcodes'), url: '/barcodes' },
        ],
      },
      {
        title: t('component.sidemenu.label.statistic'),
        icon: BarChart3,
        items: [
          { title: t('component.sidemenu.label.orderStatistic'), url: '/statistic/order' },
          { title: t('component.sidemenu.label.productStatistic'), url: '/statistic/product' },
          { title: t('component.sidemenu.label.stockStatistic'), url: '/statistic/stock' },
          { title: t('component.sidemenu.label.productionStatistic'), url: '/statistic/production' },
          { title: t('component.sidemenu.label.metrics'), url: '/statistic/metrics' },
        ],
      },
      {
        title: t('component.sidemenu.label.marketing'),
        icon: Tag,
        items: [
          { title: t('component.sidemenu.label.clients'), url: '/clients' },
          { title: t('component.sidemenu.label.promocodes'), url: '/promocodes' },
          { title: t('component.sidemenu.label.coupons'), url: '/coupons' },
          { title: t('component.sidemenu.label.bonuses'), url: '/bonuses' },
        ],
      },
      {
        title: t('component.sidemenu.label.stocks'),
        icon: Warehouse,
        items: [
          { title: t('component.sidemenu.label.stocks'), url: '/stocks' },
          { title: t('component.sidemenu.label.purchases'), url: '/purchases' },
          { title: t('component.sidemenu.label.procurements'), url: '/procurements' },
          { title: t('component.sidemenu.label.production'), url: '/production' },
          { title: t('component.sidemenu.label.inventories'), url: '/inventories' },
        ],
      },
      {
        title: t('component.sidemenu.label.money'),
        icon: Banknote,
        items: [
          { title: t('component.sidemenu.label.cashregisters'), url: '/cashregisters' },
          {
            title: t('component.sidemenu.label.cashregistersAccounts'),
            url: '/cashregisters/accounts',
          },
          { title: t('component.sidemenu.label.expenses'), url: '/expenses' },
          { title: t('component.sidemenu.label.investors'), url: '/investors' },
          { title: t('component.sidemenu.label.providers'), url: '/providers' },
        ],
      },
      {
        title: t('component.sidemenu.label.socials'),
        icon: Globe,
        items: [
          { title: t('component.sidemenu.label.news'), url: '/socials/news' },
          { title: t('component.sidemenu.label.updates'), url: '/updates' },
          { title: t('component.sidemenu.label.tour'), url: '/tour' },
        ],
      },
      {
        title: t('component.sidemenu.label.users'),
        icon: Users,
        items: [
          { title: t('component.sidemenu.label.users'), url: '/users' },
          { title: t('component.sidemenu.label.timetable'), url: '/users/timetable' },
        ],
      },
      {
        title: t('component.sidemenu.label.settings'),
        icon: Settings,
        items: [
          { title: t('component.sidemenu.label.languages'), url: '/settings/languages' },
          { title: t('component.sidemenu.label.currencies'), url: '/settings/currencies' },
          { title: t('component.sidemenu.label.sources'), url: '/settings/sources' },
          { title: t('component.sidemenu.label.orderStatuses'), url: '/settings/order-statuses' },
          {
            title: t('component.sidemenu.label.deliveryServices'),
            url: '/settings/delivery-services',
          },
          { title: t('component.sidemenu.label.units'), url: '/settings/units' },
          { title: t('component.sidemenu.label.settings'), url: '/settings' },
          { title: t('component.sidemenu.label.logs'), url: '/settings/logs' },
        ],
      },
      {
        title: t('component.sidemenu.label.documents'),
        url: '/documents',
        icon: FileText,
      },
    ],
  }

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
