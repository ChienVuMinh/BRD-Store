# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD) & THIẾT KẾ CƠ SỞ DỮ LIỆU
**Dự án:** Hệ thống Phân phối & Kiểm duyệt Ứng dụng (App Store)

---

## PHẦN A: YÊU CẦU NGHIỆP VỤ

### 1. CẤU TRÚC PHÂN QUYỀN NGƯỜI DÙNG (USER ROLES)

Hệ thống quản lý 4 nhóm đối tượng chính:

**1.1. Cấp Hệ thống (System Level - Quản trị lõi)**
*   **S_ADMIN**: Quản trị viên cấp cao nhất. Quản lý cấu hình lõi hệ thống, tạo và phân quyền cho người dùng Cấp Chủ quản.

**1.2. Cấp Chủ quản (Owner Level - Vận hành nền tảng App Store)**
*   **O_ADMIN**: Quản trị chung toàn bộ nền tảng vận hành.
*   **O_PARTNER_MANAGER**: Chuyên viên quản lý đối tác (Xử lý hồ sơ pháp lý, định danh KYC, duyệt tư cách đối tác).
*   **O_REVIEWER**: Chuyên viên kiểm duyệt (Đánh giá nội dung, soi quyền nhạy cảm, phê duyệt bản build).
*   **O_REPORT**: Chuyên viên phân tích dữ liệu (Xem báo cáo tổng quan, thống kê lượt tải, doanh thu toàn chợ).
*   **O_FINANCE**: Kế toán (Xử lý đối soát, doanh thu In-app/App trả phí, thanh toán Payout bằng VNĐ cho đối tác).
*   **O_SUPPORT**: Hỗ trợ kỹ thuật / CSKH (Quyền Read-only xem thông tin app, log hệ thống, ẩn các bình luận vi phạm).

**1.3. Cấp Đối tác (Partner Level - Nhà phát triển / B2B)**
*   **P_ADMIN**: Quản trị viên đối tác (Chủ sở hữu hồ sơ). Toàn quyền quản lý nhân sự, tạo API Key CI/CD, khai báo app, giá bán và phát hành.
*   **P_DEVELOPER**: Lập trình viên. Có quyền upload bản build (hoặc đẩy qua API), cấu hình kỹ thuật (SDK, Hash), test app.
*   **P_QC**: Chuyên viên kiểm thử. Có quyền truy cập tải và test các bản build nội bộ, báo cáo lỗi.
*   **P_FINANCE**: Kế toán đối tác (Xem báo cáo doanh thu, cập nhật STK ngân hàng nhận tiền).

**1.4. Người dùng cuối (Consumers - B2C)**
*   Khách hàng tải ứng dụng trên Chợ. Hệ thống quản lý tài khoản định danh, thiết bị, lịch sử tải và dữ liệu đánh giá (Rating/Review).

---

### 2. CHI TIẾT LUỒNG NGHIỆP VỤ CỐT LÕI (B2B)

#### 2.1. Quản lý Đối tác (Partner Management)
*   **Luồng đăng ký:** Đối tác đăng ký qua Cổng Partner. Hồ sơ được `O_PARTNER_MANAGER` duyệt. Khi thành công, tài khoản trở thành `P_ADMIN`. `P_ADMIN` tự tạo các tài khoản cấp dưới (`P_DEV`, `P_QC`) hoặc tạo **API Keys** (để upload tự động).
*   **Máy trạng thái đối tác:** `PENDING` ➔ `APPROVED` / `REJECTED` ➔ `SUSPENDED` (Nếu vi phạm).
*   **Dữ liệu lõi:** Mã số thuế, Giấy tờ pháp lý, Thông tin người đại diện, Tài khoản ngân hàng (VNĐ) để nhận đối soát.

#### 2.2. Khai báo & Quản lý Ứng dụng (App Metadata & Configuration)
*   **Luồng khai báo:** `P_ADMIN` tạo hồ sơ app mới. Phân định rõ HĐH (Android, iOS, HarmonyOS). `Package Name` phải là duy nhất trên mỗi nền tảng.
*   **Mô hình kinh doanh:** Lựa chọn App Miễn phí (`FREE`) hoặc Trả phí (`PAID` - nhập giá VNĐ).
*   **Máy trạng thái Hồ sơ App:** `DRAFT` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `SUSPENDED`.
*   **Dữ liệu hiển thị:**
    *   Tên app, Mô tả, Logo, Banner, Screenshots, Danh mục, Độ tuổi.
    *   **Tags:** Từ khóa tối ưu SEO trên App Store.
    *   **Khu vực phân phối:** Chọn theo cây địa lý (Tỉnh ➔ Huyện ➔ Xã).
