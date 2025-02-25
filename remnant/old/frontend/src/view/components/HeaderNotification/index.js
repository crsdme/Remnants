import {
    BellOutlined,
} from '@ant-design/icons';
import { Button, theme, Badge, List, Avatar, Dropdown, Space, Typography, Pagination, Tabs, Flex } from 'antd';

import { 
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ClockCircleOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import request from '../../../utils/requests';
import socket from '../../../utils/socket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import AvatarWithHover from '../../components/AvatarWithHover';

export default function Component() {

    const { t } = useTranslation();
    
    const { useToken } = theme;

    const { token } = useToken();

    const { tokens, profile } = useSelector((state) => state.auth);
    
    const params = { userId: profile._id, tokens }
    
    const { Title, Text } = Typography;

    dayjs.extend(relativeTime);

    dayjs.locale('ru');

    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        width: 350,
        minHeight: 430
    };

    const [notifications, setNotifications] = useState([]);
    const [notificationsNotViewed, setNotificationsNotViewd] = useState(0);
    const [notificationsCount, setNotificationsCount] = useState(0);

    const getNotifications = async (value) => {
        const { status, data } = await request.getNotifications(value, params);
        if (status === 'success') {
            setNotifications(data.notifications);
            setNotificationsCount(data.notificationsCount);
            setNotificationsNotViewd(data.notificationsNotViewed);
        }
    }

    const handleList = async (page) => {
        const { status, data } = await request.getNotifications({ filter: { user: profile._id }, pagination: { current: page, pageSize: 3 } }, params);
        if (status === 'success') {
            setNotifications(data.notifications);
            setNotificationsCount(data.notificationsCount);
            setNotificationsNotViewd(data.notificationsNotViewed);
        }
    }

    const tabsItems = [
        {
          key: '1',
          label: t('alerts'),
        },
        {
          key: '2',
          label: t('messages'),
        },
        {
          key: '3',
          label: t('tasks'),
        },
    ];

    useEffect(() => {
        getNotifications({ filter: { user: profile._id } });

        const updateNotificationsHandler = (updatedData) => {
            if (updatedData.status) {
              getNotifications({ filter: { user: profile._id } });
            }
        };

        socket.on('/updateNotifications', updateNotificationsHandler);

        return () => {
            socket.off('/updateNotifications', updateNotificationsHandler);
            socket.disconnect();
        };
    }, [])

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomRight"
            arrow={{ pointAtRight: true }}
            menu={{
                items: notifications,
            }}
            dropdownRender={(menu) => <div style={contentStyle}>
            <Tabs defaultActiveKey="1" items={tabsItems} centered />
            <List
                itemLayout="vertical"
                size="small"
                footer={
                    <Pagination
                      total={notificationsCount}
                      pageSize={3}
                      size="small"
                      hideOnSinglePage
                      showLessItems
                      onChange={handleList}
                      style={{ textAlign: 'center' }}
                    />
                }
                dataSource={menu.props.items}
                renderItem={(item) => (<>
                    <List.Item
                        style={{ padding: '17px' }}
                        key={item.name}
                    >   
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                            <Badge dot={!item.viewed}>
                                <Avatar style={{ marginBottom: 25 }} />
                            </Badge>
                            <Space direction='vertical' style={{ flex: 1 }} size={5}>
                                <Link to={item.link} style={{ flex: 1 }}>
                                    <Title level={5} style={{ marginTop: 0 }}>{t(item.title)}</Title>
                                    <Text>{t(item.description)}</Text>
                                </Link>
                                <Space>
                                    <ClockCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                                    <Text type="secondary"  >{ dayjs(item.createdAt).fromNow() }</Text>
                                </Space>
                            </Space>
                            <Dropdown
                                menu={{
                                    items: [{
                                        key: '1',
                                        label: t('remove'),
                                        icon: <DeleteOutlined />
                                    }],
                                    onClick: () => console.log(item._id)
                                }}
                                placement="bottomRight"
                                arrow
                            >
                                <Button type='text' icon={<MoreOutlined />} />
                            </Dropdown>
                        </div>
                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                            <Badge dot={!item.viewed}>
                                <Avatar />
                            </Badge>
                            <Link to={item.link} style={{ flex: 1 }}>
                                <Title level={5} style={{ marginTop: 0 }}>{t(item.title)}</Title>
                                <Text>{t(item.description)}</Text>
                            </Link>
                            <Text>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }</Text>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                        key: '1',
                                        label: t('remove'),
                                        danger: true,
                                        icon: <DeleteOutlined />
                                        },
                                        {
                                        key: '2',
                                        label: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                                        icon: <ClockCircleOutlined />
                                        },
                                    ],
                                }}
                                placement="bottomRight"
                                arrow
                            >
                                <MoreOutlined />
                            </Dropdown>
                        </div> */}
                    </List.Item>
                </>)}
            />
        </div>}
        >
            <Badge size="small" count={notificationsNotViewed} offset={[-7, 7]}>
                <Button type="ghost" icon={<BellOutlined />} />
            </Badge>
        </Dropdown>
    );
}