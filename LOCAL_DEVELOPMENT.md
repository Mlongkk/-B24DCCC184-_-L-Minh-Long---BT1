# 🏃 Hướng Dẫn Chạy Frontend & Backend Trên Localhost

## 📋 Điều Kiện Tiên Quyết

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:
- **Node.js** (v14+)
- **Yarn** hoặc **npm**
- **Git**

---

## 🔧 Cấu Hình Tự Động

### ✅ Cấu Hình Đã Được Hoàn Thành

Toàn bộ frontend đã được cấu hình để **tự động detect** địa chỉ API:

- **Khi localhost**: API base URL = `http://localhost:3000/api`
- **Khi production**: API base URL = `https://ript1307-nhom-4-kthp-backend.onrender.com/api`

**Các file đã cập nhật:**
```
src/services/auth/authService.ts
src/services/users/userService.ts
src/services/customers/customerService.ts
src/services/pets/petService.ts
src/services/appointments/appointmentService.ts
src/services/medical-records/medicalRecordService.ts
src/services/dashboard/dashboardService.ts
```

---

## 🎯 Bước 1: Chạy Frontend (Terminal 1)

```bash
# Vào thư mục project
cd c:\Users\This MC\Documents\base-web-umi-main

# Cài dependencies (chỉ lần đầu)
yarn install

# Chạy dev server
yarn start:dev
# hoặc: npm run start:dev
# hoặc: yarn dev
```

**Kết quả:**
```
webpack compiled successfully
Local:   http://localhost:8000
Network: http://192.168.x.x:8000
```

Truy cập: **http://localhost:8000**

> ℹ️ Frontend sẽ tự động detect localhost và sử dụng API base URL = `http://localhost:4000/api`

---

## 🎯 Bước 2: Chạy Backend (Terminal 2)

Bạn cần clone backend repository hoặc đã có source code.

### Nếu backend chưa được clone:

```bash
# Clone backend repository
git clone https://github.com/your-repo/benhnvienabc-backend.git
cd benhnvienabc-backend
```

### Cấu hình Backend:

```bash
# 1. Cài dependencies
yarn install
# hoặc: npm install

# 2. Cấu hình environment (tạo file .env hoặc cập nhật)
# File: .env
cat > .env << EOF
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://neondb_owner:npg_tWLrV5QwO2iz@ep-purple-dawn-apfi7lyl-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_jwt_secret_key
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=benhnvienabc
KEYCLOAK_CLIENT_ID=benhnvienabc-client
EOF

# 3. Chạy database migrations (nếu có)
yarn typeorm migration:run
# hoặc: npm run typeorm:migration:run

# 4. Chạy dev server
yarn start:dev
# hoặc: npm run start:dev
```

**Kết quả:**
```
✓ Server is running on: http://localhost:4000
✓ Database connected: neondb
✓ API endpoints ready
```

---

## ✅ Kiểm Tra Kết Nối

### Test API từ Backend

```bash
curl http://localhost:4000/api/health
# Kết quả: { "status": "ok" }
```

### Test Login API

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### Test từ Frontend Console

Mở DevTools (`F12`) → Console, chạy:

```javascript
// Kiểm tra API base URL
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend Error:', e))
```

---

## 🔄 Dòng Chảy Hoàn Chỉnh

```mermaid
graph TD
    A["Browser: localhost:8000<br/>(Frontend)"] -->|"HTTP Requests"| B["Frontend App<br/>(React + UmiJS)"]
    B -->|"Auto-detect localhost<br/>→ http://localhost:4000/api"| C["Backend Server<br/>(NestJS)<br/>localhost:4000"]
    C -->|"PostgreSQL<br/>Neon"| D["Database<br/>neondb"]
    C -->|"OIDC"| E["Keycloak<br/>localhost:8080"]
    B -->|"User sees"| A
```

---

## 🧪 Test Các Tính Năng Chính

### 1. Đăng Nhập
```bash
1. Mở http://localhost:8000
2. Click "Đăng Nhập" hoặc "Login"
3. Nhập username/password
4. Kiểm tra console (F12) xem có error không
```

### 2. Gọi API Customer
Mở DevTools Console:
```javascript
import customerService from '@/services/customers/customerService'
customerService.getCustomers().then(r => console.log(r))
```

