import { landingUrl } from '@/services/base/constant';
import authService from '@/services/auth/authService';
import userService from '@/services/users/userService';
import defaultSettings from '../../../config/defaultSettings';
import {
	FileWordOutlined,
	GlobalOutlined,
	LogoutOutlined,
	UserOutlined,
	MailOutlined,
	TeamOutlined,
	EditOutlined,
} from '@ant-design/icons';
import { Avatar, Menu, Spin, Divider, Space, Typography, Button, Drawer, Form, Input, message } from 'antd';
import { type ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useState } from 'react';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

const { Text } = Typography;

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [form] = Form.useForm();
	const [submitting, setSubmitting] = useState(false);
	const initialUser = authService.getCurrentUser();
	const [user, setUser] = useState(initialUser);

	const loginOut = () => {
		authService.logout();
		localStorage.clear();
		sessionStorage.clear();
		window.location.href = '/user/login';
	};

	const handleSaveProfile = async (values: any) => {
		if (!user) return;
		try {
			setSubmitting(true);
			await userService.updateUser(user.id, {
				fullName: values.fullName,
				phone: values.phone,
			});

			const updatedUser = {
				...user,
				fullName: values.fullName,
				phone: values.phone,
			};
			setUser(updatedUser);
			localStorage.setItem('bva_user_info', JSON.stringify(updatedUser));

			message.success('Cập nhật thông tin thành công');
			setDrawerVisible(false);
			form.resetFields();
		} catch (error: any) {
			console.error('Update error:', error);
			message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
		} finally {
			setSubmitting(false);
		}
	};

	const handleOpenEditDrawer = () => {
		if (user) {
			form.setFieldsValue({
				fullName: user.fullName || '',
				phone: user.phone || '',
			});
			setDrawerVisible(true);
		}
	};

	if (!user) {
		return (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin size='small' />
			</span>
		);
	}

	const fullName = user.fullName || user.username || 'User';
	const lastNameChar = fullName.split(' ')?.at(-1)?.[0]?.toUpperCase() ?? '';
	const userEmail = user.email || 'N/A';
	const userRole = user.roles?.[0] || 'User';
	const roleDisplay = userRole === 'ADMIN' ? 'Quản trị viên' : userRole === 'DOCTOR' ? 'Bác sĩ' : 'Khách hàng';

	const getMenuItems = (): ItemType[] => {
		const items: ItemType[] = [];

		if (defaultSettings.showOffice365Link) {
			items.push({
				key: 'office',
				icon: <FileWordOutlined />,
				label: 'Office 365',
				onClick: () => window.open('https://office.com/'),
			});
		}

		if (defaultSettings.showLandingPortalLink) {
			items.push({
				key: 'portal',
				icon: <GlobalOutlined />,
				label: 'Cổng thông tin',
				onClick: () => window.open(landingUrl),
			});
		}

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

	const profileCard = (
		<div className={styles.profileCard}>
			<div className={styles.profileHeader}>
				<Avatar
					size={64}
					icon={lastNameChar ? lastNameChar : <UserOutlined />}
					className={styles.profileAvatar}
				/>
				<div className={styles.profileInfo}>
					<span className={styles.nameText}>{fullName}</span>
					<span className={styles.roleText}>{roleDisplay}</span>
				</div>
			</div>

			<Divider style={{ margin: '12px 0' }} />

			{/* Thay Space bằng div container thường để tối ưu flexbox */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
				<div className={styles.profileDetail}>
					<MailOutlined className={styles.detailIcon} />
					<span className={styles.detailText}>{userEmail}</span>
				</div>
				<div className={styles.profileDetail}>
					<TeamOutlined className={styles.detailIcon} />
					<span className={styles.detailText}>{roleDisplay}</span>
				</div>
			</div>

			<Divider style={{ margin: '12px 0' }} />

			<Button
				block
				type='primary'
				icon={<EditOutlined />}
				onClick={handleOpenEditDrawer}
				className={styles.editButton}
			>
				Sửa thông tin
			</Button>

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
					/>
					<span className={styles.name}>{fullName}</span>
				</span>
			</HeaderDropdown>

			<Drawer
				title='Chỉnh sửa thông tin cá nhân'
				placement='right'
				onClose={() => {
					setDrawerVisible(false);
					form.resetFields();
				}}
				visible={drawerVisible}
				width={480}
			>
				<Form
					form={form}
					layout='vertical'
					onFinish={handleSaveProfile}
				>
					<div className={styles.drawerHeaderBanner}>
						<Avatar
							size={80}
							icon={lastNameChar ? lastNameChar : <UserOutlined />}
							className={styles.drawerAvatar}
						/>
						<div>
							<h3 className={styles.drawerTitle}>{fullName}</h3>
							<p className={styles.drawerSubtitle}>{userEmail}</p>
						</div>
					</div>

					<Form.Item
						label='Họ tên'
						name='fullName'
						rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
					>
						<Input placeholder="Nhập họ và tên đầy đủ" />
					</Form.Item>

					<Form.Item
						label='Điện thoại'
						name='phone'
						rules={[
							{
								pattern: /^0\d{9,10}$/,
								message: 'Số điện thoại phải bắt đầu bằng 0 và có từ 10 đến 11 chữ số',
							},
						]}
					>
						<Input placeholder="Nhập số điện thoại liên hệ" />
					</Form.Item>

					<div className={styles.drawerFooter}>
						<Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
						<Button type='primary' htmlType='submit' loading={submitting}>
							Lưu thay đổi
						</Button>
					</div>
				</Form>
			</Drawer>
		</>
	);
};

export default AvatarDropdown;