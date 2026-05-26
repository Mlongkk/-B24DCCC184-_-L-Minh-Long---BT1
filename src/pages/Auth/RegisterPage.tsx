import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Divider, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import authService from '@/services/auth/authService';
import './LoginPage.less';

interface RegisterFormData {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('=== RegisterPage Environment ===');
    }, []);

    const checkUsernameExists = async (username: string) => {
        if (!username || username.length < 3) return false;

        try {
            const response = await authService.checkUsername(username);
            // Trường hợp API trả về dạng 200 OK kèm object kết quả
            return response?.exists || false;
        } catch (error: any) {
            console.error('Error checking username:', error);

            // Nếu API trả về lỗi 400 hoặc 409 nghĩa là tài khoản ĐÃ TỒN TẠI
            if (error?.response?.status === 400 || error?.response?.status === 409) {
                return true; // Trả về true để xác nhận username ĐÃ tồn tại
            }

            return false; // Các lỗi mạng khác hoặc sập server
        }
    };

    const onFinish = async (values: RegisterFormData) => {
        try {
            setLoading(true);

            // Tạo payload gửi đi
            const payload = {
                username: values.username,
                email: values.email,
                fullName: values.fullName,
                phone: values.phone,
                password: values.password,
            };

            // Gửi thẳng yêu cầu đăng ký lên server
            const result = await authService.register(payload);

            console.log('Register success:', result);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            history.push('/auth/login');
        } catch (error: any) {
            console.error('Register error:', error);

            // Đọc thông báo lỗi chi tiết trả về từ Backend của bạn
            // Tùy theo cấu trúc API, thông thường lỗi trùng sẽ nằm trong error.response.data
            const errorMsg =
                error?.response?.data?.message ||  // Ví dụ: "Tên đăng nhập này đã tồn tại"
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.message ||
                'Đăng ký thất bại. Vui lòng thử lại.';

            // Hiển thị thông báo lỗi thực tế từ server trả về thay vì câu thông báo chung chung
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="login-page-container">
            <Row justify="start" align="middle" className="login-row">
                {/* Tăng độ rộng md và lg lên để form 2 cột trên desktop đẹp hơn */}
                <Col xs={24} sm={22} md={16} lg={12} xl={10} className="login-col">
                    <Card className="login-page-card registration-card">
                        <div className="login-page-header">
                            <h1>BenhVienABC</h1>
                            <p>Tạo tài khoản mới để trải nghiệm dịch vụ</p>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            size="large"
                            requiredMark={false} // Ẩn dấu sao đỏ để UI tinh tế hơn
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ và tên' },
                                            { min: 3, message: 'Họ và tên phải từ 3 ký tự' }
                                        ]}
                                    >
                                        <Input prefix={<IdcardOutlined />} placeholder="Nhập họ và tên" disabled={loading} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="username"
                                        label="Tên đăng nhập"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                            { pattern: /^[a-zA-Z0-9_.-]+$/, message: 'Tên đăng nhập chỉ chứa chữ, số, dấu gạch dưới, dấu chấm, dấu gạch ngang' }
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" disabled={loading} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="email@example.com" disabled={loading} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                                            { pattern: /^0[0-9]{9,10}$/, message: 'Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số' }
                                        ]}
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" disabled={loading} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" disabled={loading} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu"
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" disabled={loading} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item style={{ marginTop: 8 }}>
                                <Button type="primary" htmlType="submit" block size="large" loading={loading} className="btn-submit">
                                    Đăng ký tài khoản
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider className="custom-divider">Hoặc</Divider>

                        <Button type="default" block size="large" onClick={() => history.push('/auth/login')} disabled={loading} className="btn-secondary">
                            Đã có tài khoản? Đăng nhập
                        </Button>

                        <div className="login-page-footer">
                            <p>Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ</p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;