-- Migration: Add payment columns to bookings table
-- This adds payment status and Razorpay payment details to bookings
-- Date: 2025-01-01

USE db_week_one_up;

-- Add payment-related columns to bookings table if they don't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255) NULL,
ADD INDEX IF NOT EXISTS idx_payment_status (payment_status),
ADD INDEX IF NOT EXISTS idx_booking_status (booking_status);

-- Create orders table for payment history (optional, if not exists)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_date (order_date)
);


