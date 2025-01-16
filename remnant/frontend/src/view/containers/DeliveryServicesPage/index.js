import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox, Select } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    PropertySafetyFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';

const { Content } = Layout;
const { Title } = Typography;

export default function Page({ props }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingDeliveryService, setEditingDeliveryService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deliveryServices, setDeliveryServices] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createDeliveryService = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status, data } = await request.createDeliveryService({ names, priority }, params);
        if (status === 'success') {
            setDeliveryServices(state => [data, ...state]);
            closeModal();
        }
    }

    const editDeliveryService = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status } = await request.editDeliveryService({ _id: editingDeliveryService, names, priority }, params);
        if (status === 'success') {
            getDeliveryServices();
            closeModal();
        }
    }

    const removeDeliveryService = async (_id) => {
        const { status } = await request.removeDeliveryService({ _id }, params);
        if (status === 'success') getDeliveryServices(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getDeliveryServices = async () => {
        const { status, data } = await request.getDeliveryServices({}, params);
        if (status === 'success') {
            setDeliveryServices(data.deliveryServices);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingDeliveryService(_id);
        const deliveryService = deliveryServices.find(item => item._id === _id);
        form.setFieldsValue(deliveryService);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDeliveryService(null);
        form.resetFields();
    }

    useEffect(() => {
        getDeliveryServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('deliveryServicesPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('deliveryServicesPage.type'),
            dataIndex: 'type',
            key: 'key'
        },
        {
            title: t('deliveryServicesPage.active'),
            dataIndex: 'active',
            key: 'key'
        },
        {
            title: t('deliveryServicesPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeDeliveryService(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('deliveryServicesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('deliveryServicesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={deliveryServices}
            />

            <Modal 
                title={true ? t('deliveryServicesPage.edit.title') : t('deliveryServicesPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingDeliveryService ? await editDeliveryService() : await createDeliveryService()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`deliveryServicesPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="active" 
                        label={t('deliveryServicesPage.type')}
                    >
                        <Select
                            options={[
                                {
                                    label: t('deliveryServicesPage.novaposhta'),
                                    value: 'novaposhta'
                                },
                                {
                                    label: t('deliveryServicesPage.selfpickup'),
                                    value: 'selfpickup'
                                },
                                {
                                    label: t('deliveryServicesPage.courier'),
                                    value: 'courier'
                                },
                                {
                                    label: t('deliveryServicesPage.other'),
                                    value: 'other'
                                },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="priority" 
                        label={t('deliveryServicesPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name="active" 
                        label={t('deliveryServicesPage.active')}
                        valuePropName="active"
                    >
                        <Checkbox />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}