-- DocuFlow database schema for XAMPP / MySQL 8+
-- Import in phpMyAdmin: select the `docuflow` database, open SQL, paste this file, then click Go.

CREATE DATABASE IF NOT EXISTS docuflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE docuflow;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMINISTRATOR', 'MANAGER', 'EMPLOYEE') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'READY_FOR_SIGNATURE', 'SIGNED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  owner_id BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_documents_owner (owner_id),
  KEY idx_documents_status (status),
  KEY idx_documents_created_at (created_at),
  CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES users(id)
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
