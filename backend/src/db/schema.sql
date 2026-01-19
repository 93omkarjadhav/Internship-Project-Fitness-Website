-- Week 1 merged schema
CREATE DATABASE IF NOT EXISTS db_week_one_up;
USE db_week_one_up;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  passcode_hash VARCHAR(255) DEFAULT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  gender ENUM('Female', 'Male', 'Other') DEFAULT NULL,
  dob DATE DEFAULT NULL,
  phone_number VARCHAR(50) DEFAULT NULL,
  address TEXT,
  profile_image_url VARCHAR(512) DEFAULT NULL,
  email_verified TINYINT(1) DEFAULT 0,
  member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  food_preference VARCHAR(255) DEFAULT '',
  common_allergies JSON,
  snack_frequency VARCHAR(100) DEFAULT '',
  calorie_intake INT DEFAULT 2000,
  -- Nutrition Flow targets (merged)
  display_name VARCHAR(255) DEFAULT 'Fitfare User',
  calorie_target INT DEFAULT 2200,
  protein_target INT DEFAULT 120,
  fat_target INT DEFAULT 70,
  carb_target INT DEFAULT 250,
  meals_per_day INT DEFAULT 3,
  hydration_target_ml INT DEFAULT 2500,
  other_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_security_settings (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  enable_pin BOOLEAN DEFAULT FALSE,
  biometric_login BOOLEAN DEFAULT FALSE,
  remember_login BOOLEAN DEFAULT TRUE,
  use_face_id BOOLEAN DEFAULT FALSE,
  account_recovery BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  activity_reminder BOOLEAN DEFAULT FALSE,
  push_notification BOOLEAN DEFAULT TRUE,
  nutrition_reminder BOOLEAN DEFAULT TRUE,
  ai_recommendations BOOLEAN DEFAULT FALSE,
  weekly_insight BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_login_date DATE DEFAULT NULL,
  weekly_status JSON DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  rating INT NOT NULL,
  feedback_text TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS help_articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  ai_persona ENUM('friendly', 'professional', 'witty') DEFAULT 'friendly',
  gender_identity ENUM('male', 'female', 'non-binary', 'prefer-not-say') DEFAULT 'prefer-not-say',
  daily_chat_count INT NOT NULL DEFAULT 0,
  last_chat_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_cycle (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  cycle_length_days INT DEFAULT 28,
  period_length_days INT DEFAULT 5,
  last_period_start DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_memory (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  memory_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_metrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  height_cm DECIMAL(5,2) DEFAULT NULL,
  weight_kg DECIMAL(5,2) DEFAULT NULL,
  target_weight_kg DECIMAL(5,2) DEFAULT NULL,
  fitness_goal ENUM('weight_loss','muscle_gain','endurance','maintenance','flexibility') DEFAULT 'maintenance',
  activity_level ENUM('sedentary','light','moderate','active','very_active') DEFAULT 'moderate',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(36) NOT NULL,
  sender_type ENUM('user','ai') NOT NULL,
  content TEXT NOT NULL,
  image_base64 MEDIUMTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

INSERT IGNORE INTO help_articles (id, title, content)
VALUES (1, 'Need help?', 'Add help articles to the help_articles table.');

-- Nutrition Flow tables (merged)
CREATE TABLE IF NOT EXISTS meals (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(64) DEFAULT 'Other',
  calories INT DEFAULT 0,
  protein DECIMAL(10,2) DEFAULT 0,
  fat DECIMAL(10,2) DEFAULT 0,
  carbs DECIMAL(10,2) DEFAULT 0,
  fiber DECIMAL(10,2) DEFAULT 0,
  meal_date DATE NOT NULL,
  meal_time TIME DEFAULT '12:00:00',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_meals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduled_meals (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(64) DEFAULT 'Meal',
  scheduled_time TIME NOT NULL,
  calories INT DEFAULT 0,
  protein DECIMAL(10,2) DEFAULT 0,
  fat DECIMAL(10,2) DEFAULT 0,
  carbs DECIMAL(10,2) DEFAULT 0,
  scheduled_date DATE NOT NULL,
  status ENUM('scheduled','completed','skipped') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sched_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_recommendations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  focus_area VARCHAR(64) DEFAULT 'Nutrition',
  score_delta INT DEFAULT 0,
  action_text VARCHAR(255),
  status ENUM('pending','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reco_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Period tracking tables (merged from period_tracking_2)
CREATE TABLE IF NOT EXISTS cycles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE,
  cycle_length INT,
  period_length INT,
  flow_intensity VARCHAR(50),
  fluid_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cycles_user_id (user_id),
  INDEX idx_cycles_start_date (period_start_date)
);

CREATE TABLE IF NOT EXISTS symptoms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  cycle_id BIGINT UNSIGNED,
  symptom_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  INDEX idx_symptoms_user_id (user_id),
  INDEX idx_symptoms_cycle_id (cycle_id),
  INDEX idx_symptoms_date (date)
);

CREATE TABLE IF NOT EXISTS cycle_days (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  cycle_id BIGINT UNSIGNED,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  phase VARCHAR(50),
  flow_intensity VARCHAR(50),
  mood VARCHAR(50),
  energy_level INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  INDEX idx_cycle_days_user_id (user_id),
  INDEX idx_cycle_days_cycle_id (cycle_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  next_period_date DATE,
  ovulation_date DATE,
  fertile_window_start DATE,
  fertile_window_end DATE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_predictions_user_id (user_id),
  INDEX idx_predictions_next_period_date (next_period_date)
);

-- Development seed data for demo user/profile
INSERT IGNORE INTO users (id, email, password_hash, full_name)
VALUES (1, 'demo@fitfare.local', '$2a$10$demohashplaceholder', 'Demo User');

INSERT IGNORE INTO user_profiles (user_id)
VALUES (1);

