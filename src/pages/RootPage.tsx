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

    useEffect(() => {
        if (!user) {
            // Chưa login → redirect đến login page
            history.push('/auth/login');
        }
    }, [history, user]);

    // Chưa login → hiển thị loading
    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Đã login → render HomePage (dashboard khác nhau dựa trên role)
    return <HomePage />;
};

export default RootPage;
