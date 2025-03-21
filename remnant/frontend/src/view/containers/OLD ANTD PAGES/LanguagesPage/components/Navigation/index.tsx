import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';

import CustomModal from './components/CustomModal';

import { useLanguageContext } from '@/utils/contexts';

export default function Navigation() {
  const { t } = useTranslation();

  const languageContext = useLanguageContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => languageContext.openModal()}>{t('createLanguage')}</Button>
      </Flex>
      <CustomModal />
    </>
  );
}
