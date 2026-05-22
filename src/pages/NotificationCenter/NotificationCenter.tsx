import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Button,
    Space,
    Tag,
    Empty,
    Badge,
    Row,
    Col,
    Select,
    Spin,
    Drawer,
    Descriptions,
    message,
    Popconfirm,
} from 'antd';
import {
    DeleteOutlined,
    MailOutlined,
    BellOutlined,
    CheckOutlined,
    DeleteFilled,
    ReloadOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import notificationService from '@/services/notifications/notificationService';
import { Notification, NotificationType } from '@/models/notification';
import styles from './NotificationCenter.less';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preferenceDrawerVisible, setPreferenceDrawerVisible] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({
                isRead: filter === 'unread' ? false : undefined,
                page: 1,
                pageSize: 50,
            });
            setNotifications(response.data);
            setUnreadCount(response.unreadCount);
        } catch (error) {
            message.error('Lỗi khi tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notification: Notification) => {
        try {
            await notificationService.markAsRead(notification.id);
            setNotifications(
                notifications.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n,
                ),
            );
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            message.error('Lỗi khi đánh dấu đã đọc');
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(notifications.filter((n) => n.id !== notificationId));
            message.success('Xóa thông báo thành công');
        } catch (error) {
            message.error('Lỗi khi xóa thông báo');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            message.success('Đánh dấu tất cả đã đọc');
        } catch (error) {
            message.error('Lỗi khi đánh dấu');
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        const iconMap: any = {
            APPOINTMENT_REMINDER: '📅',
            APPOINTMENT_CONFIRMED: '✅',
            APPOINTMENT_CANCELLED: '❌',
            APPOINTMENT_RESCHEDULED: '🔄',
            MEDICAL_RECORD_CREATED: '📋',
            PRESCRIPTION_READY: '💊',
            VACCINATION_DUE: '💉',
            SYSTEM_UPDATE: '⚙️',
            URGENT_ALERT: '🚨',
        };
        return iconMap[type] || '🔔';
    };

    const getPriorityColor = (priority: string) => {
        const colorMap: any = {
            LOW: 'default',
            MEDIUM: 'gold',
            HIGH: 'orange',
            URGENT: 'red',
        };
        return colorMap[priority] || 'default';
    };

    const handleViewDetail = (notification: Notification) => {
        setSelectedNotification(notification);
        setDrawerVisible(true);
        if (!notification.isRead) {
            handleMarkAsRead(notification);
        }
    };

    return (
        <div className={styles.container}>
            <Row gutter={16}>
                <Col xs={24} lg={4}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>
                                <Badge count={unreadCount} color="#ff4d4f">
                                    <BellOutlined style={{ fontSize: 24 }} />
                                </Badge>
                            </div>
                            <p style={{ color: '#999', margin: 0 }}>Chưa đọc</p>
                            <p style={{ fontSize: 20, fontWeight: 'bold' }}>{unreadCount}</p>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={20}>
                    <Card
                        title="Thông báo"
                        extra={
                            <Space>
                                <Button icon={<ReloadOutlined />} onClick={fetchNotifications} />
                                {unreadCount > 0 && (
                                    <Button
                                        type="primary"
                                        ghost
                                        icon={<CheckOutlined />}
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Đánh dấu tất cả
                                    </Button>
                                )}
                                <Button icon={<SettingOutlined />} onClick={() => setPreferenceDrawerVisible(true)}>
                                    Cài đặt
                                </Button>
                            </Space>
                        }
                    >
                        {/* Filter */}
                        <div style={{ marginBottom: 16 }}>
                            <Select
                                value={filter}
                                onChange={setFilter}
                                style={{ width: 150 }}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="unread">Chưa đọc</Select.Option>
                            </Select>
                        </div>

                        {/* Notifications List */}
                        <Spin spinning={loading}>
                            {notifications.length === 0 ? (
                                <Empty description="Không có thông báo nào" />
                            ) : (
                                <List
                                    dataSource={notifications}
                                    renderItem={(notification) => (
                                        <List.Item
                                            className={!notification.isRead ? styles.unreadItem : ''}
                                            extra={
                                                <Space size="small">
                                                    {!notification.isRead && (
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            onClick={() => handleMarkAsRead(notification)}
                                                        >
                                                            Đánh dấu
                                                        </Button>
                                                    )}
                                                    <Popconfirm
                                                        title="Xóa thông báo?"
                                                        onConfirm={() => handleDelete(notification.id)}
                                                    >
                                                        <Button
                                                            danger
                                                            type="link"
                                                            size="small"
                                                            icon={<DeleteOutlined />}
                                                        />
                                                    </Popconfirm>
                                                </Space>
                                            }
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <div style={{ fontSize: 20 }}>
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                }
                                                title={
                                                    <div>
                                                        <span style={{ fontWeight: !notification.isRead ? 'bold' : 'normal' }}>
                                                            {notification.title}
                                                        </span>
                                                        <Space size={4} style={{ marginLeft: 8 }}>
                                                            <Tag color={getPriorityColor(notification.priority)}>
                                                                {notification.priority}
                                                            </Tag>
                                                            <Tag>{notification.category}</Tag>
                                                        </Space>
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <p style={{ margin: '4px 0' }}>{notification.message}</p>
                                                        <p style={{ color: '#999', fontSize: 12, margin: 0 }}>
                                                            {dayjs(notification.createdAt).fromNow()}
                                                        </p>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Spin>
                    </Card>
                </Col>
            </Row>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết thông báo"
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedNotification(null);
                }}
                open={drawerVisible}
                width={500}
            >
                {selectedNotification && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Tiêu đề">
                            {selectedNotification.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            {selectedNotification.message}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại">
                            {getNotificationIcon(selectedNotification.type)} {selectedNotification.type}
                        </Descriptions.Item>
                        <Descriptions.Item label="Danh mục">
                            {selectedNotification.category}
                        </Descriptions.Item>
                        <Descriptions.Item label="Độ ưu tiên">
                            <Tag color={getPriorityColor(selectedNotification.priority)}>
                                {selectedNotification.priority}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedNotification.isRead ? 'green' : 'blue'}>
                                {selectedNotification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedNotification.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>

            {/* Preferences Drawer */}
            <Drawer
                title="Cài đặt thông báo"
                placement="right"
                onClose={() => setPreferenceDrawerVisible(false)}
                open={preferenceDrawerVisible}
            >
                <p>Tính năng này sẽ được cập nhật</p>
            </Drawer>
        </div>
    );
};

export default NotificationCenter;
