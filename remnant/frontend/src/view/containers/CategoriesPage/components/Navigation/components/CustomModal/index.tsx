import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Button, Input, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequestLanguages, useSearchCategories } from '@/api/hooks';
import { useCategoryContext } from '@/utils/contexts';
// import DebounceSelect from '@/view/components/DebounceSelect';
import DebounceTreeSelect from '@/view/components/DebounceTreeSelect';

export default function CategoryModal() {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();

  const categoryContext = useCategoryContext();

  const requestLanguages = useRequestLanguages({ pagination: { full: true } });

  const fetchCategories = useSearchCategories();

  // const fetchCategoriesHandler = async (search: string) => {
  //   const { data } = await fetchCategories({
  //     filters: { names: search, language: i18n.language, flat: true },
  //     pagination: { current: 1, pageSize: 5 }
  //   });

  //   return data.categories;
  // };

  const fetchCategoriesHandlerTree = async (search: string) => {
    const { data } = await fetchCategories({
      filters: { names: search, language: i18n.language },
      pagination: { current: 1, pageSize: 5 }
    });

    return data.categories;
  };

  useEffect(() => {
    if (categoryContext.selectedCategory) {
      const selected = categoryContext.selectedCategory;
      form.setFieldsValue({
        ...selected,
        parent: selected.parent
          ? {
              label: selected.parent.names[i18n.language],
              value: selected.parent._id
            }
          : undefined
      });
    } else {
      form.resetFields();
    }
  }, [categoryContext.selectedCategory, form]);

  return (
    <Modal
      title={t(`categoryPage.modal.title.${categoryContext.selectedCategory ? 'edit' : 'create'}`)}
      open={categoryContext.isModalOpen}
      confirmLoading={categoryContext.isLoading}
      onCancel={() => categoryContext.closeModal()}
      footer={[
        <Button
          type='primary'
          loading={categoryContext.isLoading}
          icon={<PlusOutlined />}
          onClick={() => form.submit()}
          key='create'
        >
          {t(`categoryPage.modal.button.${categoryContext.selectedCategory ? 'edit' : 'create'}`)}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(formData) => categoryContext.submitCategoryForm(formData)}
      >
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`categoryPage.modal.form.name.${language.code}`)}
            name={['names', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        {/* <Form.Item label={t('categoryPage.modal.form.priority')} name={'parent'}>
          <DebounceSelect fetchOptions={async (search) => await fetchCategoriesHandler(search)} />
        </Form.Item> */}
        <Form.Item label={t('categoryPage.modal.form.priority')} name={'parent'}>
          <DebounceTreeSelect
            fetchOptions={async (search) => await fetchCategoriesHandlerTree(search)}
            mapPattern={(category, i18n) => ({
              title: category.names[i18n.language],
              value: category._id
            })}
          />
        </Form.Item>
        <Form.Item label={t('categoryPage.modal.form.priority')} name={'priority'}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
}
