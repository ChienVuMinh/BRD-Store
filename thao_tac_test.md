# HƯỚNG DẪN TEST BACKEND (BRD Store)

## Chuẩn bị
- Backend đã chạy thành công tại: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Database: PostgreSQL, database `brd_store`, user `brd_store`

## Tài khoản mẫu (seed data) — mật khẩu chung: `Admin@123`

| Username    | Vai trò            |
|-------------|---------------------|
| `sadmin`    | S_ADMIN              |
| `oadmin`    | O_ADMIN               |
| `opartner`  | O_PARTNER_MANAGER     |
| `oreviewer` | O_REVIEWER             |

---

## Bước 1 — Đăng nhập lấy token

1. Vào Swagger UI, tìm nhóm **Auth**, gọi API login với:
   ```json
   { "username": "sadmin", "password": "Admin@123" }
   ```
2. Copy giá trị `token` trong response.
3. Bấm nút **Authorize** (🔒 góc trên phải Swagger UI) → dán token vào → Authorize.
4. Từ giờ mọi API gọi sau đều mang theo quyền của tài khoản đã đăng nhập.

---

## Bước 2 — Test luồng Partner (đối tác)

1. Đăng ký 1 partner mới (API tạo/đăng ký partner) — điền `name`, `tax_id`, `email`...
   → Kiểm tra: partner mới tạo có `status = PENDING`.
2. Đăng xuất, đăng nhập lại bằng `opartner` (role O_PARTNER_MANAGER).
3. Gọi API duyệt partner (APPROVE) cho partner vừa tạo.
   → Kiểm tra: partner chuyển `status = APPROVED`.
4. Kiểm tra trong bảng `users` (qua DBeaver) xem có tài khoản `P_ADMIN` mới được tự tạo, gắn đúng `partner_id` của partner vừa duyệt không.

---

## Bước 3 — Test luồng App & Version

1. Đăng nhập bằng tài khoản `P_ADMIN` vừa được tạo ở Bước 2.
2. Tạo app mới — chọn `os_platform`, `package_name`, `name`, category...
   → Kiểm tra: app có `status = DRAFT`.
3. Upload 1 version cho app (file bất kỳ, không cần file APK thật vì đây là demo).
   → Kiểm tra: version chuyển `DRAFT → SUBMIT`.
4. Gọi API đệ trình version để duyệt.
   → Kiểm tra: version chuyển sang `IN_REVIEW`.
5. Đăng nhập bằng `oreviewer` (role O_REVIEWER).
6. Thử 2 trường hợp:
   - Duyệt version → kiểm tra chuyển `APPROVED`.
   - Từ chối 1 version khác → bắt buộc phải nhập `rejection_reason`, kiểm tra chuyển `REJECTED`.
7. Với version đã `APPROVED`, gọi API publish.
   → Kiểm tra: version chuyển `PUBLISHED`.
8. Nếu app có version cũ đã `PUBLISHED` trước đó, kiểm tra version cũ có tự động chuyển sang `ARCHIVED` không (logic tự động archive khi publish bản mới).

---

## Bước 4 — Kiểm tra Audit Log

- Gọi API xem audit log (dành cho S_ADMIN/O_SUPPORT).
- Xác nhận các hành động ở Bước 2, 3 đều được ghi lại đầy đủ:
  - Ai thực hiện (`user_id`)
  - Hành động gì (`action`)
  - Bảng nào (`target_entity`)
  - Dữ liệu cũ/mới (`old_value`, `new_value` dạng JSON)

---

## Bước 5 — Kiểm tra Notification

- Sau khi version bị reject/approve ở Bước 3, đăng nhập bằng tài khoản liên quan (VD P_ADMIN của partner đó).
- Gọi API lấy danh sách notification.
- Kiểm tra có thông báo mới được tạo tương ứng với hành động reject/approve không.

---

## Bước 6 — Kiểm tra phân quyền (RBAC)

- Thử gọi 1 API cần quyền cao (VD: duyệt version, duyệt partner) bằng:
  - Tài khoản không đủ quyền (VD `P_DEVELOPER`).
  - Không đăng nhập (không có token).
- Kỳ vọng: bị từ chối với mã lỗi `403 Forbidden` (hoặc `401 Unauthorized` nếu chưa đăng nhập).

---

## Bước 7 — Test luồng Consumer (người dùng cuối) — tuỳ chọn

1. Đăng ký/đăng nhập 1 tài khoản consumer.
2. Gọi API ghi nhận lượt tải (install) cho app đã `PUBLISHED`.
3. Gọi API đánh giá (rating 1-5 sao + comment) cho app đó.
   → Kiểm tra: chỉ được đánh giá 1 lần / app (unique theo user + app).
4. Đăng nhập bằng P_ADMIN của partner sở hữu app, gọi API trả lời đánh giá (`developer_reply`).
5. Đăng nhập bằng O_SUPPORT (nếu có tài khoản), thử ẩn (`is_hidden = true`) 1 đánh giá vi phạm.

---

## Bước 8 — Kiểm tra job nền (background job)

- Chờ vài phút hoặc kiểm tra log console của backend, xác nhận job `@Scheduled` tính lại `app_stats` có chạy không (xem log hoặc query trực tiếp bảng `app_stats` qua DBeaver, so sánh `updated_at` có thay đổi theo thời gian không).

---

## Ghi chú

- Nếu gặp lỗi trong quá trình test, ghi lại: API đang gọi, request body, mã lỗi trả về, và log console backend để debug.
- Các điểm BRD chưa quy định rõ (được agent tự quyết định khi code) — cần xác nhận lại khi test:
  1. Ai có quyền duyệt **app metadata** (không chỉ version) — hiện đang cho O_REVIEWER/O_ADMIN/S_ADMIN.
  2. Consumer có cơ chế đăng nhập riêng (JWT), khác với BRD gốc chưa có mô tả.
  3. `partner_api_keys` sinh được nhưng chưa có luồng xác thực riêng cho CI/CD (hiện mọi thứ đều qua JWT thường).
  4. P_QC / P_FINANCE dùng chung API với P_ADMIN, chưa có endpoint riêng biệt.
