-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: railway
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('9636b157-e222-403b-83f3-dc5a2255962a','926acc537dc3ae813dd03dc11e13df2cc7c40f0697e86f509d5ef9435f5c48e7','2026-08-29 13:20:04.672','20260829132001_init',NULL,NULL,'2026-08-29 13:20:01.986',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `due`
--

DROP TABLE IF EXISTS `due`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `due` (
  `id` int NOT NULL AUTO_INCREMENT,
  `homeownerId` int NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `amountPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(10,2) NOT NULL,
  `status` enum('UNPAID','PAID','OVERDUE','PARTIAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Due_homeownerId_year_month_key` (`homeownerId`,`year`,`month`),
  KEY `Due_year_month_idx` (`year`,`month`),
  KEY `Due_status_idx` (`status`),
  CONSTRAINT `Due_homeownerId_fkey` FOREIGN KEY (`homeownerId`) REFERENCES `homeowner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `due`
--

LOCK TABLES `due` WRITE;
/*!40000 ALTER TABLE `due` DISABLE KEYS */;
INSERT INTO `due` VALUES (1,1,2026,8,25000.00,25000.00,0.00,'PAID','2026-08-29 14:33:17.594','2026-08-29 14:33:32.527'),(2,2,2026,8,21212.00,0.00,21212.00,'UNPAID','2026-08-29 16:22:47.266','2026-08-29 16:22:47.264');
/*!40000 ALTER TABLE `due` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility`
--

DROP TABLE IF EXISTS `facility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Facility_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility`
--

LOCK TABLES `facility` WRITE;
/*!40000 ALTER TABLE `facility` DISABLE KEYS */;
INSERT INTO `facility` VALUES (1,'Basketball Court','Basketball playhouse','ACTIVE','2026-08-29 14:39:02.403','2026-08-29 14:39:02.394'),(2,'Clubhouse',NULL,'ACTIVE','2026-08-29 14:39:13.691','2026-08-29 14:39:13.689'),(3,'Tennis Court',NULL,'ACTIVE','2026-08-29 14:39:19.786','2026-08-29 14:39:19.785');
/*!40000 ALTER TABLE `facility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feesetting`
--

DROP TABLE IF EXISTS `feesetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feesetting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('MONTHLY_DUES','BASKETBALL_COURT','TENNIS_COURT','CLUBHOUSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `FeeSetting_type_key` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feesetting`
--

LOCK TABLES `feesetting` WRITE;
/*!40000 ALTER TABLE `feesetting` DISABLE KEYS */;
INSERT INTO `feesetting` VALUES (1,'BASKETBALL_COURT',500.00,'Basketball Court reservation fee',1,'2026-08-30 16:31:08.000','2026-08-30 16:31:08.000'),(2,'TENNIS_COURT',500.00,'Tennis Court reservation fee',1,'2026-08-30 16:31:08.000','2026-08-30 16:31:08.000'),(3,'CLUBHOUSE',1000.00,'Clubhouse reservation fee',1,'2026-08-30 16:31:08.000','2026-08-30 16:31:08.000');
/*!40000 ALTER TABLE `feesetting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homeowner`
--

DROP TABLE IF EXISTS `homeowner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `homeowner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middleName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Homeowner_userId_key` (`userId`),
  KEY `Homeowner_lastName_firstName_idx` (`lastName`,`firstName`),
  CONSTRAINT `Homeowner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homeowner`
--

LOCK TABLES `homeowner` WRITE;
/*!40000 ALTER TABLE `homeowner` DISABLE KEYS */;
INSERT INTO `homeowner` VALUES (1,2,'Shane','Diesta','Marinas','47 Aldana Street Pamplona Uno Las Pinas City','09260117936','angelonicolai0412@gmail.com','2026-08-29 14:00:37.055','2026-08-29 14:00:37.051'),(2,3,'gabriel','E','Lim','47 Aldana Street Pamplona Uno Las Pinas City','09260117936','limgab50@gmail.com','2026-08-29 16:22:02.879','2026-08-29 16:22:02.877'),(3,4,'Angelo',NULL,'Nicolaio','47 Aldana Street Pamplona Uno Las Pinas City','09260117936','akijazro@gmail.com','2026-08-30 08:27:39.528','2026-08-30 08:27:39.524');
/*!40000 ALTER TABLE `homeowner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `homeownerId` int NOT NULL,
  `dueId` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('GCASH','MAYA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PAID','FAILED','CANCELLED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `referenceNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymongoPaymentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymongoCheckoutId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_referenceNumber_key` (`referenceNumber`),
  UNIQUE KEY `Payment_orNumber_key` (`orNumber`),
  UNIQUE KEY `Payment_paymongoPaymentId_key` (`paymongoPaymentId`),
  UNIQUE KEY `Payment_paymongoCheckoutId_key` (`paymongoCheckoutId`),
  KEY `Payment_homeownerId_idx` (`homeownerId`),
  KEY `Payment_dueId_idx` (`dueId`),
  KEY `Payment_status_idx` (`status`),
  KEY `Payment_paidAt_idx` (`paidAt`),
  CONSTRAINT `Payment_dueId_fkey` FOREIGN KEY (`dueId`) REFERENCES `due` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Payment_homeownerId_fkey` FOREIGN KEY (`homeownerId`) REFERENCES `homeowner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,1,1,25000.00,'GCASH','PAID','12222555',NULL,NULL,NULL,'2026-08-29 14:33:32.524','2026-08-29 14:33:32.525','2026-08-29 14:33:32.524'),(2,2,2,21212.00,'GCASH','PENDING',NULL,NULL,NULL,'cs_cf5896d44c6ee29e0325676c',NULL,'2026-08-30 09:50:20.487','2026-08-30 09:50:20.472'),(3,2,2,21212.00,'GCASH','PENDING',NULL,NULL,NULL,'cs_aa415b634198dc15cbc8cd9c',NULL,'2026-08-30 09:50:53.152','2026-08-30 09:50:53.151');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipt`
--

DROP TABLE IF EXISTS `receipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paymentId` int NOT NULL,
  `receiptNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Receipt_paymentId_key` (`paymentId`),
  UNIQUE KEY `Receipt_receiptNumber_key` (`receiptNumber`),
  CONSTRAINT `Receipt_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipt`
--

LOCK TABLES `receipt` WRITE;
/*!40000 ALTER TABLE `receipt` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `homeownerId` int NOT NULL,
  `facilityId` int NOT NULL,
  `reservationDate` datetime(3) NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Reservation_homeownerId_idx` (`homeownerId`),
  KEY `Reservation_facilityId_idx` (`facilityId`),
  KEY `Reservation_reservationDate_idx` (`reservationDate`),
  KEY `Reservation_status_idx` (`status`),
  CONSTRAINT `Reservation_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `facility` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Reservation_homeownerId_fkey` FOREIGN KEY (`homeownerId`) REFERENCES `homeowner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
INSERT INTO `reservation` VALUES (1,3,1,'2026-08-29 16:00:00.000','2026-08-30 11:30:00.000','2026-08-30 14:31:00.000',500.00,'CONFIRMED','2026-08-30 08:32:03.893','2026-08-30 08:59:24.123');
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','HOMEOWNER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_role_idx` (`role`),
  KEY `User_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'bsitlim@gmail.com','.wIBFQnS4DCOWTyqREJJ83vj/X8iQ6Getxj8IWUU6J6','ADMIN','ACTIVE','2026-08-29 13:41:54.253','2026-08-29 13:41:54.244'),(2,'angelonicolai0412@gmail.com','$2b$12$mrxgqb0PPXcF8iGzUBhY3.6G8aFOHHZXOtOU9VKmMfHR3GWdteD3i','ADMIN','ACTIVE','2026-08-29 14:00:37.041','2026-08-29 14:00:37.033'),(3,'limgab50@gmail.com','$2b$12$hbmGO9QikZ3qNIzd6E8o6.8jQR42ya.zg10ZX2foGi2qZpxocOeZK','HOMEOWNER','ACTIVE','2026-08-29 16:22:02.874','2026-08-29 16:22:02.866'),(4,'akijazro@gmail.com','$2b$12$H7Mv6zgKdvqsO8/d72Mtae52fASxW5K7Ky4HgYkmTiQ0qUUZVBCXm','HOMEOWNER','ACTIVE','2026-08-30 08:27:39.476','2026-08-30 08:27:39.469');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-30 22:03:32

