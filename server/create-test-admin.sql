-- Quick SQL untuk create test admin user
-- Password: admin123
-- Run di PostgreSQL: psql -U postgres -d gabta_dev -f create-test-admin.sql

-- Hash dari bcrypt untuk 'admin123' dengan salt 10
-- $2a$10$xyz... (akan di-generate oleh backend)

-- Cara mudah: Pakai endpoint register untuk create user baru!
-- Atau update password admin yang exist

-- Update password admin yang ada (hash baru untuk 'admin123')
UPDATE users 
SET password = '$2a$10$rOvg4QMZZc5c.vJwvmWJOOH7Y2xS8V9Xa9/p.KZYf5gBH7DZhQO.C'
WHERE email = 'admin@gabta.com';

-- Atau buat admin baru kalau perlu
-- INSERT INTO users (id, email, password, "firstName", "lastName", "roleId", "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid(),
--   'test@gabta.com',
--   '$2a$10$rOvg4QMZZc5c.vJwvmWJOOH7Y2xS8V9Xa9/p.KZYf5gBH7DZhQO.C',
--   'Test',
--   'Admin',
--   (SELECT id FROM roles WHERE name = 'admin'),
--   NOW(),
--   NOW()
-- );
