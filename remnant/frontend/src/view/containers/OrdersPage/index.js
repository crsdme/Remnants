import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, Flex, Modal, Select, Tag } from 'antd';
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
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

export default function Page({ props }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const removeOrder = async (_id) => {
        const { status } = await request.removeOrder({ _id }, params);
        if (status === 'success') getOrders(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getOrders = async () => {
        const { status, data } = await request.getOrders({}, params);
        if (status === 'success') {
            setOrders(data.orders);
        }
    }

    useEffect(() => {
        getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('ordersPage.id'),
            dataIndex: 'id',
            key: 'key'
        },
        {
            title: t('ordersPage.status'),
            dataIndex: 'status',
            key: 'key',
        },
        {
            title: t('ordersPage.source'),
            dataIndex: 'source',
            key: 'key',
        },
        {
            title: t('ordersPage.client'),
            dataIndex: 'client',
            key: 'key',
        },
        {
            title: t('ordersPage.summary'),
            dataIndex: 'summary',
            key: 'key',
        },
        {
            title: t('ordersPage.createdAt'),
            dataIndex: 'createdAt',
            key: 'key',
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, id }) => 
            <Space>
                <Button icon={<EditFilled />} onClick={() => navigate(`/order/${id}?type=edit`)} />
                <Button icon={<DeleteFilled />} onClick={() => removeOrder(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('ordersPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                {
                    props.orderStatuses.map(item => <Tag color={item.color}>{ item.names[selectedLanguage] }</Tag>)
                }
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => navigate('/order?type=create')} >{t('ordersPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={orders}
            />
        </Content>
    );
}