import React from 'react';
import authService from '@/services/auth/authService';
import CustomerDashboard from './CustomerDashboard/CustomerDashboard';
import Trangchu from './TrangChu';

/**
 * Trang chủ chính - hiển thị dashboard khác nhau dựa trên role
 * - Admin/VET (Doctor): Hiển thị Dashboard (quản lý hệ thống)
 * - Customer: Hiển thị CustomerDashboard (thông tin thú cưng, lịch hẹn)
 */
const HomePage: React.FC = () => {
    const user = authService.getCurrentUser();

    // Nếu user là ADMIN hoặc VET (DOCTOR) → Dashboard
    if (user && (user.roles.includes('ADMIN') || user.roles.includes('VET'))) {
        return <Trangchu />;
    }

    // Default: CustomerDashboard
    return <CustomerDashboard />;
};

export default HomePage;