*   **Bảo mật:**
    *   Cây danh mục quyền. Nếu là quyền nhạy cảm (Danh bạ, SMS), bắt buộc điền `Justification` (Giải trình).
    *   Khai báo chữ ký số (`App Signature Hash`) chống mạo danh.

#### 2.3. Quản lý Phiên bản & Luồng Kiểm duyệt (Version Lifecycle & CI/CD)
*   **Máy trạng thái Phiên bản:**
    1.  `DRAFT`: Bản build vừa được tải lên, đang chờ hoàn thiện thông tin.
    2.  `SUBMIT`: Bản build hoàn tất cấu hình. Sinh URL test để `P_DEVELOPER` và `P_QC` test nội bộ.
    3.  `IN_REVIEW`: `P_ADMIN` đệ trình. Version vào hàng đợi của `O_REVIEWER`.
    4.  `APPROVED` / `REJECTED`: `O_REVIEWER` đánh giá. Từ chối bắt buộc có `Rejection Reason`.
    5.  `PUBLISHED`: Bản build đã duyệt được phát hành lên Store.
    6.  `ARCHIVED`: Version cũ tự động lưu trữ.
*   **Dữ liệu kỹ thuật:** Version Name, Build Number (tự tăng), SHA-256 Hash, Min SDK / Target SDK.

---

### 3. LUỒNG NGƯỜI DÙNG CUỐI & STOREFRONT (B2C)

#### 3.1. Tải & Cài đặt Ứng dụng (App Installs)
*   Hệ thống ghi nhận lịch sử vào bảng Thống kê (ID người dùng, Phiên bản, Thiết bị, Thời gian).
*   Dữ liệu được tổng hợp vào `App Stats` để hiển thị `Total Downloads`.

#### 3.2. Đánh giá & Phản hồi (Ratings & Reviews)
*   **Người dùng:** Đánh giá (1-5 sao) và Bình luận. 1 user/1 app.
*   **Đối tác:** Sử dụng `Developer Reply` để trả lời.
*   **Quản trị viên:** Có quyền kiểm duyệt (Moderation), bật cờ `is_hidden` để ẩn bình luận vi phạm.

---

### 4. HỆ THỐNG LÕI & BẢO MẬT (SYSTEM & SECURITY)

*   **Nhật ký Kiểm toán (Audit Logs):** Mọi thao tác Thêm/Sửa/Xóa, thay đổi trạng thái, phân quyền, cấu hình tài chính đều phải ghi Log (Người thực hiện, Hành động, Bảng, Dữ liệu cũ/mới dạng JSON, IP, Thời gian).
*   **Tối ưu Hiệu suất:** Dùng bảng `app_stats` lưu chỉ số Aggregated tính toán ngầm (Background jobs) giảm tải DB.
*   **Bảo mật ID:** Dùng `UUID` cho mã định danh chống rà quét dữ liệu (ID Scraping).

---

## PHẦN B: DATABASE SCRIPT (POSTGRESQL)

