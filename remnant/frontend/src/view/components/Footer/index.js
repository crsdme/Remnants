import {
    MenuFoldOutlined,
    AppstoreOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from "react-router-dom";
const { Footer } = Layout;


export default function LayoutContainer() {

    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <Footer
            style={{
            textAlign: 'center',
            }}
        >
            Footer ©2023
        </Footer>
    );
}