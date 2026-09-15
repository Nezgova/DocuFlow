-- DocuFlow database schema for XAMPP / MySQL 8+
-- Import in phpMyAdmin: select the `docuflow` database, open SQL, paste this file, then click Go.

CREATE DATABASE IF NOT EXISTS docuflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE docuflow;

CREATE TABLE IF NOT EXISTS departments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_departments_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_categories_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tags (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_tags_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_tags (
  document_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (document_id, tag_id),
  KEY idx_document_tags_tag (tag_id),
  CONSTRAINT fk_document_tags_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMINISTRATOR', 'MANAGER', 'EMPLOYEE') NOT NULL,
  department_id BIGINT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email),
  KEY idx_users_department (department_id),
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(2000) NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'READY_FOR_SIGNATURE', 'SIGNED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  due_date DATE NULL,
  current_version INT NOT NULL DEFAULT 1,
  owner_id BIGINT NOT NULL,
  department_id BIGINT NULL,
  category_id BIGINT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_documents_owner (owner_id),
  KEY idx_documents_department (department_id),
  KEY idx_documents_category (category_id),
  KEY idx_documents_status (status),
  KEY idx_documents_priority (priority),
  KEY idx_documents_due_date (due_date),
  KEY idx_documents_created_at (created_at),
  CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_documents_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_documents_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_versions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  version_number INT NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by_id BIGINT NOT NULL,
  change_notes VARCHAR(1000) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_document_versions_doc (document_id),
  KEY idx_document_versions_uploaded_by (uploaded_by_id),
  CONSTRAINT fk_document_versions_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_versions_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS approvals (
  id BIGINT NOT NULL AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  decision ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  decided_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_approvals_document_reviewer UNIQUE (document_id, reviewer_id),
  KEY idx_approvals_reviewer (reviewer_id),
  KEY idx_approvals_decision (decision),
  CONSTRAINT fk_approvals_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_approvals_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  content VARCHAR(2000) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_comments_document_created (document_id, created_at),
  CONSTRAINT fk_comments_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  actor_id BIGINT NOT NULL,
  action VARCHAR(80) NOT NULL,
  detail VARCHAR(500) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_activity_logs_document_created (document_id, created_at),
  KEY idx_activity_logs_actor (actor_id),
   CONSTRAINT fk_activity_logs_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
   CONSTRAINT fk_activity_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, is_read),
  KEY idx_notifications_created (created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed default departments if not present
INSERT INTO departments (name, description)
SELECT 'Human Resources', 'Personnel management, recruitment, and employee relations'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Human Resources');

INSERT INTO departments (name, description)
SELECT 'Finance', 'Accounting, budgeting, and financial reporting'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Finance');

INSERT INTO departments (name, description)
SELECT 'Legal', 'Contracts, compliance, and regulatory matters'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Legal');

INSERT INTO departments (name, description)
SELECT 'IT', 'Information technology, systems, and security'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'IT');

INSERT INTO departments (name, description)
SELECT 'Marketing', 'Brand management, advertising, and communications'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Marketing');

-- Seed default categories if not present
INSERT INTO categories (name, description)
SELECT 'Contract', 'Legal agreements and binding contracts'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Contract');

INSERT INTO categories (name, description)
SELECT 'Invoice', 'Billing, invoices, and financial payment requests'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Invoice');

INSERT INTO categories (name, description)
SELECT 'Policy', 'Company policies, handbooks, and guidelines'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Policy');

INSERT INTO categories (name, description)
SELECT 'Report', 'Business, performance, and audit reports'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Report');

INSERT INTO categories (name, description)
SELECT 'Meeting Minutes', 'Official notes and minutes from meetings'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Meeting Minutes');

INSERT INTO categories (name, description)
SELECT 'Purchase Order', 'Procurement and purchase order documents'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Purchase Order');

INSERT INTO categories (name, description)
SELECT 'Internship Convention', 'Student internship agreements and conventions'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Internship Convention');

INSERT INTO categories (name, description)
SELECT 'Technical Documentation', 'Technical specifications, architectures, and manuals'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Technical Documentation');
