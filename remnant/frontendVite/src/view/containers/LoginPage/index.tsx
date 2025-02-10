import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { UnlockOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select } from 'antd';
import Logo from './images/remnantLogo.png';
import { useAuthContext } from '@/utils/contexts';

export function LoginPage() {
  const { t } = useTranslation();

  const authContenxt = useAuthContext();

  const loginUser = (value) => {
    authContenxt.login(value);
  };

  return (
    <>
      <Helmet>
        <title>{t('title.login')}</title>
        <meta name='description' content={t('description.login')} />
      </Helmet>
      <div className='w-screen h-screen flex justify-center items-center'>
        <div className='flex items-center gap-7 flex-col'>
          <img src={Logo} className='w-[145px]' />
          <div className='bg-white w-80 rounded-lg p-6'>
            <h3 className='text-2xl font-medium text-center mb-2'>{t('loginPage.signIn')}</h3>
            <p className='text-sm text-neutral-textIcon-subtitle text-center mb-8'>
              {t('loginPage.forgotPassword')}
            </p>
            <Form layout='vertical' onFinish={loginUser}>
              <Form.Item
                name='login'
                label={t('loginPage.login')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input placeholder={t('loginPage.login')} />
              </Form.Item>

              <Form.Item
                name='password'
                label={t('loginPage.password')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input.Password placeholder={t('loginPage.password')} />
              </Form.Item>

              <Form.Item
                name='type'
                label={t('loginPage.type')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Select
                  options={[
                    {
                      value: 'guest',
                      label: t('loginPage.typeGuest')
                    },
                    {
                      value: 'work',
                      label: t('loginPage.typeWork')
                    }
                  ]}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  className='appearance-none'
                  type='primary'
                  htmlType='submit'
                  block
                  loading={status === 'inProgress'}
                  icon={<UnlockOutlined />}
                >
                  {t('loginPage.submit')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
