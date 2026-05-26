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
    Grid,
    List,
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
import { Pet } from '@/models';
import styles from './MyPetList.less';

const MyPetList: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const screens = Grid.useBreakpoint();
    const isMobile = screens.xs === true || (screens.sm && !screens.md);

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
    
    const canCreate = !isDoctor;
    const canEdit = !isDoctor;
    const canDelete = !isDoctor;

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        fetchMyPets();
    }, [pagination.current, pagination.pageSize, searchText, species, gender]);

    const fetchMyPets = async () => {
        try {
            setLoading(true);
            const response = await petService.getMyPets({
                search: searchText,
                species: species,
                gender: gender,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });

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

    const handleFilterChange = (type: 'species' | 'gender' | 'search', value: any) => {
        if (type === 'species') setSpecies(value);
        if (type === 'gender') setGender(value);
        if (type === 'search') setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleEdit = (pet: Pet) => {
        setSelectedPet(pet);
        const formData: any = {
            owner_id: pet.owner_id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            weight: pet.weight,
        };

        if (pet.birth_date) {
            formData.birth_date = pet.birth_date.split('T')[0];
        } else if (pet.dateOfBirth) {
            formData.birth_date = pet.dateOfBirth.split('T')[0];
        }

        if (pet.image_url) {
            formData.image_url = pet.image_url;
        }

        form.setFieldsValue(formData);
        setDrawerVisible(true);
    };

    const handleDelete = async (pet: Pet) => {
        try {
            setDeleteLoading(true);
            setPetToDelete(pet);
            const dependencies = await petService.checkPetDependencies(pet.id);
            setPetDependencies(dependencies);
            setDeleteModalVisible(true);
        } catch (error: any) {
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
            const result = await petService.deletePet(petToDelete.id);
            setDeleteModalVisible(false);

            Modal.success({
                title: '✅ Xóa thành công',
                content: (
                    <div>
                        <p><strong>Thú cưng:</strong> {result.deletedRecords.pet}</p>
                        <p><strong>Cuộc hẹn:</strong> {result.deletedRecords.appointments} cuộc</p>
                        <p><strong>Hồ sơ y tế:</strong> {result.deletedRecords.medicalRecords} bản ghi</p>
                        <p><strong>Hóa đơn:</strong> {result.deletedRecords.invoices} hóa đơn</p>
                    </div>
                ),
                okText: 'Đóng',
                onOk() {
                    fetchMyPets();
                    setPetToDelete(null);
                    setPetDependencies(null);
                },
            });
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'Lỗi khi xóa thú cưng';
            message.error(errorMsg);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        try {
            setLoading(true);
            if (selectedPet) {
                const { owner_id, ...updateData } = values;
                await petService.updatePet(selectedPet.id, updateData);
                message.success('Cập nhật thú cưng thành công');
                setDrawerVisible(false);
                form.resetFields();
                setSelectedPet(null);
                fetchMyPets();
            } else {
                const createData = { ...values };
                if (!isAdmin && currentUser) {
                    createData.owner_id = currentUser.id;
                } else if (isAdmin && !values.owner_id) {
                    message.error('Vui lòng chọn chủ nhân cho thú cưng');
                    return;
                }

                const newPet = await petService.createPet(createData);
                message.success('Thêm thú cưng thành công! Bây giờ bạn có thể tải ảnh lên.');
                setSelectedPet(newPet);
                form.setFieldsValue({
                    ...values,
                    image_url: newPet?.image_url || '',
                });
                fetchMyPets();
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'Lỗi khi lưu thú cưng';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadAvatar = async (file: File) => {
        if (!selectedPet) return;
        try {
            setUploadLoading(true);
            const response = await petService.uploadPetAvatar(selectedPet.id, file);
            message.success('Tải ảnh thành công');
            const imageUrl = response.image_url || response.avatarUrl;
            form.setFieldsValue({ image_url: imageUrl });
            
            // Cập nhật lại real-time avatar trong danh sách đang chọn
            setSelectedPet(prev => prev ? { ...prev, image_url: imageUrl } : null);
            fetchMyPets();
        } catch (error: any) {
            
        } finally {
            setUploadLoading(false);
        }
    };

    const getSpeciesLabel = (species: string) => {
        const speciesMap: any = { DOG: 'Chó', CAT: 'Mèo', BIRD: 'Chim', RABBIT: 'Thỏ', OTHER: 'Khác' };
        return speciesMap[species] || species;
    };

    const getGenderLabel = (gender: string) => {
        const genderMap: any = { MALE: 'MALE', FEMALE: 'FEMALE', UNKNOWN: 'UNKNOWN' };
        return genderMap[gender] || gender;
    };

    // Columns cho bản Desktop
    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 80,
            render: (imageUrl: string) => (
                <Avatar size={50} src={imageUrl} style={{ backgroundColor: '#73d13d' }}>
                    {!imageUrl && 'Pet'}
                </Avatar>
            ),
        },
        {
            title: 'Tên thú cưng',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span style={{ fontWeight: 600, color: '#141414' }}>{name}</span>
        },
        {
            title: 'Loài/Giống',
            key: 'species_breed',
            render: (record: Pet) => (
                <div>
                    <div>{getSpeciesLabel(record.species)}</div>
                    <small style={{ color: '#8c8c8c' }}>{record.breed}</small>
                </div>
            )
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender: string) => getGenderLabel(gender),
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birth_date',
            key: 'birth_date',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
        },
        {
            title: 'Thống kê',
            key: 'stats',
            render: (record: Pet) => (
                <div style={{ fontSize: '13px' }}>
                    <div>- Lịch hẹn: {record.appointments?.length || 0}</div>
                    <div>- Hồ sơ y tế: {record.medicalRecords?.length || 0}</div>
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            textAlign: 'center',
            render: (record: Pet) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
                        onClick={() => history.push(`/my-pets/${record.id}`)}
                    />
                    {canEdit && (
                        <Button 
                            type="text" 
                            icon={<EditOutlined style={{ color: '#fa8c16' }} />} 
                            onClick={() => handleEdit(record)}
                        />
                    )}
                    {canDelete && (
                        <Button 
                            type="text" 
                            danger 
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
            <div className={styles.headerSection}>
                <h2 className={styles.titlePage}>Thú cưng của tôi</h2>
                <Space size={8}>
                    <Button icon={<ReloadOutlined />} onClick={fetchMyPets} />
                    {canCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setSelectedPet(null);
                                form.resetFields();
                                if (currentUser) {
                                    form.setFieldsValue({ owner_id: currentUser.id });
                                }
                                setDrawerVisible(true);
                            }}
                        >
                            {!isMobile && 'Thêm mới'}
                        </Button>
                    )}
                </Space>
            </div>

            {/* Bộ lọc thông minh */}
            <Card className={styles.filterCard} bordered={false}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} md={10}>
                        <Input.Search
                            placeholder="Tìm kiếm tên thú cưng..."
                            allowClear
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={7}>
                        <Select
                            placeholder="Chọn loài"
                            style={{ width: '100%' }}
                            allowClear
                            value={species}
                            onChange={(val) => handleFilterChange('species', val)}
                        >
                            <Select.Option value="DOG">Chó</Select.Option>
                            <Select.Option value="CAT">Mèo</Select.Option>
                            <Select.Option value="BIRD">Chim</Select.Option>
                            <Select.Option value="RABBIT">Thỏ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={7}>
                        <Select
                            placeholder="Giới tính"
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
            </Card>

            {/* Nội dung danh sách */}
            {isMobile ? (
                /* HIỂN THỊ DẠNG CARD TRÊN MOBILE */
                <List
                    dataSource={pets}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        size: 'small',
                        className: styles.mobilePagination,
                        onChange: (page, pSize) => {
                            setPagination(prev => ({ ...prev, current: page, pageSize: pSize || 10 }));
                        }
                    }}
                    renderItem={(item: Pet) => (
                        <Card className={styles.petMobileCard} key={item.id} bordered={false}>
                            <div className={styles.cardFlexContainer}>
                                <Avatar size={64} src={item.image_url} style={{ backgroundColor: '#73d13d' }}>
                                    {!item.image_url && 'Pet'}
                                </Avatar>
                                <div className={styles.cardContent}>
                                    <div className={styles.petNameRow}>
                                        <h4>{item.name}</h4>
                                        <span className={styles.speciesTag}>{getSpeciesLabel(item.species)}</span>
                                    </div>
                                    <p>Giống: {item.breed}</p>
                                    {item.birth_date && (
                                        <p>Ngày sinh: {new Date(item.birth_date).toLocaleDateString('vi-VN')}</p>
                                    )}
                                    <div className={styles.miniStats}>
                                        <span>📅 Lịch hẹn: {item.appointments?.length || 0}</span>
                                        <span>📋 Hồ sơ: {item.medicalRecords?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <Button 
                                    icon={<EyeOutlined />} 
                                    onClick={() => history.push(`/my-pets/${item.id}`)}
                                >
                                    Xem
                                </Button>
                                {canEdit && (
                                    <Button 
                                        icon={<EditOutlined />} 
                                        onClick={() => handleEdit(item)}
                                    >
                                        Sửa
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => handleDelete(item)}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                />
            ) : (
                /* HIỂN THỊ BẢNG TRÊN DESKTOP */
                <Card bordered={false} bodyStyle={{ padding: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={pets}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thú cưng`,
                            showSizeChanger: true,
                        }}
                        onChange={(page) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page.current || 1,
                                pageSize: page.pageSize || 10
                            }));
                        }}
                    />
                </Card>
            )}

            {/* Form Drawer (Cải tiến Nút luôn nằm dưới đáy di động) */}
            <Drawer
                title={selectedPet ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng'}
                placement={isMobile ? 'bottom' : 'right'}
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedPet(null);
                    form.resetFields();
                }}
                visible={drawerVisible}
                width={isMobile ? '100%' : 460}
                height={isMobile ? '85vh' : undefined}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
                        <Button type="primary" onClick={() => form.submit()} loading={loading}>
                            Lưu lại
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    {!selectedPet && <Form.Item name="owner_id" hidden><Input /></Form.Item>}

                    <Form.Item name="name" label="Tên thú cưng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nhập tên bé..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="species" label="Loài" rules={[{ required: true, message: 'Chọn loài' }]}>
                                <Select placeholder="Chọn loài">
                                    <Select.Option value="DOG">Chó</Select.Option>
                                    <Select.Option value="CAT">Mèo</Select.Option>
                                    <Select.Option value="BIRD">Chim</Select.Option>
                                    <Select.Option value="RABBIT">Thỏ</Select.Option>
                                    <Select.Option value="OTHER">Khác</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Giới tính">
                                    <Select.Option value="MALE">MALE</Select.Option>
                                    <Select.Option value="FEMALE">FEMALE</Select.Option>
                                    <Select.Option value="UNKNOWN">UNKNOWN</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="breed" label="Giống loại" rules={[{ required: true, message: 'Vui lòng nhập giống' }]}>
                        <Input placeholder="Ví dụ: Poodle, Mèo Anh lông ngắn..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="birth_date" label="Ngày sinh">
                                <Input type="date" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="weight" label="Cân nặng (kg)">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0.0" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {selectedPet && (
                        <Card size="small" title="Hình ảnh đại diện" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Avatar size={70} src={selectedPet.image_url} style={{ backgroundColor: '#87d068' }} />
                                <Upload
                                    maxCount={1}
                                    beforeUpload={(file) => { handleUploadAvatar(file); return false; }}
                                    showUploadList={false}
                                >
                                    <Button icon={<CameraOutlined />} loading={uploadLoading}>Đổi ảnh đại diện</Button>
                                </Upload>
                            </div>
                        </Card>
                    )}
                </Form>
            </Drawer>

            {/* Delete Modal */}
            <Modal
                title="⚠️ Xác nhận xóa thú cưng"
                visible={deleteModalVisible}
                onOk={handleConfirmDelete}
                okText="Xóa dữ liệu"
                okButtonProps={{ danger: true, loading: deleteLoading }}
                onCancel={() => { setDeleteModalVisible(false); setPetToDelete(null); }}
                cancelText="Hủy"
                width={400}
                centered
            >
                {petToDelete && petDependencies && (
                    <div>
                        <p>Bạn chắc chắn muốn xóa bé <b>{petToDelete.name}</b>?</p>
                        {petDependencies.hasRelations ? (
                            <div className={styles.warningBox}>
                                <p><b>Lưu ý:</b> Thú cưng này có dữ liệu liên quan hệ thống:</p>
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    {petDependencies.appointments > 0 && <li>{petDependencies.appointments} lịch hẹn</li>}
                                    {petDependencies.medicalRecords > 0 && <li>{petDependencies.medicalRecords} hồ sơ khám</li>}
                                </ul>
                            </div>
                        ) : (
                            <p style={{ color: '#52c41a' }}>Bé này không có dữ liệu ràng buộc lịch trình.</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyPetList;