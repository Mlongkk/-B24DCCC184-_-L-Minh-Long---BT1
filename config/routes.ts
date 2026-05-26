

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
	// Backward compatibility: /dashboard → /
	// {
	// 	path: '/dashboard',
	// 	redirect: '/',
	// },

	// {
	// 	path: '/Dashboard',
	// 	name: 'Dashboard',
	// 	component: './Dashboard/Dashboard',
	// 	icon: 'DashboardOutlined',
	// },

	// {
	// 	path: '/customers',
	// 	name: 'Quản lý khách hàng',
	// 	component: './Customers/CustomerList',
	// 	icon: 'UserOutlined',
	// },

	{
		path: '/pets',
		name: 'Quản lý thú cưng',
		icon: 'TeamOutlined',
		access: 'adminAndDoctor', // Chỉ ADMIN và DOCTOR
		routes: [
			{
				path: '/pets',
				component: './Pets/PetList',
			},
			{
				path: '/pets/:id',
				component: './Pets/PetDetail',
				hideInMenu: true,
			},
			{
				path: '/pets/edit/:id',
				component: './Pets/PetList',
				hideInMenu: true,
			},
		],
	},

	{
		path: '/appointments',
		name: 'Quản lý lịch hẹn',
		icon: 'CalendarOutlined',
		access: 'adminAndDoctor', // Chỉ ADMIN và DOCTOR thấy menu chính
		routes: [
			{
				path: '/appointments/calendar',
				name: 'Lịch hẹn',
				component: './Appointments/AppointmentCalendar',
				access: 'adminAndDoctor', // Chỉ ADMIN và DOCTOR
			},
			{
				path: '/appointments/booking',
				name: 'Đặt lịch',
				component: './Appointments/AppointmentBooking',
				access: 'doctorBooking', // Tất cả NGOẠI TRỪ DOCTOR
			},
		],
	},

	// {
	// 	path: '/medical-records',
	// 	name: 'Quản lý bệnh án',
	// 	component: './MedicalRecords/MedicalRecordsTimeline',
	// 	icon: 'FileTextOutlined',
	// },
	{
		path: '/users',
		name: 'Quản lý người dùng',
		component: './Users/UserList',
		icon: 'TeamOutlined',
		access: 'adminOnly', // Chỉ ADMIN
	},


	// ===== Customer-only Routes =====
	{
		path: '/booking',
		name: 'Đặt lịch',
		component: './Appointments/AppointmentBooking',
		icon: 'CalendarOutlined',
		access: 'customerAccess', // Chỉ CUSTOMER
	},

	{
		path: '/profile',
		name: 'Thông tin cá nhân',
		component: './CustomerDashboard/CustomerDashboard',
		icon: 'UserOutlined',
		hideInMenu: true, // Ẩn khỏi menu, chỉ truy cập trực tiếp
		access: 'customerAccess',
	},

	// ===== Customer Pet Management =====
	{
		path: '/my-pets',
		name: 'Thú cưng của tôi',
		component: './MyPets/MyPetList',
		icon: 'TeamOutlined',
		access: 'customerAccess', // Chỉ CUSTOMER
	},
	{
		path: '/my-pets/:id',
		component: './MyPets/MyPetDetail',
		hideInMenu: true,
		access: 'customerAccess',
	},

	// ===== Customer Appointments Management =====
	{
		path: '/my-appointments',
		name: 'Lịch hẹn của tôi',
		component: './Appointments/MyAppointments',
		icon: 'CalendarOutlined',
		access: 'customerAccess', // Chỉ CUSTOMER
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
