import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Card, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import authService from '@/services/auth/authService';
import { getDashboardPath } from '@/hooks/useAuthRedirect';
import './LoginPage.less';

interface LoginFormData {
    username: string;
    password: string;
    rememberMe?: boolean;
}

const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    /**
     * Handle traditional login
     */
    const onFinish = async (values: LoginFormData) => {
        try {
            setLoading(true);
            await authService.login({
                username: values.username,
                password: values.password,
                rememberMe: values.rememberMe,
            });
            message.success('Đăng nhập thành công!');
            // Redirect dựa trên role
            const dashboardPath = getDashboardPath();
            history.push(dashboardPath);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle Keycloak login
     */
    const handleKeycloakLogin = () => {
        try {
            const redirectUri = `${window.location.origin}/auth/callback`;
            const loginUrl = authService.getKeycloakLoginUrl(redirectUri);
            window.location.href = loginUrl;
        } catch (error) {
            message.error('Khởi tạo Keycloak login thất bại');
        }
    };

    return (
        <div className="login-page-container">
            <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
                <Col xs={22} sm={20} md={10} lg={8} xl={6}>
                    <Card className="login-page-card">
                        {/* Header */}
                        <div className="login-page-header">
                            <h1>BenhVienABC</h1>
                            <p>Hệ thống quản lý thú y</p>
                        </div>

                        {/* Login Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            size="large"
                        >
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                    { min: 3, message: 'Tên đăng nhập phải từ 3 ký tự' },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Tên đăng nhập"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Mật khẩu"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item name="rememberMe" valuePropName="checked" initialValue={false}>
                                <Checkbox>Ghi nhớ tôi</Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Divider */}
                        <Divider>Hoặc</Divider>

                        {/* Keycloak Login */}
                        <Button
                            type="default"
                            block
                            size="large"
                            onClick={handleKeycloakLogin}
                            disabled={loading}
                            icon={<GoogleOutlined />}
                        >
                            Đăng nhập với Keycloak
                        </Button>

                        {/* Footer Links */}
                        <div className="login-page-footer">
                            <p>
                                Quên mật khẩu?{' '}
                                <a href="/forgot-password">Đặt lại tại đây</a>
                            </p>
                            <p>
                                Chưa có tài khoản?{' '}
                                <a onClick={() => history.push('/auth/register')} style={{ cursor: 'pointer' }}>
                                    Đăng kí ngay
                                </a>
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;
