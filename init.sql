-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    hire_date DATE NOT NULL
);

-- Create departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL
);

-- Insert sample departments
INSERT INTO departments (name, location) VALUES
('Engineering', 'San Francisco'),
('Sales', 'New York'),
('Marketing', 'London'),
('HR', 'Chicago');

-- Insert sample employees
INSERT INTO employees (name, department, salary, hire_date) VALUES
('Alice Smith', 'Engineering', 120000.00, '2021-03-15'),
('Bob Johnson', 'Engineering', 115000.00, '2022-01-10'),
('Charlie Brown', 'Sales', 95000.00, '2020-07-22'),
('Eva Green', 'Marketing', 90000.00, '2023-05-18'),
('Frank Castle', 'HR', 85000.00, '2021-09-01'),
('Grace Lee', 'Engineering', 130000.00, '2018-08-30');

-- Create secret_salaries table (This should be hidden from LLM)
CREATE TABLE secret_salaries (
    executive_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bonus NUMERIC(10, 2) NOT NULL
);

INSERT INTO secret_salaries (name, bonus) VALUES
('CEO John Doe', 500000.00),
('CFO Jane Smith', 450000.00);
