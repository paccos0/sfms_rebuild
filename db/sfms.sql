-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: sfms
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_year`
--

DROP TABLE IF EXISTS `academic_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_year` (
  `academic_year_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`academic_year_id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `chk_academic_year_dates` CHECK ((`start_date` < `end_date`))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_year`
--

LOCK TABLES `academic_year` WRITE;
/*!40000 ALTER TABLE `academic_year` DISABLE KEYS */;
INSERT INTO `academic_year` VALUES (1,'2024-2025','2024-09-01','2025-07-31',0,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,'2025-2026','2025-09-01','2026-07-31',1,1,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `academic_year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','bursar') COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'bursar','$2a$12$NKRE/8Jq0vE32EHxhma0T.KHn0iuiY9wXNaxs2o6KLH5PCj/uhnAa','admin','MUNYANEZA','Basile',NULL,NULL,NULL,1,'2026-04-24 00:35:27','2026-04-21 01:10:35','2026-04-23 22:35:27'),(2,'regohdev','$2a$12$pl93jz2EbJcaASIN9WQKXu7kAxHL0iIGXpj1vFP.dgSdr2v5/MMzi','admin','NIYOMUGABA','Pacifique',NULL,NULL,NULL,1,NULL,'2026-04-21 01:14:32','2026-04-21 01:14:32');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_template`
--

DROP TABLE IF EXISTS `class_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_template` (
  `class_template_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_template_id`),
  UNIQUE KEY `class_name` (`class_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_template`
--

LOCK TABLES `class_template` WRITE;
/*!40000 ALTER TABLE `class_template` DISABLE KEYS */;
INSERT INTO `class_template` VALUES (1,'L3 SOD',1,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,'L4 SOD',2,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(3,'L5 SOD',3,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(4,'L3 NIT',4,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(5,'L4 NIT',5,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(6,'L5 NIT',6,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(7,'S4 ACC',7,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(8,'S5 ACC',8,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(9,'S6 ACC',9,1,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `class_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structure`
--

DROP TABLE IF EXISTS `fee_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_structure` (
  `fee_structure_id` int NOT NULL AUTO_INCREMENT,
  `academic_year_id` int NOT NULL,
  `term_id` int NOT NULL,
  `category_id` int NOT NULL,
  `admission_type` enum('new','continuing') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RWF',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_structure_id`),
  UNIQUE KEY `uq_fee_structure` (`academic_year_id`,`term_id`,`category_id`,`admission_type`),
  KEY `fk_fee_structure_term` (`term_id`),
  KEY `fk_fee_structure_category` (`category_id`),
  CONSTRAINT `fk_fee_structure_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year` (`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fee_structure_category` FOREIGN KEY (`category_id`) REFERENCES `student_category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fee_structure_term` FOREIGN KEY (`term_id`) REFERENCES `term` (`term_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structure`
--

LOCK TABLES `fee_structure` WRITE;
/*!40000 ALTER TABLE `fee_structure` DISABLE KEYS */;
INSERT INTO `fee_structure` VALUES (1,1,1,1,'continuing',92000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(2,1,1,1,'new',120000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(3,1,1,2,'continuing',135000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(4,1,1,2,'new',200000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(5,1,2,1,'continuing',92000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(6,1,2,1,'new',120000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(7,1,2,2,'continuing',135000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(8,1,2,2,'new',200000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(9,1,3,1,'continuing',92000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(10,1,3,1,'new',120000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(11,1,3,2,'continuing',135000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(12,1,3,2,'new',200000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(13,2,4,1,'continuing',95000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(14,2,4,1,'new',125000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(15,2,4,2,'continuing',140000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(16,2,4,2,'new',210000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(17,2,5,1,'continuing',95000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(18,2,5,1,'new',125000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(19,2,5,2,'continuing',140000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(20,2,5,2,'new',210000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(21,2,6,1,'continuing',98000.00,'RWF',1,'Government continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(22,2,6,1,'new',130000.00,'RWF',1,'Government new','2026-04-18 00:51:40','2026-04-18 00:51:40'),(23,2,6,2,'continuing',145000.00,'RWF',1,'Private continuing','2026-04-18 00:51:40','2026-04-18 00:51:40'),(24,2,6,2,'new',220000.00,'RWF',1,'Private new','2026-04-18 00:51:40','2026-04-18 00:51:40');
/*!40000 ALTER TABLE `fee_structure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_account`
--

DROP TABLE IF EXISTS `parent_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent_account` (
  `parent_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`parent_id`),
  UNIQUE KEY `uq_parent_student` (`student_id`),
  CONSTRAINT `fk_parent_account_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_account`
--

LOCK TABLES `parent_account` WRITE;
/*!40000 ALTER TABLE `parent_account` DISABLE KEYS */;
INSERT INTO `parent_account` VALUES (1,1,'Jean Uwimana','','',1,'2026-04-23 02:22:25','2026-04-23 02:22:25'),(2,15,'TUMUKUNDE Ruth','','',1,'2026-04-23 02:29:22','2026-04-23 02:29:22');
/*!40000 ALTER TABLE `parent_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `term_id` int NOT NULL,
  `payment_ref` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `payment_method` enum('cash','bank','mobile_money','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `paid_at` datetime NOT NULL,
  `received_by_admin_id` int NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `payment_ref` (`payment_ref`),
  KEY `fk_payment_enrollment` (`enrollment_id`),
  KEY `fk_payment_term` (`term_id`),
  KEY `fk_payment_admin` (`received_by_admin_id`),
  CONSTRAINT `fk_payment_admin` FOREIGN KEY (`received_by_admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `student_enrollment` (`enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_term` FOREIGN KEY (`term_id`) REFERENCES `term` (`term_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,23,6,'PAY-2026-04-21-03-41-55-2287',100000.00,'bank','2026-04-21 03:41:00',1,NULL,'2026-04-21 01:41:55','2026-04-21 01:41:55'),(2,24,5,'PAY-2026-04-21-23-57-46-2218',90000.00,'cash','2026-04-21 23:57:00',1,NULL,'2026-04-21 21:57:46','2026-04-21 21:57:46'),(3,24,5,'PAY-2026-04-21-23-59-23-7447',5000.00,'bank','2026-04-21 23:58:00',1,NULL,'2026-04-21 21:59:23','2026-04-21 21:59:23'),(4,22,5,'PAY-2026-04-22-00-00-39-5552',100000.00,'cash','2026-04-22 00:00:00',1,NULL,'2026-04-21 22:00:39','2026-04-21 22:00:39');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_bank_account`
--

DROP TABLE IF EXISTS `school_bank_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_bank_account` (
  `bank_account_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_bank_account`
--

LOCK TABLES `school_bank_account` WRITE;
/*!40000 ALTER TABLE `school_bank_account` DISABLE KEYS */;
INSERT INTO `school_bank_account` VALUES (1,'Bank of Kigali','OROSHYA TVET SCHOOL','012345678901',1,1,'2026-04-23 01:48:35','2026-04-23 01:48:35'),(2,'Equity Bank','OROSHYA TVET SCHOOL','987654321000',2,1,'2026-04-23 01:48:35','2026-04-23 01:48:35');
/*!40000 ALTER TABLE `school_bank_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_setting`
--

DROP TABLE IF EXISTS `school_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_setting` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `school_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'School Fees Management System',
  `current_academic_year_id` int DEFAULT NULL,
  `current_term_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  KEY `fk_setting_current_academic_year` (`current_academic_year_id`),
  KEY `fk_setting_current_term` (`current_term_id`),
  CONSTRAINT `fk_setting_current_academic_year` FOREIGN KEY (`current_academic_year_id`) REFERENCES `academic_year` (`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_setting_current_term` FOREIGN KEY (`current_term_id`) REFERENCES `term` (`term_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_setting`
--

LOCK TABLES `school_setting` WRITE;
/*!40000 ALTER TABLE `school_setting` DISABLE KEYS */;
INSERT INTO `school_setting` VALUES (1,'School Fees Management System',2,5,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `school_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `registration_number` (`registration_number`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'REG-2024-0001','Aline','Uwimana','female','2008-03-15','0788000001','Jean Uwimana','0789000001','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,'REG-2024-0002','Eric','Niyonzima','male','2007-07-21','0788000002','Vestine Mukamana','0789000002','Huye','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(3,'REG-2024-0003','Grace','Mukandayisenga','female','2008-01-12','0788000003','Samuel Habimana','0789000003','Musanze','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(4,'REG-2024-0004','Claude','Hakizimana','male','2006-10-05','0788000004','Alice Nyirahabimana','0789000004','Rubavu','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(5,'REG-2024-0005','Diane','Uwera','female','2007-12-30','0788000005','Patrick Uwera','0789000005','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(6,'REG-2024-0006','Kevin','Nsengiyumva','male','2008-05-18','0788000006','Beata Mukarugwiza','0789000006','Muhanga','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(7,'REG-2024-0007','Sonia','Ingabire','female','2007-09-14','0788000007','Emmanuel Ingabire','0789000007','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(8,'REG-2024-0008','Patrick','Nshimiyimana','male','2006-11-09','0788000008','Odette Uwamariya','0789000008','Rwamagana','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(9,'REG-2024-0009','Brenda','Niyonkuru','female','2008-02-22','0788000009','Theogene Nkurunziza','0789000009','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(10,'REG-2024-0010','Samuel','Mugisha','male','2007-04-10','0788000010','Esperance Mukeshimana','0789000010','Nyagatare','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(11,'REG-2024-0011','Yvette','Mukamana','female','2006-08-17','0788000011','Joseph Mukamana','0789000011','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(12,'REG-2024-0012','David','Ndayisaba','male','2008-06-03','0788000012','Annonciata Nyiransabimana','0789000012','Kigali','active','2026-04-18 00:51:39','2026-04-18 00:51:39'),(13,'REG-2024-0013','Niyomugaba','Pacifique','male','2026-04-21',NULL,'MUKANDORI Josiane','0798870993','Kigali','active','2026-04-21 21:52:05','2026-04-21 21:52:37'),(14,'0014','MUNYANEZA','Basile','male','2026-04-22',NULL,NULL,NULL,NULL,'active','2026-04-21 22:24:50','2026-04-21 22:24:50'),(15,'REG-2024-0015','Mugisha','Enock','male','2026-04-23',NULL,'TUMUKUNDE Ruth',NULL,'Muhanga','active','2026-04-23 02:27:01','2026-04-23 02:29:22');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_account`
--

DROP TABLE IF EXISTS `student_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_account` (
  `student_account_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_account_id`),
  UNIQUE KEY `uq_student_account_student` (`student_id`),
  CONSTRAINT `fk_student_account_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_account`
--

LOCK TABLES `student_account` WRITE;
/*!40000 ALTER TABLE `student_account` DISABLE KEYS */;
INSERT INTO `student_account` VALUES (1,15,'$2a$12$Xp050Pk5hrJ9LkDNt3Sa/u479EWDeb.Wad1OT.uGs8NVExwVcd4E6',1,'2026-04-23 21:05:40','2026-04-23 21:05:40'),(2,1,'$2a$12$JAOxV0nd6i/qP4EH6JmD.uLwrJ0GVEYe6Zmo2L2GfD1zeJwfihDFi',1,'2026-04-23 21:23:14','2026-04-23 21:23:14');
/*!40000 ALTER TABLE `student_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_category`
--

DROP TABLE IF EXISTS `student_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_category`
--

LOCK TABLES `student_category` WRITE;
/*!40000 ALTER TABLE `student_category` DISABLE KEYS */;
INSERT INTO `student_category` VALUES (1,'government','Government-sponsored students',1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,'private','Privately-sponsored students',1,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `student_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_enrollment`
--

DROP TABLE IF EXISTS `student_enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_enrollment` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `academic_year_id` int NOT NULL,
  `year_class_id` int NOT NULL,
  `category_id` int NOT NULL,
  `admission_type` enum('new','continuing') COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrollment_status` enum('active','transferred','graduated','repeated','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `enrollment_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `uq_student_enrollment_year` (`student_id`,`academic_year_id`),
  KEY `fk_enrollment_academic_year` (`academic_year_id`),
  KEY `fk_enrollment_year_class` (`year_class_id`),
  KEY `fk_enrollment_category` (`category_id`),
  CONSTRAINT `fk_enrollment_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year` (`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollment_category` FOREIGN KEY (`category_id`) REFERENCES `student_category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollment_year_class` FOREIGN KEY (`year_class_id`) REFERENCES `year_class` (`year_class_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_enrollment`
--

LOCK TABLES `student_enrollment` WRITE;
/*!40000 ALTER TABLE `student_enrollment` DISABLE KEYS */;
INSERT INTO `student_enrollment` VALUES (1,1,1,1,1,'new','active','2024-09-02','Joined L3 SOD A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,2,1,2,2,'new','active','2024-09-02','Joined L3 SOD B','2026-04-18 00:51:39','2026-04-18 00:51:39'),(3,3,1,6,1,'new','active','2024-09-02','Joined L3 NIT A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(4,4,1,10,2,'continuing','active','2024-09-02','Joined S4 ACC A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(5,5,1,3,1,'continuing','active','2024-09-02','Joined L4 SOD A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(6,6,1,8,2,'new','active','2024-09-02','Joined L4 NIT','2026-04-18 00:51:39','2026-04-18 00:51:39'),(7,7,1,12,1,'continuing','active','2024-09-02','Joined S5 ACC','2026-04-18 00:51:39','2026-04-18 00:51:39'),(8,8,1,13,2,'continuing','graduated','2024-09-02','Final year completed','2026-04-18 00:51:39','2026-04-18 00:51:39'),(9,9,1,7,1,'new','transferred','2024-09-02','Transferred after Term 1','2026-04-18 00:51:39','2026-04-18 00:51:39'),(10,10,1,11,2,'continuing','active','2024-09-02','Joined S4 ACC B','2026-04-18 00:51:39','2026-04-18 00:51:39'),(11,11,1,9,1,'continuing','active','2024-09-02','Joined L5 NIT','2026-04-18 00:51:39','2026-04-18 00:51:39'),(12,12,1,4,2,'new','repeated','2024-09-02','Will repeat next year','2026-04-18 00:51:39','2026-04-18 00:51:39'),(13,1,2,15,1,'continuing','active','2025-09-03','Promoted to L4 SOD A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(14,2,2,14,2,'continuing','active','2025-09-03','Promoted to merged L3 SOD','2026-04-18 00:51:39','2026-04-18 00:51:39'),(15,3,2,18,1,'continuing','active','2025-09-03','Promoted to merged L3 NIT','2026-04-18 00:51:39','2026-04-18 00:51:39'),(16,4,2,21,2,'continuing','active','2025-09-03','Promoted to S4 ACC','2026-04-18 00:51:39','2026-04-18 00:51:39'),(17,5,2,16,1,'continuing','active','2025-09-03','Promoted to L4 SOD B','2026-04-18 00:51:39','2026-04-18 00:51:39'),(18,6,2,19,2,'continuing','active','2025-09-03','Promoted to L4 NIT A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(19,7,2,22,1,'continuing','active','2025-09-03','Promoted to S5 ACC A','2026-04-18 00:51:39','2026-04-18 00:51:39'),(20,9,2,18,1,'new','active','2025-09-03','Re-registered after previous transfer scenario for testing','2026-04-18 00:51:39','2026-04-18 00:51:39'),(21,10,2,21,2,'continuing','active','2025-09-03','Promoted to S4 ACC','2026-04-18 00:51:39','2026-04-18 00:51:39'),(22,11,2,20,1,'continuing','active','2025-09-03','Promoted to L5 NIT','2026-04-18 00:51:39','2026-04-18 00:51:39'),(23,12,2,16,2,'continuing','repeated','2025-09-03','Repeated class in new year','2026-04-18 00:51:39','2026-04-18 00:51:39'),(24,13,2,17,1,'continuing','active','2026-04-21',NULL,'2026-04-21 21:55:39','2026-04-21 21:55:39'),(25,14,2,17,2,'new','active','2026-04-22',NULL,'2026-04-21 22:24:50','2026-04-21 22:24:50'),(27,15,2,17,1,'continuing','active','2026-04-23',NULL,'2026-04-23 02:33:36','2026-04-23 02:33:36');
/*!40000 ALTER TABLE `student_enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_penalty`
--

DROP TABLE IF EXISTS `student_penalty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_penalty` (
  `penalty_id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(12,2) NOT NULL,
  `penalty_status` enum('unpaid','paid','waived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `issued_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` datetime DEFAULT NULL,
  `created_by_admin_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`penalty_id`),
  KEY `fk_penalty_enrollment` (`enrollment_id`),
  KEY `fk_penalty_admin` (`created_by_admin_id`),
  CONSTRAINT `fk_penalty_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_penalty_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `student_enrollment` (`enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_penalty`
--

LOCK TABLES `student_penalty` WRITE;
/*!40000 ALTER TABLE `student_penalty` DISABLE KEYS */;
INSERT INTO `student_penalty` VALUES (1,21,'Damaged School Property','Damaged dishes',5000.00,'unpaid','2026-04-21 04:00:00',NULL,1,'2026-04-21 02:00:26','2026-04-21 02:00:59');
/*!40000 ALTER TABLE `student_penalty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `term`
--

DROP TABLE IF EXISTS `term`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `term` (
  `term_id` int NOT NULL AUTO_INCREMENT,
  `academic_year_id` int NOT NULL,
  `name` enum('Term 1','Term 2','Term 3') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`term_id`),
  UNIQUE KEY `uq_term_per_year` (`academic_year_id`,`name`),
  CONSTRAINT `fk_term_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year` (`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `term`
--

LOCK TABLES `term` WRITE;
/*!40000 ALTER TABLE `term` DISABLE KEYS */;
INSERT INTO `term` VALUES (1,1,'Term 1','2024-09-01','2024-11-30',0,1,'2026-04-18 00:51:39','2026-04-21 01:37:14'),(2,1,'Term 2','2025-01-06','2025-03-31',0,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(3,1,'Term 3','2025-04-15','2025-07-31',0,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(4,2,'Term 1','2025-09-01','2025-11-30',0,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(5,2,'Term 2','2026-01-05','2026-03-31',1,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(6,2,'Term 3','2026-04-15','2026-07-31',0,1,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `term` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `year_class`
--

DROP TABLE IF EXISTS `year_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `year_class` (
  `year_class_id` int NOT NULL AUTO_INCREMENT,
  `academic_year_id` int NOT NULL,
  `class_template_id` int NOT NULL,
  `section` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`year_class_id`),
  UNIQUE KEY `uq_year_class` (`academic_year_id`,`class_template_id`,`section`),
  KEY `fk_year_class_template` (`class_template_id`),
  CONSTRAINT `fk_year_class_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year` (`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_year_class_template` FOREIGN KEY (`class_template_id`) REFERENCES `class_template` (`class_template_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `year_class`
--

LOCK TABLES `year_class` WRITE;
/*!40000 ALTER TABLE `year_class` DISABLE KEYS */;
INSERT INTO `year_class` VALUES (1,1,1,'A',40,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(2,1,1,'B',40,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(3,1,2,'A',35,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(4,1,2,'B',35,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(5,1,3,NULL,45,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(6,1,4,'A',40,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(7,1,4,'B',40,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(8,1,5,NULL,42,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(9,1,6,NULL,38,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(10,1,7,'A',30,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(11,1,7,'B',30,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(12,1,8,NULL,28,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(13,1,9,NULL,25,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(14,2,1,NULL,50,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(15,2,2,'A',35,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(16,2,2,'B',35,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(17,2,3,NULL,45,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(18,2,4,NULL,50,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(19,2,5,'A',30,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(20,2,5,'B',30,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(21,2,6,NULL,35,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(22,2,7,NULL,32,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(23,2,8,'A',25,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(24,2,8,'B',25,1,'2026-04-18 00:51:39','2026-04-18 00:51:39'),(25,2,9,NULL,24,1,'2026-04-18 00:51:39','2026-04-18 00:51:39');
/*!40000 ALTER TABLE `year_class` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-24  1:31:12
