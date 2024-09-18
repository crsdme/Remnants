import {
    UnlockOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../images/remnantLogo.png';

export default function Page() {

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const { warnings, errors, info, status } = useSelector(state => state.auth);

    const loginUser = (value) => {
        dispatch({type: 'SAGA_AUTH_LOGIN', payload: value});
    }

    if (status === 'auth') {
      navigate('/dashboard');
    }

    return (
    <div class="bg-neutral-surface-subtle w-screen h-screen flex justify-center items-center">
        <div class="flex items-center flex-col gap-7">
            <img src={Logo} class="w-[145px]" />
            <div class="bg-neutral-white w-80 p-6 rounded-lg">
                <h3 class="text-2xl font-medium text-center mb-2">{t('loginPage.signIn')}</h3>
                <p class="text-sm text-neutral-textIcon-subtitle text-center mb-8">{t('loginPage.forgotPassword')}</p>
                <Form layout="vertical" onFinish={loginUser}>
                    <Form.Item
                        name="login"
                        label={t('loginPage.login')}
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <Input placeholder={t('login')} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={t('loginPage.password')}
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <Input.Password placeholder={t('loginPage.password')} />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label={t('loginPage.type')}
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <Select
                            options={[
                                {
                                    value: 'guest',
                                    label: t('loginPage.typeGuest'),
                                },
                                {
                                    value: 'work',
                                    label: t('loginPage.typeWork'),
                                }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button 
                        class="appearance-none" 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={ status ==='inProgress' } 
                        icon={<UnlockOutlined />}>
                            {t('loginPage.submit')}
                        </Button>
                    </Form.Item>
                    
                </Form>
            </div>            
        </div>    
    </div>
    );
}