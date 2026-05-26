import type { IInitialState } from './services/base/typing';
import authService from '@/services/auth/authService';
// import { currentRole } from './utils/ip';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: IInitialState) {
	// const scopes = initialState.authorizedPermissions?.find((item) => item.rsname === currentRole)?.scopes;
	const scopes = initialState.authorizedPermissions?.map((item) => item.scopes).flat();
	const user = authService.getCurrentUser();
	const roles = user?.roles || [];

	return {
		// ===== ROLE-BASED ACCESS =====
		isAdmin: roles.includes('ADMIN'),
		isDoctor: roles.includes('DOCTOR'),
		isCustomer: roles.includes('CUSTOMER'),

		// ===== ROUTE ACCESS CONTROL =====
		// Admin: Xem tất cả
		adminOnly: roles.includes('ADMIN'),

		// Doctor: Không xem Quản lý người dùng, không xem Đặt lịch
		doctorManagement: roles.includes('DOCTOR') || roles.includes('ADMIN'),
		doctorBooking: !roles.includes('DOCTOR'), // Doctor không thấy "Đặt lịch" option

		// Customer: Chỉ xem Trang chủ + Đặt lịch
		customerAccess: roles.includes('CUSTOMER'),
		adminAndDoctor: roles.includes('ADMIN') || roles.includes('DOCTOR'),

		// ===== LEGACY ACCESS CONTROL =====
		// accessFilter: (route: any) => scopes?.includes(route?.maChucNang) || false,
		// manyAccessFilter: (route: any) => route?.listChucNang?.some((role: string) => scopes?.includes(role)) || false,
	};
}