```sql
-- ==============================================================================
-- 1. ENUMS (MÁY TRẠNG THÁI & PHÂN LOẠI)
-- ==============================================================================
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE partner_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE partner_type_enum AS ENUM ('INDIVIDUAL', 'ENTERPRISE');
CREATE TYPE app_status_enum AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE version_status_enum AS ENUM ('DRAFT', 'SUBMIT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE review_action_enum AS ENUM ('APPROVED', 'REJECTED');
CREATE TYPE geo_type_enum AS ENUM ('PROVINCE', 'DISTRICT', 'WARD');
CREATE TYPE os_platform_enum AS ENUM ('ANDROID', 'IOS', 'HARMONYOS', 'MULTI_PLATFORM');
CREATE TYPE app_price_type_enum AS ENUM ('FREE', 'PAID');

-- ==============================================================================
-- 2. DANH MỤC LÕI & CẤU TRÚC PHÂN CẤP
-- ==============================================================================
CREATE TABLE geographies (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    geo_type geo_type_enum NOT NULL,
    parent_code VARCHAR(20) REFERENCES geographies(code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT REFERENCES app_permissions(id),
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_url TEXT
);

CREATE TABLE content_ratings (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    search_count BIGINT DEFAULT 0
);

-- ==============================================================================
-- 3. ĐỐI TÁC, NGƯỜI DÙNG & API ACCESS
-- ==============================================================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    partner_type partner_type_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    legal_rep_name VARCHAR(255) NOT NULL,
    legal_rep_phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    province_code VARCHAR(20) REFERENCES geographies(code),
    district_code VARCHAR(20) REFERENCES geographies(code),
    ward_code VARCHAR(20) REFERENCES geographies(code),
    address_detail TEXT,
    logo_url TEXT,
    legal_document_url TEXT,
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    bank_account_no VARCHAR(100),
    bank_account_name VARCHAR(255),
    status partner_status_enum DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_level VARCHAR(50)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    status user_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE partner_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    api_key_hash VARCHAR(255) NOT NULL,
    key_name VARCHAR(100),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. ỨNG DỤNG (METADATA)
-- ==============================================================================
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    os_platform os_platform_enum NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_desc VARCHAR(255),
    full_desc TEXT,
    logo_url TEXT,
    banner_url TEXT,
    content_rating_id INT REFERENCES content_ratings(id),
    support_email VARCHAR(255),
    support_phone VARCHAR(20),
    website_url TEXT,
    privacy_policy_url TEXT,
    price_type app_price_type_enum DEFAULT 'FREE',
    price_vnd DECIMAL(12, 2) DEFAULT 0.00,
    app_signature_hash VARCHAR(255),
    is_global_access BOOLEAN DEFAULT TRUE,
    status app_status_enum DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(os_platform, package_name) 
);

CREATE TABLE app_category_map (
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    category_id INT REFERENCES app_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (app_id, category_id)
);

CREATE TABLE app_geography_map (
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    geography_code VARCHAR(20) REFERENCES geographies(code) ON DELETE CASCADE,
    PRIMARY KEY (app_id, geography_code)
);

CREATE TABLE app_permission_map (
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    permission_id INT REFERENCES app_permissions(id) ON DELETE CASCADE,
    justification TEXT NOT NULL,
    PRIMARY KEY (app_id, permission_id)
);

CREATE TABLE app_tag_map (
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (app_id, tag_id)
);

CREATE TABLE app_screenshots (
    id SERIAL PRIMARY KEY,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- ==============================================================================
-- 5. PHIÊN BẢN & KIỂM DUYỆT
-- ==============================================================================
CREATE TABLE app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE NOT NULL,
    version_name VARCHAR(100) NOT NULL,
    build_number BIGINT NOT NULL,
    file_url TEXT,
    file_size_bytes BIGINT,
    file_hash_sha256 VARCHAR(255),
    min_sdk_version VARCHAR(50),
    target_sdk_version VARCHAR(50),
    supported_architectures VARCHAR(100),
    release_notes TEXT,
    scheduled_release_date TIMESTAMP WITH TIME ZONE,
    status version_status_enum DEFAULT 'DRAFT',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, build_number)
);

CREATE TABLE version_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES app_versions(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    action review_action_enum NOT NULL,
    rejection_reason TEXT,
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. NGƯỜI DÙNG CUỐI (B2C) & TƯƠNG TÁC
-- ==============================================================================
CREATE TABLE consumers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_installs (
    id BIGSERIAL PRIMARY KEY,
    app_id UUID REFERENCES apps(id),
    version_id UUID REFERENCES app_versions(id),
    consumer_id UUID REFERENCES consumers(id),
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    consumer_id UUID REFERENCES consumers(id) ON DELETE CASCADE,
    version_id UUID REFERENCES app_versions(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    developer_reply TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, consumer_id)
);

CREATE TABLE app_stats (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    total_downloads BIGINT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. AUDIT LOGS & INDEXES
-- ==============================================================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_entity_id VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apps_platform_package ON apps(os_platform, package_name);
CREATE INDEX idx_app_tags_tag_id ON app_tag_map(tag_id);
CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_app_installs_app_id ON app_installs(app_id);
CREATE INDEX idx_audit_logs_lookup ON audit_logs(target_entity, target_entity_id);
