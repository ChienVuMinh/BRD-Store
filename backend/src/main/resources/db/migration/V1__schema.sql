CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE partner_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE partner_type_enum AS ENUM ('INDIVIDUAL', 'ENTERPRISE');
CREATE TYPE app_status_enum AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE version_status_enum AS ENUM ('DRAFT', 'SUBMIT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE review_action_enum AS ENUM ('APPROVED', 'REJECTED');
CREATE TYPE geo_type_enum AS ENUM ('PROVINCE', 'DISTRICT', 'WARD');
CREATE TYPE os_platform_enum AS ENUM ('ANDROID', 'IOS', 'HARMONYOS', 'MULTI_PLATFORM');
CREATE TYPE app_price_type_enum AS ENUM ('FREE', 'PAID');
CREATE TYPE notification_type_enum AS ENUM ('APP_STATUS_CHANGE', 'VERSION_STATUS_CHANGE', 'PARTNER_STATUS_CHANGE', 'NEW_REVIEW', 'DEVELOPER_REPLY', 'GENERAL');

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

CREATE TABLE consumers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
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

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consumer_id UUID REFERENCES consumers(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR consumer_id IS NOT NULL)
);

CREATE INDEX idx_apps_platform_package ON apps(os_platform, package_name);
CREATE INDEX idx_app_tags_tag_id ON app_tag_map(tag_id);
CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_app_installs_app_id ON app_installs(app_id);
CREATE INDEX idx_audit_logs_lookup ON audit_logs(target_entity, target_entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_consumer ON notifications(consumer_id);
CREATE INDEX idx_apps_partner_id ON apps(partner_id);
CREATE INDEX idx_app_versions_app_id ON app_versions(app_id);
CREATE INDEX idx_users_partner_id ON users(partner_id);
