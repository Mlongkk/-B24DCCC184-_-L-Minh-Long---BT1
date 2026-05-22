// DEPRECATED: ThongBao pages no longer available
// import ViewThongBao from '@/pages/ThongBao/components/ViewThongBao';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import NoticeIcon from './NoticeIcon';

// TODO: Replace with new NotificationCenter page

// DEPRECATED: ThongBao model no longer available
/*
const NoticeIconView = () => {
	const {
		danhSach,
		getThongBaoModel,
		total,
		page,
		limit,
		setLimit,
		loading,
		record,
		setRecord,
		unread,
		readNotificationModel,
	} = useModel('thongbao.noticeicon');
*/

// TODO: Integrate with new NotificationCenter page
const NoticeIconView = () => {
	// Placeholder: Show unread notifications count
	const [unread, setUnread] = useState(0);
	const [visiblePopup, setVisiblePopup] = useState(false);

	return (
		<>
			<NoticeIcon
				count={unread}
				onItemClick={async (item) => {
					setRecord(item);
					setVisibleDetail(true);
					setVisiblePopup(false);
				}}
				loading={loading}
				onClear={() => clearReadState()}
				clearText='Đánh dấu tất cả là đã đọc'
				viewMoreText='Tải thêm'
				onViewMore={() => {
					if (loading) return;
					setLimit(limit + 5);
				}}
				popupVisible={visiblePopup}
				clearClose
				onPopupVisibleChange={(visible) => {
					setVisiblePopup(visible);
				}}
			>
				<NoticeIcon.Tab
					tabKey='notification'
					count={total}
					list={danhSach}
					title='Thông báo'
					emptyText='Bạn đã xem tất cả thông báo'
					showClear={!!unread}
					showViewMore={danhSach.length < total}
				/>
			</NoticeIcon>

			<Modal
				width={800}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
				onCancel={() => setVisibleDetail(false)}
				visible={visibleDetail}
				okButtonProps={{ hidden: true }}
				cancelText='Đóng'
			>
				<ViewThongBao
					record={record}
					afterViewDetail={() => {
						setVisibleDetail(false);
						setVisiblePopup(false);
					}}
				/>
			</Modal>
		</>
	);
};

export default NoticeIconView;
