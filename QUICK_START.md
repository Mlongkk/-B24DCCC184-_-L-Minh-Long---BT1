# 🏥 BenhVienABC - Hệ Thống Quản Lý Thú Y

## ✅ HOÀN THÀNH

### 📦 Services (Gọi API Backend)
- ✅ **authService**: Đăng nhập, Keycloak OIDC, kiểm tra quyền
- ✅ **customerService**: CRUD khách hàng + tìm kiếm
- ✅ **petService**: CRUD + upload ảnh thú cưng
- ✅ **appointmentService**: CRUD lịch hẹn, kiểm tra giờ trống
- ✅ **medicalRecordService**: Bệnh án, timeline, PDF
- ✅ **notificationService**: Thông báo, đánh dấu đọc
- ✅ **dashboardService**: Thống kê, biểu đồ

### 📱 Pages (Giao Diện)
- ✅ **LoginPage**: Đăng nhập + Keycloak
- ✅ **AuthCallbackPage**: Xử lý callback Keycloak
- ✅ **CustomerList**: Danh sách KH (CRUD)
- ✅ **PetList**: Danh sách thú cưng (CRUD + upload)
- ✅ **AppointmentCalendar**: Lịch hẹn dạng Calendar
- ✅ **AppointmentBooking**: Form đặt lịch 5 bước
- ✅ **MedicalRecordsTimeline**: Timeline bệnh án
- ✅ **NotificationCenter**: Trung tâm thông báo
- ✅ **Dashboard**: Bảng điều khiển (Recharts)

### 📝 Models (TypeScript Interfaces)
- ✅ **auth.ts**: User, Role, Permission, Permission_Codes
- ✅ **customer.ts**: Customer, CreateCustomerRequest
- ✅ **pet.ts**: Pet, Vaccination, CreatePetRequest
- ✅ **appointment.ts**: Appointment, TimeSlot, DaySchedule
- ✅ **medical-record.ts**: MedicalRecord, Prescription, PetVitals
- ✅ **notification.ts**: Notification, NotificationType

### 🧩 Components
- ✅ **FileUploader**: Component upload file (kéo thả)

### 📚 Tài Liệu
- ✅ **DOCUMENTATION.ts**: Tài liệu chi tiết 2000+ dòng
- ✅ **README_SERVICES.md**: Hướng dẫn sử dụng services
- ✅ **Backend Memory**: Thông tin backend trong /memories/repo

---

## 🚀 CHẠY PROJECT

```bash
# 1. Cài dependencies (chỉ lần đầu)
yarn install

# 2. Chạy dev server
yarn dev
# Truy cập: http://localhost:8000

# 3. Build production
yarn build

# 4. Deploy (Windows)
yarn deploy-win

# 5. Deploy (Linux/Mac)
yarn deploy
```

---

## 📖 TÀI LIỆU THAM KHẢO

### 1. File Tài Liệu Chính
```
src/DOCUMENTATION.ts          # ← CHỈ CẦN ĐỌC FILE NÀY
```
Chứa:
- Giải thích từng service (8 dòng ~ 800+ dòng)
- Giải thích từng model (6 dòng ~ 600+ dòng)
- Giải thích từng page (9 dòng ~ 900+ dòng)
- Ví dụ sử dụng cho từng service
- Luồng ứng dụng chính
- Quyền hạn (RBAC)
- Config environment
- Ghi chú quan trọng

### 2. File Hướng Dẫn Sử Dụng
```
README_SERVICES.md            # ← COPY-PASTE READY EXAMPLES
```
Chứa:
- Lưu ý DO/DON'T
- Setup ban đầu
- Cấu trúc project
- Import + sử dụng từng service (với ví dụ)
- Import + sử dụng models
- Error handling
- Component example
- Debugging tips

### 3. Backend Info trong Memory
```
/memories/repo/BENHNVIENABC_BACKEND.md
```
Chứa:
- Tech stack
- Danh sách services/pages/models đã tạo
- API endpoints (backend cần cung cấp)
- Database entities
- Keycloak config
- Environment variables
- Quy ước code
- Permissions

---

## 🔑 KEY POINTS

### ✅ DO
```typescript
// ✅ Đúng - Import tuyệt đối
import authService from '@/services/auth/authService';
import { Customer, Permission_Codes } from '@/models';

// ✅ Đúng - Kiểm tra quyền
if (authService.hasPermission(Permission_Codes.CUSTOMER_CREATE)) {
  showButton = true;
}

// ✅ Đúng - Error handling
try {
  const customers = await customerService.getCustomers({...});
} catch (error: any) {
  message.error(error?.response?.data?.message || 'Lỗi');
}

// ✅ Đúng - TypeScript types
const [customers, setCustomers] = useState<Customer[]>([]);
```

### ❌ DON'T
```typescript
// ❌ Sai - Đừng dùng npm
npm install    // ← DÙNG yarn install

// ❌ Sai - Đừng import relative
import service from '../../../services/...';  // ← DÙNG @/

// ❌ Sai - Đừng bỏ types
const customers = useState([]);  // ← PHẢI <Customer[]>

// ❌ Sai - Đừng hardcode URL
const API = 'http://localhost:3000/api';  // ← DÙNG env variable
```

---

## 🛠️ CẤU HÌNH ENVIRONMENT

