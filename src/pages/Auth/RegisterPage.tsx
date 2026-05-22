import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Divider, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import authService from '@/services/auth/authService';
import './LoginPage.less';

interface RegisterFormData {
    username: string;
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    // Debug: Log API configuration on component mount
    useEffect(() => {
        console.log('=== RegisterPage Environment ===');
        console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
        console.log('NODE_ENV:', process.env.NODE_ENV);
    }, []);

    /**
     * Handle user registration
     */
    const onFinish = async (values: RegisterFormData) => {
        try {
            setLoading(true);
            console.log('Register attempt:', values);

            // Call register API
            const result = await authService.register({
                username: values.username,
                email: values.email,
                fullName: values.fullName,
                password: values.password,
            });

            console.log('Register success:', result);
            message.success('Đăng kí thành công! Vui lòng đăng nhập.');
            history.push('/auth/login');
        } catch (error: any) {
            console.error('Register error:', error);
            console.error('Error response:', error?.response?.data);
            console.error('Error status:', error?.response?.status);

            const errorMsg =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.message ||
                'Đăng kí thất bại. Vui lòng thử lại.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        history.push('/auth/login');
    };

    return (
        <div className="login-page-container">
            <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
                <Col xs={22} sm={20} md={10} lg={8} xl={6}>
                    <Card className="login-page-card">
                        {/* Header */}
                        <div className="login-page-header">
                            <h1>BenhVienABC</h1>
                            <p>Tạo tài khoản mới</p>
                        </div>

                        {/* Register Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            size="large"
                        >
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên' },
                                    { min: 2, message: 'Họ và tên phải từ 2 ký tự' },
                                    { max: 100, message: 'Họ và tên không vượt quá 100 ký tự' },
                                ]}
                            >
                                <Input
                                    placeholder="Nhập họ và tên"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                    { min: 3, message: 'Tên đăng nhập phải từ 3 ký tự' },
                                    { max: 50, message: 'Tên đăng nhập không vượt quá 50 ký tự' },
                                    {
                                        pattern: /^[a-zA-Z0-9_.-]+$/,
                                        message: 'Tên đăng nhập chỉ chứa chữ, số, dấu gạch dưới, dấu chấm, dấu gạch ngang',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Tên đăng nhập"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="email@example.com"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu phải từ 6 ký tự' },
                                    {
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message:
                                            'Mật khẩu phải chứa chữ hoa, chữ thường và số',
                                    },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error('Mật khẩu xác nhận không khớp!')
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Xác nhận mật khẩu"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                >
                                    Đăng kí
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Divider */}
                        <Divider>Hoặc</Divider>

                        {/* Login Link */}
                        <Button
                            type="default"
                            block
                            size="large"
                            onClick={handleLoginClick}
                            disabled={loading}
                        >
                            Đã có tài khoản? Đăng nhập
                        </Button>

                        {/* Footer Links */}
                        <div className="login-page-footer">
                            <p style={{ marginTop: '20px' }}>
                                Bằng cách đăng kí, bạn đồng ý với{' '}
                                <a href="/terms">Điều khoản dịch vụ</a>
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;
