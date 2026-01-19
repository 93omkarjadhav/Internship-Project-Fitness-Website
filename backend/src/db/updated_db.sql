-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: test_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(512) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `club_id` bigint unsigned NOT NULL,
  `club_title` varchar(255) NOT NULL,
  `club_city` varchar(100) NOT NULL,
  `price_per_day` int NOT NULL,
  `start_date` date DEFAULT (curdate()),
  `end_date` date DEFAULT NULL,
  `booking_status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `payment_ref` varchar(128) DEFAULT NULL,
  `total_amount` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_user` (`user_id`),
  KEY `idx_booking_club` (`club_id`),
  CONSTRAINT `fk_booking_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `price_per_day` int DEFAULT '0',
  `rating` float DEFAULT '0',
  `image_url` varchar(512) NOT NULL,
  `city` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'New Chat',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cycle_days`
--

DROP TABLE IF EXISTS `cycle_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cycle_days` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `cycle_id` bigint unsigned DEFAULT NULL,
  `day_number` int NOT NULL,
  `date` date NOT NULL,
  `phase` varchar(50) DEFAULT NULL,
  `flow_intensity` varchar(50) DEFAULT NULL,
  `mood` varchar(50) DEFAULT NULL,
  `energy_level` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cycle_days_user_id` (`user_id`),
  KEY `idx_cycle_days_cycle_id` (`cycle_id`),
  CONSTRAINT `cycle_days_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cycle_days_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `cycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cycles`
--

