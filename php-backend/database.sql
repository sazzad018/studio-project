-- Database Schema for Studio Management System

CREATE DATABASE IF NOT EXISTS studio_management;
USE studio_management;

-- 1. Core Entities
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    facebook VARCHAR(255),
    totalBudget DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    budget DECIMAL(10, 2) DEFAULT 0,
    category VARCHAR(100),
    thumbnailUrl LONGTEXT,
    script TEXT,
    link VARCHAR(255),
    clientAdvance DECIMAL(10, 2) DEFAULT 0,
    modelPayment DECIMAL(10, 2) DEFAULT 0,
    extraExpenses DECIMAL(10, 2) DEFAULT 0,
    contentLog TEXT,
    startDate VARCHAR(50),
    endDate VARCHAR(50),
    contentType VARCHAR(100),
    priority VARCHAR(50),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    hourlyRate DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 5.0,
    imageUrl LONGTEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    facebook VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS project_models (
    project_id VARCHAR(50) NOT NULL,
    model_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, model_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    platform VARCHAR(50),
    status VARCHAR(50),
    scheduledDate VARCHAR(50),
    url VARCHAR(255),
    imageUrl LONGTEXT,
    projectId VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS schedule (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    models TEXT,
    crew TEXT,
    projectId VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS categories (
    name VARCHAR(100) PRIMARY KEY
);

-- 2. Finance and Billing
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    clientId VARCHAR(50),
    projectId VARCHAR(50),
    invoiceNumber VARCHAR(50),
    date VARCHAR(50),
    dueDate VARCHAR(50),
    items LONGTEXT,
    subtotal DECIMAL(10, 2),
    taxRate DECIMAL(5, 2),
    discount DECIMAL(10, 2),
    total DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Unpaid',
    notes TEXT
);

-- 3. Task Management
CREATE TABLE IF NOT EXISTS daily_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_key VARCHAR(20) NOT NULL,
    step_id VARCHAR(100) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    notes TEXT,
    UNIQUE KEY (date_key, step_id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'To Do',
    assignedTo VARCHAR(100),
    dueDate VARCHAR(50)
);

-- 4. User and HR Management
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(50),
    salary VARCHAR(50),
    joiningDate VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    password VARCHAR(255),
    permissions TEXT,
    isSuperAdmin BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS time_logs (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    date VARCHAR(50),
    checkIn VARCHAR(50),
    checkOut VARCHAR(50),
    totalHours DECIMAL(5, 2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS work_logs (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    date VARCHAR(50),
    task TEXT,
    hours DECIMAL(5, 2)
);

-- 5. CRM functionality (Leads, Comments, Templates)
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    company VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    status VARCHAR(50),
    notes TEXT,
    followUpDate VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS message_templates (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150),
    content TEXT
);

-- 6. Generic Store / Configuration / Caching
-- Used for generic configurations like logo URLs, terms & conditions, app state.
CREATE TABLE IF NOT EXISTS key_value_store (
    store_key VARCHAR(150) PRIMARY KEY,
    store_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Service Specific Clients (Marketing, Video, Website, etc.)
CREATE TABLE IF NOT EXISTS service_clients (
    id VARCHAR(50) PRIMARY KEY,
    businessName VARCHAR(255) NOT NULL,
    websiteUrl VARCHAR(255),
    whatsappNumber VARCHAR(50),
    email VARCHAR(100),
    serviceType VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    facebookPageLink VARCHAR(255),
    adAccountId VARCHAR(100),
    createdAt VARCHAR(50),
    isPinned BOOLEAN DEFAULT 0,
    details JSON
);

CREATE TABLE IF NOT EXISTS service_comments (
    id VARCHAR(50) PRIMARY KEY,
    clientId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    authorId VARCHAR(50),
    authorName VARCHAR(100),
    createdAt VARCHAR(50),
    FOREIGN KEY (clientId) REFERENCES service_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_reminders (
    id VARCHAR(50) PRIMARY KEY,
    clientId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    assignedToId VARCHAR(50),
    dueDate VARCHAR(50),
    isFbAdEndReminder BOOLEAN DEFAULT 0,
    FOREIGN KEY (clientId) REFERENCES service_clients(id) ON DELETE CASCADE
);

-- Initial Dummy Data
INSERT IGNORE INTO categories (name) VALUES ('Fashion'), ('Commercial'), ('Editorial'), ('Fitness'), ('Parts');
