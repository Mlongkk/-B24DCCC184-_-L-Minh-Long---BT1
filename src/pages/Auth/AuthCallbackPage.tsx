import React, { useEffect, useState } from 'react';
import { Spin, message, Result } from 'antd';
import { useHistory, useLocation } from 'umi';
import authService from '@/services/auth/authService';

const AuthCallbackPage: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get code and state from URL params
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                const state = params.get('state');

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Verify state
                if (!authService.verifyState(state || '')) {
                    throw new Error('Invalid state parameter');
                }

                // Exchange code for token
                await authService.keycloakLogin(code, state || undefined);
                message.success('Đăng nhập thành công!');

                // Redirect to dashboard
                history.replace('/dashboard');
            } catch (error: any) {
                const errorMsg = error?.message || 'Keycloak authentication failed';
                setError(errorMsg);
                message.error(errorMsg);
            }
        };

        handleCallback();
    }, [location, history]);

    if (error) {
        return (
            <Result
                status="error"
                title="Đăng nhập thất bại"
                subTitle={error}
                extra={
                    <button
                        onClick={() => history.push('/auth/login')}
                        style={{ padding: '8px 16px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Quay lại đăng nhập
                    </button>
                }
            />
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Đang xác thực..." />
        </div>
    );
};

export default AuthCallbackPage;
