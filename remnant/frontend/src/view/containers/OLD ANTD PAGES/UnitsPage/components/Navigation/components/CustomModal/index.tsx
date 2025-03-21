import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Divider, Form, Input, InputNumber, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useUnitContext } from '@/utils/contexts';
import { useRequestLanguages } from '@/api/hooks';

export default function EditUnitPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const unitContext = useUnitContext();

  const requestLanguages = useRequestLanguages({ pagination: { full: true } });

  useEffect(() => {
    if (unitContext.selectedUnit) {
      form.setFieldsValue({ ...unitContext.selectedUnit });
    } else {
      form.resetFields();
    }
  }, [unitContext.selectedUnit, form]);

  return (
    <Modal
      title={t(`unitPage.modal.title.${unitContext.selectedUnit ? 'edit' : 'create'}`)}
      open={unitContext.isModalOpen}
      confirmLoading={unitContext.isLoading}
      onCancel={() => unitContext.closeModal()}
      footer={[
        <Button
          type='primary'
          loading={unitContext.isLoading}
          icon={<PlusOutlined />}
          onClick={() => form.submit()}
          key='create'
        >
          {t(`unitPage.modal.button.${unitContext.selectedUnit ? 'edit' : 'create'}`)}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(formData) => unitContext.submitUnitForm(formData)}
      >
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`unit.modal.form.name.${language.code}`)}
            name={['names', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        <Divider orientation='left' orientationMargin='0'>
          {t('unit.modal.devider.symbols')}
        </Divider>
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`unit.modal.form.name.${language.code}`)}
            name={['symbols', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        <Form.Item label={t('unit.modal.form.priority')} name={'priority'}>
          <InputNumber />
        </Form.Item>
        <Form.Item label={t('unit.modal.form.active')} name={'active'} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
}
