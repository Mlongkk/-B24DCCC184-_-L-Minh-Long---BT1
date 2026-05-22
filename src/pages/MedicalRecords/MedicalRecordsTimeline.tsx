import React, { useState, useEffect } from 'react';
import {
    Card,
    Timeline,
    Empty,
    Spin,
    Row,
    Col,
    Select,
    Button,
    Space,
    Badge,
    Drawer,
    Descriptions,
    Tag,
    message,
    Table,
} from 'antd';
import {
    FileOutlined,
    MedicineBoxOutlined,
    DownloadOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import medicalRecordService from '@/services/medical-records/medicalRecordService';
import petService from '@/services/pets/petService';
import authService from '@/services/auth/authService';
import { MedicalRecord, Pet, Permission_Codes } from '@/models';
import styles from './MedicalRecordsTimeline.less';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const MedicalRecordsTimeline: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<string>('');
    const [timeline, setTimeline] = useState<any>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const canView = authService.hasPermission(Permission_Codes.MEDICAL_VIEW);

    useEffect(() => {
        if (canView) {
            fetchPets();
        }
    }, [canView]);

    useEffect(() => {
        if (selectedPetId) {
            fetchMedicalTimeline();
            fetchMedicalRecords();
        }
    }, [selectedPetId]);

    const fetchPets = async () => {
        try {
            const response = await petService.getPets({ pageSize: 1000 });
            setPets(response.data);
            if (response.data.length > 0) {
                setSelectedPetId(response.data[0].id);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách thú cưng');
        }
    };

    const fetchMedicalTimeline = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordService.getMedicalTimeline(selectedPetId);
            setTimeline(data);
        } catch (error) {
            message.error('Lỗi khi tải lịch sử bệnh án');
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            const recordsData = await medicalRecordService.getRecordsByPetId(selectedPetId);
            setRecords(recordsData);
        } catch (error) {
            console.error('Error fetching medical records', error);
        }
    };

    const handleDownloadPDF = async (recordId: string) => {
        try {
            const blob = await medicalRecordService.downloadAsPDF(recordId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `medical-record-${recordId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            message.success('Tải xuống thành công');
        } catch (error) {
            message.error('Lỗi khi tải xuống');
        }
    };

    const getTypeIcon = (type: string) => {
        const iconMap: any = {
            APPOINTMENT: '📅',
            DIAGNOSIS: '🔍',
            TREATMENT: '💊',
            VACCINATION: '💉',
            NOTE: '📝',
        };
        return iconMap[type] || '📋';
    };

    const getTimelineItems = () => {
        if (!timeline || !timeline.records) return [];
        return timeline.records.map((entry: any) => ({
            children: (
                <div>
                    <p style={{ fontWeight: 'bold' }}>
                        {getTypeIcon(entry.type)} {entry.title}
                    </p>
                    <p style={{ margin: '8px 0' }}>{entry.description}</p>
                    {entry.veterinarian && (
                        <p style={{ color: '#999', fontSize: 12 }}>
                            👨‍⚕️ BS. {entry.veterinarian}
                        </p>
                    )}
                </div>
            ),
            dot: (
                <Badge
                    status={entry.type === 'APPOINTMENT' ? 'processing' : 'success'}
                />
            ),
            label: dayjs(entry.date).format('DD/MM/YYYY'),
        }));
    };

    const recordColumns = [
        {
            title: 'Ngày khám',
            dataIndex: 'visitDate',
            key: 'visitDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'BS. Khám',
            dataIndex: 'veterinarian',
            key: 'veterinarian',
        },
        {
            title: 'Chẩn đoán',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
            render: (text: string) => text?.substring(0, 30) + '...',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'COMPLETED' ? 'green' : 'blue'}>{status}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
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
                    <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadPDF(record.id)}
                    >
                        PDF
                    </Button>
                </Space>
            ),
        },
    ];

    if (!canView) {
        return (
            <Card>
                <Empty description="Bạn không có quyền xem bệnh án" />
            </Card>
        );
    }

    return (
        <div className={styles.container}>
            <Row gutter={16}>
                <Col xs={24} lg={6}>
                    <Card title="Chọn thú cưng">
                        <Select
                            placeholder="Chọn thú cưng"
                            value={selectedPetId}
                            onChange={setSelectedPetId}
                            style={{ width: '100%' }}
                        >
                            {pets.map((pet) => (
                                <Select.Option key={pet.id} value={pet.id}>
                                    🐾 {pet.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Card>
                </Col>

                <Col xs={24} lg={18}>
                    {selectedPetId && (
                        <>
                            <Card title="Timeline bệnh án" loading={loading}>
                                {timeline && timeline.records && timeline.records.length > 0 ? (
                                    <Timeline items={getTimelineItems()} />
                                ) : (
                                    <Empty description="Chưa có bệnh án nào" />
                                )}
                            </Card>

                            <Card
                                title="Chi tiết bệnh án"
                                style={{ marginTop: 20 }}
                                extra={
                                    <Button type="primary" icon={<PrinterOutlined />}>
                                        In
                                    </Button>
                                }
                            >
                                <Table
                                    columns={recordColumns}
                                    dataSource={records}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </>
                    )}
                </Col>
            </Row>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết bệnh án"
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedRecord(null);
                }}
                open={drawerVisible}
                width={600}
            >
                {selectedRecord && (
                    <div>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Ngày khám">
                                {dayjs(selectedRecord.visitDate).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="BS. Khám">
                                {selectedRecord.veterinarian}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chẩn đoán">
                                {selectedRecord.diagnosis}
                            </Descriptions.Item>
                            <Descriptions.Item label="Điều trị">
                                {selectedRecord.treatment}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedRecord.status === 'COMPLETED' ? 'green' : 'blue'}>
                                    {selectedRecord.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRecord.vitals && (
                            <Card title="Chỉ số sinh tồn" style={{ marginTop: 20 }}>
                                <Row gutter={16}>
                                    {selectedRecord.vitals.temperature && (
                                        <Col xs={12} sm={6}>
                                            <div>🌡️ Nhiệt độ: {selectedRecord.vitals.temperature}°C</div>
                                        </Col>
                                    )}
                                    {selectedRecord.vitals.heartRate && (
                                        <Col xs={12} sm={6}>
                                            <div>❤️ Nhịp tim: {selectedRecord.vitals.heartRate} bpm</div>
                                        </Col>
                                    )}
                                    {selectedRecord.vitals.weight && (
                                        <Col xs={12} sm={6}>
                                            <div>⚖️ Cân nặng: {selectedRecord.vitals.weight} kg</div>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        )}

                        {selectedRecord.prescription && selectedRecord.prescription.length > 0 && (
                            <Card title="Đơn thuốc" style={{ marginTop: 20 }}>
                                {selectedRecord.prescription.map((med, idx) => (
                                    <div key={idx} style={{ marginBottom: 12 }}>
                                        <Tag color="blue">{med.medicationName}</Tag>
                                        <p style={{ margin: '4px 0', fontSize: 12 }}>
                                            Liều: {med.dosage} | Tần suất: {med.frequency} | Thời gian: {med.duration}
                                        </p>
                                    </div>
                                ))}
                            </Card>
                        )}

                        <Button
                            type="primary"
                            block
                            style={{ marginTop: 20 }}
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadPDF(selectedRecord.id)}
                        >
                            Tải xuống PDF
                        </Button>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MedicalRecordsTimeline;
