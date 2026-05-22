import { useEffect } from 'react';
import { useHistory, useLocation } from 'umi';
import authService from '@/services/auth/authService';

/**
 * Utility function - Lấy dashboard path dựa trên user role
 * Tất cả roles sẽ redirect về '/' (HomePage sẽ render dashboard phù hợp)
 */
export const getDashboardPath = (): string => {
    const user = authService.getCurrentUser();

    if (!user) {
        return '/auth/login';
    }

    // Tất cả user roles (ADMIN, VET, CUSTOMER) → home page
    // HomePage sẽ tự động detect role và render dashboard phù hợp
    return '/';
};

/**
 * Hook để handle redirect dựa trên authentication và role
 * - Nếu chưa login → redirect đến /auth/login
 * - Nếu đã login → redirect dựa trên role:
 *   - ADMIN/VET (doctor) → /dashboard
 *   - CUSTOMER → /customer-dashboard
 */
export const useAuthRedirect = (requiredRoles?: string[]) => {
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const user = authService.getCurrentUser();

        // Nếu chưa login
        if (!user) {
            // Không redirect từ /auth/login hoặc /auth/callback để tránh loop
            if (!location.pathname.startsWith('/auth')) {
                history.push('/auth/login');
            }
            return;
        }

        // Nếu có yêu cầu role cụ thể
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRequiredRole = requiredRoles.some((role) =>
                user.roles.includes(role)
            );
            if (!hasRequiredRole) {
                // Redirect đến trang khác nếu không có role
                const defaultPath = getDashboardPath();
                history.push(defaultPath);
                return;
            }
        }
    }, []);
};

/**
 * Hook để lấy redirect path dựa trên user role
 * @deprecated Sử dụng getDashboardPath() function thay vì hook này
 */
export const useGetDashboardPath = (): string => {
    return getDashboardPath();
};

/**
 * Hook để kiểm tra authentication status
 */
export const useAuth = () => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    const isDashboard = user?.roles.includes('ADMIN') || user?.roles.includes('VET');
    const isCustomer = user?.roles.includes('CUSTOMER');

    return {
        user,
        isAuthenticated,
        isDashboard,
        isCustomer,
        hasRole: (role: string) => user?.roles.includes(role) || false,
    };
};
