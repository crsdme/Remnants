import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Statistic, Select, Skeleton } from 'antd';
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

    const [editingCashRegister, setEditingCashRegister] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashRegisters, setCashRegisters] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createCashRegister = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status, data } = await request.createCashRegister({ names, priority }, params);
        if (status === 'success') {
            setCashRegisters(state => [data, ...state]);
            closeModal();
        }
    }

    const editCashRegister = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status } = await request.editCashRegister({ _id: editingCashRegister, names, priority }, params);
        if (status === 'success') {
            getCashRegisters();
            closeModal();
        }
    }

    const removeCashRegister = async (_id) => {
        const { status } = await request.removeCashRegister({ _id }, params);
        if (status === 'success') getCashRegisters(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
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
        setEditingCashRegister(_id);
        const cashRegister = cashRegisters.find(item => item._id === _id);
        form.setFieldsValue(cashRegister);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCashRegister(null);
        form.resetFields();
    }

    useEffect(() => {
        getCashRegisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('cashRegistersPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('cashRegistersPage.accounts'),
            dataIndex: 'accounts',
            key: 'key',
            render: (accounts) => 
            accounts.map(account => {
                const accountName = account.names[selectedLanguage];
        
                const balances = account.balance.map(balance => {
                    const currencySymbol = props.currencies.find(
                        currency => currency._id === balance.currency
                    )?.symbol;
                    
                    return `${balance.amount} ${currencySymbol}`;
                });
                return <Statistic title={accountName} value={balances.join(", ")} />
            })
        },
        {
            title: t('cashRegistersPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeCashRegister(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('cashRegistersPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('cashRegistersPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={cashRegisters}
            />
            <Modal 
                title={true ? t('cashRegistersPage.edit.title') : t('cashRegistersPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingCashRegister ? await editCashRegister() : await createCashRegister()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`cashRegistersPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('cashRegistersPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}