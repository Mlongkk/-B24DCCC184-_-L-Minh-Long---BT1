import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
	pwa?: boolean;
	logo?: string;
	borderRadiusBase: string;
	siderWidth: number;

	secondaryColor?: string;
	backgroundColor?: string;
	textColor?: string;
	sidebarBackgroundColor?: string;

	// Header user dropdown config
	showUserDropdown?: boolean;
	showOffice365Link?: boolean;
	showLandingPortalLink?: boolean;
} = {

	// Sử dụng biến toàn cục bạn đã declare trong typings.d.ts
	primaryColor: process.env.APP_CONFIG_PRIMARY_COLOR || '#CC0D00',
	secondaryColor: process.env.APP_CONFIG_SECONDARY_COLOR || '#1890FF',
	backgroundColor: process.env.APP_CONFIG_BG_COLOR || '#F0F2F5',
	textColor: process.env.APP_CONFIG_TEXT_COLOR || '#F0F2F5',
	sidebarBackgroundColor: process.env.APP_CONFIG_SIDEBAR_BG || '#001529',

	borderRadiusBase: '6px',
	layout: 'mix',
	contentWidth: 'Fluid',
	fixedHeader: false,
	fixSiderbar: true,
	colorWeak: false,
	title: 'Bệnh viện Thú y ABC',
	pwa: false,
	logo: '/logo.png',
	iconfontUrl: '',
	headerTheme: 'dark',
	navTheme: 'realDark',
	headerHeight: 56,
	siderWidth: 220,

	// Header user dropdown config
	showUserDropdown: true,			// Hiển thị dropdown tên user
	showOffice365Link: false,		// Hiển thị link Office 365
	showLandingPortalLink: true,	// Hiển thị link Cổng thông tin
};

export default Settings;