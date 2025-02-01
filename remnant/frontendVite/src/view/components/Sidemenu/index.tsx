import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';

type MenuItem = Required<MenuProps>['items'][number];

export const Sidemenu: React.FC = () => {
  const { t } = useTranslation();

  const items: MenuItem[] = [
    {
      key: 'dashvoard',
      label: t('sidemenu.dashboard'),
      children: [
        {
          key: 'g1',
          label: 'Item 1',
          type: 'group',
          children: [
            { key: '1', label: 'Option 1' },
            { key: '2', label: 'Option 2' }
          ]
        },
        {
          key: 'g2',
          label: 'Item 2',
          type: 'group',
          children: [
            { key: '3', label: 'Option 3' },
            { key: '4', label: 'Option 4' }
          ]
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'grp',
      label: 'Group',
      type: 'group',
      children: [
        { key: '13', label: 'Option 13' },
        { key: '14', label: 'Option 14' }
      ]
    }
  ];

  return <Menu style={{ marginTop: '64px' }} mode='inline' items={items} />;
};
