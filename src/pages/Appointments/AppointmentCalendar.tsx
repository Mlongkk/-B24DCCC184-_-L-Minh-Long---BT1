import React, { useState, useEffect } from 'react';
import {
    Card,
    Calendar,
    Badge,
    Form,
    Input,
    Select,
    Button,
    Space,
    message,
    Tag,
    Empty,
    Row,
    Col,
    Drawer,
    List,
    Avatar,
    Checkbox,
    Spin,
    DatePicker,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined, CheckCircleOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

import appointmentService from '@/services/appointments/appointmentService';
import customerService from '@/services/customers/customerService';
import petService from '@/services/pets/petService';
import userService from '@/services/users/userService';
import authService from '@/services/auth/authService';
import { Appointment, Customer, Pet, Permission_Codes } from '@/models';
import styles from './AppointmentCalendar.less';

import moment, { Moment } from 'moment';

moment.locale('vi');

const AppointmentCalendar: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Moment>(moment());
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Bộ lọc mới thêm vào
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [doctorFilter, setDoctorFilter] = useState('ALL');
    const [searchAllDates, setSearchAllDates] = useState(false);
    const [dateRange, setDateRange] = useState<[Moment | null, Moment | null] | null>(null);

    const user = authService.getCurrentUser();
    const isDoctor = user?.roles.includes('DOCTOR');
    const isAdmin = user?.roles.includes('ADMIN');

    const canCreate = authService.hasPermission(Permission_Codes.APPOINTMENT_CREATE) && !isDoctor;
    const canEdit = authService.hasPermission(Permission_Codes.APPOINTMENT_UPDATE) && !isDoctor;
    const canDelete = authService.hasPermission(Permission_Codes.APPOINTMENT_DELETE);
    const canConfirm = canEdit || isDoctor; // Doctor có thể xác nhận lịch

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsPageLoading(true);
                await Promise.all([
                    fetchAppointments(),
                    fetchCustomers(),
                    fetchPets(),
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

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getAppointments({ limit: 1000 });
            setAppointments(response.data);
        } catch (error) {
            message.error('Lỗi khi tải lịch hẹn');
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

    const fetchPets = async () => {
        try {
            const response = await petService.getPets({ pageSize: 1000 });
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets', error);
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

    // Lấy dữ liệu lịch hẹn của một ngày cụ thể trên Lịch
    const getDateAppointments = (date: Moment): Appointment[] => {
        return appointments.filter((apt) => {
            const aptDate = apt.appointment_date || apt.appointmentDate;
            // Parse date và convert UTC → local timezone (Vietnam +07:00)
            if (!aptDate) return false;
            const aptMoment = moment.utc(aptDate).local();
            return aptMoment.format('YYYY-MM-DD') === date.format('YYYY-MM-DD');
        });
    };

    // Nội dung hiển thị chấm nhỏ/badge trên ô lịch
    const getDateContent = (date: Moment) => {
        const dateAppointments = getDateAppointments(date);
        if (dateAppointments.length === 0) return null;

        return (
            <div style={{ fontSize: 12 }}>
                {dateAppointments.length > 0 && (
                    <div style={{ color: '#999' }}>{dateAppointments.length} lịch hẹn</div>
                )}
            </div>
        );
    };

    const handleDateSelect = (date: Moment) => {
        setSelectedDate(date);
        setCurrentPage(1);
    };

    const handleNewAppointment = () => {
        form.resetFields(['petId', 'doctorId', 'startTime', 'priority_level', 'reason']);
        setSelectedAppointment(null);
        setDrawerVisible(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        const time = getTimeFromAppointmentDate(appointment);
        form.setFieldsValue({
            petId: appointment.petId || appointment.pet_id,
            doctorId: appointment.doctor_id || appointment.doctorId,
            startTime: time !== 'N/A' ? time : '',
            priority_level: appointment.priority_level || 'NORMAL',
            reason: appointment.reason || '',
        });
        setDrawerVisible(true);
    };

    const handleSaveAppointment = async (values: any) => {
        try {
            setLoading(true);
            // Format: ISO string UTC (backend sẽ lưu như UTC)
            // selectedDate là local Vietnam time, cần convert sang UTC
            const localDateTime = selectedDate.format('YYYY-MM-DD') + 'T' + values.startTime + ':00';
            const dateTime = moment(localDateTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

            const appointmentData = {
                pet_id: values.petId,
                doctor_id: values.doctorId,
                appointment_date: dateTime,
                priority_level: values.priority_level || 'NORMAL',
                reason: values.reason,
            };

            if (selectedAppointment) {
                await appointmentService.updateAppointment(selectedAppointment.id, appointmentData);
                message.success('Cập nhật lịch hẹn thành công');
            } else {
                await appointmentService.createAppointment(appointmentData);
                message.success('Tạo lịch hẹn thành công');
            }
            setDrawerVisible(false);
            fetchAppointments();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.error || error?.response?.data?.message || 'Lỗi khi lưu lịch hẹn';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        try {
            setActionLoadingId(appointmentId);
            await appointmentService.deleteAppointment(appointmentId);
            message.success('Xóa lịch hẹn thành công');
            fetchAppointments();
        } catch (error) {
            message.error('Lỗi khi xóa lịch hẹn');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmAppointment = async (appointmentId: string) => {
        try {
            setActionLoadingId(appointmentId);
            await appointmentService.confirmAppointment(appointmentId);
            message.success('Xác nhận lịch hẹn thành công');
            fetchAppointments();
        } catch (error) {
            message.error('Lỗi khi xác nhận lịch hẹn');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCompleteAppointment = async (appointmentId: string) => {
        try {
            setActionLoadingId(appointmentId);
            await appointmentService.completeAppointment(appointmentId);
            message.success('Hoàn thành lịch hẹn thành công');
            fetchAppointments();
        } catch (error) {
            message.error('Lỗi khi hoàn thành lịch hẹn');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Helper định dạng giờ hẹn
    const getTimeFromAppointmentDate = (appointment: any) => {
        const rawDate =
            appointment.startTime ||
            appointment.appointmentDate ||
            appointment.appointment_date;

        if (!rawDate) return 'N/A';

        const momentObj = moment.utc(rawDate).local();
        return momentObj.isValid() ? momentObj.format('HH:mm') : 'N/A';
    };

    // Helper tìm tên thú cưng
    const getPetName = (appointment: Appointment): string => {
        if (appointment.petName) return appointment.petName;
        // Ưu tiên lấy từ nested object pet từ backend
        if ((appointment as any).pet?.name) return (appointment as any).pet.name;
        const pet = pets.find(p => p.id === appointment.petId || p.id === appointment.pet_id);
        return pet?.name || 'N/A';
    };

    // Helper lấy tên khách hàng
    const getCustomerName = (appointment: Appointment): string => {
        if (appointment.customerName) return appointment.customerName;
        // Ưu tiên lấy từ nested object customer từ backend
        if ((appointment as any).customer?.full_name) return (appointment as any).customer.full_name;
        return 'Khách hàng';
    };

    // Helper lấy avatar pet (image_url)
    const getPetImageUrl = (appointment: Appointment): string | null => {
        return (appointment as any).pet?.image_url || null;
    };

    // Helper lấy tên bác sĩ
    const getDoctorName = (appointment: Appointment): string => {
        const doctorObj = (appointment as any).doctor;
        if (doctorObj?.full_name) return doctorObj.full_name;
        if (doctorObj?.fullName) return doctorObj.fullName;
        if (doctorObj?.username) return doctorObj.username;
        return 'N/A';
    };

    // Helper lấy lý do khám
    const getReason = (appointment: Appointment): string => {
        return appointment.reason && appointment.reason.trim() ? appointment.reason : 'Không có ghi chú';
    };

    // Lọc và Tìm kiếm dữ liệu lịch hẹn
    const getFilteredAppointments = (): Appointment[] => {
        let filtered = appointments;

        // 1. Lọc theo khoảng ngày (Ưu tiên nếu được chọn)
        if (dateRange && dateRange[0] && dateRange[1]) {
            filtered = filtered.filter((apt) => {
                const aptDate = apt.appointment_date || apt.appointmentDate;
                if (!aptDate) return false;
                const aptMoment = moment.utc(aptDate).local();
                const startDate = dateRange[0]!;
                const endDate = dateRange[1]!;
                return aptMoment.isBetween(
                    startDate.startOf('day'),
                    endDate.endOf('day'),
                    undefined,
                    '[]'
                );
            });
        } else if (!searchAllDates) {
            // Phân loại theo Ngày khám (Nếu không bật "Tất cả các ngày")
            filtered = filtered.filter((apt) => {
                const aptDate = apt.appointment_date || apt.appointmentDate;
                if (!aptDate) return false;
                const aptMoment = moment.utc(aptDate).local();
                return aptMoment.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
            });
        }

        // 2. Lọc theo từ khóa Tìm kiếm (Tên khách hàng, Thú cưng hoặc Lý do)
        if (searchText.trim()) {
            const query = searchText.toLowerCase().trim();
            filtered = filtered.filter((apt) => {
                const customerMatch = getCustomerName(apt).toLowerCase().includes(query);

                return customerMatch;
            });
        }

        // 3. Lọc theo Trạng thái
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((apt) => apt.status === statusFilter);
        }

        // 4. Lọc theo Độ ưu tiên
        if (priorityFilter !== 'ALL') {
            filtered = filtered.filter((apt) => (apt.priority_level || 'NORMAL') === priorityFilter);
        }

        // 5. Lọc theo Bác sĩ được chỉ định
        if (doctorFilter !== 'ALL') {
            filtered = filtered.filter((apt) => {
                const matches = apt.doctor_id === doctorFilter || apt.doctorId === doctorFilter;
                if (!matches && appointments.length > 0) {
                    console.log('Apt doctor_id:', apt.doctor_id, 'doctorId:', apt.doctorId, 'filter:', doctorFilter);
                }
                return matches;
            });
        }

        // Sắp xếp tự động theo ngày, sau đó theo giờ tăng dần
        return filtered.sort((a, b) => {
            const dateA = a.appointment_date || a.appointmentDate;
            const dateB = b.appointment_date || b.appointmentDate;

            if (!dateA || !dateB) return 0;

            const momentA = moment.utc(dateA).local();
            const momentB = moment.utc(dateB).local();

            return momentA.diff(momentB);
        });
    };

    const finalFilteredList = getFilteredAppointments();

    // Các hàm helper phong cách thẻ Tag
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
            default: return 'gold'; // PENDING
        }
    };

    if (isPageLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ padding: 16 }}>
            <Row gutter={[16, 16]}>
                {/* Phần bảng lịch */}
                <Col xs={24} lg={14} xl={15}>
                    <Card title="Lịch hẹn tổng quan" className={styles.calendarCard}>
                        <Calendar
                            fullscreen={false}
                            value={selectedDate}
                            onChange={handleDateSelect}
                            dateCellRender={getDateContent}
                        />
                    </Card>
                </Col>

                {/* Phần danh bạ lịch hẹn và Tìm kiếm */}
                <Col xs={24} lg={10} xl={9}>
                    <Card
                        title={
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>
                                    {searchAllDates ? 'Kết quả tìm kiếm' : `Lịch: ${selectedDate.format('DD/MM/YYYY')}`}
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <Checkbox
                                        checked={searchAllDates}
                                        onChange={(e) => {
                                            setSearchAllDates(e.target.checked);
                                            setCurrentPage(1);
                                        }}
                                        style={{ fontSize: 13 }}
                                    >
                                        Tìm kiếm trên tất cả các ngày
                                    </Checkbox>
                                </div>
                            </div>
                        }
                        extra={
                            canCreate && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleNewAppointment}
                                >
                                    Thêm lịch
                                </Button>
                            )
                        }
                    >
                        {/* Thanh bộ lọc & tìm kiếm */}
                        <div style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Input
                                    placeholder="Tìm theo tên Khách hàng..."
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    allowClear
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    value={dateRange}
                                    onChange={(dates: any) => {
                                        setDateRange(dates);
                                        setCurrentPage(1);
                                    }}
                                    format="DD/MM/YYYY"
                                    allowClear
                                />
                                <Row gutter={6}>
                                    <Col span={8}>
                                        <Select
                                            placeholder="Trạng thái"
                                            value={statusFilter}
                                            onChange={(val) => {
                                                setStatusFilter(val);
                                                setCurrentPage(1);
                                            }}
                                            style={{ width: '100%' }}
                                            size="small"
                                        >
                                            <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                                            <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
                                            <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
                                            <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
                                            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                                            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                                        </Select>
                                    </Col>
                                    <Col span={8}>
                                        <Select
                                            placeholder="Độ ưu tiên"
                                            value={priorityFilter}
                                            onChange={(val) => {
                                                setPriorityFilter(val);
                                                setCurrentPage(1);
                                            }}
                                            style={{ width: '100%' }}
                                            size="small"
                                        >
                                            <Select.Option value="ALL">Tất cả ưu tiên</Select.Option>
                                            <Select.Option value="NORMAL">Bình thường</Select.Option>
                                            <Select.Option value="URGENT">Khẩn cấp</Select.Option>
                                            <Select.Option value="EMERGENCY">Cấp cứu</Select.Option>
                                        </Select>
                                    </Col>
                                    <Col span={8}>
                                        <Select
                                            placeholder="Bác sĩ"
                                            value={doctorFilter}
                                            onChange={(val) => {
                                                setDoctorFilter(val);
                                                setCurrentPage(1);
                                            }}
                                            style={{ width: '100%' }}
                                            size="small"
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
                            </Space>
                        </div>

                        {finalFilteredList.length === 0 ? (
                            <Empty description={searchText ? "Không tìm thấy lịch hẹn phù hợp" : "Không có lịch hẹn nào"} />
                        ) : (
                            <List
                                dataSource={finalFilteredList}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: finalFilteredList.length,
                                    onChange: (page) => setCurrentPage(page),
                                    onShowSizeChange: (current, size) => {
                                        setPageSize(size);
                                        setCurrentPage(1);
                                    },
                                    pageSizeOptions: ['5', '10', '20'],
                                    showSizeChanger: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
                                }}
                                renderItem={(appointment) => (
                                    <List.Item
                                        key={appointment.id}
                                        style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {/* Phần thông tin chính */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                {/* Ảnh đại diện - ưu tiên ảnh thú cưng, nếu không thì dùng chữ cái */}
                                                <Avatar
                                                    style={{
                                                        backgroundColor: '#87d068',
                                                        flexShrink: 0,
                                                        marginTop: '2px'
                                                    }}
                                                    src={getPetImageUrl(appointment) || undefined}
                                                >
                                                    {!getPetImageUrl(appointment) && "A".toUpperCase()}
                                                </Avatar>

                                                <div style={{ flexGrow: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#262626' }}>
                                                            {getCustomerName(appointment)}
                                                        </span>
                                                        <Space size={4} style={{ flexWrap: 'wrap' }}>
                                                            <Tag color={getStatusColor(appointment.status)} style={{ margin: 0 }}>
                                                                {appointment.status}
                                                            </Tag>
                                                            <Tag color={getPriorityColor(appointment.priority_level)} style={{ margin: 0 }}>
                                                                {getPriorityLabel(appointment.priority_level)}
                                                            </Tag>
                                                        </Space>
                                                    </div>

                                                    <div style={{ marginTop: 6, fontSize: 13, color: '#595959' }}>
                                                        <div><b>Thú cưng:</b> {getPetName(appointment)}</div>
                                                        <div><b>Bác sĩ:</b> {getDoctorName(appointment)}</div>
                                                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                            <b>Lý do:</b> {getReason(appointment)}
                                                        </div>
                                                        {(appointment as any).notes && (
                                                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                <b>Ghi chú:</b> {(appointment as any).notes}
                                                            </div>
                                                        )}
                                                        <div style={{ color: '#1890ff', fontWeight: 500, marginTop: 2 }}>
                                                            Giờ hẹn: {getTimeFromAppointmentDate(appointment)} {`(${moment.utc(appointment.appointment_date || appointment.appointmentDate).local().format('DD/MM')})`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dải nút chức năng Responsive thông minh */}
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px dashed #f0f0f0', paddingTop: 8 }}>
                                                {/* Xác nhận lịch - Doctor có thể xác nhận */}
                                                {canConfirm && (appointment.status === 'SCHEDULED') && (
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        loading={actionLoadingId === appointment.id}
                                                        disabled={actionLoadingId !== null}
                                                        onClick={() => handleConfirmAppointment(appointment.id)}
                                                    >
                                                        Xác nhận
                                                    </Button>
                                                )}
                                                {/* Hoàn thành lịch - Admin và Doctor */}
                                                {(canEdit || isDoctor) && appointment.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                                        icon={<CheckCircleOutlined />}
                                                        loading={actionLoadingId === appointment.id}
                                                        disabled={actionLoadingId !== null}
                                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                                    >
                                                        Hoàn thành
                                                    </Button>
                                                )}
                                                {/* Sửa lịch - Chỉ Admin (ẩn với Doctor) */}
                                                {!isDoctor && canEdit && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                                                    <Button
                                                        size="small"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEditAppointment(appointment)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                )}
                                                {/* Hủy lịch - Doctor có thể hủy */}
                                                {(canDelete || isDoctor) && (appointment.status !== 'CANCELLED') && (
                                                    <Button
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        loading={actionLoadingId === appointment.id}
                                                        disabled={actionLoadingId !== null}
                                                        onClick={() => handleDeleteAppointment(appointment.id)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Appointment Form Drawer */}
            <Drawer
                title={selectedAppointment ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn'}
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedAppointment(null);
                }}
                visible={drawerVisible}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveAppointment}
                    initialValues={{ priority_level: 'NORMAL' }}
                >
                    <Form.Item
                        name="petId"
                        label="Thú cưng"
                        rules={[{ required: true, message: 'Vui lòng chọn thú cưng' }]}
                    >
                        <Select placeholder="Chọn thú cưng">
                            {pets.map((p) => (
                                <Select.Option key={p.id} value={p.id}>
                                    {p.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="doctorId"
                        label="Bác sĩ thú y"
                        rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
                    >
                        <Select
                            placeholder="Chọn bác sĩ"
                            showSearch
                            optionFilterProp="children"
                        >
                            {doctors.map((d) => (
                                <Select.Option key={d.id} value={d.id}>
                                    {d.full_name || d.fullName || d.username}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="startTime"
                        label="Giờ hẹn"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                    >
                        <Input type="time" />
                    </Form.Item>

                    <Form.Item
                        name="priority_level"
                        label="Mức độ ưu tiên"
                        initialValue="NORMAL"
                    >
                        <Select placeholder="Chọn mức độ">
                            <Select.Option value="NORMAL">Bình thường</Select.Option>
                            <Select.Option value="URGENT">Khẩn cấp</Select.Option>
                            <Select.Option value="EMERGENCY">Cấp cứu</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Lý do"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
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

export default AppointmentCalendar;