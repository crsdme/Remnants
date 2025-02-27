import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Flex, Button } from 'antd';

import CustomModal from './components/CustomModal';
import { useUnitContext } from '@/utils/contexts';

export default function Navigation() {
  const { t } = useTranslation();

  const unitContext = useUnitContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => unitContext.openModal()}>{t('createUnit')}</Button>
      </Flex>
      <CustomModal />
    </>
  );
}
