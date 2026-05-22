/**
 * ============================================================================
 * README: HƯỚNG DẪN SỬ DỤNG SERVICES & MODELS
 * ============================================================================
 * 
 * Dành cho Frontend Developers làm việc trên BenhVienABC
 * 
 * ============================================================================
 * 1. LƯU Ý QUAN TRỌNG
 * ============================================================================
 * 
 * ✅ DO:
 * - Dùng yarn thay vì npm (project base của thầy)
 * - Giữ nguyên Node version
 * - Chú thích bằng tiếng Việt
 * - Import tuyệt đối: @/services, @/models, @/components
 * - Kiểm tra quyền trước khi hiển thị button/menu
 * - Xử lý error với try-catch + message.error()
 * - Sử dụng TypeScript types/interfaces
 * 
 * ❌ DON'T:
 * - KHÔNG đổi Node version, Yarn version
 * - KHÔNG dùng npm install
 * - KHÔNG import relative path (../../../)
 * - KHÔNG hardcode URL API
 * - KHÔNG quên thêm Authorization header
 * - KHÔNG bỏ TypeScript types
 * 
 * ============================================================================
 * 2. SETUP BAN ĐẦU
 * ============================================================================
 * 
 * # Cài đặt dependencies
 * yarn install
 * 
 * # Chạy dev server
 * yarn dev
 * # Truy cập: http://localhost:8000
 * 
 * # Build production
 * yarn build
 * 
 * ============================================================================
 * 3. CẤU TRÚC PROJECT
 * ============================================================================
 * 
 * src/
 * ├── models/              # ← TypeScript interfaces/types
 * │   ├── auth.ts          #   User, Role, Permission
 * │   ├── customer.ts      #   Customer, CreateCustomerRequest
 * │   ├── pet.ts           #   Pet, Species, Vaccination
 * │   ├── appointment.ts   #   Appointment, TimeSlot, DaySchedule
 * │   ├── medical-record.ts #  MedicalRecord, PetVitals, Prescription
 * │   └── notification.ts  #   Notification, NotificationType
 * │
 * ├── services/            # ← Gọi API backend
 * │   ├── auth/authService.ts
 * │   ├── customers/customerService.ts
 * │   ├── pets/petService.ts
 * │   ├── appointments/appointmentService.ts
 * │   ├── medical-records/medicalRecordService.ts
 * │   ├── notifications/notificationService.ts
 * │   └── dashboard/dashboardService.ts
 * │
 * ├── pages/               # ← Giao diện chính
 * │   ├── Auth/            #   LoginPage, AuthCallbackPage
 * │   ├── Customers/       #   CustomerList
 * │   ├── Pets/            #   PetList
 * │   ├── Appointments/    #   AppointmentCalendar, AppointmentBooking
 * │   ├── MedicalRecords/  #   MedicalRecordsTimeline
 * │   ├── NotificationCenter/  # NotificationCenter
 * │   └── Dashboard/       #   Dashboard
 * │
 * ├── components/          # ← Thành phần reusable
 * │   └── Upload/FileUploader.tsx
 * │
 * ├── hooks/               # ← Custom React hooks
 * ├── styles/              # ← Global styles
 * ├── utils/               # ← Tiện ích
 * ├── DOCUMENTATION.ts     # ← TÀI LIỆU CHI TIẾT !!!
 * └── app.tsx
 * 
 * ============================================================================
 * 4. IMPORT & SỬ DỤNG SERVICES
 * ============================================================================
 * 
 * a) AUTH SERVICE - Đăng nhập, token, quyền
 * 
 * import authService from '@/services/auth/authService';
 * 
 * // Đăng nhập
 * await authService.login({
 *   username: 'admin',
 *   password: '123456',
 *   rememberMe: true
 * });
 * 
 * // Lấy thông tin user
 * const user = authService.getCurrentUser();
 * console.log(user.fullName, user.roles, user.permissions);
 * 
 * // Kiểm tra quyền
 * if (authService.hasPermission(Permission_Codes.CUSTOMER_CREATE)) {
 *   // Hiển thị nút thêm khách hàng
 * }
 * 
 * // Đăng xuất
 * await authService.logout();
 * 
 * ---
 * 
 * b) CUSTOMER SERVICE - Quản lý khách hàng
 * 
 * import customerService from '@/services/customers/customerService';
 * 
 * // Lấy danh sách khách hàng
 * const response = await customerService.getCustomers({
 *   search: 'Nguyễn',
 *   page: 1,
 *   pageSize: 10,
 *   isActive: true,
 *   sortBy: 'fullName',
 *   sortOrder: 'ASC'
 * });
 * console.log(response.data);   // Mảng Customer[]
 * console.log(response.total);  // Tổng số
 * 
 * // Lấy 1 khách hàng
 * const customer = await customerService.getCustomerById('cust-123');
 * 
 * // Tạo khách hàng
 * const newCustomer = await customerService.createCustomer({
 *   fullName: 'Nguyễn Văn A',
 *   email: 'a@example.com',
 *   phoneNumber: '0123456789',
 *   address: '123 Nguyễn Hữu Cảnh',
 *   city: 'TP.HCM',
 *   district: 'Quận 1',
 *   ward: 'Phường 1'
 * });
 * 
 * // Cập nhật khách hàng
 * await customerService.updateCustomer('cust-123', {
 *   phoneNumber: '0987654321'
 * });
 * 
 * // Xóa khách hàng
 * await customerService.deleteCustomer('cust-123');
 * 
 * // Lấy danh sách thú cưng của khách hàng
 * const pets = await customerService.getCustomerPets('cust-123');
 * 
 * // Lấy danh sách lịch hẹn của khách hàng
 * const appointments = await customerService.getCustomerAppointments('cust-123');
 * 
 * ---
 * 
 * c) PET SERVICE - Quản lý thú cưng
 * 
 * import petService from '@/services/pets/petService';
 * 
 * // Lấy danh sách thú cưng
 * const response = await petService.getPets({
 *   search: 'Max',
 *   customerId: 'cust-123',
 *   species: 'DOG',
 *   page: 1,
 *   pageSize: 10
 * });
 * 
 * // Tạo thú cưng
 * const pet = await petService.createPet({
 *   customerId: 'cust-123',
 *   name: 'Max',
 *   species: 'DOG', // DOG, CAT, BIRD, RABBIT, OTHER
 *   breed: 'Husky',
 *   dateOfBirth: '2020-01-15',
 *   weight: 25,
 *   color: 'Trắng',
 *   microchipId: 'CHIP-123'
 * });
 * 
 * // Tải ảnh lên
 * const response = await petService.uploadPetAvatar('pet-123', file);
 * console.log(response.avatarUrl); // URL ảnh
 * 
 * // Lấy lịch sử bệnh
 * const history = await petService.getPetMedicalHistory('pet-123');
 * 
 * ---
 * 
 * d) APPOINTMENT SERVICE - Quản lý lịch hẹn
 * 
 * import appointmentService from '@/services/appointments/appointmentService';
 * 
 * // Lấy danh sách lịch hẹn
 * const response = await appointmentService.getAppointments({
 *   status: 'CONFIRMED',
 *   startDate: '2026-05-01',
 *   endDate: '2026-05-31',
 *   page: 1,
 *   pageSize: 10
 * });
 * 
 * // Tạo lịch hẹn
 * const apt = await appointmentService.createAppointment({
 *   customerId: 'cust-123',
 *   petId: 'pet-456',
 *   appointmentDate: '2026-05-25',
 *   startTime: '09:00',
 *   endTime: '10:00',
 *   reason: 'Khám tổng quát',
 *   veterinarianId: 'vet-789',
 *   notes: 'Thú cưng có bệnh lịch sử...'
 * });
 * 
 * // Lấy giờ trống trong ngày
 * const schedule = await appointmentService.getAvailableSlots(
 *   '2026-05-25',
 *   'vet-789' // optional
 * );
 * console.log(schedule.timeSlots); // [{ startTime, endTime, available }]
 * 
 * // Lấy danh sách ngày còn trống
 * const dates = await appointmentService.getAvailableDates(
 *   '2026-05-21',
 *   '2026-06-20'
 * );
 * 
 * // Xác nhận lịch hẹn
 * await appointmentService.confirmAppointment('apt-123');
 * 
 * // Hủy lịch hẹn
 * await appointmentService.cancelAppointment('apt-123', 'Lý do hủy');
 * 
 * // Gửi nhắc nhở
 * await appointmentService.sendReminder('apt-123');
 * 
 * ---
 * 
 * e) MEDICAL RECORD SERVICE - Quản lý bệnh án
 * 
 * import medicalRecordService from '@/services/medical-records/medicalRecordService';
 * 
 * // Lấy danh sách bệnh án
 * const response = await medicalRecordService.getMedicalRecords({
 *   page: 1,
 *   pageSize: 10
 * });
 * 
 * // Tạo bệnh án
 * const record = await medicalRecordService.createMedicalRecord({
 *   petId: 'pet-123',
 *   visitDate: '2026-05-21',
 *   veterinarianId: 'vet-456',
 *   diagnosis: 'Viêm tai',
 *   treatment: 'Kháng sinh amoxicillin',
 *   vitals: {
 *     temperature: 38.5,
 *     heartRate: 90,
 *     weight: 25,
 *     bloodPressure: '120/80'
 *   },
 *   prescription: [
 *     {
 *       medicationName: 'Amoxicillin',
 *       dosage: '500mg',
 *       frequency: '2 lần/ngày',
 *       duration: '7 ngày'
 *     }
 *   ],
 *   notes: 'Theo dõi sự tiến triển',
 *   followUpDate: '2026-05-28'
 * });
 * 
 * // Lấy timeline lịch sử bệnh
 * const timeline = await medicalRecordService.getMedicalTimeline('pet-123');
 * console.log(timeline.records); // [{ date, type, title, description }]
 * 
 * // Tải file đính kèm (ảnh X-ray, video, v.v.)
 * const response = await medicalRecordService.uploadAttachment('record-123', file);
 * 
 * // Tải PDF bệnh án
 * const blob = await medicalRecordService.downloadAsPDF('record-123');
 * const url = window.URL.createObjectURL(blob);
 * // Sau đó: download URL
 * 
 * ---
 * 
 * f) NOTIFICATION SERVICE - Quản lý thông báo
 * 
 * import notificationService from '@/services/notifications/notificationService';
 * 
 * // Lấy danh sách thông báo
 * const response = await notificationService.getNotifications({
 *   isRead: false, // chỉ chưa đọc
 *   page: 1,
 *   pageSize: 20
 * });
 * console.log(response.unreadCount); // Số chưa đọc
 * 
 * // Lấy số thông báo chưa đọc
 * const { count } = await notificationService.getUnreadCount();
 * 
 * // Đánh dấu 1 thông báo đã đọc
 * await notificationService.markAsRead('notification-123');
 * 
 * // Đánh dấu tất cả đã đọc
 * await notificationService.markAllAsRead();
 * 
 * // Xóa thông báo
 * await notificationService.deleteNotification('notification-123');
 * 
 * ---
 * 
 * g) DASHBOARD SERVICE - Lấy dữ liệu dashboard
 * 
 * import dashboardService from '@/services/dashboard/dashboardService';
 * 
 * // Lấy thống kê
 * const stats = await dashboardService.getStats();
 * console.log(stats.totalCustomers);      // Tổng KH
 * console.log(stats.totalPets);           // Tổng thú cưng
 * console.log(stats.totalAppointments);   // Tổng lịch hẹn
 * console.log(stats.completedAppointments); // Lịch hẹn hoàn thành
 * console.log(stats.appointmentsByMonth); // Lịch hẹn theo tháng
 * 
 * // Lấy dữ liệu biểu đồ
 * const charts = await dashboardService.getChartData();
 * 
 * ============================================================================
 * 5. IMPORT & SỬ DỤNG MODELS (TYPES)
 * ============================================================================
 * 
 * import {
 *   User,
 *   Permission_Codes,
 *   Customer,
 *   Pet,
 *   Appointment,
 *   MedicalRecord,
 *   Notification
 * } from '@/models';
 * 
 * // Khi tạo component, luôn define types
 * const [customers, setCustomers] = useState<Customer[]>([]);
 * const [loading, setLoading] = useState(false);
 * 
 * // Dùng interface khi fetch data
 * const response = await customerService.getCustomers(...);
 * const customers: Customer[] = response.data;
 * 
 * ============================================================================
 * 6. ERROR HANDLING
 * ============================================================================
 * 
 * import { message } from 'antd';
 * 
 * try {
 *   const customer = await customerService.createCustomer(data);
 *   message.success('Thêm khách hàng thành công');
 * } catch (error: any) {
 *   const errorMsg = error?.response?.data?.message || 'Lỗi không xác định';
 *   message.error(errorMsg);
 *   console.error('Error creating customer:', error);
 * }
 * 
 * ============================================================================
 * 7. COMPONENT EXAMPLE
 * ============================================================================
 * 
 * import React, { useState, useEffect } from 'react';
 * import { Table, Button, message } from 'antd';
 * import customerService from '@/services/customers/customerService';
 * import authService from '@/services/auth/authService';
 * import { Customer, Permission_Codes } from '@/models';
 * 
 * const CustomerList: React.FC = () => {
 *   const [customers, setCustomers] = useState<Customer[]>([]);
 *   const [loading, setLoading] = useState(false);
 *   
 *   // Kiểm tra quyền
 *   const canCreate = authService.hasPermission(
 *     Permission_Codes.CUSTOMER_CREATE
 *   );
 *   
 *   useEffect(() => {
 *     fetchCustomers();
 *   }, []);
 *   
 *   const fetchCustomers = async () => {
 *     try {
 *       setLoading(true);
 *       const response = await customerService.getCustomers({
 *         page: 1,
 *         pageSize: 10
 *       });
 *       setCustomers(response.data);
 *     } catch (error) {
 *       message.error('Lỗi khi tải danh sách');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   
 *   const handleCreate = () => {
 *     // Chỉ hiển thị nếu có quyền
 *     if (canCreate) {
 *       // Mở form thêm
 *     } else {
 *       message.warning('Bạn không có quyền');
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <Button 
 *         type="primary" 
 *         onClick={handleCreate}
 *         disabled={!canCreate}
 *       >
 *         Thêm mới
 *       </Button>
 *       <Table
 *         columns={[...]}
 *         dataSource={customers}
 *         loading={loading}
 *       />
 *     </div>
 *   );
 * };
 * 
 * export default CustomerList;
 * 
 * ============================================================================
 * 8. DEBUGGING & TIPS
 * ============================================================================
 * 
 * // Kiểm tra user info
 * console.log(authService.getCurrentUser());
 * 
 * // Kiểm tra token
 * console.log('Token:', authService.getToken());
 * 
 * // Kiểm tra quyền
 * console.log('Permissions:', authService.getUserPermissions());
 * console.log('Roles:', authService.getUserRoles());
 * 
 * // Kiểm tra localStorage
 * console.log('Auth:', localStorage.getItem('bva_auth_token'));
 * console.log('User:', localStorage.getItem('bva_user_info'));
 * 
 * ============================================================================
 * 9. RESOURCES
 * ============================================================================
 * 
 * - Xem file: src/DOCUMENTATION.ts (tài liệu chi tiết)
 * - Backend Info: /memories/repo/BENHNVIENABC_BACKEND.md
 * - UmiJS Docs: https://umijs.org
 * - Ant Design: https://ant.design/
 * - React: https://react.dev
 * - TypeScript: https://www.typescriptlang.org
 * 
 * ============================================================================
 */

export const README = {
  project: 'BenhVienABC',
  version: '5.0.0',
  lastUpdated: '2026-05-21',
  author: 'Frontend Team'
};
