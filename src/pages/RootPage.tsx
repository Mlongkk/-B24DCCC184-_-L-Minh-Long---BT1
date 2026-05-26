import React, { useEffect } from 'react';
import { useHistory } from 'umi';
import { Spin } from 'antd';
import authService from '@/services/auth/authService';
import HomePage from './HomePage';

/**
 * Root page - Handle redirect dựa trên authentication
 * - Nếu chưa login → redirect đến /auth/login
 * - Nếu đã login → render HomePage (hiển thị dashboard phù hợp với role)
 */
const RootPage: React.FC = () => {
    const history = useHistory();
    const user = authService.getCurrentUser();
    const token = authService.getToken();

    console.log('🏠 RootPage rendered');
    console.log('  Token:', token ? '✅ Present' : '❌ Missing');
    console.log('  User:', user ? `✅ ${user.username}` : '❌ Missing');

    useEffect(() => {
        // Nếu không có token và không có user → redirect đến login
        if (!token && !user) {
            console.log('❌ No token/user, redirecting to login');
            history.push('/auth/login');
        }
    }, [history, user, token]);

    // Chưa login → hiển thị loading
    if (!token || !user) {
        console.log('⏳ Loading state - token or user missing');
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Đã login → render HomePage (dashboard khác nhau dựa trên role)
    console.log('✅ Rendering HomePage for user:', user.username);
    return <HomePage />;
};

export default RootPage;
