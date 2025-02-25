import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox } from 'antd';
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

    const [editingUnit, setEditingUnit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [units, setUnits] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createUnit = async () => {
        const { names, symbol, priority, active } = form.getFieldsValue();
        const { status, data } = await request.createUnit({ names, symbol, priority, active }, params);
        if (status === 'success') {
            setUnits(state => [data, ...state]);
            closeModal();
        }
    }

    const editUnit = async () => {
        const { names, symbol, priority, active } = form.getFieldsValue();
        const { status } = await request.editUnit({ _id: editingUnit, names, symbol, priority, active }, params);
        if (status === 'success') {
            getUnits();
            closeModal();
        }
    }

    const removeUnit = async (_id) => {
        const { status } = await request.removeUnit({ _id }, params);
        if (status === 'success') getUnits(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getUnits = async () => {
        const { status, data } = await request.getUnits({}, params);
        if (status === 'success') {
            console.log(data)
            setUnits(data.units);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingUnit(_id);
        const group = units.find(item => item._id === _id);
        form.setFieldsValue(group);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUnit(null);
        form.resetFields();
    }

    useEffect(() => {
        getUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('unitsPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('unitsPage.symbol'),
            dataIndex: 'symbol',
            key: 'key'
        },
        {
            title: t('unitsPage.active'),
            dataIndex: 'active',
            key: 'key'
        },
        {
            title: t('unitsPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeUnit(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('unitsPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('unitsPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={units}
            />

            <Modal 
                title={true ? t('unitsPage.edit.title') : t('unitsPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingUnit ? await editUnit() : await createUnit()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`unitsPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('unitsPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name={'symbol'} 
                        label={t(`unitsPage.symbol`)}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label={t('unitsPage.active')}
                        name="active"
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}