import React from 'react';
import defaultSettings from '../../../config/defaultSettings';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	return (
		<div className={styles.right}>
			{/* <ModuleSwitch /> */}

			{/* <NoticeIconView /> */}

			{/* <Tooltip title='Giới thiệu chung' placement='bottom'>
				<a onClick={() => history.push('/gioi-thieu')}>
					<InfoCircleOutlined />
				</a>
			</Tooltip> */}

			{defaultSettings.showUserDropdown && <AvatarDropdown menu />}
		</div>
	);
};

export default GlobalHeaderRight;