DROP TABLE IF EXISTS `cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cycles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `period_start_date` date NOT NULL,
  `period_end_date` date DEFAULT NULL,
  `cycle_length` int DEFAULT NULL,
  `period_length` int DEFAULT NULL,
  `flow_intensity` varchar(50) DEFAULT NULL,
  `fluid_type` varchar(50) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cycles_user_id` (`user_id`),
  KEY `idx_cycles_start_date` (`period_start_date`),
  CONSTRAINT `cycles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `help_articles`
--

DROP TABLE IF EXISTS `help_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `help_articles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `meals`
--

DROP TABLE IF EXISTS `meals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `meal_name` varchar(255) NOT NULL,
  `meal_type` varchar(64) DEFAULT 'Other',
  `calories` int DEFAULT '0',
  `protein` decimal(10,2) DEFAULT '0.00',
  `fat` decimal(10,2) DEFAULT '0.00',
  `carbs` decimal(10,2) DEFAULT '0.00',
  `fiber` decimal(10,2) DEFAULT '0.00',
  `meal_date` date NOT NULL,
  `meal_time` time DEFAULT '12:00:00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_meals_user` (`user_id`),
  CONSTRAINT `fk_meals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` char(36) NOT NULL,
  `sender_type` enum('user','ai') NOT NULL,
  `content` text NOT NULL,
  `image_base64` mediumtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Completed',
  `location` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_date` (`order_date`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_prt_user` (`user_id`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `predictions`
--

DROP TABLE IF EXISTS `predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `predictions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `next_period_date` date DEFAULT NULL,
  `ovulation_date` date DEFAULT NULL,
  `fertile_window_start` date DEFAULT NULL,
  `fertile_window_end` date DEFAULT NULL,
  `confidence_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_predictions_user_id` (`user_id`),
  KEY `idx_predictions_next_period_date` (`next_period_date`),
  CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `referral_rewards`
--

DROP TABLE IF EXISTS `referral_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral_rewards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `referral_id` bigint unsigned NOT NULL,
  `reward_type` enum('coupon','discount','premium_feature') DEFAULT 'coupon',
  `reward_value` varchar(100) DEFAULT NULL,
  `reward_description` text,
  `is_claimed` tinyint(1) DEFAULT '0',
  `claimed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_rewards` (`user_id`),
  KEY `idx_claimed` (`is_claimed`),
  KEY `fk_rewards_referral` (`referral_id`),
  CONSTRAINT `fk_rewards_referral` FOREIGN KEY (`referral_id`) REFERENCES `user_referrals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rewards_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scheduled_meals`
--

DROP TABLE IF EXISTS `scheduled_meals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_meals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `meal_name` varchar(255) NOT NULL,
  `meal_type` varchar(64) DEFAULT 'Meal',
  `scheduled_time` time NOT NULL,
  `calories` int DEFAULT '0',
  `protein` decimal(10,2) DEFAULT '0.00',
  `fat` decimal(10,2) DEFAULT '0.00',
  `carbs` decimal(10,2) DEFAULT '0.00',
  `scheduled_date` date NOT NULL,
  `status` enum('scheduled','completed','skipped') DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sched_user` (`user_id`),
  CONSTRAINT `fk_sched_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `symptoms`
--

DROP TABLE IF EXISTS `symptoms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `symptoms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `cycle_id` bigint unsigned DEFAULT NULL,
  `symptom_type` varchar(100) NOT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_symptoms_user_id` (`user_id`),
  KEY `idx_symptoms_cycle_id` (`cycle_id`),
  KEY `idx_symptoms_date` (`date`),
  CONSTRAINT `symptoms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `symptoms_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `cycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_contacts`
--

DROP TABLE IF EXISTS `user_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `is_invited` tinyint(1) DEFAULT '0',
  `invited_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_contacts` (`user_id`),
  KEY `idx_contact_phone` (`contact_phone`),
  CONSTRAINT `fk_user_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_cycle`
--

DROP TABLE IF EXISTS `user_cycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cycle` (
  `user_id` bigint unsigned NOT NULL,
  `cycle_length_days` int DEFAULT '28',
  `period_length_days` int DEFAULT '5',
  `last_period_start` date DEFAULT NULL,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_cycle_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_feedback`
--

DROP TABLE IF EXISTS `user_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_feedback` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `rating` int NOT NULL,
  `feedback_text` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_memory`
--

DROP TABLE IF EXISTS `user_memory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_memory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `memory_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_memory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_metrics`
--

DROP TABLE IF EXISTS `user_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_metrics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `target_weight_kg` decimal(5,2) DEFAULT NULL,
  `fitness_goal` enum('weight_loss','muscle_gain','endurance','maintenance','flexibility') DEFAULT 'maintenance',
  `activity_level` enum('sedentary','light','moderate','active','very_active') DEFAULT 'moderate',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_metrics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_notification_settings`
--

DROP TABLE IF EXISTS `user_notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_settings` (
  `user_id` bigint unsigned NOT NULL,
  `activity_reminder` tinyint(1) DEFAULT '0',
  `push_notification` tinyint(1) DEFAULT '1',
  `nutrition_reminder` tinyint(1) DEFAULT '1',
  `ai_recommendations` tinyint(1) DEFAULT '0',
  `weekly_insight` tinyint(1) DEFAULT '0',
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_notification_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `user_id` bigint unsigned NOT NULL,
  `theme` enum('light','dark','system') DEFAULT 'system',
  `ai_persona` enum('friendly','professional','witty') DEFAULT 'friendly',
  `gender_identity` enum('male','female','non-binary','prefer-not-say') DEFAULT 'prefer-not-say',
  `daily_chat_count` int NOT NULL DEFAULT '0',
  `last_chat_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `food_preference` varchar(255) DEFAULT '',
  `common_allergies` json DEFAULT NULL,
  `snack_frequency` varchar(100) DEFAULT '',
  `calorie_intake` int DEFAULT '2000',
  `display_name` varchar(255) DEFAULT 'Fitfare User',
  `calorie_target` int DEFAULT '2200',
  `protein_target` int DEFAULT '120',
  `fat_target` int DEFAULT '70',
  `carb_target` int DEFAULT '250',
  `meals_per_day` int DEFAULT '3',
  `hydration_target_ml` int DEFAULT '2500',
  `other_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=289 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_recommendations`
--

DROP TABLE IF EXISTS `user_recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_recommendations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text,
  `focus_area` varchar(64) DEFAULT 'Nutrition',
  `score_delta` int DEFAULT '0',
  `action_text` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reco_user` (`user_id`),
  CONSTRAINT `fk_reco_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_referrals`
--

DROP TABLE IF EXISTS `user_referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_referrals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `referrer_user_id` bigint unsigned NOT NULL,
  `referred_user_id` bigint unsigned DEFAULT NULL,
  `referred_contact_name` varchar(255) DEFAULT NULL,
  `referred_contact_phone` varchar(20) DEFAULT NULL,
  `referred_contact_email` varchar(255) DEFAULT NULL,
  `status` enum('pending','joined','expired') DEFAULT 'pending',
  `reward_given` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `referrer_user_guid` char(36) DEFAULT NULL,
  `referred_user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_referrer` (`referrer_user_id`),
  KEY `idx_referred` (`referred_user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_referrals_referred` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_referrals_referrer` FOREIGN KEY (`referrer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_security_settings`
--

DROP TABLE IF EXISTS `user_security_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_security_settings` (
  `user_id` bigint unsigned NOT NULL,
  `enable_pin` tinyint(1) DEFAULT '0',
  `biometric_login` tinyint(1) DEFAULT '0',
  `remember_login` tinyint(1) DEFAULT '1',
  `use_face_id` tinyint(1) DEFAULT '0',
  `account_recovery` tinyint(1) DEFAULT '1',
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_security_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_streaks`
--

DROP TABLE IF EXISTS `user_streaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_streaks` (
  `user_id` bigint unsigned NOT NULL,
  `current_streak` int DEFAULT '0',
  `longest_streak` int DEFAULT '0',
  `last_login_date` date DEFAULT NULL,
  `weekly_status` json DEFAULT NULL,
  `user_guid` char(36) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_streaks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_guid` char(36) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `passcode_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `gender` enum('Female','Male','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `address` text,
  `profile_image_url` varchar(512) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `member_since` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `referral_code` varchar(20) DEFAULT NULL,
  `referred_by_user_id` int DEFAULT NULL,
  `referral_reward_claimed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `referral_code` (`referral_code`),
  KEY `idx_referral_code` (`referral_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 12:49:10
