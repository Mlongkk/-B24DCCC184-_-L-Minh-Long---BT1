import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tag,
    Row,
    Col,
    Drawer,
    Skeleton,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import customerService from '@/services/customers/customerService';
import authService from '@/services/auth/authService';
import { Customer, Permission_Codes } from '@/models';
import styles from './CustomerList.less';

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<boolean | undefined>(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();
    const history = useHistory();

    // Check permissions
    const canCreate = authService.hasPermission(Permission_Codes.CUSTOMER_CREATE);
    const canEdit = authService.hasPermission(Permission_Codes.CUSTOMER_UPDATE);
    const canDelete = authService.hasPermission(Permission_Codes.CUSTOMER_DELETE);

    useEffect(() => {
        fetchCustomers();
    }, [pagination.current, pagination.pageSize, searchText, filterStatus]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getCustomers({
                search: searchText,
                isActive: filterStatus,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });
            setCustomers(response.data);
            setPagination({ ...pagination, total: response.total });
        } catch (error) {
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        form.setFieldsValue(customer);
        setDrawerVisible(true);
    };

    const handleDelete = async (customerId: string) => {
        try {
            await customerService.deleteCustomer(customerId);
            message.success('Xóa khách hàng thành công');
            fetchCustomers();
        } catch (error) {
            message.error('Lỗi khi xóa khách hàng');
        }
    };

    const handleSave = async (values: any) => {
        try {
            if (selectedCustomer) {
                await customerService.updateCustomer(selectedCustomer.id, values);
                message.success('Cập nhật khách hàng thành công');
            } else {
                await customerService.createCustomer(values);
                message.success('Thêm khách hàng thành công');
            }
            setDrawerVisible(false);
            form.resetFields();
            setSelectedCustomer(null);
            fetchCustomers();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi lưu khách hàng');
        }
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text: string, record: Customer) => (
                <span onClick={() => handleEdit(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            render: (text: string) => <span>{text?.substring(0, 30)}...</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Customer) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => history.push(`/customers/${record.id}`)}
                    />
                    {canEdit && (
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Xác nhận xóa?"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Card
                title="Danh sách khách hàng"
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchCustomers} />
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    form.resetFields();
                                    setDrawerVisible(true);
                                }}
                            >
                                Thêm mới
                            </Button>
                        )}
                    </Space>
                }
            >
                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            icon={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Trạng thái"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value={true}>Kích hoạt</Select.Option>
                            <Select.Option value={false}>Vô hiệu hóa</Select.Option>
                        </Select>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={customers}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    rowKey="id"
                />
            </Card>

            {/* Form Drawer */}
            <Drawer
                title={selectedCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedCustomer(null);
                    form.resetFields();
                }}
                open={drawerVisible}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="fullName"
                        label="Tên đầy đủ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="Thành phố"
                        rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="district"
                        label="Quận/Huyện"
                        rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Giới tính"
                    >
                        <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Lưu
                            </Button>
                            <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default CustomerList;
