import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

export const Sidemenu: React.FC = () => {
  const { t } = useTranslation();

  const items: MenuItem[] = [
    {
      key: 'dashboard',
      label: <Link to='/dashboard'>{t('sidemenu.label.dashboard')}</Link>
    },
    {
      key: 'orders',
      label: <Link to='/orders'>{t('sidemenu.label.orders')}</Link>
    },
    {
      key: 'leades',
      label: <Link to='/leades'>{t('sidemenu.label.leades')}</Link>
    },
    {
      key: 'chats',
      label: <Link to='/chats'>{t('sidemenu.label.chats')}</Link>
    },
    {
      key: 'tasks',
      label: <Link to='/tasks'>{t('sidemenu.label.tasks')}</Link>
    },
    {
      type: 'divider'
    },
    {
      key: 'catalog',
      label: t('sidemenu.label.catalog'),
      children: [
        {
          key: 'sidemenu.products',
          label: <Link to='/products'>{t('sidemenu.label.products')}</Link>
        },
        {
          key: 'sidemenu.categories',
          label: <Link to='/categories'>{t('sidemenu.label.categories')}</Link>
        },
        {
          key: 'sidemenu.attributes',
          label: <Link to='/attributes'>{t('sidemenu.label.attributes')}</Link>
        },
        {
          key: 'sidemenu.attributesGroup',
          label: <Link to='/attributes-group'>{t('sidemenu.label.attributesGroup')}</Link>
        },
        {
          key: 'sidemenu.barcodes',
          label: <Link to='/barcodes'>{t('sidemenu.label.barcodes')}</Link>
        }
      ]
    },
    {
      key: 'statistic',
      label: t('sidemenu.label.statistic'),
      children: [
        {
          key: 'sidemenu.orderStatistic',
          label: <Link to='/statistic/order'>{t('sidemenu.label.orderStatistic')}</Link>
        },
        {
          key: 'sidemenu.productStatistic',
          label: <Link to='/statistic/product'>{t('sidemenu.label.productStatistic')}</Link>
        },
        {
          key: 'sidemenu.stockStatistic',
          label: <Link to='/statistic/stock'>{t('sidemenu.label.stockStatistic')}</Link>
        },
        {
          key: 'sidemenu.productionStatistic',
          label: <Link to='/statistic/production'>{t('sidemenu.label.productionStatistic')}</Link>
        },
        {
          key: 'sidemenu.metrics',
          label: <Link to='/statistic/metrics'>{t('sidemenu.label.metrics')}</Link>
        }
      ]
    },
    {
      key: 'marketing',
      label: t('sidemenu.label.statistic'),
      children: [
        {
          key: 'sidemenu.clients',
          label: <Link to='/clients'>{t('sidemenu.label.clients')}</Link>
        },
        {
          key: 'sidemenu.promocodes',
          label: <Link to='/promocodes'>{t('sidemenu.label.promocodes')}</Link>
        },
        {
          key: 'sidemenu.coupons',
          label: <Link to='/coupons'>{t('sidemenu.label.coupons')}</Link>
        },
        {
          key: 'sidemenu.bonuses',
          label: <Link to='/bonuses'>{t('sidemenu.label.bonuses')}</Link>
        }
      ]
    },
    {
      key: 'stocks',
      label: t('sidemenu.label.stocks'),
      children: [
        { key: 'sidemenu.stocks', label: <Link to='/stocks'>{t('sidemenu.label.stocks')}</Link> },
        {
          key: 'sidemenu.purchases',
          label: <Link to='/purchases'>{t('sidemenu.label.purchases')}</Link>
        },
        {
          key: 'sidemenu.procurements',
          label: <Link to='/procurements'>{t('sidemenu.label.procurements')}</Link>
        },
        {
          key: 'sidemenu.production',
          label: <Link to='/production'>{t('sidemenu.label.production')}</Link>
        },
        {
          key: 'sidemenu.inventories',
          label: <Link to='/inventories'>{t('sidemenu.label.inventories')}</Link>
        }
      ]
    },
    {
      key: 'money',
      label: t('sidemenu.label.money'),
      children: [
        {
          key: 'sidemenu.cashregisters',
          label: <Link to='/cashregisters'>{t('sidemenu.label.cashregisters')}</Link>
        },
        {
          key: 'sidemenu.cashregistersAccounts',
          label: (
            <Link to='/cashregisters/accounts'>{t('sidemenu.label.cashregistersAccounts')}</Link>
          )
        },
        {
          key: 'sidemenu.expenses',
          label: <Link to='/expenses'>{t('sidemenu.label.expenses')}</Link>
        },
        {
          key: 'sidemenu.investors',
          label: <Link to='/investors'>{t('sidemenu.label.investors')}</Link>
        },
        {
          key: 'sidemenu.providers',
          label: <Link to='/providers'>{t('sidemenu.label.providers')}</Link>
        }
      ]
    },
    {
      key: 'socials',
      label: t('sidemenu.label.socials'),
      children: [
        { key: 'sidemenu.news', label: <Link to='/socials/news'>{t('sidemenu.label.news')}</Link> },
        {
          key: 'sidemenu.updates',
          label: <Link to='/updates'>{t('sidemenu.label.updates')}</Link>
        },
        { key: 'sidemenu.tour', label: <Link to='/tour'>{t('sidemenu.label.tour')}</Link> }
      ]
    },
    {
      key: 'users',
      label: t('sidemenu.label.users'),
      children: [
        { key: 'sidemenu.users', label: <Link to='/users'>{t('sidemenu.label.users')}</Link> },
        {
          key: 'sidemenu.timetable',
          label: <Link to='/users/timetable'>{t('sidemenu.label.timetable')}</Link>
        }
      ]
    },
    {
      key: 'settings',
      label: t('sidemenu.label.settings'),
      children: [
        {
          key: 'sidemenu.languages',
          label: <Link to='/settings/languages'>{t('sidemenu.label.languages')}</Link>
        },
        {
          key: 'sidemenu.currencies',
          label: <Link to='/settings/currencies'>{t('sidemenu.label.currencies')}</Link>
        },
        {
          key: 'sidemenu.sources',
          label: <Link to='/settings/sources'>{t('sidemenu.label.sources')}</Link>
        },
        {
          key: 'sidemenu.orderStatuses',
          label: <Link to='/settings/order-statuses'>{t('sidemenu.label.orderStatuses')}</Link>
        },
        {
          key: 'sidemenu.deliveryServices',
          label: (
            <Link to='/settings/delivery-services'>{t('sidemenu.label.deliveryServices')}</Link>
          )
        },
        {
          key: 'sidemenu.units',
          label: <Link to='/settings/units'>{t('sidemenu.label.units')}</Link>
        },
        {
          key: 'sidemenu.settings',
          label: <Link to='/settings'>{t('sidemenu.label.settings')}</Link>
        },
        { key: 'sidemenu.logs', label: <Link to='/settings/logs'>{t('sidemenu.label.logs')}</Link> }
      ]
    }
  ];

  return <Menu style={{ marginTop: '64px' }} mode='inline' items={items} />;
};
