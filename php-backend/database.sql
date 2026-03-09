CREATE DATABASE IF NOT EXISTS studio_management;
USE studio_management;

CREATE TABLE clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    dueDate VARCHAR(50) NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE models (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    hourlyRate DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE project_models (
    project_id VARCHAR(50) NOT NULL,
    model_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, model_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

CREATE TABLE content (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    scheduledDate VARCHAR(50) NOT NULL,
    url VARCHAR(255)
);

CREATE TABLE schedule (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    participants TEXT NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
    name VARCHAR(100) PRIMARY KEY
);

INSERT INTO categories (name) VALUES ('Fashion'), ('Commercial'), ('Editorial'), ('Fitness'), ('Parts');
