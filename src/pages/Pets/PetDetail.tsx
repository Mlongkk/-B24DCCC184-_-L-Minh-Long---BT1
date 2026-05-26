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
} from '@ant-design/icons';
import { useHistory, useParams } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import petService from '@/services/pets/petService';
import medicalRecordService from '@/services/medical-records/medicalRecordService';
import { Pet, MedicalRecord, Permission_Codes } from '@/models';
import authService from '@/services/auth/authService';
import styles from './PetDetail.less';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface RouteParams {
    id: string;
}

const PetDetail: React.FC = () => {
    const { id } = useParams<RouteParams>();
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

    const canEdit = authService.hasPermission(Permission_Codes.PET_UPDATE);
    const canViewMedical = authService.hasPermission(Permission_Codes.MEDICAL_VIEW);
    const canCreateMedical = authService.hasPermission(Permission_Codes.MEDICAL_CREATE);
    const canUpdateMedical = authService.hasPermission(Permission_Codes.MEDICAL_UPDATE);
    const canDeleteMedical = authService.hasPermission(Permission_Codes.MEDICAL_DELETE);

    useEffect(() => {
        fetchPetDetail();
    }, [id]);

    useEffect(() => {
        if (pet && canViewMedical) {
            fetchMedicalTimeline();
            fetchMedicalRecords();
        }
    }, [pet?.id, canViewMedical]);

    const fetchPetDetail = async () => {
        try {
            setLoading(true);
            const response = await petService.getPetById(id);
            setPet(response);
        } catch (error: any) {
            message.error('Không thể tải thông tin thú cưng');
            history.push('/pets');
        } finally {
            setLoading(false);
        }
    };

    // const handleEdit = () => {
    //     history.push(`/pets/edit/${id}`);
    // };

    // const handleDelete = async () => {
    //     try {
    //         await petService.deletePet(id);
    //         message.success('Xóa thú cưng thành công');
    //         history.push('/pets');
    //     } catch (error) {
    //         message.error('Lỗi khi xóa thú cưng');
    //     }
    // };

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

    // Medical Records Functions
    const fetchMedicalTimeline = async () => {
        try {
            setMedicalLoading(true);
            setLoading(true);
            const data = await medicalRecordService.getMedicalTimeline(id);
            setTimeline(data);
        } catch (error) {
            console.error('Error fetching medical timeline', error);
        } finally {
            setMedicalLoading(false);
            setLoading(false);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            const recordsData = await medicalRecordService.getRecordsByPetId(id);
            setRecords(recordsData);
        } catch (error) {
            console.error('Error fetching medical records', error);
        } finally {
            setLoading(false);
        }
    };

    // Medical Record CRUD Functions
    const handleOpenAddModal = () => {
        setIsEditing(false);
        form.resetFields();
        form.setFieldsValue({
            petName: pet?.name,
        });
        setModalVisible(true);
    };

    const handleOpenEditModal = (record: MedicalRecord) => {
        setIsEditing(true);
        form.setFieldsValue({
            petName: pet?.name,
            visitDate: dayjs(record.visit_date),
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
                    visitDate: values.visitDate.toISOString(),
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
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'BS. Khám',
            dataIndex: ['doctor', 'full_name'],
            key: 'doctor',
        },
        {
            title: 'Chẩn đoán',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
            render: (text: string) => text ? (text.length > 30 ? `${text.substring(0, 30)}...` : text) : '---',
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',

        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_: any, record: MedicalRecord) => (
                <Space size="small">
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
                            title="Xóa bệnh án"
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
                    <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                        Đang tải thông tin thú cưng...
                    </p>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className={styles.container}>
                <Card>
                    <Empty description="Không tìm thấy thú cưng" />
                    <Button onClick={() => history.push('/pets')} block>
                        Quay lại danh sách
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card
                title={
                    <Space>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => history.push('/pets')}
                        />
                        <span>Chi tiết thú cưng</span>
                    </Space>
                }
            // extra={
            //     <Space>
            //         {canEdit && (
            //             <Button icon={<EditOutlined />} onClick={handleEdit}>
            //                 Sửa
            //             </Button>
            //         )}
            //         {canDelete && (
            //             <Popconfirm
            //                 title="Xóa thú cưng"
            //                 okText="Xóa"
            //                 cancelText="Hủy"
            //                 okButtonProps={{ danger: true }}
            //                 onConfirm={handleDelete}
            //             >
            //                 <Button danger icon={<DeleteOutlined />}>
            //                     Xóa
            //                 </Button>
            //             </Popconfirm>
            //         )}
            //     </Space>
            // }
            >
                <Tabs>
                    <Tabs.TabPane tab="Thông tin chung" key="info">
                        <Row gutter={24}>
                            <Col xs={24} sm={12} md={6}>
                                <div className={styles.avatarSection}>
                                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                                        <Avatar
                                            size={150}
                                            src={pet?.image_url || pet?.avatar}
                                            style={{ backgroundColor: '#87d068', marginBottom: 16 }}
                                        >
                                            {!pet?.image_url && !pet?.avatar && 'Pet'}
                                        </Avatar>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={18}>
                                <Descriptions size="small" column={2} bordered>
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
                                        {speciesMap[pet?.species!] || pet?.species}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chủ nhân">
                                        <div>{pet?.owner?.full_name || 'N/A'}</div>
                                        <div style={{ fontSize: '11px', color: '#bfbfbf' }}>@{pet?.owner?.username}</div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">
                                        {pet?.birth_date ? new Date(pet.birth_date).toLocaleDateString('vi-VN') : pet?.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cân nặng (kg)">
                                        {pet?.weight || '-'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Tabs.TabPane>

                    {canViewMedical && (
                        <Tabs.TabPane tab="Bệnh án" key="medical">
                            <div>
                                <Card title="Timeline bệnh án" loading={medicalLoading} style={{ marginBottom: 20 }}>
                                    {timelineList && timelineList.length > 0 ? (
                                        <Timeline>
                                            {timelineList.map((entry: any, index: number) => {
                                                const type = entry.type || 'DIAGNOSIS';
                                                const title = entry.title || (entry.diagnosis ? `Chẩn đoán: ${entry.diagnosis}` : 'Lịch sử khám');
                                                const desc = (entry.treatment ? `Điều trị: ${entry.treatment}` : 'Không có chi tiết mô tả.');
                                                const date = entry.visit_date || entry.date || entry.visitDate;
                                                const formattedDate = date ? dayjs(date).format('DD/MM/YYYY') : '';
                                                const vet = entry.doctor?.full_name || entry.veterinarian || entry.doctor_name || '';

                                                return (
                                                    <Timeline.Item
                                                        key={entry.id || index}
                                                        dot={
                                                            <Badge
                                                                status={type === 'APPOINTMENT' ? 'processing' : 'success'}
                                                            />
                                                        }
                                                    >
                                                        <div style={{ paddingLeft: '8px' }}>
                                                            <span style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '4px' }}>
                                                                {formattedDate ? `${formattedDate}` : ''}
                                                            </span>
                                                            <p style={{ fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>
                                                                {title}
                                                            </p>
                                                            <p style={{ margin: '0 0 4px', color: '#555' }}>{desc}</p>
                                                            {vet && (
                                                                <p style={{ color: '#888', fontSize: 12, margin: 0 }}>
                                                                    -BS. {vet}-
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Timeline.Item>
                                                );
                                            })}
                                        </Timeline>
                                    ) : (
                                        <Empty description="Chưa có bệnh án nào" />
                                    )}
                                </Card>

                                <Card
                                    title="Chi tiết bệnh án"
                                    extra={
                                        canCreateMedical && (
                                            <Button type="primary" onClick={handleOpenAddModal}>
                                                + Thêm mới
                                            </Button>
                                        )
                                    }
                                >
                                    <Table
                                        columns={recordColumns}
                                        dataSource={records}
                                        rowKey="id"
                                        loading={medicalLoading}
                                        pagination={{ pageSize: 10 }}
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
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedRecord(null);
                }}
                visible={drawerVisible}
                width={600}
            >
                {selectedRecord && (
                    <div>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Ngày khám">
                                {dayjs(selectedRecord.visit_date).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="BS. Khám">
                                {selectedRecord.doctor?.full_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chẩn đoán">
                                {selectedRecord.diagnosis}
                            </Descriptions.Item>
                            <Descriptions.Item label="Điều trị">
                                {selectedRecord.treatment}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {selectedRecord.notes}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>

            {/* Add/Edit Medical Record Modal */}
            <Modal
                title={isEditing ? 'Sửa bệnh án' : 'Thêm bệnh án mới'}
                visible={modalVisible}
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
                        {isEditing ? 'Cập nhật' : 'Thêm mới'}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitRecord}
                >
                    <Form.Item
                        label="Thú cưng"
                        name="petName"
                    >
                        <Input
                            disabled
                            value={pet?.name}
                            placeholder="Tên thú cưng"
                        />
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
                        <Input.TextArea rows={3} placeholder="Nhập chẩn đoán" />
                    </Form.Item>
                    <Form.Item
                        label="Điều trị"
                        name="treatment"
                        rules={[{ required: true, message: 'Vui lòng nhập điều trị' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập điều trị" />
                    </Form.Item>
                    <Form.Item
                        label="Ghi chú"
                        name="notes"
                    >
                        <Input.TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PetDetail;
