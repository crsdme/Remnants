import { Select, Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'; 
import { Link } from "react-router-dom";
import logo from '../../images/logo.svg'
import {
    UserOutlined,
    SettingOutlined,
} from '@ant-design/icons';


export default function LayoutContainer({ list }) {

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const { profile } = useSelector((state) => state.auth);

    const { languages, selectedLanguage } = useSelector((state) => state.theme);

    const openSidemenu = () => {
        setIsSidebarOpen(!isSidebarOpen);
        dispatch({type: 'SAGA_THEME_SIDEBAR', payload: !isSidebarOpen})
    }

    const handleMouseEnter = (category) => {
        setActiveCategory(category);
    };
  
    const handleMouseLeave = () => {
        setActiveCategory(null);
    };

    const sidemenuSettingsItems = [
        {
            label: t('sidemenu.languages'), icon: SettingOutlined, link: '/settings/languages'
        },
        {
            label: t('sidemenu.currencies'), icon: SettingOutlined, link: '/settings/currencies'
        },
        {
            label: t('sidemenu.sources'), icon: SettingOutlined, link: '/settings/sources'
        },
        {
            label: t('sidemenu.stocks'), icon: SettingOutlined, link: '/settings/stocks'
        },
        {
            label: t('sidemenu.units'), icon: SettingOutlined, link: '/settings/units'
        },
        {
            label: t('sidemenu.users'), icon: SettingOutlined, link: '/settings/users'
        },
        {
            label: t('sidemenu.novaposhta.accounts'), icon: SettingOutlined, link: '/settings/novaposhta/accounts'
        },
        {
            label: t('sidemenu.settings'), icon: SettingOutlined, link: '/settings'
        },
    ]
  

    return (
        <nav className={`
            transition-all duration-300 ease-in-out
            flex justify-between flex-col
            fixed m-2 rounded-lg z-50
             bg-white h-[calc(100%-16px)] ${isSidebarOpen ? `w-56` : `w-16`}
        `}>
            <ul>
                <li>
                    <Link to="#">
                        <div className={`
                            transition-all duration-300 ease-in-out
                            flex justify-center items-center
                            ${isSidebarOpen ? `w-52` : `w-12`} h-12 bg-zinc-800 rounded-lg m-2
                        `} onClick={() => openSidemenu()}>
                            <img src={logo} />
                        </div>
                    </Link>
                </li>
                {
                    list.map((item, key) => {
                        const ItemComponent = item.link ? Link : 'span';

                        return (
                            <li className={`relative`} key={key} onMouseEnter={() => handleMouseEnter(key)} onMouseLeave={handleMouseLeave}>
                                <ItemComponent to={item.link} className={`
                                    transition-all duration-300 ease-in-out
                                    flex items-center relative cursor-pointer
                                    ${isSidebarOpen ? `w-54` : `w-12`} h-12 rounded-lg m-2 z-10
                                    hover:bg-zinc-200
                                `}>
                                    <span className={`
                                        transition-all duration-300 ease-in-out
                                        ml-[15px] text-zinc-800
                                        ${isSidebarOpen ? `text-sm` : `text-lg`}
                                    `}>
                                        <item.icon />
                                    </span>
                                    <p className={`
                                        transition-all duration-300 ease-in-out
                                        absolute ml-10
                                        ${isSidebarOpen ? `opacity-1 visible` : `opacity-0 invisible`}
                                    `}>{item.label}</p>
                                </ItemComponent>
                                {
                                    (item.children && key === activeCategory) && 
                                    <div className={`w-64 h-12 absolute z-0 top-0`}>
                                        <ul className={`w-56 absolute ${isSidebarOpen ? `left-56` : `left-16`} ml-2 bg-white rounded-lg shadow-xl`}>
                                            {
                                                item.children.map((child, key) => 
                                                    <li key={key}>
                                                        <Link to={child.link} className={`
                                                            transition-all duration-300 ease-in-out
                                                            flex items-center relative cursor-pointer
                                                            w-54 h-12 rounded-lg m-2
                                                            hover:bg-zinc-200
                                                        `}>
                                                            <span className={`
                                                                transition-all duration-300 ease-in-out
                                                                ml-[15px] text-zinc-800
                                                            `}>
                                                                <child.icon />
                                                            </span>
                                                            <p className={`
                                                                transition-all duration-300 ease-in-out
                                                                absolute ml-10
                                                            `}>{child.label}</p>
                                                        </Link>
                                                    </li>
                                                )
                                            }
                                        </ul>
                                    </div>
                                }
                            </li>
                        )
                    })
                }
            </ul>
            <ul>
                <li className={`relative`} onMouseEnter={() => handleMouseEnter('settings')} onMouseLeave={handleMouseLeave}>
                    <span className={`
                        transition-all duration-300 ease-in-out
                        flex items-center relative cursor-pointer
                        ${isSidebarOpen ? `w-54` : `w-12`} h-12 rounded-lg m-2 z-10
                        hover:bg-zinc-200
                    `}>
                        <span className={`
                            transition-all duration-300 ease-in-out
                            ml-[15px] text-zinc-800
                            ${isSidebarOpen ? `text-sm` : `text-lg`}
                        `}>
                            <SettingOutlined />
                        </span>
                        <p className={`
                            transition-all duration-300 ease-in-out
                            absolute ml-10
                            ${isSidebarOpen ? `opacity-1 visible` : `opacity-0 invisible`}
                        `}>{t('sidemenu.settings')}</p>
                    </span>
                    {
                        ('settings' === activeCategory) && 
                        <div className={`w-64 h-12 absolute z-0 bottom-0`}>
                            <ul className={`w-56 absolute ${isSidebarOpen ? `left-56` : `left-16`} bottom-0 ml-2 bg-white rounded-lg shadow-xl`}>
                                {
                                    sidemenuSettingsItems.map((item, key) => 
                                        <li key={key}>
                                            <Link to={item.link} className={`
                                                transition-all duration-300 ease-in-out
                                                flex items-center relative cursor-pointer
                                                w-54 h-12 rounded-lg m-2
                                                hover:bg-zinc-200
                                            `}>
                                                <span className={`
                                                    transition-all duration-300 ease-in-out
                                                    ml-[15px] text-zinc-800
                                                `}>
                                                    <item.icon />
                                                </span>
                                                <p className={`
                                                    transition-all duration-300 ease-in-out
                                                    absolute ml-10
                                                `}>{item.label}</p>
                                            </Link>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    }
                </li>
                <hr className={`mx-2`} />
                <li className={`
                    transition-all duration-300 ease-in-out
                    
                    ${isSidebarOpen ? `w-56` : `w-16`}
                `}
                onMouseEnter={() => handleMouseEnter('profile')}
                onMouseLeave={handleMouseLeave}
                >
                    <Link to={'/profile'} className={`
                        transition-all duration-500 ease-in-out
                         bg-zinc-400 rounded-lg m-2
                        flex justify-center items-center relative
                        ${isSidebarOpen ? `w-10 h-10` : `w-12 h-12`}
                    `}>
                        <UserOutlined style={{ fontSize: 20, color: 'white' }} />
                        <div className={`
                            transition-all duration-200 ease-in-out
                            ${isSidebarOpen ? `opacity-1 visible` : `opacity-0 invisible`}
                        `}>
                            <p className={`
                                transition-all duration-300 ease-in-out
                                absolute top-0 left-14 font-bold whitespace-nowrap
                            `}>{t('Volodymyr Lytvynov')}</p>
                            <p className={`
                                transition-all duration-300 ease-in-out
                                absolute top-5 left-14 text-zinc-500
                            `}>{t('manager')}</p>
                        </div>
                    </Link>
                    {
                        ('profile' === activeCategory) && 
                        <div className={`w-64 h-12 absolute z-0 bottom-0`}>
                            <div className={`
                                w-56 absolute ${isSidebarOpen ? `left-56` : `left-16`} bottom-0 ml-2 bg-white rounded-lg shadow-xl
                                flex justify-between gap-2
                                p-3
                            `}>
                                <Select
                                    style={{ width: '100%' }}
                                    value={selectedLanguage}
                                    options={(languages.all || []).map(item => ({
                                        value: item.code,
                                        label: item.name
                                    }))}
                                    onChange={(v) => dispatch({type: 'SAGA_THEME_LANGUAGE', payload: v})}
                                />
                                <Button onClick={() => dispatch({type: 'SAGA_AUTH_LOGOUT', payload: profile})}>{t('sidebar.logout')}</Button>
                            </div>
                        </div>
                    }
                </li>
            </ul>
        </nav>
    );
}