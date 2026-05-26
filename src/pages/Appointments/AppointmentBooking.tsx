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
    Space,
    Modal,
    Spin,
    Radio,
    Result,
    Descriptions,
    Badge,
    Divider,
} from 'antd';
import {
    CheckCircleOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    InfoCircleOutlined,
    SmileOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import moment from 'moment';
import appointmentService from '@/services/appointments/appointmentService';
import petService from '@/services/pets/petService';
import userService from '@/services/users/userService';
import authService from '@/services/auth/authService';
import { Pet } from '@/models';
import styles from './AppointmentBooking.less';

const { TextArea } = Input;

const AppointmentBooking: React.FC = () => {
    const [step, setStep] = useState(0);
    const [form] = Form.useForm();
    const [allPets, setAllPets] = useState<Pet[]>([]);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);
    const [selectedPet, setSelectedPet] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [petsLoading, setPetsLoading] = useState(false);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [appointmentId, setAppointmentId] = useState('');
    const [formChanged, setFormChanged] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setPetsLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                message.error('Bạn chưa đăng nhập');
                return;
            }
            const userId = currentUser.id;

            const petRes = await petService.getPets({ pageSize: 1000 });
            const petData = petRes?.data || [];
            const myPets = petData.filter(
                (pet: any) => pet.ownerId === userId || pet.owner?.id === userId
            );

            setAllPets(myPets);
            fetchDoctors();
        } catch (error: any) {
            console.error(error);
            message.error(error?.message || 'Lỗi khi tải dữ liệu thú cưng');
        } finally {
            setPetsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            setDoctorsLoading(true);
            const response = await userService.getUsers({ role: 'DOCTOR' as any });
            if (response.data) {
                setAllDoctors(response.data);
            }
        } catch (error) {
            console.error('Error fetching doctors', error);
            message.error('Lỗi khi tải danh sách bác sĩ');
        } finally {
            setDoctorsLoading(false);
        }
    };

    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = form.getFieldsValue(['reason', 'priority_level']);
            const appointmentDateTime = moment(
                `${selectedDate} ${selectedTime}`,
                'YYYY-MM-DD HH:mm'
            ).utc().toISOString();

            const appointment = await appointmentService.createAppointment({
                pet_id: selectedPet,
                doctor_id: selectedDoctor,
                appointment_date: appointmentDateTime,
                reason: values.reason,
                priority_level: values.priority_level,
            });

            setAppointmentId(appointment.id);
            setSuccessVisible(true);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi đặt lịch');
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 0: return !!selectedPet;
            case 1: return !!selectedDate;
            case 2: return selectedTime && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(selectedTime);
            case 3: return form.getFieldValue('reason') && form.getFieldValue('priority_level') && form.getFieldValue('doctor_id');
            default: return false;
        }
    };

    const steps = [
        { title: 'Thú cưng', icon: <SmileOutlined /> },
        { title: 'Ngày khám', icon: <CalendarOutlined /> },
        { title: 'Giờ khám', icon: <ClockCircleOutlined /> },
        { title: 'Thông tin', icon: <InfoCircleOutlined /> },
        { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
    ];

    const getPriorityBadge = (level: string) => {
        switch (level) {
            case 'EMERGENCY': return <Badge status="error" text="Cấp cứu" />;
            case 'URGENT': return <Badge status="warning" text="Khẩn cấp" />;
            default: return <Badge status="processing" text="Bình thường" />;
        }
    };

    // Khung giờ gợi ý giúp nâng tầm trải nghiệm đặt lịch (UX)
    const suggestedTimes = ['08:30', '09:15', '10:00', '14:00', '14:45', '15:30'];

    return (
        <div className={styles.container}>
            <Row justify="center">
                <Col xs={24} sm={28} md={26} lg={28} xl={26}>
                    <Card className={styles.bookingCard} bordered={false}>
                        <div className={styles.headerArea}>
                            <h2 className={styles.mainTitle}>Đặt Lịch Hẹn Khám Thú Y</h2>
                            <p className={styles.subTitle}>Chăm sóc sức khỏe toàn diện cho người bạn nhỏ của bạn</p>
                        </div>

                        <Steps
                            current={step}
                            responsive={true} // Bật responsive tự động chuyển dọc nếu màn hình quá nhỏ
                            labelPlacement="vertical" // Đẩy chữ xuống dưới icon giúp UI thoáng hơn, không bị đè chữ
                            className={styles.customSteps}
                        >
                            {steps.map((item, index) => (
                                <Steps.Step key={index} title={item.title} icon={item.icon} />
                            ))}
                        </Steps>

                        <Divider style={{ margin: '24px 0' }} />

                        <div className={styles.stepContent}>
                            {/* STEP 0: CHỌN THÚ CƯNG */}
                            {step === 0 && (
                                <div>
                                    <h3 className={styles.stepTitle}>Chọn thú cưng của bạn</h3>
                                    {petsLoading ? (
                                        <div className={styles.centerSpin}><Spin size="large" tip="Đang tìm danh sách bé cưng..." /></div>
                                    ) : allPets.length === 0 ? (
                                        <Result
                                            status="warning"
                                            title="Bạn chưa đăng ký thú cưng nào"
                                            subTitle="Vui lòng thêm thông tin thú cưng vào hệ thống trước khi đặt lịch."
                                        />
                                    ) : (
                                        <Radio.Group
                                            value={selectedPet}
                                            onChange={(e) => setSelectedPet(e.target.value)}
                                            className={styles.petRadioGroup}
                                        >
                                            <Row gutter={[16, 16]}>
                                                {allPets.map((p) => (
                                                    <Col xs={24} sm={12} key={p.id}>
                                                        <Radio.Button value={p.id} className={styles.petCardButton}>
                                                            <div className={styles.petCardContent}>
                                                                <span className={styles.petName}>{p.name}</span>
                                                                <span className={styles.petSpecies}>{p.species}</span>
                                                            </div>
                                                        </Radio.Button>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Radio.Group>
                                    )}
                                </div>
                            )}

                            {/* STEP 1: CHỌN NGÀY */}
                            {step === 1 && (
                                <div className={styles.centerWrapper}>
                                    <h3 className={styles.stepTitle}>Chọn ngày khám bệnh</h3>
                                    <DatePicker
                                        size="large"
                                        className={styles.customDatePicker}
                                        open
                                        getPopupContainer={(trigger) => trigger.parentElement!}
                                        value={selectedDate ? moment(selectedDate) : null}
                                        onChange={(date) => handleSelectDate(date?.format('YYYY-MM-DD') ?? '')}
                                        disabledDate={(date) => date && date < moment().startOf('day')}
                                    />
                                    <div style={{ height: 320 }} /> {/* Tạo khoảng trống cố định cho lịch mở bung */}
                                </div>
                            )}

                            {/* STEP 2: CHỌN GIỜ */}
                            {step === 2 && (
                                <div>
                                    <h3 className={styles.stepTitle}>Chọn giờ hẹn chính xác</h3>
                                    <Form layout="vertical" form={form}>
                                        <Form.Item name="appointment_time" label="Nhập hoặc bấm chọn khung giờ bên dưới">
                                            <Input
                                                size="large"
                                                prefix={<ClockCircleOutlined style={{ color: '#bfbfbf' }} />}
                                                placeholder="Ví dụ: 14:30"
                                                value={selectedTime}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d:]/g, '');
                                                    if (value.length <= 5) setSelectedTime(value);
                                                }}
                                                maxLength={5}
                                            />
                                        </Form.Item>
                                    </Form>

                                    <div style={{ marginTop: 16 }}>
                                        <p style={{ color: '#8c8c8c', marginBottom: 8 }}>Giờ gợi ý phổ biến:</p>
                                        <Space wrap size={[8, 12]}>
                                            {suggestedTimes.map(t => (
                                                <Button
                                                    key={t}
                                                    type={selectedTime === t ? 'primary' : 'default'}
                                                    onClick={() => {
                                                        setSelectedTime(t);
                                                        form.setFieldsValue({ appointment_time: t });
                                                    }}
                                                >
                                                    {t}
                                                </Button>
                                            ))}
                                        </Space>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: THÔNG TIN CHI TIẾT */}
                            {step === 3 && (
                                <div>
                                    <h3 className={styles.stepTitle}>Cung cấp thông tin chi tiết</h3>
                                    <Form
                                        layout="vertical"
                                        form={form}
                                        onFieldsChange={() => {
                                            // Force parent component re-render when form fields change
                                            setFormChanged(prev => prev + 1);
                                        }}
                                    >
                                        <Form.Item
                                            name="doctor_id"
                                            label="Bác sĩ phụ trách chính"
                                            rules={[{ required: true, message: 'Vui lòng chỉ định bác sĩ khám' }]}
                                        >
                                            <Select
                                                size="large"
                                                placeholder="Tìm và lựa chọn bác sĩ"
                                                loading={doctorsLoading}
                                                value={selectedDoctor || undefined}
                                                onChange={(value) => {
                                                    setSelectedDoctor(value);
                                                    form.setFieldsValue({ doctor_id: value });
                                                }}
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {allDoctors.map((d) => (
                                                    <Select.Option key={d.id} value={d.id}>
                                                        <UserOutlined /> {d.full_name || d.fullName || d.username}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="priority_level"
                                            label="Mức độ khẩn cấp của bệnh trạng"
                                            rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
                                        >
                                            <Radio.Group
                                                className={styles.priorityRadio}
                                                value={selectedPriority || undefined}
                                                onChange={(e) => {
                                                    setSelectedPriority(e.target.value);
                                                    form.setFieldsValue({ priority_level: e.target.value });
                                                }}
                                            >
                                                <Radio.Button value="NORMAL">Bình thường</Radio.Button>
                                                <Radio.Button value="URGENT">Khẩn cấp</Radio.Button>
                                                <Radio.Button value="EMERGENCY">Cấp cứu</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            name="reason"
                                            label="Triệu chứng hoặc lý do khám bệnh"
                                            rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                                        >
                                            <TextArea rows={4} placeholder="Hãy miêu tả chi tiết tình trạng sức khỏe hiện tại của bé để bác sĩ chuẩn bị tốt nhất..." />
                                        </Form.Item>
                                    </Form>
                                </div>
                            )}

                            {/* STEP 4: XÁC NHẬN */}
                            {step === 4 && (
                                <div>
                                    <h3 className={styles.stepTitle}>Kiểm tra lại thông tin lịch hẹn</h3>
                                    <Descriptions bordered column={1} className={styles.confirmDesc} size="middle">
                                        <Descriptions.Item label="Thú cưng">
                                            <strong>{allPets.find(p => p.id === selectedPet)?.name}</strong> ({allPets.find(p => p.id === selectedPet)?.species})
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Thời gian dự kiến">
                                            <CalendarOutlined style={{ marginRight: 6 }} />
                                            {moment(selectedDate).format('DD/MM/YYYY')} - <ClockCircleOutlined style={{ margin: '0 6px 0 12px' }} /> {selectedTime}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Bác sĩ chuyên trách">
                                            {allDoctors.find(d => d.id === selectedDoctor)?.full_name || allDoctors.find(d => d.id === selectedDoctor)?.fullName || 'Chưa chỉ định'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mức độ ưu tiên">
                                            {getPriorityBadge(selectedPriority)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Lý do khám bệnh">
                                            {form.getFieldValue('reason')}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            )}
                        </div>

                        {/* THANH ĐIỀU HƯỚNG BUTTONS */}
                        <div className={styles.footerAction}>
                            <Space size="large">
                                {step > 0 && (
                                    <Button
                                        size="large"
                                        icon={<LeftOutlined />}
                                        onClick={() => setStep(step - 1)}
                                    >
                                        Quay lại
                                    </Button>
                                )}
                                {step < 4 ? (
                                    <Button
                                        size="large"
                                        type="primary"
                                        icon={<RightOutlined />}
                                        onClick={() => setStep(step + 1)}
                                        disabled={!isStepValid()}
                                        key={`${step}-${formChanged}`}
                                    >
                                        Tiếp theo
                                    </Button>
                                ) : (
                                    <Button
                                        size="large"
                                        type="primary"
                                        className={styles.submitBtn}
                                        onClick={handleSubmit}
                                        loading={loading}
                                    >
                                        Hoàn tất Đặt lịch
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* POPUP THÀNH CÔNG ĐÃ ĐƯỢC CHUYỂN THÀNH RESULT COMPONENT SANG XỊN */}
            <Modal
                visible={successVisible}
                footer={null}
                closable={false}
                centered
                width={540}
            >
                <Result
                    status="success"
                    title="Đặt Lịch Thành Công!"
                    subTitle={
                        <div>
                            <p>Mã số hồ sơ của bạn là: <strong style={{ color: '#1890ff', fontSize: 16 }}>{appointmentId}</strong></p>
                            <p style={{ fontSize: 13, color: '#8c8c8c' }}>Hệ thống đã gửi thông báo xác nhận tự động tới hòm thư cá nhân của bạn.</p>
                        </div>
                    }
                    extra={[
                        <Button
                            type="primary"
                            key="continue"
                            size="large"
                            onClick={() => {
                                setSuccessVisible(false);
                                setStep(0);
                                form.resetFields();
                                setSelectedPet('');
                                setSelectedDoctor('');
                                setSelectedDate('');
                                setSelectedTime('');
                                setSelectedPriority('');
                            }}
                        >
                            Tiếp tục Đặt lịch mới
                        </Button>
                    ]}
                />
            </Modal>
        </div>
    );
};

export default AppointmentBooking;