import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox, Select, Skeleton } from 'antd';
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

    const [editingCashRegisterAccount, setEditingCashRegisterAccount] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashRegisterAccounts, setCashRegisterAccounts] = useState([]);
    const [cashRegisters, setCashRegisters] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createCashRegisterAccount = async () => {
        const { names, cashregister, currencies, priority } = form.getFieldsValue();
        const { status, data } = await request.createCashRegisterAccount({ names, cashregister, currencies, priority }, params);
        if (status === 'success') {
            setCashRegisterAccounts(state => [data, ...state]);
            closeModal();
        }
    }

    const editCashRegisterAccount = async () => {
        const { names, cashregister, currencies, priority } = form.getFieldsValue();
        const { status } = await request.editCashRegisterAccount({ _id: editingCashRegisterAccount, names, cashregister, currencies, priority }, params);
        if (status === 'success') {
            getCashRegisterAccounts();
            closeModal();
        }
    }

    const removeCashRegisterAccount = async (_id) => {
        const { status } = await request.removeCashRegisterAccount({ _id }, params);
        if (status === 'success') getCashRegisterAccounts(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getCashRegisterAccounts = async () => {
        const { status, data } = await request.getCashRegisterAccounts({}, params);
        if (status === 'success') {
            setCashRegisterAccounts(data.cashregisterAccounts);
        }
    }

    const getCashRegisters = async () => {
        const { status, data } = await request.getCashRegisters({}, params);
        if (status === 'success') {
            setCashRegisters(data.cashregisters);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingCashRegisterAccount(_id);
        const cashRegisterAccount = cashRegisterAccounts.find(item => item._id === _id);
        form.setFieldsValue(cashRegisterAccount);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCashRegisterAccount(null);
        form.resetFields();
    }

    useEffect(() => {
        getCashRegisterAccounts();
        getCashRegisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('cashRegisterAccountsPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('cashRegisterAccountsPage.cashregister'),
            dataIndex: 'cashregister',
            key: 'key'
        },
        {
            title: t('cashRegisterAccountsPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeCashRegisterAccount(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('cashRegisterAccountsPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('cashRegisterAccountsPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={cashRegisterAccounts}
            />
            <Modal 
                title={true ? t('cashRegisterAccountsPage.edit.title') : t('cashRegisterAccountsPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingCashRegisterAccount ? await editCashRegisterAccount() : await createCashRegisterAccount()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`cashRegisterAccountsPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="cashregister" 
                        label={t('cashRegisterAccountsPage.cashregister')}
                    >
                        <Select
                            optionFilterProp="label"
                            options={(cashRegisters || []).map(item => ({
                                value: item._id,
                                label: item.names[selectedLanguage]
                            }))}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="currencies" 
                        label={t('cashRegisterAccountsPage.currencies')}
                    >
                        <Select
                            mode="multiple"
                            optionFilterProp="label"
                            options={(props.currencies || []).map(item => ({
                                value: item._id,
                                label: item.names[selectedLanguage]
                            }))}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="priority" 
                        label={t('cashRegisterAccountsPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}