Tạo file `.env` hoặc config trong `config/config.ts`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=benhnvienabc
REACT_APP_KEYCLOAK_CLIENT_ID=benhnvienabc-client
```

---

## 📂 STRUCTURE TREE

```
src/
├── DOCUMENTATION.ts              ⭐ TÀI LIỆU CHI TIẾT
├── models/
│   ├── auth.ts                   (User, Role, Permission)
│   ├── customer.ts               (Customer, CreateCustomerRequest)
│   ├── pet.ts                    (Pet, Vaccination)
│   ├── appointment.ts            (Appointment, TimeSlot)
│   ├── medical-record.ts         (MedicalRecord, Prescription)
│   └── notification.ts           (Notification, NotificationType)
├── services/
│   ├── auth/authService.ts       (Đăng nhập, token, quyền)
│   ├── customers/customerService.ts  (CRUD khách hàng)
│   ├── pets/petService.ts        (CRUD + upload ảnh)
│   ├── appointments/appointmentService.ts (CRUD lịch hẹn)
│   ├── medical-records/medicalRecordService.ts (Bệnh án, PDF)
│   ├── notifications/notificationService.ts (Thông báo)
│   └── dashboard/dashboardService.ts (Thống kê)
├── pages/
│   ├── Auth/
│   │   ├── LoginPage.tsx          (Đăng nhập)
│   │   └── AuthCallbackPage.tsx   (Keycloak callback)
│   ├── Customers/
│   │   └── CustomerList.tsx       (Danh sách KH)
│   ├── Pets/
│   │   └── PetList.tsx            (Danh sách thú cưng)
│   ├── Appointments/
│   │   ├── AppointmentCalendar.tsx (Lịch Calendar)
│   │   └── AppointmentBooking.tsx  (Form đặt lịch)
│   ├── MedicalRecords/
│   │   └── MedicalRecordsTimeline.tsx (Bệnh án)
│   ├── NotificationCenter/
│   │   └── NotificationCenter.tsx (Thông báo)
│   └── Dashboard/
│       └── Dashboard.tsx          (Bảng điều khiển)
└── components/
    └── Upload/FileUploader.tsx    (Component upload)
```

---

## 💡 ỨNG DỤNG EXAMPLE

### 1. Lấy danh sách khách hàng
```typescript
import customerService from '@/services/customers/customerService';

const response = await customerService.getCustomers({
  search: 'Nguyễn',
  page: 1,
  pageSize: 10,
  isActive: true
});
console.log(response.data);    // Customer[]
console.log(response.total);   // Tổng số
```

### 2. Tạo thú cưng + upload ảnh
```typescript
import petService from '@/services/pets/petService';

// 1. Tạo thú cưng
const pet = await petService.createPet({
  customerId: 'cust-123',
  name: 'Max',
  species: 'DOG',
  breed: 'Husky',
  weight: 25
});

// 2. Upload ảnh
const response = await petService.uploadPetAvatar(pet.id, file);
console.log(response.avatarUrl);
```

### 3. Đặt lịch hẹn
```typescript
import appointmentService from '@/services/appointments/appointmentService';

// 1. Lấy giờ trống
const schedule = await appointmentService.getAvailableSlots('2026-05-25');

// 2. Tạo lịch hẹn
const apt = await appointmentService.createAppointment({
  customerId: 'cust-123',
  petId: 'pet-456',
  appointmentDate: '2026-05-25',
  startTime: '09:00',
  endTime: '10:00',
  reason: 'Khám tổng quát'
});
```

### 4. Xem bệnh án
```typescript
import medicalRecordService from '@/services/medical-records/medicalRecordService';

// 1. Lấy timeline bệnh án
const timeline = await medicalRecordService.getMedicalTimeline('pet-123');
console.log(timeline.records);  // [{date, type, title, description}]

// 2. Tải bệnh án PDF
const blob = await medicalRecordService.downloadAsPDF('record-123');
```

---

## 🔒 QUYỀN HẠN (RBAC)

Kiểm tra quyền trước khi show button/menu:

```typescript
import authService from '@/services/auth/authService';
import { Permission_Codes } from '@/models';

// Kiểm tra 1 quyền
if (authService.hasPermission(Permission_Codes.CUSTOMER_CREATE)) {
  // Hiển thị nút "Thêm khách hàng"
}

// Kiểm tra nhiều quyền
if (authService.hasAnyPermission([
  Permission_Codes.ADMIN,
  Permission_Codes.VET
])) {
  // Hiển thị menu admin/vet
}

// Lấy danh sách quyền của user
const permissions = authService.getUserPermissions();
```

---

## ❓ ISSUES & TROUBLESHOOTING

### Q: Lỗi "Cannot find module '@/services'"
**A**: Kiểm tra `tsconfig.json` có `"@": "src"` không

### Q: API request 401 Unauthorized
**A**: Token hết hạn hoặc không được lưu. Kiểm tra:
```typescript
const token = localStorage.getItem('bva_auth_token');
console.log('Token:', token);
```

### Q: Service không tự động thêm Authorization header
**A**: Kiểm tra service constructor có interceptor không:
```typescript
this.http.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Q: Quên import type?
**A**: TypeScript sẽ báo lỗi. Import từ `@/models`:
```typescript
import { Customer, Pet, Appointment } from '@/models';
```

---

## 📞 CONTACT & SUPPORT

- **Tài liệu**: Xem `src/DOCUMENTATION.ts`
- **Ví dụ**: Xem `README_SERVICES.md`
- **Backend**: Xem `/memories/repo/BENHNVIENABC_BACKEND.md`
- **Issues**: Check console (F12) → Network + Console tabs

---

## 📄 LICENSE & CREDITS

**Project**: BenhVienABC (Base Project)  
**Version**: 5.0.0  
**Framework**: UmiJS + React 17 + Ant Design v4  
**Backend**: NestJS + PostgreSQL  
**Auth**: Keycloak OIDC  
**Updated**: 2026-05-21

---

**Happy Coding! 🎉**
