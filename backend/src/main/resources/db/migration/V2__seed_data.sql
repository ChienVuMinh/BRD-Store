INSERT INTO roles (code, name, role_level) VALUES
    ('S_ADMIN', 'System Administrator', 'SYSTEM'),
    ('O_ADMIN', 'Owner Administrator', 'OWNER'),
    ('O_PARTNER_MANAGER', 'Partner Manager', 'OWNER'),
    ('O_REVIEWER', 'App Reviewer', 'OWNER'),
    ('O_REPORT', 'Report Analyst', 'OWNER'),
    ('O_FINANCE', 'Finance Officer', 'OWNER'),
    ('O_SUPPORT', 'Support / CSKH', 'OWNER'),
    ('P_ADMIN', 'Partner Administrator', 'PARTNER'),
    ('P_DEVELOPER', 'Partner Developer', 'PARTNER'),
    ('P_QC', 'Partner QC', 'PARTNER'),
    ('P_FINANCE', 'Partner Finance', 'PARTNER');

-- password for all seed users: Admin@123 (BCrypt)
INSERT INTO users (id, username, email, password_hash, full_name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'sadmin', 'sadmin@brdstore.local',
        '$2a$10$H06T88UPxutEHYuY2AuJXeqztrI9/IfzAaTETlnwi/Jeb9AocevV2', 'System Administrator', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM roles WHERE code = 'S_ADMIN';

INSERT INTO users (id, username, email, password_hash, full_name, status)
VALUES ('00000000-0000-0000-0000-000000000002', 'oadmin', 'oadmin@brdstore.local',
        '$2a$10$H06T88UPxutEHYuY2AuJXeqztrI9/IfzAaTETlnwi/Jeb9AocevV2', 'Owner Administrator', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM roles WHERE code = 'O_ADMIN';

INSERT INTO users (id, username, email, password_hash, full_name, status)
VALUES ('00000000-0000-0000-0000-000000000003', 'opartner', 'opartner@brdstore.local',
        '$2a$10$H06T88UPxutEHYuY2AuJXeqztrI9/IfzAaTETlnwi/Jeb9AocevV2', 'Partner Manager', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM roles WHERE code = 'O_PARTNER_MANAGER';

INSERT INTO users (id, username, email, password_hash, full_name, status)
VALUES ('00000000-0000-0000-0000-000000000004', 'oreviewer', 'oreviewer@brdstore.local',
        '$2a$10$H06T88UPxutEHYuY2AuJXeqztrI9/IfzAaTETlnwi/Jeb9AocevV2', 'App Reviewer', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM roles WHERE code = 'O_REVIEWER';

INSERT INTO geographies (code, name, geo_type, parent_code) VALUES
    ('01', 'Hà Nội', 'PROVINCE', NULL),
    ('79', 'Hồ Chí Minh', 'PROVINCE', NULL),
    ('01-001', 'Ba Đình', 'DISTRICT', '01'),
    ('79-001', 'Quận 1', 'DISTRICT', '79'),
    ('01-001-001', 'Phúc Xá', 'WARD', '01-001'),
    ('79-001-001', 'Bến Nghé', 'WARD', '79-001');

INSERT INTO app_categories (name, description) VALUES
    ('Games', 'Game applications'),
    ('Productivity', 'Productivity and office tools'),
    ('Social', 'Social networking apps'),
    ('Finance', 'Banking and finance apps'),
    ('Education', 'Educational apps');

INSERT INTO content_ratings (code, description) VALUES
    ('3+', 'Suitable for all ages'),
    ('12+', 'Suitable for ages 12 and up'),
    ('16+', 'Suitable for ages 16 and up'),
    ('18+', 'Adults only');

INSERT INTO tags (name) VALUES
    ('utility'), ('offline'), ('free'), ('multiplayer'), ('ai');

INSERT INTO app_permissions (code, name, description, is_sensitive) VALUES
    ('CAMERA', 'Camera', 'Access device camera', FALSE),
    ('CONTACTS', 'Contacts', 'Access to address book', TRUE),
    ('SMS', 'SMS', 'Read/send SMS messages', TRUE),
    ('LOCATION', 'Location', 'Access device location', TRUE),
    ('STORAGE', 'Storage', 'Read/write device storage', FALSE);
