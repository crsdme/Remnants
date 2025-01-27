import React, { useState, useEffect } from 'react';
import { Space, Layout, Table, Button, Modal, Form, Input, InputNumber, Popconfirm, Timeline } from 'antd';
import { 
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import request from '../../../utils/requests';

const { Content } = Layout;

export default function Page() {

    const [stocks, setStocks] = useState([]);
    const [productTransactions, setProductTransactions] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
    const [tablePagination, setTablePagination] = useState([]);
    const [editingStock, setEditingStock] = useState(null);
    const [tableFilters, setTableFilters] = useState({ pagination: { current: 1, pageSize: 10 } });

    const [form] = Form.useForm();

    const { t } = useTranslation();

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createStock = async (value) => {
        const { status } = await request.createStock(value, params);
        if (status === 'success') {
            getStocks(tableFilters);
            form.resetFields();
            setIsModalOpen(false);
            setEditingStock(null);
        }
    }

    const editStock = async (value) => {
        const { status } = await request.editStock({...value, _id: editingStock}, params);
        if (status === 'success') {
            getStocks(tableFilters);
            form.resetFields();
            setIsModalOpen(false);
            setEditingStock(null);
        }
    }

    const removeStock = async (_id) => {
        const { status } = await request.removeStock({ _id }, params);
        if (status === 'success') getStocks(tableFilters);
    }

    const getStocks = async (filters) => {
        const { data } = await request.getStocks(filters, params);
        console.log(data)
        setStocks(data.stocks);
        setTablePagination(data.stocksCount);
    }

    const startEditStock = async (_id) => {
        const stock = stocks.find(item => item._id === _id);
        form.setFieldsValue(stock);
        setIsModalOpen(true);
        setEditingStock(stock._id);
    }

    const startCreateStock = async () => {
        form.resetFields();
        setIsModalOpen(true);
        setEditingStock(null);
    }

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilters({ pagination, filters, sorter });
        getStocks({ pagination, filters, sorter })
    }

    const getProductTransactions = async (_id) => {
        const { status, data } = await request.getProductTransactions({ filter: { stock: _id } }, params);
        if (status === 'success') {
            setProductTransactions(data.productTransactions);
        }
    }

    const closeTransactionsModal = () => {
        setIsTransactionsModalOpen(false);
        setProductTransactions(null);
    }

    const openTransactionsModal = (_id) => {
        setIsTransactionsModalOpen(true);
        getProductTransactions(_id);
    }

    useEffect(() => {
        getStocks(tableFilters);
    }, []);

    const columns = [
        {
            title: t('names'),
            dataIndex: ['names', selectedLanguage],
            key: 'names',
        },
        {
            title: t('priority'),
            dataIndex: 'priority',
            key: 'priority',
        },
        {
            dataIndex: '_id',
            width: 30,
            render: (_id) => <Space>
                <Button icon={<EditOutlined />} onClick={() => startEditStock(_id)} />
                <Button type='primary' onClick={() => openTransactionsModal(_id)} />
                <Popconfirm
                    title="Delete the task"
                    description="Are you sure to delete this task?"
                    onConfirm={() => removeStock(_id)}
                >
                    <Button type='primary' danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        }
    ];

    const columnsProductTransactions = [
        {
            title: t('t.fromStock'),
            dataIndex: ['from', 'stock', 'names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('t.toStock'),
            dataIndex: ['to', 'stock', 'names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('t.fromCashregisterAccount'),
            dataIndex: ['from', 'cashregisterAccount', 'names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('t.type'),
            dataIndex: 'type',
            key: 'key',
        },
        {
            title: t('t.purchaseId'),
            dataIndex: ['purchase', 'id'],
            key: 'key'
        },
        {
            title: t('t.products'),
            dataIndex: 'products',
            key: 'key'
        },
        {
            title: t('t.fromcurrency'),
            dataIndex: ['from', 'currency', 'names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('t.tocurrency'),
            dataIndex: ['to', 'currency', 'names', selectedLanguage],
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                {/* <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeCashRegister(_id)} /> */}
            </Space>
        },
    ];

    return (<>
        <Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
            <Space.Compact style={{ float: 'right', padding: 8 }}>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => startCreateStock()}/>
            </Space.Compact>
            <Table 
                columns={columns} 
                dataSource={stocks}
                pagination={{ total: tablePagination }}
                onChange={(pagination, filters, sorter) => onChangeTable(pagination, filters, sorter)}
                style={{ padding: '0 8px' }}
            />
        </Content>

        <Modal
            title={editingStock ? t('editCurrency') : t('createCurrency')}
            open={isModalOpen}
            confirmLoading={false}
            onCancel={() => setIsModalOpen(false)}
            footer={[
                <Button
                  type="primary"
                  loading={false}
                  icon={editingStock ? <EditOutlined /> : <PlusOutlined />}
                  onClick={() => form.submit()}
                >
                  { editingStock ? t('editCurrency') : t('createCurrency') }
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={(v) => editingStock ? editStock(v) : createStock(v)}>
                { languages.all.map((language, key) => 
                    <Form.Item 
                        name={['names', language.code]} 
                        label={t(`stocksPage.name.${language.code}`)}
                        rules={[{ required: language.main }]}
                        key={key}
                    >
                        <Input />
                    </Form.Item>
                ) }
                <Form.Item 
                    name="priority" 
                    label={t('stocksPage.priority')}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>

        <Modal 
            title={t('stocksPage.transactions')}
            open={isTransactionsModalOpen} 
            width={500}
            centered
            onOk={() => closeTransactionsModal()}
            onCancel={() => closeTransactionsModal()}
        >
            {/* <Table 
                columns={columnsProductTransactions}
                dataSource={productTransactions}
            /> */}
            <Timeline
                items={(productTransactions || []).map(transaction => ({
                    children: `
                        ${transaction.createdAt} |
                        ${transaction.type} | ${(transaction.orderId || transaction.purchase.id)} |
                        ${(transaction.products || []).map(product => `${product.names?.[selectedLanguage] || "N/A"} (${product.quantity || 0})`).join(", ")}
                    `
                }))}
            />
        </Modal>
    </>);
}