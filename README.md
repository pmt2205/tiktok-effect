# TikTok Live Effect Mapping

Ứng dụng quản lý hiệu ứng TikTok Live, gồm ba thành phần:

- **Frontend:** Next.js, chạy mặc định tại `http://localhost:3000`.
- **Backend:** NestJS, chạy mặc định tại `http://localhost:3001`.
- **Database:** MongoDB, chạy mặc định tại `localhost:27017`.

## 1. Yêu cầu hệ thống

Khuyến nghị chạy toàn bộ dự án bằng Docker:

- Docker Desktop.
- Docker Compose v2 (đã đi kèm Docker Desktop).

Nếu chạy code trực tiếp để phát triển, máy cần thêm:

- Node.js 22.
- npm.
- MongoDB hoặc một MongoDB URI có thể truy cập được.

## 2. Cấu trúc dự án

```text
tiktok-effect/
├── frontend/              # Giao diện Next.js
│   ├── public/            # Ảnh, video và tài nguyên tĩnh
│   └── src/
│       ├── app/           # Routes và layouts
│       ├── components/    # Component UI dùng chung
│       ├── features/      # Chức năng được tổ chức theo feature
│       ├── hooks/         # React hooks dùng chung
│       ├── lib/           # Constants và tiện ích
│       ├── store/         # Redux store
│       └── types/         # TypeScript types
├── backend/               # API NestJS
│   ├── public/media/      # Media mặc định và file upload
│   ├── src/
│   │   ├── common/        # Middleware, interfaces và tiện ích
│   │   └── features/      # Auth, users, gifts, settings, chat...
│   └── tests/             # Kiểm thử backend
├── docker-compose.yml     # Chạy frontend, backend và MongoDB
└── .env.example           # Mẫu biến môi trường cho Docker
```

## 3. Chạy bằng Docker

### Bước 1: Tạo file môi trường

Tại thư mục gốc của dự án, chạy:

```powershell
Copy-Item .env.example .env
```

Trên macOS hoặc Linux:

```bash
cp .env.example .env
```

Mở `.env` và thay ít nhất hai giá trị sau bằng chuỗi bí mật mạnh:

```dotenv
MONGO_ROOT_PASSWORD=mat-khau-mongodb-cua-ban
JWT_SECRET=chuoi-bi-mat-jwt-dai-it-nhat-32-ky-tu
```

Nếu sử dụng Google Login, điền cả hai biến:

```dotenv
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Bước 2: Khởi động

Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:

```bash
docker compose up --build -d
```

Lần chạy đầu tiên có thể mất vài phút vì Docker phải tải image và cài dependencies.

### Bước 3: Kiểm tra

```bash
docker compose ps
```

Các địa chỉ mặc định:

| Dịch vụ | Địa chỉ |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |
| Backend health | `http://localhost:3001/api/health` |
| MongoDB | `mongodb://localhost:27017` |

Xem log tất cả dịch vụ:

```bash
docker compose logs -f
```

Chỉ xem log một dịch vụ:

```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f mongo
```

Nhấn `Ctrl+C` để thoát màn hình log; container vẫn tiếp tục chạy.

## 4. Dừng hoặc khởi động lại Docker

Dừng và xóa container/network, nhưng giữ dữ liệu MongoDB và media:

```bash
docker compose down
```

Khởi động lại stack đã build:

```bash
docker compose up -d
```

Khởi động lại riêng backend:

```bash
docker compose restart backend
```

Xóa cả container và toàn bộ volume dữ liệu:

```bash
docker compose down -v
```

> Cảnh báo: lệnh có `-v` sẽ xóa dữ liệu MongoDB và media lưu trong Docker volume.

## 5. Cập nhật code khi dùng Docker

Docker hiện chạy production build. Sau khi sửa code, cần build lại dịch vụ tương ứng.

Frontend:

```bash
docker compose up --build -d frontend
```

Backend:

```bash
docker compose up --build -d backend
```

Build lại toàn bộ:

```bash
docker compose up --build -d
```

`NEXT_PUBLIC_BACKEND_URL` được nhúng vào frontend tại thời điểm build. Nếu thay đổi biến này trong `.env`, bắt buộc phải build lại frontend.

## 6. Chạy trực tiếp để phát triển

### Database

Có thể chỉ chạy MongoDB bằng Docker:

```bash
docker compose up -d mongo
```

### Backend

