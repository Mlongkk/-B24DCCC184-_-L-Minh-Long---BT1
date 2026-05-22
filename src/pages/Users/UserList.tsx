import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tag,
    Avatar,
    Drawer,
    Divider,
    Badge,
    Tooltip,
    Row,
    Col,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from '@ant-design/icons';
import userService from '@/services/users/userService';
import { UserRole } from '@/models/auth';
import { UserProfile } from '@/models/user';
import styles from './UserList.less';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [form] = Form.useForm();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers({
                search: searchText,
                role: roleFilter,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });

            console.log('API Response:', response);

            // Ensure data is always an array with roles field
            let usersData = Array.isArray(response.data) ? response.data : response.data?.data || [];

            const processedUsers = usersData.map((user: any) => {
                console.log('User data:', user);
                return {
                    ...user,
                    roles: Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [],
                };
            });

            console.log('Processed users:', processedUsers);
            setUsers(processedUsers);
            setPagination((prev) => ({ ...prev, total: response.total }));
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng', error);
            message.error('Lỗi khi tải danh sách người dùng');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [searchText, roleFilter, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: UserProfile) => {
        setSelectedUser(user);
        form.setFieldsValue({
            fullName: user.fullName,
            phone: user.phone,
            roles: user.roles?.[0], // Get first role from array as string
        });
        setDrawerVisible(true);
    };

    const handleDelete = async (userId: string) => {
        try {
            await userService.deleteUser(userId);
            message.success('Xóa người dùng thành công');
            fetchUsers();
        } catch (error) {
            message.error('Lỗi khi xóa người dùng');
        }
    };

    const handleSave = async (values: any) => {
        if (!selectedUser) return;

        try {
            console.log('Form values:', values);

            const response = await userService.updateUser(selectedUser.id, {
                fullName: values.fullName,
                phone: values.phone,
                roles: values.roles ? [values.roles] : [], // Convert string to array
            });

            console.log('Update response:', response);

            message.success('Cập nhật người dùng thành công');
            setDrawerVisible(false);
            form.resetFields();
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Update error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật người dùng');
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'red';
            case UserRole.VET:
                return 'blue';
            case UserRole.CUSTOMER:
                return 'green';
            default:
                return 'default';
        }
    };

    const getRoleDisplay = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'Quản trị viên';
            case UserRole.VET:
                return 'Bác sĩ';
            case UserRole.CUSTOMER:
                return 'Khách hàng';
            default:
                return role;
        }
    };

    const columns: any[] = [
        {
            title: 'Tên người dùng',
            key: 'username',
            render: (_: any, record: UserProfile) => (
                <div className={styles.userCell}>
                    <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        src={record.avatar}
                        style={{
                            backgroundColor: '#1890ff',
                            fontWeight: 'bold',
                        }}
                    />
                    <div className={styles.userInfo}>
                        <div className={styles.username}>{record.username}</div>
                        <div className={styles.fullname}>{record.fullName}</div>
                    </div>
                </div>
            ),
            width: 250,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (email: string) => (
                <Tooltip title={email}>
                    <div style={{ cursor: 'pointer', color: '#1890ff' }}>
                        <MailOutlined style={{ marginRight: 8 }} />
                        {email.length > 30 ? `${email.substring(0, 30)}...` : email}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles',
            key: 'roles',
            width: 200,
            render: (roles: UserRole[] | undefined) => (
                <Space wrap>
                    {roles && roles.length > 0 ? (
                        roles.map((role) => (
                            <Tag key={role} color={getRoleColor(role)}>
                                {getRoleDisplay(role)}
                            </Tag>
                        ))
                    ) : (
                        <span style={{ color: '#999' }}>-</span>
                    )}
                </Space>
            ),
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone: string) =>
                phone ? (
                    <span>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        {phone}
                    </span>
                ) : (
                    <span style={{ color: '#999' }}>-</span>
                ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: any, record: UserProfile) => (
                <Space size='small'>
                    <Tooltip title='Sửa'>
                        <Button
                            type='primary'
                            size='small'
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Bạn có chắc chắn muốn xóa người dùng này?'
                            onConfirm={() => handleDelete(record.id)}
                            okText='Xóa'
                            cancelText='Hủy'
                        >
                            <Button danger size='small' icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <UserOutlined /> Quản lý người dùng
                    </h1>
                    <Button type='primary' icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
                        Làm mới
                    </Button>
                </div>

                <Divider />

                <div className={styles.filterSection}>
                    <Row gutter={16} align='middle'>
                        <Col xs={24} sm={24} md={12} lg={8}>
                            <Input
                                placeholder='Tìm kiếm theo tên, email, điện thoại...'
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setPagination({ ...pagination, current: 1 });
                                }}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={6}>
                            <Select
                                placeholder='Lọc theo vai trò'
                                allowClear
                                style={{ width: '100%' }}
                                value={roleFilter}
                                onChange={(value) => {
                                    setRoleFilter(value);
                                    setPagination({ ...pagination, current: 1 });
                                }}
                                options={[
                                    { label: 'Quản trị viên', value: UserRole.ADMIN },
                                    { label: 'Bác sĩ', value: UserRole.VET },
                                    { label: 'Khách hàng', value: UserRole.CUSTOMER },
                                ]}
                            />
                        </Col>
                    </Row>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                    }}
                    onChange={(page) => {
                        setPagination({
                            current: page.current || 1,
                            pageSize: page.pageSize || 10,
                            total: pagination.total,
                        });
                    }}
                    rowKey='id'
                    className={styles.table}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Edit Drawer */}
            <Drawer
                title='Chỉnh sửa người dùng'
                placement='right'
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedUser(null);
                    form.resetFields();
                }}
                visible={drawerVisible}
                width={500}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleSave}
                    initialValues={selectedUser || {}}
                >
                    {selectedUser && (
                        <>
                            <div className={styles.userProfile}>
                                <Avatar
                                    size={80}
                                    icon={<UserOutlined />}
                                    src={selectedUser.avatar}
                                    style={{
                                        backgroundColor: '#1890ff',
                                        fontWeight: 500,
                                        fontSize: '32px',
                                    }}
                                />
                                <div className={styles.profileInfo}>
                                    <h3>{selectedUser.username}</h3>
                                    <p>{selectedUser.email}</p>
                                    <Badge
                                        status={selectedUser.isActive ? 'success' : 'error'}
                                        text={selectedUser.isActive ? 'Hoạt động' : 'Vô hiệu'}
                                    />
                                </div>
                            </div>

                            <Divider />

                            <Form.Item label='Email' name='email'>
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>

                            <Form.Item label='Họ tên' name='fullName'>
                                <Input />
                            </Form.Item>

                            <Form.Item label='Điện thoại' name='phone'>
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>

                            <Form.Item
                                label='Vai trò'
                                name='roles'
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select
                                    placeholder='Chọn vai trò'
                                    options={[
                                        { label: 'Quản trị viên', value: UserRole.ADMIN },
                                        { label: 'Bác sĩ', value: UserRole.VET },
                                        { label: 'Khách hàng', value: UserRole.CUSTOMER },
                                    ]}
                                />
                            </Form.Item>

                            <div className={styles.drawerFooter}>
                                <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
                                <Button type='primary' htmlType='submit'>
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Drawer>
        </div>
    );
};

export default UserList;