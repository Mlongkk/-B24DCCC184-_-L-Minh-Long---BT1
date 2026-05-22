import { landingUrl } from '@/services/base/constant';
import authService from '@/services/auth/authService';
import defaultSettings from '../../../config/defaultSettings';
import {
	FileWordOutlined,
	GlobalOutlined,
	LogoutOutlined,
	UserOutlined,
	MailOutlined,
	TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Menu, Spin, Divider, Space, Typography } from 'antd';
import { type ItemType } from 'antd/lib/menu/hooks/useItems';
import React from 'react';
import { OIDCBounder } from '../OIDCBounder';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

const { Text } = Typography;

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
	const loginOut = () => OIDCBounder?.getActions()?.dangXuat();

	// Lấy user từ authService
	const currentUser = authService.getCurrentUser();

	// Nếu chưa đăng nhập, hiển thị loading
	if (!currentUser) {
		return (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin size='small' style={{ marginLeft: 8, marginRight: 8 }} />
			</span>
		);
	}

	// Tính fullName từ user data
	const fullName = currentUser.fullName || currentUser.username || 'User';
	const lastNameChar = fullName.split(' ')?.at(-1)?.[0]?.toUpperCase() ?? '';

	// Lấy thông tin chi tiết
	const userEmail = currentUser.email || 'N/A';
	const userRole = currentUser.roles?.[0] || 'User';
	const roleDisplay = userRole === 'ADMIN' ? 'Quản trị viên' : userRole === 'DOCTOR' ? 'Bác sĩ' : 'Khách hàng';

	// Định nghĩa getMenuItems trước khi sử dụng
	const getMenuItems = (): ItemType[] => {
		const items: ItemType[] = [];

		// Thêm Office 365 link nếu được bật
		if (defaultSettings.showOffice365Link) {
			items.push({
				key: 'office',
				icon: <FileWordOutlined />,
				label: 'Office 365',
				onClick: () => window.open('https://office.com/'),
			});
		}

		// Thêm Cổng thông tin link nếu được bật
		if (defaultSettings.showLandingPortalLink) {
			items.push({
				key: 'portal',
				icon: <GlobalOutlined />,
				label: 'Cổng thông tin',
				onClick: () => window.open(landingUrl),
			});
		}

		// Thêm divider và logout
		if (items.length > 0) {
			items.push({ type: 'divider', key: 'divider' });
		}

		items.push({
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Đăng xuất',
			onClick: loginOut,
			danger: true,
		});

		return items;
	};

	// Tạo profile card content
	const profileCard = (
		<div className={styles.profileCard}>
			<div className={styles.profileHeader}>
				<Avatar
					size={64}
					icon={lastNameChar ? lastNameChar : <UserOutlined />}
					className={styles.profileAvatar}
					style={{
						backgroundColor: '#1890ff',
						fontSize: '28px',
						fontWeight: 'bold',
					}}
				/>
				<div className={styles.profileInfo}>
					<Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px', color: '#1890ff' }}>
						{fullName}
					</Text>
					<Text type='secondary' style={{ fontSize: '12px', display: 'block' }}>
						{roleDisplay}
					</Text>
				</div>
			</div>

			<Divider style={{ margin: '12px 0' }} />

			<Space direction='vertical' style={{ width: '100%' }}>
				<div className={styles.profileDetail}>
					<MailOutlined className={styles.detailIcon} />
					<Text type='secondary' style={{ fontSize: '12px' }}>
						{userEmail}
					</Text>
				</div>
				<div className={styles.profileDetail}>
					<TeamOutlined className={styles.detailIcon} />
					<Text type='secondary' style={{ fontSize: '12px' }}>
						{roleDisplay}
					</Text>
				</div>
			</Space>

			<Divider style={{ margin: '12px 0' }} />

			<Menu className={styles.profileMenu} items={getMenuItems()} />
		</div>
	);

	return (
		<>
			<HeaderDropdown overlay={profileCard}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						className={styles.avatar}
						icon={lastNameChar ? lastNameChar : <UserOutlined />}
						alt='avatar'
						style={{
							backgroundColor: '#1890ff',
							fontWeight: 'bold',
							color: '#fff',
						}}
					/>
					<span className={`${styles.name}`}>{fullName}</span>
				</span>
			</HeaderDropdown>
		</>
	);
};

export default AvatarDropdown;