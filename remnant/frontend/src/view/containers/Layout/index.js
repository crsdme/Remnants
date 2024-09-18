import {
    DashboardOutlined,
    GoldOutlined,
    FolderOutlined,
    QrcodeOutlined,
    AppstoreOutlined,
    BarChartOutlined,
    ShopOutlined,
    PercentageOutlined,
    ShoppingCartOutlined,
    TableOutlined,
    PlusSquareOutlined,
    ContainerOutlined,
    PoundOutlined,
    WalletOutlined,
    CreditCardOutlined,
    CalendarOutlined,
    TranslationOutlined,
    SettingOutlined,
    AuditOutlined,
    UserOutlined,
    UserSwitchOutlined,
    LogoutOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Input, Flex, Space, Popover, Avatar } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { useTranslation } from 'react-i18next';
import { Outlet, Link, useLocation } from "react-router-dom";

import Footer from '../../components/Footer';
import Sidemenu from '../../components/Sidemenu';
import HeaderNotification from '../../components/HeaderNotification';
const { Header, Sider, Content } = Layout;
const { Search } = Input;

export default function Page() {

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    let user = useSelector((state) => state.auth.profile);

    let { sidebarStatus } = useSelector((state) => state.theme);

    const sidemenuItems = [
        {
            label: t('sidemenu.review'), icon: DashboardOutlined, link: '/review'
        },
        {
            label: t('sidemenu.catalog'), icon: AppstoreOutlined, children: [
                {
                    label: t('sidemenu.products'), icon: GoldOutlined, link: '/products'
                },
                {
                    label: t('sidemenu.categories'), icon: FolderOutlined, link: '/categories'
                },
                {
                    label: t('sidemenu.attributes'), icon: QrcodeOutlined, link: '/attributes'
                },
                {
                    label: t('sidemenu.barcodes'), icon: QrcodeOutlined, link: '/barcodes'
                }
            ]
        },
        {
            label: t('sidemenu.statistic'), icon: BarChartOutlined, children: [
                {
                    label: t('sidemenu.orderStatistic'), icon: ShoppingCartOutlined, link: '/statistic/order'
                },
                {
                    label: t('sidemenu.productStatistic'), icon: GoldOutlined, link: '/statistic/product'
                },
                {
                    label: t('sidemenu.stockStatistic'), icon: GoldOutlined, link: '/statistic/stock'
                },
                {
                    label: t('sidemenu.productionStatistic'), icon: GoldOutlined, link: '/statistic/production'
                },
                {
                    label: t('sidemenu.metrics'), icon: GoldOutlined, link: '/statistic/metrics'
                },
            ]
        },
        {
            label: t('sidemenu.orders'), icon: ShoppingCartOutlined, link: '/orders'
        },
        {
            label: t('sidemenu.marketing'), icon: ShopOutlined, children: [
                {
                    label: t('sidemenu.clients'), icon: UserOutlined, link: '/clients'
                },
                {
                    label: t('sidemenu.promocodes'), icon: PercentageOutlined, link: '/promocodes'
                },
                {
                    label: t('sidemenu.coupons'), icon: PercentageOutlined, link: '/coupons'
                },
                {
                    label: t('sidemenu.bonuses'), icon: PercentageOutlined, link: '/bonuses'
                },
            ]
        },
        {
            label: t('sidemenu.stocks'), icon: TableOutlined, children: [
                {
                    label: t('sidemenu.purchases'), icon: PlusSquareOutlined, link: '/purchases'
                },
                {
                    label: t('sidemenu.inventories'), icon: ContainerOutlined, link: '/inventories'
                }
            ]
        },
        {
            label: t('sidemenu.money'), icon: PoundOutlined, children: [
                {
                    label: t('sidemenu.expenses'), icon: WalletOutlined, link: '/expenses'
                },
                {
                    label: t('sidemenu.cashregisters'), icon: CreditCardOutlined, link: '/cashregisters'
                },
                {
                    label: t('sidemenu.investors'), icon: UserOutlined, link: '/investors'
                }
            ]
        },
        {
            label: t('sidemenu.money'), icon: PoundOutlined, children: [
                {
                    label: t('sidemenu.procurements'), icon: PlusSquareOutlined, link: '/procurements'
                },
                {
                    label: t('sidemenu.providers'), icon: UserOutlined, link: '/providers'
                },
            ]
        },
        {
            label: t('sidemenu.socials'), icon: PoundOutlined, children: [
                {
                    label: t('sidemenu.news'), icon: PlusSquareOutlined, link: '/news'
                },
                {
                    label: t('sidemenu.updates'), icon: UserOutlined, link: '/updates'
                },
                {
                    label: t('sidemenu.chats'), icon: UserOutlined, link: '/chats'
                },
            ]
        },
        {
            label: t('sidemenu.users'), icon: PoundOutlined, children: [
                {
                    label: t('sidemenu.users'), icon: PlusSquareOutlined, link: '/users'
                },
                {
                    label: t('sidemenu.timetable'), icon: UserOutlined, link: '/timetable'
                }
            ]
        },
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>

            <Sidemenu list={sidemenuItems} />

            <Layout>
                <Content class={`transition-all duration-300 ease-in-out`} style={{ paddingLeft: sidebarStatus ? 224 : 63 }}>
                    <Outlet />
                </Content>

            </Layout>
        </Layout>
    );
}