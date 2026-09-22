-- ═══════════════════════════════════════════════════════════
-- FindX Database Setup Script
-- Run this in MySQL before starting the application
-- ═══════════════════════════════════════════════════════════

-- Create Database
CREATE DATABASE IF NOT EXISTS findx_db;
USE findx_db;

-- ─── Admin Login Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_login (
    adminid VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(150)
);

-- Insert default admin (ID: admin, Password: admin123)
INSERT IGNORE INTO admin_login (adminid, name, password, email)
VALUES ('admin', 'Super Admin', 'admin123', 'admin@findx.in');

-- ─── Categories Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_class VARCHAR(50) DEFAULT 'bi-tag'
);

-- Insert default categories
INSERT IGNORE INTO categories (name, icon_class) VALUES
('Electronics',     'bi-laptop-fill'),
('Mobile Phone',    'bi-phone-fill'),
('Laptop',          'bi-laptop-fill'),
('Wallet',          'bi-wallet-fill'),
('Bag',             'bi-bag-fill'),
('Backpack',        'bi-bag-fill'),
('Keys',            'bi-key-fill'),
('Watch',           'bi-watch'),
('Jewelry',         'bi-gem'),
('Documents',       'bi-file-earmark-text-fill'),
('ID Card',         'bi-person-badge-fill'),
('Passport',        'bi-passport'),
('Glasses',         'bi-eyeglasses'),
('Headphones',      'bi-headphones'),
('Camera',          'bi-camera-fill'),
('Bicycle',         'bi-bicycle'),
('Books',           'bi-book-fill'),
('Clothes',         'bi-bag-heart-fill'),
('Toys',            'bi-controller'),
('Other',           'bi-question-circle-fill');

-- ─── Users Table (JPA will create automatically, this is for reference) ──
-- The application uses spring.jpa.hibernate.ddl-auto=update
-- so all tables will be created automatically by JPA/Hibernate.

-- ═══════════════════════════════════════════════════════════
-- After running this script, start the application with:
-- mvn spring-boot:run
-- OR open in IntelliJ/STS and run FindxApplication.java
-- ═══════════════════════════════════════════════════════════
