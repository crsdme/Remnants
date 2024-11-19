import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox, Select, Tag } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    CloseOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';

const { Content } = Layout;
const { Title } = Typography;

export default function Page() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [formOption] = Form.useForm();

    const [editingAttribute, setEditingAttribute] = useState(null);
    const [attributeOptionId, setAttributeOptionId] = useState(null);
    const [isAttributeModalOpen, setAttributeIsModalOpen] = useState(false);
    const [isOptionModalOpen, setOptionIsModalOpen] = useState(false);
    const [attributes, setAttributes] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createAttribute = async () => {
        const { names, is_multiple, type, priority } = form.getFieldsValue();
        const { status, data } = await request.createAttribute({ names, is_multiple, type, priority }, params);
        if (status === 'success') {
            setAttributes(state => [data, ...state])
            closeAttributeModal();
        }
    }

    const createAttributeOption = async () => {
        const values = formOption.getFieldsValue();
        const { status, data } = await request.createAttributeOption({ _id: attributeOptionId, ...values }, params);
        if (status === 'success') {
            getAttributes();
            closeOptionModal();
        }
    } 

    const editAttribute = async () => {
        const { names, is_multiple, type, priority } = form.getFieldsValue();
        const { status } = await request.editAttribute({ _id: editingAttribute, names, is_multiple, type, priority }, params);
        if (status === 'success') {
            getAttributes();
            closeAttributeModal();
        }
    }

    const removeAttribute = async (_id) => {
        const { status } = await request.removeAttribute({ _id }, params);
        if (status === 'success') getAttributes(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getAttributes = async () => {
        const { status, data } = await request.getAttributes({}, params);
        if (status === 'success') {
            setAttributes(data.customFields);
        }
    }


    const openCreateAttributeModal = () => {
        setAttributeIsModalOpen(true);
    }

    const openCreateOptionModal = (_id) => {
        setAttributeOptionId(_id)
        setOptionIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setAttributeIsModalOpen(!isAttributeModalOpen);
        setEditingAttribute(_id);
        const attribute = attributes.find(item => item._id === _id);
        form.setFieldsValue(attribute);
    }

    const closeAttributeModal = () => {
        setAttributeIsModalOpen(false);
        setEditingAttribute(null);
        form.resetFields();
    }

    const closeOptionModal = () => {
        setOptionIsModalOpen(false);
        formOption.resetFields();
    }

    useEffect(() => {
        getAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('attributesPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('attributesPage.is_multiple'),
            dataIndex: 'is_multiple',
            key: 'key'
        },
        {
            title: t('attributesPage.type'),
            dataIndex: 'type',
            key: 'key'
        },
        {
            title: t('attributesPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            title: t('attributesPage.options'),
            dataIndex: 'options',
            key: 'key',
            render: (values) => <>{(values || []).map((item, key) => <Tag key={key}>{ item.names[selectedLanguage] }</Tag>)}</>
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, type }) => <Space>
            { type === 'select' && <Button icon={<UnorderedListOutlined />} onClick={() => openCreateOptionModal(_id)} /> }
            <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removeAttribute(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('attributesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateAttributeModal()} >{t('attributesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={attributes}
            />

            <Modal 
                title={true ? t('attributesPage.edit.title') : t('attributesPage.create.title')}
                open={isAttributeModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeAttributeModal()}
            >
                <Form form={form} onFinish={async () => editingAttribute ? await editAttribute() : await createAttribute()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`attributesPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('attributesPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name="is_multiple"
                        valuePropName="checked"
                        label={t('attributesPage.is_multiple')}
                    >
                        <Checkbox>{ t('attributesPage.is_multiple') }</Checkbox>
                    </Form.Item>
                    <Form.Item 
                        name="model" 
                        label={t('attributesPage.model')}
                    >
                        <Select
                            options={[
                                {
                                    value: 'product',
                                    label: t('attributesPage.model.product'),
                                },
                                {
                                    value: 'order',
                                    label: t('attributesPage.model.order'),
                                },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="type" 
                        label={t('attributesPage.type')}
                    >
                        <Select
                            options={[
                                {
                                value: 'text',
                                label: t('attributesPage.type.text'),
                                },
                                {
                                    value: 'select',
                                    label: t('attributesPage.type.select'),
                                },
                                {
                                    value: 'color',
                                    label: t('attributesPage.type.color'),
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal 
                title={t('attributesPage.create.title')}
                open={isOptionModalOpen}
                width={400}
                centered
                onOk={() => formOption.submit()}
                onCancel={() => closeOptionModal()}
            >
                <Form form={formOption} onFinish={async () =>await createAttributeOption()} layout='vertical'>
                    <Form.List name="options">
                        {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space
                                    key={key}
                                    align="baseline"
                                >
                                { languages.all.map((language, key) => 
                                    <Form.Item 
                                        {...restField}
                                        name={[name, 'names', language.code]} 
                                        label={t(`attributesPage.name.${language.code}`)}
                                        rules={[{ required: language.main }]}
                                        key={key}
                                    >
                                        <Input />
                                    </Form.Item>
                                ) }
                                <CloseOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    { t('attributesPage.addOption.button') }
                                </Button>
                            </Form.Item>
                        </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </Content>
    );
}