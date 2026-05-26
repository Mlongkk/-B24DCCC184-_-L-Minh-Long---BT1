import { Card } from 'antd';
import './components/style.less';
import { unitName } from '@/services/base/constant';

const TrangChu = () => {
	return (
		<Card
			className="home-card-container"
			bordered={false}
			bodyStyle={{
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>

			<div className='home-welcome'>
				<img src="logo.png" className='logo' />
				<b className='text'>Bệnh viện Thú y ABC</b>
				<br />

				<h1 className='title'>THỰC HÀNH LẬP TRÌNH WEB</h1>
				<h2 className='sub-title'>{unitName.toUpperCase()}</h2>
			</div>
		</Card>
		
	);
};

export default TrangChu;