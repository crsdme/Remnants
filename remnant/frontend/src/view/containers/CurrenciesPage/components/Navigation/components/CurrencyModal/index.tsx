import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Button, Input, Checkbox, InputNumber, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequestLanguages } from '@/utils/api/hooks';

import { useCurrencyContext } from '@/utils/contexts';

export default function EditCurrencyPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const currencyContext = useCurrencyContext();

  const requestLanguages = useRequestLanguages({ pagination: { full: true } });

  useEffect(() => {
    if (currencyContext.selectedCurrency) {
      form.setFieldsValue({ ...currencyContext.selectedCurrency });
    } else {
      form.resetFields();
    }
  }, [currencyContext.selectedCurrency, form]);

  return (
    <Modal
      title={t(`currencyPage.modal.title.${currencyContext.selectedCurrency ? 'edit' : 'create'}`)}
      open={currencyContext.isModalOpen}
      confirmLoading={currencyContext.isLoading}
      onCancel={() => currencyContext.closeModal()}
      footer={[
        <Button
          type='primary'
          loading={currencyContext.isLoading}
          icon={<PlusOutlined />}
          onClick={() => form.submit()}
          key='create'
        >
          {t(`currencyPage.modal.button.${currencyContext.selectedCurrency ? 'edit' : 'create'}`)}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(formData) => currencyContext.submitCurrencyForm(formData)}
      >
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`currency.modal.form.name.${language.code}`)}
            name={['names', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        <Divider orientation='left' orientationMargin='0'>
          {t('currency.modal.devider.symbols')}
        </Divider>
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`currency.modal.form.name.${language.code}`)}
            name={['symbols', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        <Form.Item label={t('currency.modal.form.priority')} name={'priority'}>
          <InputNumber />
        </Form.Item>
        <Form.Item label={t('currency.modal.form.active')} name={'active'} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
}
