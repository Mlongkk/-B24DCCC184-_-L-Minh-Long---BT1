import React, { useRef, useEffect, useState } from 'react';
import { Row, Col, Button, Spin, Card, Avatar, Statistic } from 'antd';
import {
    HeartOutlined,
    CalendarOutlined,
    FileTextOutlined,
    UserOutlined,
    ArrowRightOutlined,
    MailOutlined,
    PhoneOutlined,
    SmileOutlined,
    CheckCircleOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import { useAuth } from '@/hooks/useAuthRedirect';
import styles from './CustomerDashboard.less';

/**
 * Trang chủ cao cấp cho khách hàng (CUSTOMER) - Đầy đủ hiệu ứng Scroll Reveal
 */
const CustomerDashboard: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const fullName = user?.fullName || 'Khách hàng';
    const lastNameChar = fullName ? fullName.trim().split(' ').pop()?.charAt(0).toUpperCase() : null;

    // Refs cho từng Section để kích hoạt hiệu ứng khi cuộn tới
    const menuSectionRef = useRef<HTMLElement>(null);
    const articlesSectionRef = useRef<HTMLElement>(null);
    const infoSectionRef = useRef<HTMLElement>(null);

    const [menuVisible, setMenuVisible] = useState(false);
    const [articlesVisible, setArticlesVisible] = useState(false);
    const [infoVisible, setInfoVisible] = useState(false);

    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1, // Kích hoạt sớm hơn một chút khi 10% section chạm rìa màn hình
            rootMargin: '-40px 0px -40px 0px', // Tạo biên an toàn ở cả trên và dưới để tránh giật lag khi cuộn nhanh
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Cập nhật trạng thái động: Vào màn hình thì hiện (true), ra khỏi màn hình thì ẩn (false)
                if (entry.target === menuSectionRef.current) {
                    setMenuVisible(entry.isIntersecting);
                } else if (entry.target === articlesSectionRef.current) {
                    setArticlesVisible(entry.isIntersecting);
                } else if (entry.target === infoSectionRef.current) {
                    setInfoVisible(entry.isIntersecting);
                }
            });
        }, observerOptions);

        // Kích hoạt theo dõi các section
        if (menuSectionRef.current) observer.observe(menuSectionRef.current);
        if (articlesSectionRef.current) observer.observe(articlesSectionRef.current);
        if (infoSectionRef.current) observer.observe(infoSectionRef.current);

        // Không hủy observe giữa chừng để hiệu ứng ẩn/hiện lặp đi lặp lại khi cuộn lên/xuống
        return () => {
            if (menuSectionRef.current) observer.unobserve(menuSectionRef.current);
            if (articlesSectionRef.current) observer.unobserve(articlesSectionRef.current);
            if (infoSectionRef.current) observer.unobserve(infoSectionRef.current);
        };
    }, []);

    const menuItems = [
        {
            title: 'Quản lý thú cưng',
            description: 'Thêm, cập nhật hoặc theo dõi hồ sơ sức khỏe thú cưng của bạn dễ dàng.',
            icon: <HeartOutlined />,
            path: '/my-pets',
            colorClass: styles.petCard,
        },
        {
            title: 'Đặt lịch khám',
            description: 'Chủ động đặt lịch hẹn trực tuyến với các bác sĩ thú y giàu kinh nghiệm.',
            icon: <CalendarOutlined />,
            path: '/appointments/booking',
            colorClass: styles.bookingCard,
        },
        {
            title: 'Lịch hẹn của tôi',
            description: 'Xem lại toàn bộ lịch sử lịch hẹn khám và quản lý trạng thái sắp tới.',
            icon: <FileTextOutlined />,
            path: '/my-appointments',
            colorClass: styles.historyCard,
        }
    ];

    const tipsArticles = [
        {
            title: 'Chế độ dinh dưỡng hoàn hảo cho thú cưng vào mùa hè',
            tag: 'Sức khỏe',
            date: '26 Tháng 05, 2026',
            image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60'
        },
        {
            title: 'Lịch tiêm phòng bắt buộc cho chó mèo dưới 1 tuổi',
            tag: 'Y tế',
            date: '24 Tháng 05, 2026',
            image: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=500&auto=format&fit=crop&q=60'
        },
        {
            title: 'Dấu hiệu nhận biết bé cưng của bạn đang bị stress',
            tag: 'Tâm lý',
            date: '20 Tháng 05, 2026',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60'
        }
    ];

    return (
        <Spin spinning={false}>
            <div className={styles.customerDashboard}>
                {/* Welcome Hero Section */}
                <section
                    className={styles.welcomeSection}
                    style={{
                        // Khối lớn co nhỏ nhẹ và mờ dần khi cuộn chuột đi qua
                        transform: `scale(${Math.max(0.95, 1 - scrollY / 4000)})`,
                        opacity: Math.max(0.7, 1 - scrollY / 800)
                    }}
                >
                    <div className={styles.container}>
                        <Row gutter={[40, 40]} align="middle" style={{ position: 'relative', zIndex: 2 }}>
                            <Col xs={24} lg={14} className={styles.welcomeContent}>
                                <div className={styles.welcomeBadge}>
                                    <span className={styles.badgeDot}></span>
                                    Không gian chăm sóc thú cưng toàn diện
                                </div>
                                <h1 className={styles.welcomeTitle}>
                                    Xin chào, <em>{fullName}!</em>
                                </h1>
                                <p className={styles.welcomeDesc}>
                                    Chào mừng bạn trở lại với Bệnh viện Thú y ABC. Nơi mang đến những giải pháp chăm sóc sức khỏe và đặt lịch hẹn tối ưu nhất cho người bạn nhỏ.
                                </p>
                            </Col>

                            <Col xs={24} lg={10} className={styles.welcomeVisualCol}>
                                <div
                                    className={styles.welcomeVisual}
                                    style={{
                                        // Khối Avatar di chuyển chậm lại một chút khi scroll
                                        transform: `translateY(${scrollY * 0.1}px)`
                                    }}
                                >
                                    <div className={styles.welcomeCircle}>
                                        <Avatar className={styles.avatar} icon={lastNameChar ? null : <UserOutlined />}>
                                            {lastNameChar}
                                        </Avatar>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Hình nền chú thú cưng được thêm hiệu ứng Parallax trượt mượt mà */}
                        <img
                            style={{
                                maxWidth: '30%',
                                maxHeight: '15%',
                                // Chú thú cưng sẽ trồi lên nhẹ tạo hiệu ứng layer đè lên nền
                                transform: `translateY(${scrollY * -0.15}px)`
                            }}
                            src="https://png.pngtree.com/png-clipart/20240610/original/pngtree-nice-pet-on-transparent-background-png-image_15296344.png"
                            alt="Welcome"
                            className={styles.welcomeBg}
                        />
                    </div>
                </section>

                {/* SECTION 1: Main Menu Cards (Scroll Reveal) */}
                <section className={`${styles.menuSection} ${menuVisible ? styles.visible : ''}`} ref={menuSectionRef}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Chức năng chính</h2>
                            <p className={styles.sectionDesc}>Mọi tiện ích cần thiết để đồng hành cùng sức khỏe thú cưng của bạn</p>
                        </div>

                        <Row gutter={[24, 24]}>
                            {menuItems.map((item, index) => (
                                <Col xs={24} sm={24} md={12} lg={8} key={item.path}>
                                    <Card
                                        hoverable
                                        className={`${styles.menuCard} ${item.colorClass}`}
                                        onClick={() => history.push(item.path)}
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                    >
                                        <div className={styles.menuCardIcon}>
                                            {item.icon}
                                        </div>
                                        <h3 className={styles.menuCardTitle}>{item.title}</h3>
                                        <p className={styles.menuCardDesc}>{item.description}</p>
                                        <Button type="text" className={styles.menuCardBtn} icon={<ArrowRightOutlined />}>
                                            Truy cập ngay
                                        </Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </section>

                {/* SECTION 2: Cẩm nang chăm sóc (Thêm mới để kéo dài trang + Tăng tính tương tác) */}
                <section className={`${styles.articlesSection} ${articlesVisible ? styles.visible : ''}`} ref={articlesSectionRef}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Góc cẩm nang thú y</h2>
                            <p className={styles.sectionDesc}>Kinh nghiệm và kiến thức bổ ích từ các chuyên gia hàng đầu</p>
                        </div>

                        <Row gutter={[24, 24]}>
                            {tipsArticles.map((article, index) => (
                                <Col xs={24} sm={12} lg={8} key={index}>
                                    <Card
                                        hoverable
                                        className={styles.articleCard}
                                        cover={<img alt="thumb" src={article.image} className={styles.articleImg} />}
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                    >
                                        <span className={styles.articleTag}>{article.tag}</span>
                                        <h4 className={styles.articleTitle}>{article.title}</h4>
                                        <div className={styles.articleFooter}>
                                            <span>{article.date}</span>
                                            <Button type="link" icon={<ReadOutlined />}>Đọc tiếp</Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </section>

                {/* SECTION 3: Account Info & Support (Cuối trang) */}
                <section className={`${styles.infoSection} ${infoVisible ? styles.visible : ''}`} ref={infoSectionRef}>
                    <div className={styles.container}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <Card className={styles.infoCard} title="Thông tin tài khoản" bordered={false}>
                                    <div className={styles.infoList}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Chủ hộ:</span>
                                            <span className={styles.infoValue}>{user?.fullName || '-'}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Liên hệ Email:</span>
                                            <span className={styles.infoValue}>{user?.email || '-'}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Cấp bậc thành viên:</span>
                                            <span className={styles.infoValueBadge}>Khách hàng Thân thiết</span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card className={styles.infoCard} title="Trung tâm hỗ trợ 24/7" bordered={false}>
                                    <p className={styles.helpText}>
                                        Đội ngũ CSKH và các bác sĩ túc trực luôn sẵn sàng đồng hành khi bạn cần trợ giúp hoặc tư vấn khẩn cấp:
                                    </p>
                                    <div className={styles.helpLinks}>
                                        <a href="mailto:support@benhnvienabc.com" className={styles.helpLinkItem}>
                                            <span className={styles.helpIcon}><MailOutlined /></span>
                                            <div className={styles.helpDetails}>
                                                <span className={styles.helpLabel}>Gửi Email yêu cầu</span>
                                                <span className={styles.helpData}>support@benhnvienabc.com</span>
                                            </div>
                                        </a>
                                        <a href="tel:+84123456789" className={styles.helpLinkItem}>
                                            <span className={styles.helpIcon}><PhoneOutlined /></span>
                                            <div className={styles.helpDetails}>
                                                <span className={styles.helpLabel}>Hotline khẩn cấp</span>
                                                <span className={styles.helpData}>+84 (0) 123 456 789</span>
                                            </div>
                                        </a>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </section>
            </div>
        </Spin>
    );
};

export default CustomerDashboard;