-- Add referral_code column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_user_id INT,
ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT FALSE,
ADD INDEX IF NOT EXISTS idx_referral_code (referral_code);

-- Create user_contacts table
CREATE TABLE IF NOT EXISTS user_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  is_invited BOOLEAN DEFAULT FALSE,
  invited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_contacts (user_id),
  INDEX idx_contact_phone (contact_phone)
);

-- Create user_referrals table to track referral status
CREATE TABLE IF NOT EXISTS user_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_user_id INT NOT NULL,
  referred_user_id INT NULL,
  referred_contact_name VARCHAR(255),
  referred_contact_phone VARCHAR(20),
  referred_contact_email VARCHAR(255),
  status ENUM('pending', 'joined', 'expired') DEFAULT 'pending',
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_referrer (referrer_user_id),
  INDEX idx_referred (referred_user_id),
  INDEX idx_status (status)
);

-- Create referral_rewards table to track rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  referral_id INT NOT NULL,
  reward_type ENUM('coupon', 'discount', 'premium_feature') DEFAULT 'coupon',
  reward_value VARCHAR(100),
  reward_description TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referral_id) REFERENCES user_referrals(id) ON DELETE CASCADE,
  INDEX idx_user_rewards (user_id),
  INDEX idx_claimed (is_claimed)
);

