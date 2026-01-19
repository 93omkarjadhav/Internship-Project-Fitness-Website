-- Migration: Add Clubs, System Settings, and Support functionality
-- This adds the wellness clubs feature and system maintenance/support tables
-- Date: 2025-12-05

USE db_week_one_up;

-- Table for Fitness/Wellness Clubs
CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    price_per_day DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0,
    image_url VARCHAR(512),
    facilities JSON, -- e.g., ["gym", "pool", "sauna", "yoga"]
    opening_hours VARCHAR(100), -- e.g., "6 AM - 10 PM"
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_price (price_per_day),
    INDEX idx_location (location),
    INDEX idx_name (name)
);

-- Table for Global App Configuration (Maintenance, Updates, etc.)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_end_time DATETIME,
    maintenance_message TEXT DEFAULT 'We are currently performing scheduled maintenance. Please check back soon.',
    min_app_version VARCHAR(10) DEFAULT '1.0.0',
    latest_app_version VARCHAR(10) DEFAULT '1.2.9',
    privacy_policy_url VARCHAR(255),
    terms_url VARCHAR(255),
    support_email VARCHAR(255) DEFAULT 'support@fitfare.com',
    support_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1) -- Ensure only one row exists
);

-- Table for Contact Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to VARCHAR(255),
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Add subscription status to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status ENUM('free', 'plus', 'premium') DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL;

-- Initialize default system settings
INSERT INTO system_settings (id, maintenance_mode, min_app_version, latest_app_version) 
VALUES (1, FALSE, '1.0.0', '1.2.9')
ON DUPLICATE KEY UPDATE id = 1;

-- Sample Clubs Data (for testing)
INSERT INTO clubs (name, description, location, price_per_day, rating, facilities, opening_hours, contact_number) VALUES
('Go Fitness Club', 'A space designed for exercise, fitness training, and wellness.', 'Pune City', 30.00, 4.5, '["Gym", "Cardio", "Weights", "Personal Training"]', '6 AM - 10 PM', '+91-9876543210'),
('Premium Wellness Center', 'Luxury fitness center with modern equipment and spa facilities.', 'Pune City', 80.00, 4.8, '["Gym", "Pool", "Sauna", "Yoga", "Spa"]', '5 AM - 11 PM', '+91-9876543211'),
('Budget Fitness Zone', 'Affordable gym with essential equipment for daily workouts.', 'Pune City', 25.00, 4.2, '["Gym", "Cardio"]', '6 AM - 9 PM', '+91-9876543212'),
('Elite Sports Club', 'Premium sports club with all amenities for fitness enthusiasts.', 'Pune City', 120.00, 4.9, '["Gym", "Pool", "Tennis", "Basketball", "Spa", "Cafe"]', '24 Hours', '+91-9876543213'),
('Yoga & Wellness Studio', 'Specialized in yoga, meditation, and holistic wellness.', 'Pune City', 40.00, 4.6, '["Yoga", "Meditation", "Pilates", "Dance"]', '7 AM - 8 PM', '+91-9876543214'),
('CrossFit Arena', 'High-intensity training facility for serious fitness goals.', 'Pune City', 75.00, 4.7, '["CrossFit", "Gym", "Personal Training"]', '6 AM - 10 PM', '+91-9876543215');

-- Grant necessary permissions (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE ON db_week_one_up.clubs TO 'your_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE ON db_week_one_up.support_tickets TO 'your_user'@'localhost';
-- GRANT SELECT, UPDATE ON db_week_one_up.system_settings TO 'your_user'@'localhost';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clubs_price_rating ON clubs(price_per_day, rating DESC);
CREATE INDEX IF NOT EXISTS idx_support_status_created ON support_tickets(status, created_at DESC);

-- Comments for documentation
ALTER TABLE clubs COMMENT = 'Stores fitness clubs, gyms, and wellness centers available in the app';
ALTER TABLE system_settings COMMENT = 'Global app configuration for maintenance mode, version control, etc.';
ALTER TABLE support_tickets COMMENT = 'User support tickets and customer service requests';

