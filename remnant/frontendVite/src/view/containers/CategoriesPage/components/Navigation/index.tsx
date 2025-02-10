import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Flex, Button } from 'antd';

import CategoryModal from './components/CategoryModal';
import { useCategoryContext } from '@/utils/contexts';

export default function Navigation() {
  const { t } = useTranslation();

  const categoryContext = useCategoryContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => categoryContext.openModal()}>{t('createCategory')}</Button>
      </Flex>
      <CategoryModal />
    </>
  );
}
