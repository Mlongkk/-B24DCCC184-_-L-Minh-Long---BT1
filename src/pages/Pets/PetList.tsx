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
    InputNumber,
    Avatar,
    Upload,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
    CameraOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import petService from '@/services/pets/petService';
import customerService from '@/services/customers/customerService';
import authService from '@/services/auth/authService';
import { Pet, Permission_Codes, Customer } from '@/models';
import styles from './PetList.less';

const PetList: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();

    const canCreate = authService.hasPermission(Permission_Codes.PET_CREATE);
    const canEdit = authService.hasPermission(Permission_Codes.PET_UPDATE);
    const canDelete = authService.hasPermission(Permission_Codes.PET_DELETE);

    useEffect(() => {
        fetchPets();
        fetchCustomers();
    }, [pagination.current, pagination.pageSize, searchText]);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await petService.getPets({
                search: searchText,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });
            setPets(response.data);
            setPagination({ ...pagination, total: response.total });
        } catch (error) {
            message.error('Lỗi khi tải danh sách thú cưng');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getCustomers({ pageSize: 1000 });
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers', error);
        }
    };

    const handleEdit = (pet: Pet) => {
        setSelectedPet(pet);
        form.setFieldsValue(pet);
        setDrawerVisible(true);
    };

    const handleDelete = async (petId: string) => {
        try {
            await petService.deletePet(petId);
            message.success('Xóa thú cưng thành công');
            fetchPets();
        } catch (error) {
            message.error('Lỗi khi xóa thú cưng');
        }
    };

    const handleSave = async (values: any) => {
        try {
            if (selectedPet) {
                await petService.updatePet(selectedPet.id, values);
                message.success('Cập nhật thú cưng thành công');
            } else {
                await petService.createPet(values);
                message.success('Thêm thú cưng thành công');
            }
            setDrawerVisible(false);
            form.resetFields();
            setSelectedPet(null);
            fetchPets();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi lưu thú cưng');
        }
    };

    const handleUploadAvatar = async (file: File) => {
        if (!selectedPet) return;
        try {
            setUploadLoading(true);
            const response = await petService.uploadPetAvatar(selectedPet.id, file);
            message.success('Tải ảnh thành công');
            form.setFieldValue('avatar', response.avatarUrl);
        } catch (error) {
            message.error('Lỗi khi tải ảnh');
        } finally {
            setUploadLoading(false);
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar: string) => (
                <Avatar
                    size={40}
                    src={avatar}
                    style={{ backgroundColor: '#87d068' }}
                >
                    {!avatar && 'Pet'}
                </Avatar>
            ),
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Pet) => (
                <span onClick={() => handleEdit(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Loài',
            dataIndex: 'species',
            key: 'species',
            render: (species: string) => {
                const speciesMap: any = {
                    DOG: '🐕 Chó',
                    CAT: '🐈 Mèo',
                    BIRD: '🦜 Chim',
                    RABBIT: '🐰 Thỏ',
                    OTHER: 'Khác',
                };
                return speciesMap[species] || species;
            },
        },
        {
            title: 'Chủ nhân',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Giống',
            dataIndex: 'breed',
            key: 'breed',
        },
        {
            title: 'Cân nặng (kg)',
            dataIndex: 'weight',
            key: 'weight',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Pet) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => history.push(`/pets/${record.id}`)}
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
                title="Danh sách thú cưng"
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchPets} />
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setSelectedPet(null);
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
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Tìm kiếm tên..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            icon={<SearchOutlined />}
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={pets}
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
                title={selectedPet ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng'}
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedPet(null);
                    form.resetFields();
                }}
                open={drawerVisible}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="customerId"
                        label="Chủ nhân"
                        rules={[{ required: true, message: 'Vui lòng chọn chủ nhân' }]}
                    >
                        <Select placeholder="Chọn chủ nhân">
                            {customers.map((c) => (
                                <Select.Option key={c.id} value={c.id}>
                                    {c.fullName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="species"
                        label="Loài"
                        rules={[{ required: true, message: 'Vui lòng chọn loài' }]}
                    >
                        <Select>
                            <Select.Option value="DOG">🐕 Chó</Select.Option>
                            <Select.Option value="CAT">🐈 Mèo</Select.Option>
                            <Select.Option value="BIRD">🦜 Chim</Select.Option>
                            <Select.Option value="RABBIT">🐰 Thỏ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="breed"
                        label="Giống"
                        rules={[{ required: true, message: 'Vui lòng nhập giống' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="weight"
                        label="Cân nặng (kg)"
                    >
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item
                        name="color"
                        label="Màu sắc"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="microchipId"
                        label="Mã chip"
                    >
                        <Input />
                    </Form.Item>

                    {selectedPet && (
                        <Form.Item label="Ảnh">
                            <Upload
                                maxCount={1}
                                beforeUpload={(file) => {
                                    handleUploadAvatar(file);
                                    return false;
                                }}
                                loading={uploadLoading}
                            >
                                <Button icon={<CameraOutlined />}>Tải ảnh lên</Button>
                            </Upload>
                        </Form.Item>
                    )}

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

export default PetList;
