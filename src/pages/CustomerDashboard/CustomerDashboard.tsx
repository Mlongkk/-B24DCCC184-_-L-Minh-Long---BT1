import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Table, Space, Tag, Empty, Spin } from 'antd';
import {
    CatOutlined,
    CalendarOutlined,
    FileTextOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import { useAuth } from '@/hooks/useAuthRedirect';
import appointmentService from '@/services/appointments/appointmentService';
import petService from '@/services/pets/petService';
import styles from './CustomerDashboard.less';

interface Pet {
    id: string;
    name: string;
    species: string;
}

interface Appointment {
    id: string;
    appointmentDate: string;
    status: string;
    pet: Pet;
    service?: {
        name: string;
    };
}

/**
 * Trang chủ cho khách hàng (CUSTOMER)
 * Hiển thị:
 * - Tổng số thú cưng
 * - Lịch hẹn sắp tới
 * - Tổng số khám bệnh
 */
const CustomerDashboard: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalPets: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Lấy danh sách thú cưng của khách hàng
            const petsResponse = await petService.getAllPets();
            const pets = petsResponse.data || [];

            // Lấy danh sách lịch hẹn
            const appointmentsResponse = await appointmentService.getAll();
            const appointments = appointmentsResponse.data || [];

            // Tính toán statistics
            const upcoming = appointments.filter(
                (a: Appointment) => a.status === 'SCHEDULED'
            );
            const completed = appointments.filter(
                (a: Appointment) => a.status === 'COMPLETED'
            );

            setStats({
                totalPets: pets.length,
                upcomingAppointments: upcoming.length,
                completedAppointments: completed.length,
            });

            setUpcomingAppointments(upcoming.slice(0, 5)); // Lấy 5 lịch hẹn sắp tới
        } catch (error) {
            console.error('Error loading customer dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Thú cưng',
            dataIndex: ['pet', 'name'],
            key: 'pet',
        },
        {
            title: 'Ngày hẹn',
            dataIndex: 'appointmentDate',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Dịch vụ',
            dataIndex: ['service', 'name'],
            key: 'service',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusMap = {
                    SCHEDULED: <Tag color="blue">Đã đặt</Tag>,
                    COMPLETED: <Tag color="green">Hoàn thành</Tag>,
                    CANCELLED: <Tag color="red">Hủy</Tag>,
                };
                return statusMap[status as keyof typeof statusMap] || status;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Appointment) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => history.push(`/appointments/calendar?id=${record.id}`)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Spin spinning={loading}>
            <div className={styles.customerDashboard}>
                {/* Welcome Section */}
                <Card className={styles.welcomeCard}>
                    <h1>Chào mừng, {user?.fullName}!</h1>
                    <p>Quản lý thú cưng và lịch hẹn của bạn tại Bệnh viện Thú y ABC</p>
                </Card>

                {/* Statistics */}
                <Row gutter={[24, 24]} className={styles.statsRow}>
                    <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.statCard}>
                            <Statistic
                                title="Tổng số thú cưng"
                                value={stats.totalPets}
                                prefix={<CatOutlined />}
                            />
                            <Button
                                type="primary"
                                block
                                style={{ marginTop: 16 }}
                                icon={<PlusOutlined />}
                                onClick={() => history.push('/pets')}
                            >
                                Thêm thú cưng
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.statCard}>
                            <Statistic
                                title="Lịch hẹn sắp tới"
                                value={stats.upcomingAppointments}
                                prefix={<CalendarOutlined />}
                            />
                            <Button
                                type="primary"
                                block
                                style={{ marginTop: 16 }}
                                icon={<PlusOutlined />}
                                onClick={() => history.push('/appointments/booking')}
                            >
                                Đặt lịch mới
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.statCard}>
                            <Statistic
                                title="Khám đã hoàn thành"
                                value={stats.completedAppointments}
                                prefix={<FileTextOutlined />}
                            />
                            <Button
                                block
                                style={{ marginTop: 16 }}
                                onClick={() => history.push('/medical-records')}
                            >
                                Xem hồ sơ
                            </Button>
                        </Card>
                    </Col>
                </Row>

                {/* Upcoming Appointments */}
                <Card title="Lịch hẹn sắp tới" className={styles.appointmentsCard}>
                    {upcomingAppointments.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={upcomingAppointments}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    ) : (
                        <Empty
                            description="Không có lịch hẹn nào"
                            style={{ marginTop: 32 }}
                        />
                    )}
                </Card>
            </div>
        </Spin>
    );
};

export default CustomerDashboard;
