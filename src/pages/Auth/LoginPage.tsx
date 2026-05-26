import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Card, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import authService from '@/services/auth/authService';
import { getDashboardPath } from '@/hooks/useAuthRedirect';
import './LoginPage.less';

const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            await authService.login({
                username: values.username,
                password: values.password,
                rememberMe: values.rememberMe,
            });
            message.success('Đăng nhập thành công!');
            const dashboardPath = getDashboardPath();
            window.location.replace(window.location.origin + '/#' + dashboardPath);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeycloakLogin = () => {
        try {
            const redirectUri = `${window.location.origin}/auth/callback`;
            window.location.href = authService.getKeycloakLoginUrl(redirectUri);
        } catch (error) {
            message.error('Khởi tạo Keycloak login thất bại');
        }
    };

    return (
        <div className="login-page-container">
            <Row justify="start" align="middle" className="login-row">
                <Col xs={24} sm={20} md={10} lg={8} xl={7} className="login-col">
                    <Card className="login-page-card">
                        <div className="login-page-header">
                            <h1>BenhVienABC</h1>
                            <p>Hệ thống quản lý thú y hiện đại</p>
                        </div>

                        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large" requiredMark={false}>
                            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" disabled={loading} />
                            </Form.Item>

                            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" disabled={loading} />
                            </Form.Item>

                            <Form.Item name="rememberMe" valuePropName="checked" initialValue={false} className="remember-me-item">
                                <Checkbox>Ghi nhớ tài khoản</Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block size="large" loading={loading} className="btn-submit">
                                    Đăng nhập hệ thống
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider className="custom-divider">Hoặc sử dụng cổng bảo mật</Divider>


                        <div className="login-page-footer">
                            <p>Chưa có tài khoản? <a onClick={() => history.push('/auth/register')}>Đăng ký ngay</a></p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;