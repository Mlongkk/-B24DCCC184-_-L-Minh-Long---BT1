import React, { useState, useEffect } from 'react';
import {
    Card,
    Input,
    Select,
    Button,
    message,
    Tag,
    Empty,
    Row,
    Col,
    List,
    Avatar,
    Spin,
    Pagination,
    Popconfirm,
} from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

import appointmentService from '@/services/appointments/appointmentService';
import userService from '@/services/users/userService';
import authService from '@/services/auth/authService';
import { Appointment } from '@/models';
import styles from './AppointmentCalendar.less';

import moment from 'moment';

moment.locale('vi');

const MyAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // Bộ lọc
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [doctorFilter, setDoctorFilter] = useState('ALL');

    const [doctors, setDoctors] = useState<any[]>([]);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsPageLoading(true);
                await Promise.all([
                    fetchMyAppointments(),
                    fetchDoctors(),
                ]);
            } catch (error) {
                console.error('Error loading page data', error);
            } finally {
                setIsPageLoading(false);
            }
        };
        loadData();
    }, []);

    // Fetch lại appointments khi thay đổi filter hoặc pagination
    useEffect(() => {
        if (!isPageLoading) {
            fetchMyAppointments();
        }
    }, [currentPage, pageSize, statusFilter, priorityFilter, doctorFilter]);

    const fetchMyAppointments = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: pageSize,
            };

            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (priorityFilter !== 'ALL') params.priority_level = priorityFilter;
            if (doctorFilter !== 'ALL') params.doctor_id = doctorFilter;

            const response = await appointmentService.getMyAppointments(params);
            setAppointments(response.data || []);

            if (response.pagination) {
                setTotalRecords(response.pagination.total || 0);
            }
        } catch (error) {
            message.error('Lỗi khi tải lịch hẹn của bạn');
            console.error('Error fetching my appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await userService.getUsers({ role: 'DOCTOR' as any });
            if (response.data) {
                setDoctors(response.data);
            }
        } catch (error) {
            console.error('Error fetching doctors', error);
        }
    };

    // Helpers dữ liệu mẫu từ code cũ
    const getPetName = (appointment: Appointment): string => {
        if (appointment.petName) return appointment.petName;
        if ((appointment as any).pet?.name) return (appointment as any).pet.name;
        return 'N/A';
    };

    const getPetImageUrl = (appointment: Appointment): string | null => {
        return (appointment as any).pet?.image_url || null;
    };

    const getDoctorName = (appointment: Appointment): string => {
        const doctorObj = (appointment as any).doctor;
        if (doctorObj?.full_name) return doctorObj.full_name;
        if (doctorObj?.fullName) return doctorObj.fullName;
        if (doctorObj?.username) return doctorObj.username;
        return 'N/A';
    };

    const getReason = (appointment: Appointment): string => {
        return appointment.reason && appointment.reason.trim() ? appointment.reason : 'Không có ghi chú';
    };

    const getPriorityLabel = (priority?: string): string => {
        switch (priority) {
            case 'EMERGENCY': return 'Cấp cứu';
            case 'URGENT': return 'Khẩn cấp';
            default: return 'Bình thường';
        }
    };

    const getPriorityColor = (priority?: string): string => {
        switch (priority) {
            case 'EMERGENCY': return 'red';
            case 'URGENT': return 'orange';
            default: return 'blue';
        }
    };

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case 'CONFIRMED': return 'green';
            case 'COMPLETED': return 'cyan';
            case 'CANCELLED': return 'red';
            case 'SCHEDULED': return 'blue';
            default: return 'gold';
        }
    };

    const getStatusLabel = (status?: string): string => {
        switch (status) {
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            case 'SCHEDULED': return 'Đã lên lịch';
            default: return 'Chờ xác nhận';
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        try {
            setActionLoadingId(appointmentId);
            await appointmentService.deleteAppointment(appointmentId);
            message.success('Hủy lịch hẹn thành công');
            fetchMyAppointments();
        } catch (error) {
            message.error('Lỗi khi hủy lịch hẹn');
        } finally {
            setActionLoadingId(null);
        }
    };

    const getFilteredAppointments = (): Appointment[] => {
        let filtered = appointments;

        if (searchText.trim()) {
            const query = searchText.toLowerCase().trim();
            filtered = filtered.filter((apt) => {
                const doctorName = getDoctorName(apt).toLowerCase();
                const petName = getPetName(apt).toLowerCase();
                return doctorName.includes(query) || petName.includes(query);
            });
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((apt) => apt.status === statusFilter);
        }
        if (priorityFilter !== 'ALL') {
            filtered = filtered.filter((apt) => (apt.priority_level || 'NORMAL') === priorityFilter);
        }
        if (doctorFilter !== 'ALL') {
            filtered = filtered.filter((apt) => apt.doctor_id === doctorFilter || apt.doctorId === doctorFilter);
        }

        return filtered;
    };

    const handleRefresh = () => {
        setCurrentPage(1);
        fetchMyAppointments();
    };

    if (isPageLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    const filteredData = getFilteredAppointments();

    return (
        <div className={styles.container} style={{ padding: '16px 8px', maxWidth: 1200, margin: '0 auto' }}>
            <Card
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>Lịch hẹn của tôi</span>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </div>
                }
            >
                {/* Thanh bộ lọc & tìm kiếm */}
                <div style={{ marginBottom: 20 }}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={12} lg={9}>
                            <Input
                                placeholder="Tìm kiếm theo bác sĩ hoặc thú cưng..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                allowClear
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={8} md={4} lg={5}>
                            <Select
                                placeholder="Trạng thái"
                                value={statusFilter}
                                onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                                <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
                                <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
                                <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                                <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={4} lg={5}>
                            <Select
                                placeholder="Độ ưu tiên"
                                value={priorityFilter}
                                onChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="ALL">Tất cả ưu tiên</Select.Option>
                                <Select.Option value="NORMAL">Bình thường</Select.Option>
                                <Select.Option value="URGENT">Khẩn cấp</Select.Option>
                                <Select.Option value="EMERGENCY">Cấp cứu</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={4} lg={5}>
                            <Select
                                placeholder="Bác sĩ"
                                value={doctorFilter}
                                onChange={(val) => { setDoctorFilter(val); setCurrentPage(1); }}
                                style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Select.Option value="ALL">Tất cả bác sĩ</Select.Option>
                                {doctors.map(d => (
                                    <Select.Option key={d.id} value={d.id}>
                                        {d.full_name || d.fullName || d.username}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </div>

                {/* Danh sách lịch hẹn */}
                {filteredData.length === 0 ? (
                    <Empty
                        style={{ padding: '32px 0' }}
                        description={searchText ? "Không tìm thấy lịch hẹn phù hợp" : "Bạn chưa có lịch hẹn nào"}
                    />
                ) : (
                    <>
                        <List
                            itemLayout="vertical"
                            dataSource={filteredData}
                            loading={loading}
                            renderItem={(appointment) => (
                                <List.Item
                                    key={appointment.id}
                                    style={{
                                        padding: '16px',
                                        background: '#fafafa',
                                        borderRadius: 8,
                                        marginBottom: 12,
                                        border: '1px solid #f0f0f0'
                                    }}
                                >
                                    <Row gutter={[16, 16]} align="middle">
                                        {/* Avatar & Nội dung thông tin chính */}
                                        <Col xs={24} sm={18} md={20}>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                                <Avatar
                                                    size={{ xs: 48, sm: 54, md: 60 }}
                                                    style={{ backgroundColor: '#87d068', flexShrink: 0 }}
                                                    src={getPetImageUrl(appointment) || undefined}
                                                >
                                                    {!getPetImageUrl(appointment) && getPetName(appointment).charAt(0).toUpperCase()}
                                                </Avatar>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {/* Tên Pet và Tags */}
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 600, fontSize: 16, color: '#141414' }}>
                                                            {getPetName(appointment)}
                                                        </span>
                                                        <Tag color={getStatusColor(appointment.status)} style={{ margin: 0 }}>
                                                            {getStatusLabel(appointment.status)}
                                                        </Tag>
                                                        <Tag color={getPriorityColor(appointment.priority_level)} style={{ margin: 0 }}>
                                                            {getPriorityLabel(appointment.priority_level)}
                                                        </Tag>
                                                    </div>

                                                    {/* Chi tiết lịch hẹn */}
                                                    <div style={{ color: '#595959', fontSize: 13 }}>
                                                        <div style={{ marginBottom: 2 }}>
                                                            <CalendarOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                                                            {moment.utc(appointment.appointment_date || appointment.appointmentDate).local().format('dddd, DD/MM/YYYY - HH:mm')}
                                                        </div>
                                                        <div style={{ marginBottom: 2 }}>
                                                            <UserOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                                                            <b>Bác sĩ:</b> {getDoctorName(appointment)}
                                                        </div>
                                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            <b>Lý do:</b> {getReason(appointment)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Nút hành động (Tự động xuống dòng trên mobile, đẩy sang phải trên PC) */}
                                        <Col xs={24} sm={6} md={4} style={{ textAlign: 'right' }}>
                                            {appointment.status !== 'CANCELLED' ? (
                                                <Popconfirm
                                                    title="Hủy lịch hẹn"
                                                    onConfirm={() => handleDeleteAppointment(appointment.id)}
                                                    okText="Có"
                                                    cancelText="Không"
                                                    placement="topRight"
                                                >
                                                    <Button
                                                        danger
                                                        block
                                                        type="text"
                                                        style={{ backgroundColor: '#fff1f0', border: '1px solid #ffa39e' }}
                                                        icon={<DeleteOutlined />}
                                                        loading={actionLoadingId === appointment.id}
                                                        disabled={actionLoadingId !== null}
                                                    >
                                                        Hủy lịch
                                                    </Button>
                                                </Popconfirm>
                                            ) : (
                                                <span style={{ color: '#bfbfbf', fontSize: 13, fontStyle: 'italic' }}>Đã đóng</span>
                                            )}
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />

                        {/* Phân trang Responsive */}
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalRecords}
                                onChange={(page) => setCurrentPage(page)}
                                onShowSizeChange={(current, size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                }}
                                pageSizeOptions={['5', '10', '20']}
                                showSizeChanger
                                responsive={true} // Bật tính năng responsive tự động thu gọn của Antd
                                showTotal={(total) => `Tổng ${total} mục`}
                            />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default MyAppointments;