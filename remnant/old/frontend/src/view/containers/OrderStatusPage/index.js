import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, Flex, Modal, Select, Tag, ColorPicker, InputNumber } from 'antd';
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
import BarcodeScanner from '../../../utils/barcodeScanner';
import ProductTable from '../../components/ProductTable';
import SelectProductTable from '../../components/SelectProductTable';

const { Content } = Layout;
const { Title } = Typography;

export default function Page({ props }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingOrderStatus, setEditingOrderStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderStatuses, setOrderStatuses] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createOrderStatus = async () => {
        const { names, color, priority } = form.getFieldsValue();
        const { status, data } = await request.createOrderStatus({ names, color, priority }, params);
        if (status === 'success') {
            setOrderStatuses(state => [data, ...state])
            closeModal();
        }
    }

    const editOrderStatus = async () => {
        const { names, color, priority } = form.getFieldsValue();
        const { status } = await request.editOrderStatus({ _id: editingOrderStatus, names, color, priority }, params);
        if (status === 'success') {
            getOrderStatuses();
            closeModal();
        }
    }

    const removeOrderStatus = async (_id) => {
        const { status } = await request.removeOrderStatus({ _id }, params);
        if (status === 'success') getOrderStatuses(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getOrderStatuses = async () => {
        const { status, data } = await request.getOrderStatuses({}, params);
        if (status === 'success') {
            setOrderStatuses(data.orderStatuses);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingOrderStatus(_id);
        const orderStatus = orderStatuses.find(item => item._id === _id);
        form.setFieldsValue(orderStatus);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrderStatus(null);
        form.resetFields();
    }

    useEffect(() => {
        getOrderStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('orderStatusesPage.names'),
            dataIndex: 'names',
            key: 'key',
            render: (v, { color }) => <Tag color={color}>{ v[selectedLanguage] }</Tag>
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, type }) => <Space>
            <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removeOrderStatus(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('orderStatusesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('orderStatusesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={orderStatuses}
            />

            <Modal 
                title={true ? t('orderStatusesPage.edit.title') : t('orderStatusesPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingOrderStatus ? await editOrderStatus() : await createOrderStatus()} layout='vertical'>
                    {
                        languages.all.map((item, key) => 
                        <Form.Item
                            key={key}
                            label={`name${item.code}`}
                            name={['names', item.code]}   
                            rules={[{ required: item.main, message: t(`orderStatusesPage.requiredName`) }]}
                        >
                            <Input />
                        </Form.Item>
                        )
                    }
                    <Form.Item
                        label={t(`orderStatusesPage.requiredColor`)}
                        name={'color'}   
                    >
                        <ColorPicker 
                            defaultValue="#1677ff" 
                            disabledAlpha 
                            format={'HEX'} 
                            onChange={(color) => {form.setFieldValue("color", color.toHexString());}}
                            presets={[{
                                label: t('orderStatusesPage.preset'),
                                colors: ['#cf1322', '#d4380d', '#d46b08', '#d48806', '#d4b106', '#7cb305', '#389e0d', '#08979c', '#0958d9', '#1d39c4', '#531dab', '#c41d7f']
                            }]}
                        />
                    </Form.Item>
                    <Form.Item
                        label={t(`orderStatusesPage.priority`)}
                        name='priority'   
                    >
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}