Mở terminal tại thư mục `backend`:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run start:dev
```

Kiểm tra `backend/.env` có cấu hình phù hợp:

```dotenv
MONGO_URI=mongodb://tiktok:mat-khau-mongodb-cua-ban@localhost:27017/tiktok-effect?authSource=admin
JWT_SECRET=chuoi-bi-mat-jwt-dai-it-nhat-32-ky-tu
GOOGLE_CLIENT_ID=
```

Nếu MongoDB cài trực tiếp trên máy và không bật xác thực, có thể dùng:

```dotenv
MONGO_URI=mongodb://localhost:27017/tiktok-effect
```

Backend hỗ trợ các lệnh:

```bash
npm run start:dev    # Development với watch mode
npm run build        # Build production
npm run start:prod   # Chạy bản đã build
npm test             # Build và chạy backend tests
```

### Frontend

Mở terminal khác tại thư mục `frontend`:

```powershell
cd frontend
npm install
```

Tạo file `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Sau đó chạy:

```bash
npm run dev
```

Frontend hỗ trợ các lệnh:

```bash
npm run dev      # Development server
npm run build    # Build production
npm run start    # Chạy production build
npm run lint     # Kiểm tra ESLint
```

## 7. Cấu hình khi deploy lên server

Trong file `.env` ở server, đổi URL backend thành địa chỉ người dùng có thể truy cập từ trình duyệt:

```dotenv
NEXT_PUBLIC_BACKEND_URL=https://api.ten-mien-cua-ban.com
```

Không đặt `NEXT_PUBLIC_BACKEND_URL=http://backend:3001`. Hostname `backend` chỉ tồn tại trong Docker network và trình duyệt của người dùng không truy cập được hostname này.

Sau khi đổi URL:

```bash
docker compose up --build -d frontend
```

Khi dùng domain khác với các domain đang được backend cho phép, cần bổ sung domain frontend vào cấu hình CORS của backend.

## 8. Dữ liệu và volume

Compose tạo hai named volume:

- `tiktok-effect_mongo_data`: lưu dữ liệu MongoDB.
- `tiktok-effect_backend_media`: lưu media của backend.

Xem danh sách volume:

```bash
docker volume ls
```

Dữ liệu vẫn còn sau khi chạy `docker compose down`. Chỉ xóa khi chạy `docker compose down -v` hoặc xóa volume thủ công.

Các biến `MONGO_INITDB_ROOT_USERNAME` và `MONGO_INITDB_ROOT_PASSWORD` chỉ được
MongoDB sử dụng khi khởi tạo volume lần đầu. Nếu đổi username hoặc password trong
`.env` sau đó, volume cũ vẫn giữ thông tin đăng nhập trước đó. Khi database chưa
có dữ liệu cần giữ, chạy `docker compose down -v` rồi tạo lại stack. Nếu cần giữ
dữ liệu, phải đổi mật khẩu bên trong MongoDB hoặc khôi phục giá trị cũ trong `.env`.

## 9. Xử lý lỗi thường gặp

### Không kết nối được Docker daemon

Nếu xuất hiện lỗi tương tự `failed to connect to the docker API`, hãy mở Docker Desktop, chờ Docker Engine khởi động hoàn tất rồi chạy lại:

```bash
docker compose up --build -d
```

### Cổng đang được sử dụng

Đổi port phía máy host trong `.env`:

```dotenv
FRONTEND_PORT=3100
BACKEND_PORT=3101
MONGO_PORT=27018
```

Khi đổi `BACKEND_PORT`, cũng cập nhật URL mà trình duyệt sử dụng:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:3101
```

Sau đó build lại frontend.

### Backend không kết nối được MongoDB

Kiểm tra trạng thái và log:

```bash
docker compose ps
docker compose logs mongo
docker compose logs backend
```

Nếu đã đổi tài khoản MongoDB sau khi volume được tạo, thông tin đăng nhập cũ vẫn nằm trong volume. Sao lưu dữ liệu trước khi cân nhắc tạo lại volume.

### Frontend không gọi được backend

Kiểm tra health endpoint:

```text
http://localhost:3001/api/health
```

Sau đó kiểm tra `NEXT_PUBLIC_BACKEND_URL` trong `.env` và build lại frontend.

### Kiểm tra cấu hình Compose

```bash
docker compose config
```

Lệnh này giúp phát hiện lỗi YAML và hiển thị cấu hình cuối cùng sau khi nạp biến môi trường.

## 10. Lưu ý bảo mật

- Không commit file `.env` lên Git.
- Không sử dụng mật khẩu và JWT secret mẫu trên môi trường production.
- Không công khai cổng MongoDB ra Internet nếu không thực sự cần.
- Chỉ thêm đúng domain frontend cần thiết vào CORS.
- Nên đặt reverse proxy HTTPS phía trước frontend và backend khi deploy.
