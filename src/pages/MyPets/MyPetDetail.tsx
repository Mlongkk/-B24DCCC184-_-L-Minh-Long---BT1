import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Spin,
    message,
    Descriptions,
    Avatar,
    Space,
    Popconfirm,
    Upload,
    Empty,
    Tabs,
    Timeline,
    Badge,
    Drawer,
    Table,
    Modal,
    Form,
    Input,
    DatePicker,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    CameraOutlined,
    PlusOutlined,
} from '@ant-design/icons';
// Sửa lỗi import useParams từ 'umi'
import { useHistory, useParams } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import petService from '@/services/pets/petService';
import medicalRecordService from '@/services/medical-records/medicalRecordService';
import { Pet, MedicalRecord, Permission_Codes } from '@/models';
import authService from '@/services/auth/authService';
import styles from './MyPetDetail.less';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const MyPetDetail: React.FC = () => {
    // Ép kiểu ép buộc hoặc ép qua unknown để tránh lỗi type của useParams trong phiên bản Umi cũ/mới
    const params = useParams() as any;
    const id = params?.id || '';

    const history = useHistory();
    const uploadRef = useRef<any>(null);

    // Pet Detail States
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Medical Records States
    const [timeline, setTimeline] = useState<any>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [medicalLoading, setMedicalLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Thêm các fallback giá trị mặc định để tránh lỗi undefined method khi phân quyền
    const canEdit = authService?.hasPermission ? authService.hasPermission(Permission_Codes.PET_UPDATE) : true;
    const canViewMedical = authService?.hasPermission
        ? (authService.hasPermission(Permission_Codes.MEDICAL_VIEW) || !authService.hasRole('DOCTOR'))
        : true;
    const canCreateMedical = authService?.hasPermission ? authService.hasPermission(Permission_Codes.MEDICAL_CREATE) : true;
    const canUpdateMedical = authService?.hasPermission ? authService.hasPermission(Permission_Codes.MEDICAL_UPDATE) : true;
    const canDeleteMedical = authService?.hasPermission ? authService.hasPermission(Permission_Codes.MEDICAL_DELETE) : true;

    useEffect(() => {
        if (id) {
            fetchPetDetail();
        }
    }, [id]);

    useEffect(() => {
        if (pet && canViewMedical) {
            fetchMedicalTimeline();
            fetchMedicalRecords();
        }
    }, [pet, canViewMedical]);

    const fetchPetDetail = async () => {
        try {
            setLoading(true);
            const response = await petService.getMyPetDetail(id);
            setPet(response);
        } catch (error: any) {
            message.error('Không thể tải thông tin thú cưng');
            history.push('/my-pets');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (file: File) => {
        try {
            setUploading(true);
            const updatedPet = await petService.uploadPetImage(id, file);
            setPet(updatedPet);
            message.success('Cập nhật ảnh thành công');
        } catch (error: any) {

        } finally {
            setUploading(false);
        }
    };

    const fetchMedicalTimeline = async () => {
        try {
            setMedicalLoading(true);
            const data = await medicalRecordService.getMedicalTimeline(id);
            setTimeline(data);
        } catch (error) {
            console.error('Error fetching medical timeline', error);
        } finally {
            setMedicalLoading(false);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            const recordsData = await medicalRecordService.getRecordsByPetId(id);
            setRecords(recordsData || []);
        } catch (error) {
            console.error('Error fetching medical records', error);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        form.resetFields();
        form.setFieldsValue({ petName: pet?.name });
        setModalVisible(true);
    };

    const handleOpenEditModal = (record: MedicalRecord) => {
        setIsEditing(true);
        form.setFieldsValue({
            petName: pet?.name,
            visitDate: record.visit_date ? dayjs(record.visit_date) : dayjs(),
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            notes: record.notes,
        });
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleSubmitRecord = async (values: any) => {
        try {
            setSubmitting(true);
            if (isEditing && selectedRecord) {
                await medicalRecordService.updateMedicalRecord(selectedRecord.id, {
                    diagnosis: values.diagnosis,
                    treatment: values.treatment,
                    notes: values.notes,
                });
                message.success('Cập nhật bệnh án thành công');
            } else {
                await medicalRecordService.createMedicalRecord({
                    petId: id,
                    visitDate: values.visitDate ? values.visitDate.toISOString() : dayjs().toISOString(),
                    diagnosis: values.diagnosis,
                    treatment: values.treatment,
                    notes: values.notes,
                });
                message.success('Thêm bệnh án thành công');
            }
            setModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            fetchMedicalRecords();
            fetchMedicalTimeline();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi khi lưu bệnh án');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        try {
            await medicalRecordService.deleteMedicalRecord(recordId);
            message.success('Xóa bệnh án thành công');
            fetchMedicalRecords();
            fetchMedicalTimeline();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi khi xóa bệnh án');
        }
    };


    const getTimelineList = (): any[] => {
        if (!timeline) return [];
        if (Array.isArray(timeline)) return timeline;
        if (timeline.records && Array.isArray(timeline.records)) return timeline.records;
        if (timeline.data) {
            if (Array.isArray(timeline.data)) return timeline.data;
            if (timeline.data.records && Array.isArray(timeline.data.records)) return timeline.data.records;
        }
        return [];
    };

    const speciesMap: any = {
        DOG: 'Chó',
        CAT: 'Mèo',
        BIRD: 'Chim',
        RABBIT: 'Thỏ',
        OTHER: 'Khác',
    };

    const timelineList = getTimelineList();

    const recordColumns = [
        {
            title: 'Ngày khám',
            dataIndex: 'visit_date',
            key: 'visit_date',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '---',
            onCell: () => ({ 'data-label': 'Ngày khám' } as any),
        },
        {
            title: 'BS. Khám',
            dataIndex: ['doctor', 'full_name'],
            key: 'doctor',
            render: (text: any, record: any) => record.doctor?.full_name || '---',
            onCell: () => ({ 'data-label': 'BS. Khám' } as any),
        },
        {
            title: 'Chẩn đoán',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
            render: (text: string) => text ? (text.length > 25 ? `${text.substring(0, 25)}...` : text) : '---',
            onCell: () => ({ 'data-label': 'Chẩn đoán' } as any),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            render: (text: string) => text || '---',
            onCell: () => ({ 'data-label': 'Ghi chú' } as any),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
            onCell: () => ({ 'data-label': 'Hành động' } as any),
            render: (_: any, record: MedicalRecord) => (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setSelectedRecord(record);
                            setDrawerVisible(true);
                        }}
                    >
                        Xem
                    </Button>
                    {canUpdateMedical && (
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditModal(record)}
                        >
                            Sửa
                        </Button>
                    )}
                    {canDeleteMedical && (
                        <Popconfirm
                            title="Bạn chắc chắn muốn xóa bệnh án này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteRecord(record.id)}
                        >
                            <Button
                                type="link"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: '16px'
                }}>
                    <Spin size="large" />
                    <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
                        Đang tải thông tin thú cưng...
                    </p>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className={styles.container}>
                <Card style={{ textAlign: 'center', borderRadius: '8px' }}>
                    <Empty description="Không tìm thấy thông tin thú cưng" />
                    <Button type="primary" onClick={() => history.push('/my-pets')} style={{ marginTop: 16 }}>
                        Quay lại danh sách
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card
                style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                title={
                    <Space size="middle">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => history.push('/my-pets')}
                        />
                        <span style={{ fontWeight: 600 }}>Chi tiết thú cưng</span>
                    </Space>
                }
            >
                {/* Ant Design v4 / v5 Fix: Di chuyển Tabs vào bên trong Content của Card thay vì bọc ngoài trực tiếp TabPane */}
                <Tabs defaultActiveKey="info">
                    <Tabs.TabPane tab="Thông tin chung" key="info">
                        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                            <Col xs={24} sm={24} md={7} lg={6}>
                                <div className={styles.avatarSection}>
                                    <Upload
                                        ref={uploadRef}
                                        accept="image/*"
                                        maxCount={1}
                                        disabled={uploading}
                                        beforeUpload={(file) => {
                                            handleUploadImage(file);
                                            return false;
                                        }}
                                        showUploadList={false}
                                    >
                                        {/* Tăng kích thước khung cha lên 150px để nút có không gian hiển thị, không bị overflow:hidden cắt mất */}
                                        <div style={{
                                            position: 'relative',
                                            width: 150,
                                            height: 150,
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: uploading ? 'not-allowed' : 'pointer'
                                        }}>

                                            <Spin spinning={uploading} tip="Tải ảnh...">
                                                <Avatar
                                                    size={140}
                                                    src={pet?.image_url || pet?.avatar}
                                                    style={{
                                                        backgroundColor: '#87d068',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                    }}
                                                >
                                                    {!pet?.image_url && !pet?.avatar && 'Pet'}
                                                </Avatar>
                                            </Spin>

                                            {canEdit && (
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    icon={uploading ? null : <CameraOutlined />}
                                                    loading={uploading}
                                                    size="middle"
                                                    style={{
                                                        position: 'absolute',
                                                        // Đẩy dịch vào trong một chút để không lo bị mất rìa
                                                        bottom: 8,
                                                        right: 8,
                                                        zIndex: 999, // Đảm bảo nổi lên trên mọi layer của Spin hay Avatar
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                        border: '2px solid #fff', // Thêm viền trắng bao quanh nút cho nổi bật hẳn lên
                                                    }}
                                                    onClick={(e) => {
                                                        // Ngăn sự kiện click bị kích hoạt đúp hoặc lỗi lan truyền
                                                        if (uploading) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Upload>
                                    <h3 style={{ marginTop: 12, marginBottom: 4, fontSize: '18px' }}>{pet?.name}</h3>
                                    <p style={{ color: '#888', margin: 0 }}>
                                        {pet?.species ? (speciesMap[pet.species] || pet.species) : ''} {pet?.breed && `(${pet.breed})`}
                                    </p>
                                </div>
                            </Col>

                            <Col xs={24} sm={24} md={17} lg={18}>
                                <Descriptions
                                    size="middle"
                                    column={{ xs: 1, sm: 2, md: 2 }}
                                    bordered
                                    style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}
                                >
                                    <Descriptions.Item label="Tên thú cưng">
                                        <strong>{pet?.name}</strong>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">
                                        {pet?.gender || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giống">
                                        {pet?.breed || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Loài">
                                        {pet?.species ? (speciesMap[pet.species] || pet.species) : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chủ nhân">
                                        <div>{pet?.owner?.full_name || 'N/A'}</div>
                                        <div style={{ fontSize: '11px', color: '#bfbfbf' }}>@{pet?.owner?.username}</div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">
                                        {pet?.birth_date ? dayjs(pet.birth_date).format('DD/MM/YYYY') : pet?.dateOfBirth ? dayjs(pet.dateOfBirth).format('DD/MM/YYYY') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cân nặng">
                                        {pet?.weight ? `${pet.weight} kg` : '-'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Tabs.TabPane>

                    {canViewMedical && (
                        <Tabs.TabPane tab="Bệnh án" key="medical">
                            <div style={{ marginTop: 16 }}>
                                <Card title="Timeline lịch trình bệnh án" className={styles.medicalCard} loading={medicalLoading}>
                                    {timelineList && timelineList.length > 0 ? (
                                        <Timeline mode="left" style={{ marginTop: 8 }}>
                                            {timelineList.map((entry: any, index: number) => {
                                                const type = entry.type || 'DIAGNOSIS';
                                                const title = entry.title || (entry.diagnosis ? `Chẩn đoán: ${entry.diagnosis}` : 'Lịch sử khám');
                                                const desc = (entry.treatment ? `Điều trị: ${entry.treatment}` : null) || 'Không có chi tiết mô tả.';
                                                const date = entry.visit_date || entry.date || entry.visitDate;
                                                const formattedDate = date ? dayjs(date).format('DD/MM/YYYY') : '';
                                                const vet = entry.doctor?.full_name || entry.veterinarian || entry.doctor_name || '';

                                                return (
                                                    <Timeline.Item
                                                        key={entry.id || index}
                                                        dot={<Badge status={type === 'APPOINTMENT' ? 'processing' : 'success'} />}
                                                    >
                                                        <div style={{ paddingLeft: '4px' }}>
                                                            <span style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '2px' }}>
                                                                {formattedDate ? `${formattedDate}` : ''}
                                                            </span>
                                                            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '14px', color: '#222' }}>
                                                                {title}
                                                            </p>
                                                            <p style={{ margin: '0 0 4px', color: '#555', fontSize: '13px' }}>{desc}</p>
                                                            {vet && (
                                                                <span style={{ color: '#888', fontSize: '12px', display: 'block' }}>
                                                                    -BS. {vet}-
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Timeline.Item>
                                                );
                                            })}
                                        </Timeline>
                                    ) : (
                                        <Empty description="Chưa có dòng thời gian bệnh án nào" />
                                    )}
                                </Card>

                                <Card
                                    className={styles.medicalCard}
                                    style={{ marginTop: 16 }}
                                    title={
                                        <div className={styles.cardHeaderFlex}>
                                            <span>Danh sách bệnh án chi tiết</span>
                                            {canCreateMedical && (
                                                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
                                                    Thêm mới
                                                </Button>
                                            )}
                                        </div>
                                    }
                                >
                                    <Table
                                        className={styles.responsiveTable}
                                        columns={recordColumns as any}
                                        dataSource={records}
                                        rowKey="id"
                                        loading={medicalLoading}
                                        pagination={{ pageSize: 5, size: 'small' }}
                                        scroll={{ x: 600 }} // Thêm dòng này để tạo thanh cuộn ngang mượt mà khi màn hình bé
                                    />
                                </Card>
                            </div>
                        </Tabs.TabPane>
                    )}
                </Tabs>
            </Card>


            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết bệnh án"
                placement="right"
                closable={true} // Bật nút dấu X lên
                destroyOnClose={true} // Tự động dọn rác khi đóng để tránh lag data
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedRecord(null);
                }}

                visible={drawerVisible}
                width={typeof window !== 'undefined' && window.innerWidth < 576 ? '100%' : 520}

                // Thêm nút Đóng kiểu Button ở dưới chân Drawer cho chắc cú trên Mobile
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => {
                            setDrawerVisible(false);
                            setSelectedRecord(null);
                        }}>
                            Đóng lại
                        </Button>
                    </div>
                }
            >
                {selectedRecord && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Ngày khám">
                            {selectedRecord.visit_date ? dayjs(selectedRecord.visit_date).format('DD/MM/YYYY HH:mm') : '---'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ khám">
                            {selectedRecord.doctor?.full_name || '---'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chẩn đoán">
                            <span style={{ whiteSpace: 'pre-line' }}>{selectedRecord.diagnosis}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Điều trị">
                            <span style={{ whiteSpace: 'pre-line' }}>{selectedRecord.treatment}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            <span style={{ whiteSpace: 'pre-line' }}>{selectedRecord.notes || '---'}</span>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>

            {/* Add/Edit Medical Record Modal */}
            <Modal
                title={isEditing ? 'Cập nhật thông tin bệnh án' : 'Thêm hồ sơ bệnh án mới'}
                visible={modalVisible}
                width={typeof window !== 'undefined' && window.innerWidth < 576 ? '95%' : 520}
                centered
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setSelectedRecord(null);
                    setIsEditing(false);
                }}
                footer={[
                    <Button key="back" onClick={() => {
                        setModalVisible(false);
                        form.resetFields();
                        setSelectedRecord(null);
                        setIsEditing(false);
                    }}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={submitting} onClick={() => form.submit()}>
                        {isEditing ? 'Cập nhật' : 'Lưu lại'}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitRecord}
                >
                    <Form.Item label="Thú cưng" name="petName">
                        <Input disabled placeholder="Tên thú cưng" />
                    </Form.Item>
                    <Form.Item
                        label="Ngày khám"
                        name="visitDate"
                        rules={[{ required: !isEditing, message: 'Vui lòng chọn ngày khám' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày khám"
                            disabled={isEditing}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Chẩn đoán"
                        name="diagnosis"
                        rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập kết quả chẩn đoán lâm sàng" />
                    </Form.Item>
                    <Form.Item
                        label="Phác đồ điều trị"
                        name="treatment"
                        rules={[{ required: true, message: 'Vui lòng nhập phương pháp điều trị' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập đơn thuốc hoặc hướng xử lý điều trị" />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="notes">
                        <Input.TextArea rows={2} placeholder="Ghi chú nhắc nhở thêm (nếu có)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyPetDetail;