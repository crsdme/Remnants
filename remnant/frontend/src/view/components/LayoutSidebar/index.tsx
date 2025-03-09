import * as React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  ListChecks,
  BarChart3,
  Tag,
  Warehouse,
  Banknote,
  Globe,
  Settings,
  FileText
} from 'lucide-react';

import { NavMain } from './navMain';
import { NavUser } from './navUser';

import {
  Sidebar,
  SidebarContent,
  // SidebarHeader,
  SidebarFooter,
  SidebarRail
} from '@/view/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Orders',
      url: '/orders',
      icon: ShoppingCart
    },
    {
      title: 'Leades',
      url: '/leades',
      icon: Users
    },
    {
      title: 'Chats',
      url: '/chats',
      icon: MessageSquare
    },
    {
      title: 'Tasks',
      url: '/tasks',
      icon: ListChecks
    },
    {
      title: 'Catalog',
      icon: Package,
      items: [
        { title: 'Products', url: '/products' },
        { title: 'Categories', url: '/categories' },
        { title: 'Attributes', url: '/attributes' },
        { title: 'Attributes Group', url: '/attributes-group' },
        { title: 'Barcodes', url: '/barcodes' }
      ]
    },
    {
      title: 'Statistic',
      icon: BarChart3,
      items: [
        { title: 'Order Statistic', url: '/statistic/order' },
        { title: 'Product Statistic', url: '/statistic/product' },
        { title: 'Stock Statistic', url: '/statistic/stock' },
        { title: 'Production Statistic', url: '/statistic/production' },
        { title: 'Metrics', url: '/statistic/metrics' }
      ]
    },
    {
      title: 'Marketing',
      icon: Tag,
      items: [
        { title: 'Clients', url: '/clients' },
        { title: 'Promo Codes', url: '/promocodes' },
        { title: 'Coupons', url: '/coupons' },
        { title: 'Bonuses', url: '/bonuses' }
      ]
    },
    {
      title: 'Stocks',
      icon: Warehouse,
      items: [
        { title: 'Stocks', url: '/stocks' },
        { title: 'Purchases', url: '/purchases' },
        { title: 'Procurements', url: '/procurements' },
        { title: 'Production', url: '/production' },
        { title: 'Inventories', url: '/inventories' }
      ]
    },
    {
      title: 'Money',
      icon: Banknote,
      items: [
        { title: 'Cash Registers', url: '/cashregisters' },
        { title: 'Cash Registers Accounts', url: '/cashregisters/accounts' },
        { title: 'Expenses', url: '/expenses' },
        { title: 'Investors', url: '/investors' },
        { title: 'Providers', url: '/providers' }
      ]
    },
    {
      title: 'Socials',
      icon: Globe,
      items: [
        { title: 'News', url: '/socials/news' },
        { title: 'Updates', url: '/updates' },
        { title: 'Tour', url: '/tour' }
      ]
    },
    {
      title: 'Users',
      icon: Users,
      items: [
        { title: 'Users', url: '/users' },
        { title: 'Timetable', url: '/users/timetable' }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      items: [
        { title: 'Languages', url: '/settings/languages' },
        { title: 'Currencies', url: '/settings/currencies' },
        { title: 'Sources', url: '/settings/sources' },
        { title: 'Order Statuses', url: '/settings/order-statuses' },
        { title: 'Delivery Services', url: '/settings/delivery-services' },
        { title: 'Units', url: '/settings/units' },
        { title: 'Settings', url: '/settings' },
        { title: 'Logs', url: '/settings/logs' }
      ]
    },
    {
      title: 'Documents',
      url: '/documents',
      icon: FileText
    }
  ]
};

export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      {/* <SidebarHeader></SidebarHeader> */}
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
