import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { useProductContext } from '@/utils/contexts';
import { Flex, Button } from 'antd';

import EditModal from './components/EditModal';

export default function Navigation() {
  const { t } = useTranslation();

  const productContext = useProductContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => productContext.openModal()}>{t('createProduct')}</Button>
      </Flex>
      <EditModal />
    </>
  );
}
