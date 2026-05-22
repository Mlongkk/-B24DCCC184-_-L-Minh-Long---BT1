import { landingUrl } from '@/services/base/constant';
import authService from '@/services/auth/authService';
import defaultSettings from '../../../config/defaultSettings';
import { FileWordOutlined, GlobalOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { type ItemType } from 'antd/lib/menu/hooks/useItems';
import React from 'react';
import { OIDCBounder } from '../OIDCBounder';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

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

	// Tạo menu items động dựa trên settings
	const items: ItemType[] = [
		{
			key: 'name',
			icon: <UserOutlined />,
			label: fullName,
		},
	];

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
			label: APP_CONFIG_TITLE_LANDING ?? 'Cổng thông tin',
			onClick: () => window.open(landingUrl),
		});
	}

	// Thêm divider và logout
	items.push(
		{ type: 'divider', key: 'divider' },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Đăng xuất',
			onClick: loginOut,
			danger: true,
		}
	);

	if (menu && !currentUser.roles?.includes('ADMIN')) {
		// items.splice(1, 0, {
		//   key: 'center',
		//   icon: <UserOutlined />,
		//   label: 'Trang cá nhân',
		//   onClick: () => history.push('/account/center'),
		// });
	}

	return (
		<>
			<HeaderDropdown overlay={<Menu className={styles.menu} items={items} />}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						className={styles.avatar}
						icon={lastNameChar ? lastNameChar : <UserOutlined />}
						alt='avatar'
					/>
					<span className={`${styles.name}`}>{fullName}</span>
				</span>
			</HeaderDropdown>
		</>
	);
};

export default AvatarDropdown;
