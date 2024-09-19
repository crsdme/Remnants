import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, TreeSelect } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';

const { Content } = Layout;
const { Title } = Typography;

export default function Page() {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingCategory, setEditingCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    
    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createCategory = async () => {
        const { names, parent, priority } = form.getFieldsValue();
        const { status, data } = await request.createCategory({ names, parent, priority }, params);
        if (status === 'success') {
            setCategories(state => [data, ...state])
            closeCategoryModal();
        }
    } 

    const editCategory = async () => {
        const { names, parent, priority } = form.getFieldsValue();
        const { status, data } = await request.editCategory({ _id: editingCategory, names, parent, priority }, params);
        if (status === 'success') {
            getCategories();
            closeCategoryModal();
        }
    }

    const removeCategory = async (_id) => {
        const { status } = await request.removeCategory({ _id }, params);
        if (status === 'success') getCategories(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setCategories(state => state.filter(item => item._id !== _id));
    }

    const getCategories = async () => {
        const { status, data } = await request.getCategories({}, params);
        if (status === 'success') setCategories(data.categories);
    }


    const openCreateCategoryModal = () => {
        setIsModalOpen(true);
    }

    function flattenHierarchy(categories) {
        const flatArray = [];
    
        function flatten(category) {
            const { children, ...rest } = category;
            flatArray.push(rest);
    
            if (children) {
                children.forEach(child => flatten(child));
            }
        }
    
        categories.forEach(category => flatten(category));
    
        return flatArray;
    }

    const openEditCategoryModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingCategory(_id);

        const flatCategories = flattenHierarchy(categories);
        const category = flatCategories.find(item => item._id === _id);

        form.setFieldsValue(category);
    }

    const closeCategoryModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
    }

    const mapCategoriesToTree = () => {
        function mapCategory(category) {
            const children = Array.isArray(category.children) ? category.children : [];
        
            return {
                title: category.names[selectedLanguage],
                value: category._id,
                children: children.map(mapCategory)
            };
        }
    
        return categories.map(mapCategory);
    }

    useEffect(() => {
        getCategories();
    }, []);

    const columns = [
        {
            title: t('categoryPage.name'),
            dataIndex: ['names', 'ru'],
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
            <Button icon={<EditFilled />} onClick={() => openEditCategoryModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removeCategory(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('categoryPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateCategoryModal()} >{t('categoryPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={categories}
            />

            <Modal 
                title={editingCategory ? t('categoryPage.edit.title') : t('categoryPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeCategoryModal()}
            >
                <Form form={form} onFinish={async () => editingCategory ? await editCategory() : await createCategory()} layout='vertical'>
                    { languages.all.map(language => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`categoryPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('categoryPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="parent" label={t('categoryPage.parentCategory')}>
                        <TreeSelect
                            showSearch
                            dropdownStyle={{
                                maxHeight: 400,
                                overflow: 'auto',
                            }}
                            placeholder={t('categoryPage.select.category')}
                            allowClear
                            treeDefaultExpandAll
                            treeData={mapCategoriesToTree()}  
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}