import React, { useEffect } from 'react';
import { useHistory } from 'umi';
import { Spin } from 'antd';
import { getDashboardPath } from '@/hooks/useAuthRedirect';
import authService from '@/services/auth/authService';

/**
 * Root page - Handle redirect dựa trên authentication và role
 * - Nếu chưa login → redirect đến /auth/login
 * - Nếu đã login → redirect đến dashboard phù hợp với role
 */
const RootPage: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        const user = authService.getCurrentUser();

        if (!user) {
            // Chưa login → redirect đến login page
            history.push('/auth/login');
        } else {
            // Đã login → redirect dựa trên role
            const dashboardPath = getDashboardPath();
            history.push(dashboardPath);
        }
    }, [history]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Spin size="large" />
        </div>
    );
};

export default RootPage;
