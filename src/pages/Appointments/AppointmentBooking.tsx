import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    message,
    Steps,
    Row,
    Col,
    Empty,
    Badge,
    Space,
    Modal,
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import appointmentService from '@/services/appointments/appointmentService';
import customerService from '@/services/customers/customerService';
import petService from '@/services/pets/petService';
import { Customer, Pet, DaySchedule } from '@/models';
import styles from './AppointmentBooking.less';

const AppointmentBooking: React.FC = () => {
    const [step, setStep] = useState(0);
    const [form] = Form.useForm();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [selectedPet, setSelectedPet] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [appointmentId, setAppointmentId] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const customerRes = await customerService.getCustomers({ pageSize: 1000 });
            setCustomers(customerRes.data);

            const petRes = await petService.getPets({ pageSize: 1000 });
            setPets(petRes.data);

            // Get available dates for next 30 days
            const startDate = dayjs().format('YYYY-MM-DD');
            const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');
            const datesRes = await appointmentService.getAvailableDates(startDate, endDate);
            setAvailableDates(datesRes);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu');
        }
    };

    const handleSelectCustomer = (customerId: string) => {
        setSelectedCustomer(customerId);
        // Filter pets by customer
        const customerPets = pets.filter((p) => p.customerId === customerId);
        setPets(customerPets);
    };

    const handleSelectDate = async (date: string) => {
        setSelectedDate(date);
        try {
            const schedule = await appointmentService.getAvailableSlots(date);
            setDaySchedule(schedule);
        } catch (error) {
            message.error('Lỗi khi tải lịch trống');
        }
    };

    const handleSelectTime = (time: string) => {
        setSelectedTime(time);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = form.getFieldsValue(['reason', 'notes']);

            const appointment = await appointmentService.createAppointment({
                customerId: selectedCustomer,
                petId: selectedPet,
                appointmentDate: selectedDate,
                startTime: selectedTime,
                endTime: dayjs(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm'),
                reason: values.reason,
                notes: values.notes,
            });

            setAppointmentId(appointment.id);
            setSuccessVisible(true);
            message.success('Đặt lịch thành công!');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi đặt lịch');
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 0:
                return selectedCustomer && selectedPet;
            case 1:
                return selectedDate;
            case 2:
                return selectedTime;
            case 3:
                return form.getFieldValue('reason');
            default:
                return false;
        }
    };

    const steps = [
        { title: 'Chọn thú cưng', description: 'Chọn chủ nhân và thú cưng' },
        { title: 'Chọn ngày', description: 'Chọn ngày khám' },
        { title: 'Chọn giờ', description: 'Chọn giờ khám' },
        { title: 'Thông tin', description: 'Thêm thông tin chi tiết' },
        { title: 'Xác nhận', description: 'Xác nhận đặt lịch' },
    ];

    return (
        <div className={styles.container}>
            <Row justify="center">
                <Col xs={24} sm={22} md={18} lg={14}>
                    <Card title="Đặt lịch hẹn khám thú y">
                        <Steps current={step} items={steps} style={{ marginBottom: 30 }} />

                        {step === 0 && (
                            <div>
                                <h3>Chọn thú cưng của bạn</h3>
                                <Form layout="vertical" form={form}>
                                    <Form.Item
                                        label="Chủ nhân"
                                        rules={[{ required: true }]}
                                    >
                                        <Select
                                            placeholder="Chọn chủ nhân"
                                            value={selectedCustomer}
                                            onChange={handleSelectCustomer}
                                        >
                                            {customers.map((c) => (
                                                <Select.Option key={c.id} value={c.id}>
                                                    {c.fullName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item label="Thú cưng" rules={[{ required: true }]}>
                                        <Select
                                            placeholder="Chọn thú cưng"
                                            value={selectedPet}
                                            onChange={setSelectedPet}
                                        >
                                            {pets.map((p) => (
                                                <Select.Option key={p.id} value={p.id}>
                                                    {p.name} ({p.species})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h3>Chọn ngày khám</h3>
                                <p style={{ color: '#999', marginBottom: 16 }}>
                                    Những ngày có dấu chấm xanh là những ngày còn trống
                                </p>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    value={selectedDate ? dayjs(selectedDate) : null}
                                    onChange={(date) => handleSelectDate(date?.format('YYYY-MM-DD') || '')}
                                    disabledDate={(date) =>
                                        !availableDates.includes(date.format('YYYY-MM-DD'))
                                    }
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h3>Chọn giờ khám</h3>
                                {daySchedule ? (
                                    <div>
                                        <Row gutter={[8, 8]}>
                                            {daySchedule.timeSlots.map((slot) => (
                                                <Col key={slot.startTime} xs={12} sm={8} md={6}>
                                                    <Button
                                                        block
                                                        type={selectedTime === slot.startTime ? 'primary' : 'default'}
                                                        disabled={!slot.available}
                                                        onClick={() => handleSelectTime(slot.startTime)}
                                                    >
                                                        {slot.startTime}
                                                    </Button>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                ) : (
                                    <Empty description="Đang tải..." />
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3>Thông tin chi tiết</h3>
                                <Form layout="vertical" form={form}>
                                    <Form.Item
                                        name="reason"
                                        label="Lý do khám"
                                        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Ví dụ: Khám tổng quát, tiêm phòng, v.v." />
                                    </Form.Item>

                                    <Form.Item
                                        name="notes"
                                        label="Ghi chú"
                                    >
                                        <Input.TextArea rows={2} placeholder="Thêm ghi chú nếu cần thiết" />
                                    </Form.Item>
                                </Form>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={{ textAlign: 'center' }}>
                                <h3>Xác nhận đặt lịch</h3>
                                <div style={{ marginTop: 20, textAlign: 'left' }}>
                                    <p><strong>Chủ nhân:</strong> {customers.find(c => c.id === selectedCustomer)?.fullName}</p>
                                    <p><strong>Thú cưng:</strong> {pets.find(p => p.id === selectedPet)?.name}</p>
                                    <p><strong>Ngày khám:</strong> {dayjs(selectedDate).format('DD/MM/YYYY')}</p>
                                    <p><strong>Giờ khám:</strong> {selectedTime}</p>
                                    <p><strong>Lý do:</strong> {form.getFieldValue('reason')}</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: 30, textAlign: 'right' }}>
                            <Space>
                                {step > 0 && (
                                    <Button onClick={() => setStep(step - 1)}>
                                        Quay lại
                                    </Button>
                                )}
                                {step < 4 ? (
                                    <Button
                                        type="primary"
                                        onClick={() => setStep(step + 1)}
                                        disabled={!isStepValid()}
                                    >
                                        Tiếp tục
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        loading={loading}
                                    >
                                        Xác nhận đặt lịch
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Success Modal */}
            <Modal
                title="Đặt lịch thành công!"
                open={successVisible}
                onOk={() => {
                    setSuccessVisible(false);
                    setStep(0);
                    form.resetFields();
                    setSelectedCustomer('');
                    setSelectedPet('');
                    setSelectedDate('');
                    setSelectedTime('');
                }}
                cancelButtonProps={{ style: { display: 'none' } }}
                okText="Tiếp tục"
            >
                <div style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                    <p>Lịch hẹn của bạn đã được đặt thành công!</p>
                    <p style={{ color: '#999' }}>Mã lịch hẹn: <strong>{appointmentId}</strong></p>
                    <p>Bạn sẽ nhận được email xác nhận trong vòng 5 phút.</p>
                </div>
            </Modal>
        </div>
    );
};

export default AppointmentBooking;