### 3. Upload File
```javascript
const file = new File(["content"], "test.txt", { type: "text/plain" })
customerService.uploadFile(file).then(r => console.log(r))
```

---

## 🐛 Troubleshooting

### ❌ "Failed to fetch" hoặc "CORS error"

**Nguyên nhân:** Backend không chạy hoặc CORS chưa cấu hình

**Giải pháp:**
```bash
# 1. Kiểm tra backend đang chạy
curl http://localhost:3000/api/health

# 2. Nếu không có kết quả → Start backend
cd benhnvienabc-backend
yarn start:dev

# 3. Kiểm tra CORS config trong backend
# Ensure backend/src/main.ts có:
app.enableCors({
  origin: ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true,
})
```

### ❌ "Cannot find module '@/services/auth/authService'"

**Giải pháp:**
```bash
# Xóa cache TypeScript
rm -rf node_modules/.cache
rm -rf .umi
yarn install
yarn start:dev
```

### ❌ "Port 4000 already in use"

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4000
kill -9 <PID>

# Hoặc chạy backend trên port khác
PORT=4001 yarn start:dev
# Rồi cập nhật API_BASE trong authService.ts (thay localhost:4000 → localhost:4001)
```

### ❌ "Token expired" hoặc "Unauthorized"

**Giải pháp:**
```javascript
// Xóa cached tokens
localStorage.clear()
sessionStorage.clear()

// Đăng nhập lại
window.location.reload()
```

---

## 📦 Công Cụ & Port Map

| Công Cụ | Port | URL |
|---------|------|-----|
| **Frontend** | 8000 | http://localhost:8000 |
| **Backend API** | 4000 | http://localhost:4000 |
| **PostgreSQL** (Neon Cloud) | - | postgresql://neondb_owner:... (cloud) |
| **Keycloak** | 8080 | http://localhost:8080 |
| **Redis** (optional) | 6379 | redis://localhost:6379 |

---

## 🎛️ Environment Variables

### Frontend (tự động detect)
- **Localhost**: Dùng `http://localhost:4000/api`
- **Production** (https://quan-ly-benh-vien-thu-y-abc.netlify.app): Dùng `https://ript1307-nhom-4-kthp-backend.onrender.com/api`

### Backend (cần cấu hình)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://neondb_owner:npg_tWLrV5QwO2iz@ep-purple-dawn-apfi7lyl-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=dev_secret_key_12345
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=benhnvienabc
KEYCLOAK_CLIENT_ID=benhnvienabc-client
FRONTEND_URL=http://localhost:8000
```

---

## 📚 Tài Liệu Thêm

- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn cơ bản
- [README_SERVICES.md](./README_SERVICES.md) - Cách dùng services
- [src/DOCUMENTATION.ts](./src/DOCUMENTATION.ts) - Tài liệu chi tiết
- [/memories/repo/BENHNVIENABC_BACKEND.md](/memories/repo/BENHNVIENABC_BACKEND.md) - Thông tin backend

---

## ✨ Tips & Tricks

### 1. Hot Reload
Frontend hỗ trợ Fast Refresh - edit file sẽ reload tự động:
```bash
# Lúc frontend đang chạy, edit file:
src/pages/HomePage.tsx
# Kết quả: browser reload ngay, state giữ lại
```

### 2. DevTools Redux
Cài extension Redux DevTools xem state:
```javascript
// Console
window.__REDUX_DEVTOOLS_EXTENSION__
```

### 3. API Debugging
```javascript
// Thêm log interceptor trong authService.ts
this.http.interceptors.response.use(
  r => { console.log('✅ API Response:', r); return r; },
  e => { console.error('❌ API Error:', e); return Promise.reject(e); }
)
```

### 4. Keycloak Local Setup
Nếu chạy Keycloak local:
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

---

## 🚀 Production Deployment

Khi deploy production:

```bash
# 1. Build optimized
yarn build

# 2. Kiểm tra dist
ls -la dist/

# 3. Deploy (Windows)
yarn deploy-win

# 4. Deploy (Mac/Linux)
yarn deploy
```

Frontend sẽ **tự động** switch sang production API endpoint.

---

**Cập nhật lần cuối:** 23/05/2026  
**Trạng thái:** ✅ Hoàn thành & sẵn sàng chạy local
