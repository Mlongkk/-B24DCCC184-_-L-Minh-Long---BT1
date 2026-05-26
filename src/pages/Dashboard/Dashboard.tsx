import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Empty, Spin, Select } from 'antd';
import Trangchu from '../TrangChu';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import dashboardService, { DashboardStats } from '@/services/dashboard/dashboardService';
import authService from '@/services/auth/authService';
import { Permission_Codes } from '@/models';
import styles from './Dashboard.less';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('month');

    const canViewDashboard = authService.hasPermission(Permission_Codes.DASHBOARD_VIEW);

    useEffect(() => {
        if (canViewDashboard) {
            fetchDashboardData();
        }
    }, [canViewDashboard, timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (!canViewDashboard) {
        return (
            <Card>
                <Empty description="Bạn không có quyền xem dashboard" />
            </Card>
        );
    }

    if (loading) {
        return (
            <div>
                <Trangchu />
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
                        Đang tải dữ liệu dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <Card>
                <Spin size="large" />
            </Card>
        );
    }

    // Prepare chart data from API response
    const appointmentStatusData = (stats.appointments?.byStatus || stats.appointmentStatusDistribution || []).map((item: any) => ({
        name: item.status,
        value: item._count || item.count,
    })).filter((item: any) => item.value > 0);

    const petSpeciesData = (stats.pets?.topSpecies || stats.petSpeciesDistribution || []).map((item: any) => ({
        name: item.species,
        value: item._count || item.count,
    })).filter((item: any) => item.value > 0);

    // Calculate completed appointments from status distribution
    const completedCount = stats.completedAppointments || 0;

    // Calculate pending appointments from status distribution
    const pendingCount = stats.pendingAppointments || 0;

    // Mock data for monthly appointments - will be updated when separate endpoint is available
    const monthlyAppointments = (stats.appointmentsByMonth || [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: stats.totalAppointments || 0 },
    ]).map((item: any) => ({
        month: item.month,
        appointments: item.count,
    }));

    return (
        <div>
            <Trangchu />
            <div className={styles.container}>
                {/* Header */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            value={timeRange}
                            onChange={setTimeRange}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="day">Hôm nay</Select.Option>
                            <Select.Option value="week">Tuần này</Select.Option>
                            <Select.Option value="month">Tháng này</Select.Option>
                            <Select.Option value="year">Năm này</Select.Option>
                        </Select>
                    </Col>
                </Row>

                {/* Key Statistics */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Tổng khách hàng"
                                value={stats.totalCustomers || 0}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Tổng thú cưng"
                                value={stats.totalPets || 0}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Lịch hẹn tháng này"
                                value={stats.totalAppointments || 0}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Hoàn thành"
                                value={completedCount}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                                suffix={`/ ${stats.totalAppointments || 0}`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={16}>
                    {/* Appointment Trends */}
                    <Col xs={24} lg={12}>
                        <Card title="Xu hướng lịch hẹn" loading={loading}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyAppointments}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="appointments"
                                        stroke="#1890ff"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    {/* Pet Species Distribution */}
                    <Col xs={24} lg={12}>
                        <Card title="Phân bố loài thú cưng" loading={loading}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={petSpeciesData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {petSpeciesData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 24 }}>
                    {/* Appointment Status Distribution */}
                    <Col xs={24} lg={12}>
                        <Card title="Trạng thái lịch hẹn" loading={loading}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={appointmentStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#1890ff" name="Số lượng" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    {/* Monthly Appointments (Bar Chart) */}
                    <Col xs={24} lg={12}>
                        <Card title="Lịch hẹn theo tháng" loading={loading}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyAppointments}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="appointments" fill="#52c41a" name="Số lịch hẹn" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Additional Info */}
                <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col xs={24}>
                        <Card title="Thông tin bổ sung" loading={loading}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                            {pendingCount}
                                        </div>
                                        <div style={{ color: '#999' }}>Lịch hẹn chờ xác nhận</div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                            {stats.upcomingAppointments || 0}
                                        </div>
                                        <div style={{ color: '#999' }}>Lịch hẹn sắp tới</div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                                            {stats.activeVeterinarians || 0}
                                        </div>
                                        <div style={{ color: '#999' }}>Bác sĩ thú y hoạt động</div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff7a45' }}>
                                            {stats.totalAppointments ?
                                                ((completedCount / (stats.totalAppointments || 1)) * 100).toFixed(1)
                                                : '0'
                                            }%
                                        </div>
                                        <div style={{ color: '#999' }}>Tỷ lệ hoàn thành</div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>

    );
};

export default Dashboard;
