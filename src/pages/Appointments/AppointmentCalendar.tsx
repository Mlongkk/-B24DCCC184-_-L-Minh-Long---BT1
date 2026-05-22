import React, { useState, useEffect } from 'react';
import {
    Card,
    Calendar,
    Badge,
    Modal,
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
    Divider,
    TimePicker,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import appointmentService from '@/services/appointments/appointmentService';
import customerService from '@/services/customers/customerService';
import petService from '@/services/pets/petService';
import authService from '@/services/auth/authService';
import { Appointment, Customer, Pet, Permission_Codes } from '@/models';
import styles from './AppointmentCalendar.less';

dayjs.locale('vi');

const AppointmentCalendar: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const canCreate = authService.hasPermission(Permission_Codes.APPOINTMENT_CREATE);
    const canEdit = authService.hasPermission(Permission_Codes.APPOINTMENT_UPDATE);
    const canDelete = authService.hasPermission(Permission_Codes.APPOINTMENT_DELETE);

    useEffect(() => {
        fetchAppointments();
        fetchCustomers();
        fetchPets();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getAppointments({ pageSize: 1000 });
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

    const getDateAppointments = (date: Dayjs): Appointment[] => {
        return appointments.filter(
            (apt) =>
                dayjs(apt.appointmentDate).format('YYYY-MM-DD') ===
                date.format('YYYY-MM-DD'),
        );
    };

    const getDateContent = (date: Dayjs) => {
        const dateAppointments = getDateAppointments(date);
        if (dateAppointments.length === 0) return null;

        const statusMap: any = {
            PENDING: 'default',
            CONFIRMED: 'processing',
            COMPLETED: 'success',
            CANCELLED: 'error',
        };

        return (
            <div style={{ fontSize: 12 }}>
                {dateAppointments.slice(0, 2).map((apt) => (
                    <div key={apt.id}>
                        <Badge
                            status={statusMap[apt.status]}
                            text={`${apt.customerName || 'N/A'} - ${apt.startTime}`}
                        />
                    </div>
                ))}
                {dateAppointments.length > 2 && (
                    <div style={{ color: '#999' }}>+{dateAppointments.length - 2} khác</div>
                )}
            </div>
        );
    };

    const handleDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
    };

    const handleNewAppointment = () => {
        form.setFieldValue('appointmentDate', selectedDate);
        form.resetFields(['customerId', 'petId', 'startTime', 'endTime', 'reason']);
        setSelectedAppointment(null);
        setDrawerVisible(true);
    };

    const handleSaveAppointment = async (values: any) => {
        try {
            setLoading(true);
            if (selectedAppointment) {
                await appointmentService.updateAppointment(selectedAppointment.id, values);
                message.success('Cập nhật lịch hẹn thành công');
            } else {
                await appointmentService.createAppointment(values);
                message.success('Tạo lịch hẹn thành công');
            }
            setDrawerVisible(false);
            fetchAppointments();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi lưu lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        try {
            await appointmentService.deleteAppointment(appointmentId);
            message.success('Xóa lịch hẹn thành công');
            fetchAppointments();
        } catch (error) {
            message.error('Lỗi khi xóa lịch hẹn');
        }
    };

    const handleConfirmAppointment = async (appointmentId: string) => {
        try {
            await appointmentService.confirmAppointment(appointmentId);
            message.success('Xác nhận lịch hẹn thành công');
            fetchAppointments();
        } catch (error) {
            message.error('Lỗi khi xác nhận lịch hẹn');
        }
    };

    const selectedDateAppointments = getDateAppointments(selectedDate);

    return (
        <div className={styles.container}>
            <Row gutter={16}>
                <Col xs={24} lg={16}>
                    <Card title="Lịch hẹn" className={styles.calendarCard}>
                        <Calendar
                            fullscreen={false}
                            value={selectedDate}
                            onChange={handleDateSelect}
                            dateCellRender={getDateContent}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={`Lịch hẹn: ${selectedDate.format('DD/MM/YYYY')}`}
                        extra={
                            canCreate && (
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={handleNewAppointment}
                                >
                                    Thêm
                                </Button>
                            )
                        }
                    >
                        {selectedDateAppointments.length === 0 ? (
                            <Empty description="Không có lịch hẹn nào" />
                        ) : (
                            <List
                                dataSource={selectedDateAppointments}
                                renderItem={(appointment) => (
                                    <List.Item
                                        key={appointment.id}
                                        extra={
                                            <Space size="small">
                                                {canEdit && appointment.status === 'PENDING' && (
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        onClick={() => handleConfirmAppointment(appointment.id)}
                                                    >
                                                        Xác nhận
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => handleDeleteAppointment(appointment.id)}
                                                    />
                                                )}
                                            </Space>
                                        }
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar style={{ backgroundColor: '#87d068' }}>A</Avatar>}
                                            title={
                                                <div>
                                                    <Tag color={appointment.status === 'CONFIRMED' ? 'green' : 'default'}>
                                                        {appointment.status}
                                                    </Tag>
                                                    <span>{appointment.customerName}</span>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <p>
                                                        🐾 {appointment.petName} - {appointment.reason}
                                                    </p>
                                                    <p>⏰ {appointment.startTime} - {appointment.endTime}</p>
                                                </div>
                                            }
                                        />
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
                open={drawerVisible}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveAppointment}
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
                        name="startTime"
                        label="Giờ bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng nhập giờ' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="Giờ kết thúc"
                        rules={[{ required: true, message: 'Vui lòng nhập giờ' }]}
                    >
                        <TimePicker format="HH:mm" />
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
