import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Form,
    Input,
    Select,
    message,
    Row,
    Col,
    Drawer,
    InputNumber,
    Avatar,
    Upload,
    Modal,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ReloadOutlined,
    CameraOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import petService from '@/services/pets/petService';
import authService from '@/services/auth/authService';
import { Pet, Permission_Codes } from '@/models';
import styles from './PetList.less';

const PetList: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);

    // States cho Filter
    const [searchText, setSearchText] = useState('');
    const [species, setSpecies] = useState<string | undefined>(undefined);
    const [gender, setGender] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [petDependencies, setPetDependencies] = useState<any>(null);
    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [form] = Form.useForm();
    const history = useHistory();

    const isAdmin = authService.hasRole('ADMIN');
    const isDoctor = authService.hasRole('DOCTOR');
    const canCreate = !isDoctor && (authService.hasPermission(Permission_Codes.PET_CREATE) || isAdmin);
    const canEdit = !isDoctor && (authService.hasPermission(Permission_Codes.PET_UPDATE) || isAdmin);
    const canDelete = !isDoctor && (authService.hasPermission(Permission_Codes.PET_DELETE) || isAdmin);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    // TỰ ĐỘNG FETCH KHI BẤT KỲ FILTER NÀO THAY ĐỔI
    useEffect(() => {
        fetchPets();
    }, [pagination.current, pagination.pageSize, searchText, species, gender]);

    // Cập nhật hàm fetchPets để gửi đúng params backend yêu cầu
    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await petService.getPets({
                search: searchText,
                species: species,
                gender: gender,
                page: pagination.current,
                pageSize: pagination.pageSize, // Trong service sẽ đổi thành limit
            });

            // Lấy dữ liệu theo cấu trúc backend trả về
            const petData = response.data || [];
            const total = response.pagination?.total || 0;

            setPets(petData);
            setPagination(prev => ({ ...prev, total }));
        } catch (error) {
            message.error('Lỗi khi tải danh sách thú cưng');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tiện ích để reset về trang 1 khi lọc
    const handleFilterChange = (type: 'species' | 'gender' | 'search', value: any) => {
        if (type === 'species') setSpecies(value);
        if (type === 'gender') setGender(value);
        if (type === 'search') setSearchText(value);

        // Luôn đưa về trang 1 khi thay đổi tiêu chí lọc
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleEdit = (pet: Pet) => {
        setSelectedPet(pet);

        // Prepare form data - convert birth_date to correct format
        const formData: any = {
            owner_id: pet.owner_id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            weight: pet.weight,
        };

        // Handle birth_date - backend may return birth_date or dateOfBirth
        if (pet.birth_date) {
            formData.birth_date = pet.birth_date.split('T')[0]; // Extract date part only
        } else if (pet.dateOfBirth) {
            formData.birth_date = pet.dateOfBirth.split('T')[0];
        }

        // Include image URL if available
        if (pet.image_url) {
            formData.image_url = pet.image_url;
        }

        form.setFieldsValue(formData);
        setDrawerVisible(true);
    };

    const handleDelete = async (pet: Pet) => {
        try {
            console.log('🔍 Checking dependencies for pet:', pet.id);
            setDeleteLoading(true);
            setPetToDelete(pet);
            const dependencies = await petService.checkPetDependencies(pet.id);
            setPetDependencies(dependencies);
            setDeleteModalVisible(true);
        } catch (error: any) {
            console.error('Failed to check dependencies:', error);
            message.error('Không thể kiểm tra dữ liệu liên kết');
            setPetToDelete(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!petToDelete) return;
        try {
            setDeleteLoading(true);
            console.log('🗑️ Deleting pet:', petToDelete.id);
            const result = await petService.deletePet(petToDelete.id);
            setDeleteModalVisible(false);

            // Show success message with deletion report
            Modal.success({
                title: '✅ Xóa thành công',
                content: (
                    <div>
                        <p><strong>Thú cưng:</strong> {result.deletedRecords.pet}</p>
                        <p><strong>Cuộc hẹn:</strong> {result.deletedRecords.appointments} cuộc</p>
                        <p><strong>Hồ sơ y tế:</strong> {result.deletedRecords.medicalRecords} bản ghi</p>
                        <p><strong>Hóa đơn:</strong> {result.deletedRecords.invoices} hóa đơn</p>
                        <p><strong>Mục hóa đơn:</strong> {result.deletedRecords.totalInvoiceItems} mục</p>
                    </div>
                ),
                okText: 'Đóng',
                onOk() {
                    fetchPets();
                    setPetToDelete(null);
                    setPetDependencies(null);
                },
            });
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMsg = error?.response?.data?.message || 'Lỗi khi xóa thú cưng';
            message.error(errorMsg);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        try {
            if (selectedPet) {
                // When updating, exclude owner_id (cannot change owner)
                const { owner_id, ...updateData } = values;
                await petService.updatePet(selectedPet.id, updateData);
                message.success('Cập nhật thú cưng thành công');
                setDrawerVisible(false);
                form.resetFields();
                setSelectedPet(null);
                fetchPets();
            } else {
                // When creating: if not admin, auto-set owner_id to current user
                const createData = { ...values };
                if (!isAdmin && currentUser) {
                    createData.owner_id = currentUser.id;
                } else if (isAdmin && !values.owner_id) {
                    message.error('Vui lòng chọn chủ nhân cho thú cưng');
                    return;
                }

                console.log('Creating pet with data:', createData);
                const newPet = await petService.createPet(createData);
                message.success('Thêm thú cưng thành công! Bây giờ bạn có thể tải ảnh lên.');
                // Set the newly created pet so user can upload avatar
                setSelectedPet(newPet);
                form.setFieldsValue({
                    ...values,
                    image_url: newPet?.image_url || '',
                });
            }
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMsg = error?.response?.data?.message || JSON.stringify(error?.response?.data) || 'Lỗi khi lưu thú cưng';
            message.error(errorMsg);
        }
    };

    const handleUploadAvatar = async (file: File) => {
        if (!selectedPet) return;
        try {
            setUploadLoading(true);
            const response = await petService.uploadPetAvatar(selectedPet.id, file);
            message.success('Tải ảnh thành công');
            // Update image_url field with response
            const imageUrl = response.image_url || response.avatarUrl;
            form.setFieldsValue({ image_url: imageUrl });
        } catch (error: any) {
            console.error('Upload error:', error);
            message.error('Lỗi khi tải ảnh');
        } finally {
            setUploadLoading(false);
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 70,
            render: (imageUrl: string) => (
                <Avatar
                    size={40}
                    src={imageUrl}
                    style={{ backgroundColor: '#87d068' }}
                >
                    {!imageUrl && 'Pet'}
                </Avatar>
            ),
        },
        // {
        //     title: 'Tên',
        //     dataIndex: 'name',
        //     key: 'name',
        //     render: (text: string, record: Pet) => (
        //         <span onClick={() => handleEdit(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
        //             {text}
        //         </span>
        //     ),
        // },
        {
            title: 'Chủ nhân',
            dataIndex: ['owner', 'full_name'], // Hiển thị Tên đầy đủ thay vì username
            key: 'owner',
            width: 200,
            render: (text: string, record: Pet) => (
                <div>
                    <div>{record.owner?.full_name || 'N/A'}</div>
                    <div style={{ fontSize: '11px', color: '#bfbfbf' }}>@{record.owner?.username}</div>
                </div>
            ),
        },
        {
            title: 'Thông tin thú cưng',
            key: 'pet_info',
            width: 200,
            render: (record: Pet) => (
                <div>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{record.name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Giống: {record.breed} - {record.gender}</div>
                </div>
            ),
        },
        {
            title: 'Loài',
            dataIndex: 'species',
            key: 'species',
            width: 80,
            render: (species: string) => {
                const speciesMap: any = {
                    DOG: 'Chó',
                    CAT: 'Mèo',
                    BIRD: 'Chim',
                    RABBIT: 'Thỏ',
                    OTHER: 'Khác',
                };
                return speciesMap[species] || species;
            },
        },
        // {
        //     title: 'Giống',
        //     dataIndex: 'breed',
        //     key: 'breed',
        // },

        {
            title: 'Ngày sinh',
            dataIndex: 'birth_date',
            key: 'birth_date',
            width: 120,
            render: (birthDate: string) => {
                if (!birthDate) return '-';
                return new Date(birthDate).toLocaleDateString('vi-VN');
            },
        },
        // {
        //     title: 'Cân nặng (kg)',
        //     dataIndex: 'weight',
        //     key: 'weight',
        // },

        {
            title: 'Thống kê',
            key: 'stats',
            width: 120,
            render: (record: Pet) => (
                <Space direction="vertical" size={0}>
                    <small>- Lịch hẹn: {record.appointments?.length || 0}</small>
                    <small>- Hồ sơ: {record.medicalRecords?.length || 0}</small>
                </Space>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
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
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={deleteLoading && petToDelete?.id === record.id}
                            onClick={() => handleDelete(record)}
                        />
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
                                    // Auto-set owner_id to current user (for both admin and user)
                                    if (currentUser) {
                                        form.setFieldsValue({ owner_id: currentUser.id });
                                    }
                                    setDrawerVisible(true);
                                }}
                            >
                                Thêm mới
                            </Button>
                        )}
                    </Space>
                }
            >

                {/* // Giao diện Filter */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Tìm tên Thú cưng hoặc Giống..."
                            allowClear
                            onSearch={(val) => handleFilterChange('search', val)}
                            onChange={(e) => {
                                if (!e.target.value) handleFilterChange('search', ''); // Reset khi bấm nút x
                            }}
                        />
                    </Col>

                    <Col xs={12} sm={6} md={6}>
                        <Select
                            placeholder="Lọc theo Loài"
                            style={{ width: '100%' }}
                            allowClear
                            value={species}
                            onChange={(val) => handleFilterChange('species', val)}
                        >
                            <Select.Option value="DOG">Chó</Select.Option>
                            <Select.Option value="CAT">Mèo</Select.Option>
                            <Select.Option value="BIRD">Chim</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Col>

                    <Col xs={12} sm={6} md={6}>
                        <Select
                            placeholder="Lọc theo Giới tính"
                            style={{ width: '100%' }}
                            allowClear
                            value={gender}
                            onChange={(val) => handleFilterChange('gender', val)}
                        >
                            <Select.Option value="MALE">MALE</Select.Option>
                            <Select.Option value="FEMALE">FEMALE</Select.Option>
                            <Select.Option value="UNKNOWN">UNKNOWN</Select.Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={pets}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thú cưng`,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                    onChange={(page) => {
                        const pageSizeChanged = page.pageSize !== pagination.pageSize;
                        setPagination({
                            current: pageSizeChanged ? 1 : (page.current || 1),
                            pageSize: page.pageSize || 10,
                            total: pagination.total,
                        });
                    }}
                    rowKey="id"
                    scroll={{ x: 1200 }}
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
                visible={drawerVisible}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    {/* Hidden owner_id field for create - always auto-set from currentUser */}
                    {!selectedPet && (
                        <Form.Item
                            name="owner_id"
                            hidden
                        >
                            <Input />
                        </Form.Item>
                    )}

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
                            <Select.Option value="DOG">Chó</Select.Option>
                            <Select.Option value="CAT">Mèo</Select.Option>
                            <Select.Option value="BIRD">Chim</Select.Option>
                            <Select.Option value="RABBIT">Thỏ</Select.Option>
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
                        name="gender"
                        label="Giới tính"
                    >
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="MALE">MALE</Select.Option>
                            <Select.Option value="FEMALE">FEMALE</Select.Option>
                            <Select.Option value="UNKNOWN">UNKNOWN</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="birth_date"
                        label="Ngày sinh"
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        name="weight"
                        label="Cân nặng (kg)"
                    >
                        <InputNumber min={0} />
                    </Form.Item>

                    {selectedPet && (
                        <>
                            <Form.Item label="Ảnh hiện tại">
                                {selectedPet?.image_url ? (
                                    <Avatar
                                        size={80}
                                        src={selectedPet.image_url}
                                        style={{ marginBottom: 10 }}
                                    />
                                ) : (
                                    <div style={{ color: '#999', fontSize: 12 }}>Chưa có ảnh</div>
                                )}
                            </Form.Item>
                            <Form.Item label="Cập nhật ảnh">
                                <Upload
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                        handleUploadAvatar(file);
                                        return false;
                                    }}
                                    disabled={uploadLoading}
                                >
                                    <Button icon={<CameraOutlined />} loading={uploadLoading}>Tải ảnh lên</Button>
                                </Upload>
                            </Form.Item>
                        </>
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

            {/* Delete Modal - Show Dependencies */}
            <Modal
                title="⚠️ Xác nhận xóa thú cưng"
                visible={deleteModalVisible}
                onOk={handleConfirmDelete}
                okText="Xóa"
                okButtonProps={{ danger: true, loading: deleteLoading }}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setPetToDelete(null);
                    setPetDependencies(null);
                }}
                cancelText="Hủy"
            >
                {petToDelete && petDependencies && (
                    <div>
                        <p><strong>Tên thú cưng:</strong> {petToDelete.name}</p>

                        {petDependencies.hasRelations ? (
                            <>
                                <div style={{ padding: '12px', backgroundColor: '#fff7e6', borderLeft: '4px solid #faad14', marginBottom: '16px', borderRadius: '2px' }}>
                                    <p style={{ color: '#ad6800', marginBottom: 0 }}>
                                        ⚠️ <strong>Cảnh báo:</strong> Thú cưng này có liên kết với dữ liệu khác. Xóa sẽ làm mất tất cả dữ liệu liên quan!
                                    </p>
                                </div>
                                <p><strong>Dữ liệu sẽ bị xóa:</strong></p>
                                <ul>
                                    {petDependencies.appointments > 0 && (
                                        <li>{petDependencies.appointments} cuộc hẹn</li>
                                    )}
                                    {petDependencies.medicalRecords > 0 && (
                                        <li>{petDependencies.medicalRecords} hồ sơ y tế</li>
                                    )}
                                    {petDependencies.invoices > 0 && (
                                        <li>{petDependencies.invoices} hóa đơn</li>
                                    )}
                                    {petDependencies.invoiceItems > 0 && (
                                        <li>{petDependencies.invoiceItems} mục hóa đơn</li>
                                    )}
                                </ul>
                            </>
                        ) : (
                            <p style={{ color: '#52c41a' }}>✅ Thú cưng này không có dữ liệu liên kết nào</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PetList;
