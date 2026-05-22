/**
 * ============================================================================
 * BenhVienABC - TÀI LIỆU TỔNG HỢP CÁC SERVICES, MODELS VÀ PAGES
 * ============================================================================
 * 
 * Project: Hệ thống quản lý thú y BenhVienABC
 * Framework: UmiJS + React 17 + Ant Design v4 + TypeScript
 * Backend: NestJS + PostgreSQL
 * Auth: Keycloak OIDC
 * Version: 5.0.0
 * 
 * ============================================================================
 * I. MODELS (src/models/) - Định nghĩa kiểu dữ liệu TypeScript
 * ============================================================================
 * 
 * 1. auth.ts
 *    - User: Thông tin người dùng (id, username, email, roles, permissions)
 *    - AuthResponse: Kết quả đăng nhập (accessToken, refreshToken, user)
 *    - Role: Vai trò (ADMIN, STAFF, VET, RECEPTIONIST, CUSTOMER)
 *    - Permission: Quyền hạn (user:view, customer:create, pet:update, v.v.)
 *    - Enum UserRole: Các vai trò trong hệ thống
 *    - Enum Permission_Codes: Mã quyền chi tiết
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    import { User, Permission_Codes } from '@/models';
 *    const user = authService.getCurrentUser(); // Lấy user hiện tại
 *    if (authService.hasPermission(Permission_Codes.CUSTOMER_CREATE)) {
 *      // Hiển thị nút thêm khách hàng
 *    }
 *    ```
 * 
 * 2. customer.ts
 *    - Customer: Thông tin khách hàng (fullName, email, phone, address, city, ...)
 *    - CreateCustomerRequest: Form tạo khách hàng
 *    - UpdateCustomerRequest: Form cập nhật khách hàng
 *    - CustomerListResponse: Kết quả danh sách khách hàng (data, total, page)
 *    - CustomerSearchFilters: Bộ lọc tìm kiếm
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    const response = await customerService.getCustomers({
 *      search: 'Nguyễn',
 *      page: 1,
 *      pageSize: 10,
 *      isActive: true
 *    });
 *    ```
 * 
 * 3. pet.ts
 *    - Pet: Thông tin thú cưng (name, species, breed, weight, avatar, ...)
 *    - Species: DOG (Chó), CAT (Mèo), BIRD (Chim), RABBIT (Thỏ), OTHER
 *    - Vaccination: Thông tin tiêm phòng (name, date, expiryDate, ...)
 *    - CreatePetRequest: Form tạo thú cưng
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    const pet = await petService.createPet({
 *      name: 'Max',
 *      customerId: '123',
 *      species: 'DOG',
 *      breed: 'Husky',
 *      weight: 25
 *    });
 *    ```
 * 
 * 4. appointment.ts
 *    - Appointment: Lịch hẹn (date, time, customer, pet, reason, status)
 *    - Status: PENDING (Chờ xác nhận), CONFIRMED (Đã xác nhận), COMPLETED (Hoàn thành), CANCELLED
 *    - TimeSlot: Giờ trống trong ngày
 *    - DaySchedule: Lịch của một ngày
 *    - AppointmentNotification: Thông báo nhắc lịch
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    const slots = await appointmentService.getAvailableSlots('2026-05-25');
 *    // Lấy danh sách giờ trống ngày 25/05/2026
 *    ```
 * 
 * 5. medical-record.ts
 *    - MedicalRecord: Bệnh án (diagnosis, treatment, vitals, prescription, ...)
 *    - PetVitals: Chỉ số sinh tồn (temperature, heartRate, weight, ...)
 *    - Prescription: Đơn thuốc (medicationName, dosage, frequency, ...)
 *    - Attachment: Tệp đính kèm (ảnh X-ray, video, v.v.)
 *    - MedicalTimeline: Timeline lịch sử bệnh án
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    const record = await medicalRecordService.createMedicalRecord({
 *      petId: 'pet-123',
 *      visitDate: '2026-05-21',
 *      veterinarianId: 'vet-456',
 *      diagnosis: 'Viêm tai',
 *      treatment: 'Kháng sinh',
 *      vitals: { temperature: 38.5, weight: 25 }
 *    });
 *    ```
 * 
 * 6. notification.ts
 *    - Notification: Thông báo (title, message, type, status, priority)
 *    - NotificationType: APPOINTMENT_REMINDER, MEDICAL_RECORD_CREATED, v.v.
 *    - NotificationCategory: APPOINTMENT, MEDICAL, REMINDER, SYSTEM, URGENT
 *    - DeliveryChannel: EMAIL, SMS, PUSH, IN_APP
 *    - NotificationPreferences: Cài đặt thông báo của người dùng
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    const notifications = await notificationService.getNotifications({
 *      isRead: false,
 *      page: 1,
 *      pageSize: 20
 *    });
 *    ```
 * 
 * ============================================================================
 * II. SERVICES (src/services/) - Gọi API backend và quản lý state
 * ============================================================================
 * 
 * 1. auth/authService.ts - Quản lý xác thực người dùng
 *    Hàm chính:
 *    - keycloakLogin(code, state): Đăng nhập với Keycloak OIDC
 *    - login(credentials): Đăng nhập truyền thống (username/password)
 *    - logout(): Đăng xuất
 *    - getCurrentUser(): Lấy thông tin user hiện tại từ localStorage
 *    - hasPermission(code): Kiểm tra xem user có quyền gì
 *    - getKeycloakLoginUrl(redirectUri): Lấy URL đăng nhập Keycloak
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Đăng nhập
 *    await authService.login({ username: 'admin', password: '123456' });
 *    
 *    // Kiểm tra quyền
 *    if (authService.hasPermission(Permission_Codes.CUSTOMER_DELETE)) {
 *      showDeleteButton = true;
 *    }
 *    
 *    // Lấy user info
 *    const user = authService.getCurrentUser();
 *    console.log(user.fullName, user.roles);
 *    ```
 * 
 * 2. customers/customerService.ts - Quản lý khách hàng
 *    Hàm chính:
 *    - getCustomers(filters): Lấy danh sách khách hàng
 *    - getCustomerById(id): Lấy thông tin 1 khách hàng
 *    - createCustomer(data): Tạo khách hàng mới
 *    - updateCustomer(id, data): Cập nhật thông tin khách hàng
 *    - deleteCustomer(id): Xóa khách hàng
 *    - searchCustomers(query): Tìm kiếm khách hàng
 *    - getCustomerPets(customerId): Lấy danh sách thú cưng của khách hàng
 *    - getCustomerAppointments(customerId): Lấy danh sách lịch hẹn của khách hàng
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Lấy danh sách khách hàng trang 1
 *    const response = await customerService.getCustomers({
 *      page: 1,
 *      pageSize: 10,
 *      search: 'Nguyễn',
 *      isActive: true
 *    });
 *    console.log(response.data); // Mảng Customer
 *    
 *    // Lấy thú cưng của khách hàng
 *    const pets = await customerService.getCustomerPets('customer-123');
 *    ```
 * 
 * 3. pets/petService.ts - Quản lý thú cưng
 *    Hàm chính:
 *    - getPets(filters): Lấy danh sách thú cưng
 *    - getPetById(id): Lấy thông tin 1 thú cưng
 *    - createPet(data): Tạo thú cưng mới
 *    - updatePet(id, data): Cập nhật thông tin thú cưng
 *    - deletePet(id): Xóa thú cưng
 *    - getPetMedicalHistory(petId): Lấy lịch sử bệnh của thú cưng
 *    - getPetAppointments(petId): Lấy lịch hẹn của thú cưng
 *    - uploadPetAvatar(petId, file): Tải ảnh đại diện cho thú cưng
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Tạo thú cưng mới
 *    const pet = await petService.createPet({
 *      customerId: 'customer-123',
 *      name: 'Max',
 *      species: 'DOG',
 *      breed: 'Husky',
 *      weight: 25,
 *      color: 'Trắng'
 *    });
 *    
 *    // Tải ảnh lên
 *    const response = await petService.uploadPetAvatar(pet.id, file);
 *    console.log(response.avatarUrl); // URL ảnh
 *    ```
 * 
 * 4. appointments/appointmentService.ts - Quản lý lịch hẹn
 *    Hàm chính:
 *    - getAppointments(filters): Lấy danh sách lịch hẹn
 *    - getAppointmentById(id): Lấy thông tin 1 lịch hẹn
 *    - createAppointment(data): Tạo lịch hẹn mới
 *    - updateAppointment(id, data): Cập nhật lịch hẹn
 *    - deleteAppointment(id): Xóa lịch hẹn
 *    - cancelAppointment(id, reason): Hủy lịch hẹn
 *    - confirmAppointment(id): Xác nhận lịch hẹn
 *    - getAvailableSlots(date, veterinarianId): Lấy giờ trống trong ngày
 *    - getAvailableDates(startDate, endDate): Lấy danh sách ngày còn trống
 *    - sendReminder(appointmentId): Gửi nhắc nhở lịch hẹn
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Lấy giờ trống ngày 25/05/2026
 *    const schedule = await appointmentService.getAvailableSlots('2026-05-25');
 *    console.log(schedule.timeSlots); // Danh sách giờ trống
 *    
 *    // Tạo lịch hẹn
 *    const apt = await appointmentService.createAppointment({
 *      customerId: 'cust-123',
 *      petId: 'pet-456',
 *      appointmentDate: '2026-05-25',
 *      startTime: '09:00',
 *      endTime: '10:00',
 *      reason: 'Khám tổng quát'
 *    });
 *    ```
 * 
 * 5. medical-records/medicalRecordService.ts - Quản lý bệnh án
 *    Hàm chính:
 *    - getMedicalRecords(filters): Lấy danh sách bệnh án
 *    - getMedicalRecordById(id): Lấy thông tin 1 bệnh án
 *    - createMedicalRecord(data): Tạo bệnh án mới
 *    - updateMedicalRecord(id, data): Cập nhật bệnh án
 *    - deleteMedicalRecord(id): Xóa bệnh án
 *    - getMedicalTimeline(petId): Lấy timeline lịch sử bệnh của thú cưng
 *    - getRecordsByPetId(petId): Lấy danh sách bệnh án của thú cưng
 *    - uploadAttachment(recordId, file): Tải file đính kèm (ảnh, video)
 *    - downloadAsPDF(recordId): Tải bệnh án dưới dạng PDF
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Lấy timeline bệnh án
 *    const timeline = await medicalRecordService.getMedicalTimeline('pet-123');
 *    console.log(timeline.records); // Danh sách sự kiện
 *    
 *    // Tạo bệnh án mới
 *    const record = await medicalRecordService.createMedicalRecord({
 *      petId: 'pet-123',
 *      visitDate: '2026-05-21',
 *      veterinarianId: 'vet-456',
 *      diagnosis: 'Viêm tai',
 *      treatment: 'Kháng sinh',
 *      vitals: { temperature: 38.5, weight: 25 }
 *    });
 *    ```
 * 
 * 6. notifications/notificationService.ts - Quản lý thông báo
 *    Hàm chính:
 *    - getNotifications(filter): Lấy danh sách thông báo
 *    - getNotificationById(id): Lấy thông tin 1 thông báo
 *    - markAsRead(id): Đánh dấu thông báo đã đọc
 *    - markAllAsRead(): Đánh dấu tất cả thông báo đã đọc
 *    - deleteNotification(id): Xóa thông báo
 *    - getUnreadCount(): Lấy số thông báo chưa đọc
 *    - getPreferences(): Lấy cài đặt thông báo
 *    - updatePreferences(preferences): Cập nhật cài đặt thông báo
 *    - getAppointmentReminders(): Lấy danh sách nhắc lịch hẹn
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Lấy thông báo chưa đọc
 *    const response = await notificationService.getNotifications({
 *      isRead: false,
 *      page: 1,
 *      pageSize: 20
 *    });
 *    console.log(response.unreadCount); // Số thông báo chưa đọc
 *    
 *    // Cập nhật cài đặt
 *    await notificationService.updatePreferences({
 *      email: true,
 *      sms: true,
 *      reminderMinutesBefore: 60
 *    });
 *    ```
 * 
 * 7. dashboard/dashboardService.ts - Quản lý dữ liệu dashboard
 *    Hàm chính:
 *    - getStats(): Lấy thống kê tổng quát (số KH, số thú cưng, số lịch hẹn, ...)
 *    - getChartData(): Lấy dữ liệu cho các biểu đồ
 *    - getAppointmentTrends(startDate, endDate): Xu hướng lịch hẹn
 *    - getCustomerGrowth(months): Tăng trưởng khách hàng
 *    - getRevenueData(startDate, endDate): Doanh thu
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    // Lấy thống kê
 *    const stats = await dashboardService.getStats();
 *    console.log(stats.totalCustomers, stats.totalPets);
 *    ```
 * 
 * ============================================================================
 * III. PAGES (src/pages/) - Giao diện người dùng
 * ============================================================================
 * 
 * 1. Auth/LoginPage.tsx - Trang đăng nhập
 *    Chức năng:
 *    - Form đăng nhập truyền thống (username/password)
 *    - Nút đăng nhập với Keycloak
 *    - Link quên mật khẩu
 *    - Responsive design
 *    
 *    Import: import LoginPage from '@/pages/Auth/LoginPage';
 * 
 * 2. Auth/AuthCallbackPage.tsx - Trang callback từ Keycloak
 *    Chức năng:
 *    - Xử lý callback từ Keycloak OIDC
 *    - Lấy authorization code và state
 *    - Hoán đổi code lấy token
 *    - Redirect tới dashboard
 *    
 *    Import: import AuthCallbackPage from '@/pages/Auth/AuthCallbackPage';
 * 
 * 3. Customers/CustomerList.tsx - Danh sách khách hàng
 *    Chức năng:
 *    - Hiển thị bảng danh sách khách hàng
 *    - Tìm kiếm, lọc theo trạng thái
 *    - Nút thêm, sửa, xóa khách hàng
 *    - Form thêm/sửa khách hàng trong Drawer
 *    - Kiểm tra quyền trước khi cho phép hành động
 *    
 *    Import: import CustomerList from '@/pages/Customers/CustomerList';
 *    Quyền cần:
 *    - CUSTOMER_VIEW: Xem danh sách
 *    - CUSTOMER_CREATE: Thêm mới
 *    - CUSTOMER_UPDATE: Cập nhật
 *    - CUSTOMER_DELETE: Xóa
 * 
 * 4. Pets/PetList.tsx - Danh sách thú cưng
 *    Chức năng:
 *    - Hiển thị bảng danh sách thú cưng
 *    - Ảnh đại diện + tên + loài + chủ nhân
 *    - Tìm kiếm, lọc
 *    - Tải ảnh lên
 *    - Thêm/sửa/xóa thú cưng
 *    
 *    Import: import PetList from '@/pages/Pets/PetList';
 *    Quyền cần:
 *    - PET_VIEW, PET_CREATE, PET_UPDATE, PET_DELETE
 * 
 * 5. Appointments/AppointmentCalendar.tsx - Lịch hẹn dạng Calendar
 *    Chức năng:
 *    - Hiển thị calendar tháng
 *    - Hiển thị số lịch hẹn trên từng ngày
 *    - Click ngày để xem chi tiết lịch hẹn trong ngày
 *    - Thêm lịch hẹn mới
 *    - Xác nhận, hủy lịch hẹn
 *    
 *    Import: import AppointmentCalendar from '@/pages/Appointments/AppointmentCalendar';
 * 
 * 6. Appointments/AppointmentBooking.tsx - Form đặt lịch trực tuyến
 *    Chức năng:
 *    - Giao diện step-by-step (5 bước)
 *    - Bước 1: Chọn chủ nhân + thú cưng
 *    - Bước 2: Chọn ngày khám
 *    - Bước 3: Chọn giờ khám
 *    - Bước 4: Nhập lý do + ghi chú
 *    - Bước 5: Xác nhận đặt lịch
 *    - Modal thành công
 *    
 *    Import: import AppointmentBooking from '@/pages/Appointments/AppointmentBooking';
 * 
 * 7. MedicalRecords/MedicalRecordsTimeline.tsx - Bệnh án & Timeline
 *    Chức năng:
 *    - Chọn thú cưng
 *    - Hiển thị timeline lịch sử bệnh (appointment, diagnosis, treatment, vaccination)
 *    - Bảng danh sách bệnh án chi tiết
 *    - Xem chi tiết bệnh án (chẩn đoán, điều trị, chỉ số sinh tồn, đơn thuốc)
 *    - Tải bệnh án dưới dạng PDF
 *    
 *    Import: import MedicalRecordsTimeline from '@/pages/MedicalRecords/MedicalRecordsTimeline';
 *    Quyền cần: MEDICAL_VIEW
 * 
 * 8. NotificationCenter/NotificationCenter.tsx - Trung tâm thông báo
 *    Chức năng:
 *    - Hiển thị danh sách thông báo
 *    - Lọc: Tất cả / Chưa đọc
 *    - Hiển thị số thông báo chưa đọc
 *    - Đánh dấu từng thông báo đã đọc
 *    - Đánh dấu tất cả đã đọc
 *    - Xóa thông báo
 *    - Xem chi tiết thông báo
 *    - Cài đặt thông báo (tính năng sắp tới)
 *    
 *    Import: import NotificationCenter from '@/pages/NotificationCenter/NotificationCenter';
 * 
 * 9. Dashboard/Dashboard.tsx - Bảng điều khiển
 *    Chức năng:
 *    - Hiển thị 4 thống kê chính:
 *      + Tổng khách hàng
 *      + Tổng thú cưng
 *      + Lịch hẹn tháng này
 *      + Số lịch hẹn hoàn thành
 *    - Biểu đồ đường: Xu hướng lịch hẹn
 *    - Biểu đồ tròn: Phân bố loài thú cưng
 *    - Biểu đồ cột: Trạng thái lịch hẹn
 *    - Biểu đồ cột: Lịch hẹn theo tháng
 *    - Lọc theo khoảng thời gian (hôm nay, tuần, tháng, năm)
 *    
 *    Import: import Dashboard from '@/pages/Dashboard/Dashboard';
 *    Quyền cần: DASHBOARD_VIEW
 * 
 * ============================================================================
 * IV. COMPONENTS (src/components/) - Thành phần tái sử dụng
 * ============================================================================
 * 
 * 1. Upload/FileUploader.tsx - Component upload file
 *    Chức năng:
 *    - Hỗ trợ kéo thả file
 *    - Kiểm tra kích thước file
 *    - Hiển thị thông báo lỗi/thành công
 *    - Tùy chỉnh accept types, max size, max files
 *    
 *    Ví dụ sử dụng:
 *    ```
 *    <FileUploader
 *      accept="image/*"
 *      maxSize={5242880} // 5MB
 *      onUpload={async (file) => {
 *        await petService.uploadPetAvatar(petId, file);
 *      }}
 *    />
 *    ```
 * 
 * ============================================================================
 * V. LUỒNG ỨNG DỤNG CHÍNH
 * ============================================================================
 * 
 * 1. Luồng ĐĂNG NHẬP:
 *    User nhấp Đăng nhập
 *    → Form gửi username/password tới authService.login()
 *    → API trả về accessToken + user info
 *    → Lưu vào localStorage
 *    → Redirect tới /dashboard
 * 
 * 2. Luồng KEYCLOAK ĐĂNG NHẬP:
 *    User nhấp "Đăng nhập với Keycloak"
 *    → Redirect tới Keycloak login page
 *    → Keycloak xác thực
 *    → Redirect về /auth/callback?code=XXX&state=YYY
 *    → AuthCallbackPage nhận code, hoán đổi lấy token
 *    → Lưu token + user info
 *    → Redirect tới /dashboard
 * 
 * 3. Luồng QUẢN LÝ KHÁCH HÀNG:
 *    Vào trang Customers
 *    → CustomerList fetch danh sách khách hàng từ customerService
 *    → Hiển thị bảng
 *    → User click "Thêm mới" → Mở Drawer form
 *    → Nhập dữ liệu → Click Lưu
 *    → Form gửi tới customerService.createCustomer()
 *    → API tạo khách hàng mới
 *    → Refresh danh sách
 * 
 * 4. Luồng ĐẶT LỊCH HẸN:
 *    Vào trang AppointmentBooking
 *    → Step 1: Chọn chủ nhân + thú cưng
 *    → Step 2: Chọn ngày (chỉ những ngày còn trống)
 *    → Step 3: Chọn giờ từ danh sách getAvailableSlots()
 *    → Step 4: Nhập lý do
 *    → Step 5: Xác nhận
 *    → Gửi tới appointmentService.createAppointment()
 *    → Hiển thị modal thành công
 * 
 * 5. Luồng XEM BỆNH ÁN:
 *    Vào trang MedicalRecordsTimeline
 *    → Chọn thú cưng từ dropdown
 *    → Hiển thị timeline lịch sử bệnh
 *    → Hiển thị bảng danh sách bệnh án
 *    → User click bệnh án → Drawer chi tiết
 *    → Hiển thị chẩn đoán, điều trị, chỉ số, đơn thuốc
 *    → User click "Tải PDF" → Download bệnh án
 * 
 * ============================================================================
 * VI. QUYỀN HẠN (ACCESS CONTROL)
 * ============================================================================
 * 
 * Hệ thống sử dụng role-based access control (RBAC):
 * 
 * ADMIN:
 *   - Toàn quyền truy cập
 *   - user:*, customer:*, pet:*, appointment:*, medical:*, dashboard:*
 * 
 * STAFF:
 *   - Quản lý khách hàng, thú cưng, lịch hẹn
 *   - customer:*, pet:*, appointment:*
 * 
 * VET (Bác sĩ thú y):
 *   - Xem khách hàng, thú cưng, lịch hẹn
 *   - Tạo/cập nhật bệnh án, đơn thuốc
 *   - medical:*, customer:view, pet:view, appointment:view
 * 
 * RECEPTIONIST (Lễ tân):
 *   - Quản lý lịch hẹn, khách hàng cơ bản
 *   - customer:view, pet:view, appointment:*
 * 
 * CUSTOMER (Khách hàng):
 *   - Xem lịch hẹn của mình, thú cưng của mình
 *   - customer:view (chỉ của mình), pet:view (chỉ của mình)
 * 
 * Kiểm tra quyền:
 * ```
 * if (authService.hasPermission(Permission_Codes.CUSTOMER_CREATE)) {
 *   // Hiển thị nút thêm
 * }
 * 
 * if (authService.hasAnyPermission([Permission_Codes.ADMIN, Permission_Codes.VET])) {
 *   // Hiển thị menu chỉ dành cho admin hoặc bác sĩ
 * }
 * ```
 * 
 * ============================================================================
 * VII. CẤU HÌNH ENVIRONMENT
 * ============================================================================
 * 
 * File: .env hoặc tính năng UmiJS env
 * 
 * REACT_APP_API_URL=http://localhost:3000/api
 * REACT_APP_KEYCLOAK_URL=http://localhost:8080
 * REACT_APP_KEYCLOAK_REALM=benhnvienabc
 * REACT_APP_KEYCLOAK_CLIENT_ID=benhnvienabc-client
 * 
 * ============================================================================
 * VIII. GHI CHÚNG QUAN TRỌNG
 * ============================================================================
 * 
 * 1. Version:
 *    - Node: Tùy theo project (check .nvmrc hoặc package.json)
 *    - Yarn: Sử dụng yarn không npm
 *    - React: 17.x
 *    - Ant Design: 4.x
 *    - TypeScript: 4.x
 *    - UmiJS: 3.x
 * 
 * 2. Cách chạy project:
 *    ```
 *    yarn install      # Cài dependencies (chỉ lần đầu)
 *    yarn dev          # Chạy dev server (http://localhost:8000)
 *    yarn build        # Build production
 *    yarn deploy       # Deploy lên server
 *    ```
 * 
 * 3. Convention:
 *    - Services: Gọi API, lưu token
 *    - Pages: Giao diện chính (full page)
 *    - Components: Thành phần nhỏ (reusable)
 *    - Models: Định nghĩa kiểu dữ liệu
 *    - Hooks: Custom React hooks
 *    - Styles: File .less cho styling
 * 
 * 4. API Interceptor:
 *    - Tất cả services tự động thêm Authorization header
 *    - Token được lấy từ localStorage
 *    - Nếu token hết hạn, gọi refreshToken()
 * 
 * 5. Error Handling:
 *    - Try-catch trong components
 *    - Hiển thị message.error() cho người dùng
 *    - Log error lên console cho debugging
 * 
 * ============================================================================
 * IX. TIẾP THEO
 * ============================================================================
 * 
 * Các tính năng có thể thêm:
 * 1. Quên mật khẩu (ForgotPasswordPage)
 * 2. Chi tiết khách hàng (CustomerDetailPage)
 * 3. Chi tiết thú cưng (PetDetailPage)
 * 4. Tạo bệnh án (CreateMedicalRecordPage)
 * 5. Search & Filter nâng cao
 * 6. Export Excel/PDF
 * 7. Import từ Excel
 * 8. Real-time notification với WebSocket
 * 9. Chat hỗ trợ khách hàng
 * 10. Reports & Analytics
 * 
 * ============================================================================
 */

export const DOCUMENTATION = {
  version: '5.0.0',
  framework: 'UmiJS + React 17 + Ant Design v4',
  backend: 'NestJS + PostgreSQL',
  auth: 'Keycloak OIDC',
  lastUpdated: '2026-05-21',
};
