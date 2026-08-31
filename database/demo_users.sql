-- Optional local demo users for DocuFlow.
-- Import after docuflow_schema.sql. These BCrypt hashes are intentional;
-- never store plain-text passwords in the users table.
USE docuflow;

INSERT INTO users (full_name, email, password_hash, role, active)
SELECT 'Test Manager', 'manager@docuflow.local', '$2a$10$2sY.V4BAcy/G1/dZ4/cF5uLlAqOnamlLSHTd8tXHtJ713y5ibJPZq', 'MANAGER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@docuflow.local');

INSERT INTO users (full_name, email, password_hash, role, active)
SELECT 'Test Employee', 'employee@docuflow.local', '$2a$10$2T52TaxjNaFnpsi7hDK42einLz7ZSsSnttwVvktUSlfcBJP5ZWzre', 'EMPLOYEE', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'employee@docuflow.local');

-- Login credentials:
-- manager@docuflow.local  / Manager123!
-- employee@docuflow.local / Employee123!
