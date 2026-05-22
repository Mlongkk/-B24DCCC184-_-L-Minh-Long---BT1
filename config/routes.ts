

export default [
	{
		path: '/',
		component: './RootPage',
		name: 'Trang chủ',
		icon: 'HomeOutlined',
		hideInMenu: false,
	},
	// ===== Authentication Routes =====
	{
		path: '/auth',
		layout: false,
		routes: [
			{
				path: '/auth/login',
				layout: false,
				name: 'login',
				component: './Auth/LoginPage',
			},
			{
				path: '/auth/register',
				layout: false,
				name: 'register',
				component: './Auth/RegisterPage',
			},
			{
				path: '/auth/callback',
				layout: false,
				name: 'auth-callback',
				component: './Auth/AuthCallbackPage',
			},
			{
				path: '/auth',
				redirect: '/auth/login',
			},
		],
	},

	// Keep backward compatibility
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				redirect: '/auth/login',
			},
			{
				path: '/user',
				redirect: '/auth/login',
			},
		],
	},

	// ===== BenhVienABC Admin/Doctor Routes =====
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './Dashboard/Dashboard',
		icon: 'DashboardOutlined',
	},

	// {
	// 	path: '/customers',
	// 	name: 'Quản lý khách hàng',
	// 	component: './Customers/CustomerList',
	// 	icon: 'UserOutlined',
	// },

	{
		path: '/pets',
		name: 'Quản lý thú cưng',
		component: './Pets/PetList',
		icon: 'TeamOutlined',
	},

	{
		path: '/appointments',
		name: 'Quản lý lịch hẹn',
		icon: 'CalendarOutlined',
		routes: [
			{
				path: '/appointments/calendar',
				name: 'Lịch hẹn',
				component: './Appointments/AppointmentCalendar',
			},
			{
				path: '/appointments/booking',
				name: 'Đặt lịch',
				component: './Appointments/AppointmentBooking',
			},
		],
	},

	{
		path: '/medical-records',
		name: 'Quản lý bệnh án',
		component: './MedicalRecords/MedicalRecordsTimeline',
		icon: 'FileTextOutlined',
	},
	{
		path: '/users',
		name: 'Quản lý người dùng',
		component: './Users/UserList',
		icon: 'TeamOutlined',
	},


	// ===== Customer Routes =====
	// Redirect /customer-dashboard → / (HomePage sẽ render CustomerDashboard dựa trên role)
	{
		path: '/customer-dashboard',
		redirect: '/',
	},

	// ===== Error & Fallback Routes =====
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/404',
		component: './exception/404',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
