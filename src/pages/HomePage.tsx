import React from 'react';
import authService from '@/services/auth/authService';
import CustomerDashboard from './CustomerDashboard/CustomerDashboard';
// import Trangchu from './TrangChu';
import Dashboard from './Dashboard/Dashboard';
/**
 * Trang chủ chính - hiển thị dashboard khác nhau dựa trên role
 * - Admin/VET (Doctor): Hiển thị Dashboard (quản lý hệ thống)
 * - Customer: Hiển thị CustomerDashboard (thông tin thú cưng, lịch hẹn)
 */
const HomePage: React.FC = () => {
    const user = authService.getCurrentUser();

    console.log('📄 HomePage rendered');
    console.log('  Current user:', user?.username);
    console.log('  User roles:', user?.roles);

    // Nếu user là ADMIN hoặc DOCTOR → Dashboard
    if (user && (user.roles.includes('ADMIN') || user.roles.includes('DOCTOR'))) {
        console.log('🎯 Rendering admin/doctor dashboard (Dashboard)');
        return <Dashboard />;
    }

    // Default: CustomerDashboard
    console.log('🎯 Rendering customer dashboard');
    return <CustomerDashboard />;
};

export default HomePage;
