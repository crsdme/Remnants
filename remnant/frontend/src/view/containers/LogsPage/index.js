import React, { useState, useEffect } from 'react';
import { Layout, Table, Skeleton, Avatar, Space } from 'antd';
import { 

} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import request from '../../../utils/requests';

const { Content } = Layout;

export default function Page() {

    const [logs, setLogs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [tablePagination, setTablePagination] = useState([]);
    const [tableFilters, setTableFilters] = useState({ pagination: { current: 1, pageSize: 10 } });

    const { t } = useTranslation();

    const { tokens, profile } = useSelector((state) => state.auth);
    const params = { userId: profile._id, tokens }

    const getLogs = async (filters) => {
        const { status, data } = await request.getLogs(filters, params);
        if (status === 'success') {
            setLoading(false)
            setLogs(data.logs);
            console.log(data.logs)
            setTablePagination(data.logsCount);
        }
    }

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilters({ pagination, filters, sorter });
        getLogs({ pagination, filters, sorter })
    }

    useEffect(() => {
        getLogs(tableFilters);
    }, []);

    const columns = [
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: t('route'),
            dataIndex: 'route',
            key: 'route',
        },
        {
            title: t('userId'),
            dataIndex: 'userId',
            key: 'userId',
            render: (user) => <Space>
                <Avatar />
                <div>
                    <p>{ user.name }</p>
                    <p>{ user.role }</p>
                </div>
            </Space>
        },
        {
            title: t('ip'),
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: t('params'),
            dataIndex: 'params',
            key: 'params',
        },
        {
            title: t('createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')
        },
    ];

    const loadingColumns = [
        {
            title: t('type'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('route'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('userId'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('ip'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('params'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: 'createdAt',
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        }
    ];

    const loadingData = ['', '', '', '', '', '', '', '', '', ''];

    return (<>
        <Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
            <Table 
                columns={loading ? loadingColumns : columns} 
                dataSource={loading ? loadingData : logs}
                pagination={{ total: tablePagination }}
                onChange={(pagination, filters, sorter) => onChangeTable(pagination, filters, sorter)}
                style={{ padding: '0 8px' }}
            />
        </Content>
    </>);
}