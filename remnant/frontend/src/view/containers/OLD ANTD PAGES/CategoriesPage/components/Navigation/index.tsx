import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';

import Modal from './components/CustomModal';

import { useCategoryContext } from '@/utils/contexts';

export default function Navigation() {
  const { t } = useTranslation();

  const categoryContext = useCategoryContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => categoryContext.openModal()}>{t('createCategory')}</Button>
      </Flex>
      <Modal />
    </>
  );
}
