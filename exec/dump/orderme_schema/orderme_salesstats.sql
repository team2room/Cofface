-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: orderme
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `salesstats`
--

DROP TABLE IF EXISTS `salesstats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salesstats` (
  `stats_id` int NOT NULL AUTO_INCREMENT COMMENT '통계 ID',
  `store_id` int NOT NULL COMMENT '매장 ID',
  `stats_period_type` enum('DAY','WEEK','MONTH','YEAR') NOT NULL COMMENT '통계 기간 유형',
  `stats_date` date NOT NULL COMMENT '통계 날짜',
  `year` int NOT NULL COMMENT '연도',
  `month` int NOT NULL COMMENT '월(1-12)',
  `week` int DEFAULT NULL COMMENT '주차(1-53)',
  `day` int NOT NULL COMMENT '일(1-31)',
  `total_sales` int NOT NULL DEFAULT '0' COMMENT '총 매출액',
  `takeout_sales` int NOT NULL DEFAULT '0' COMMENT '포장 매출액',
  `eat_in_sales` int NOT NULL DEFAULT '0' COMMENT '매장 매출액',
  `total_orders` int NOT NULL DEFAULT '0' COMMENT '총 주문수',
  `takeout_orders` int NOT NULL DEFAULT '0' COMMENT '포장 주문수',
  `eat_in_orders` int NOT NULL DEFAULT '0' COMMENT '매장 주문수',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`stats_id`),
  KEY `idx_store_date` (`store_id`,`stats_date`),
  KEY `idx_period_type` (`stats_period_type`),
  KEY `idx_year_month` (`year`,`month`),
  CONSTRAINT `FK_Stores_TO_SalesStats_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salesstats`
--

LOCK TABLES `salesstats` WRITE;
/*!40000 ALTER TABLE `salesstats` DISABLE KEYS */;
INSERT INTO `salesstats` VALUES (1,1,'DAY','2023-12-01',2023,12,48,1,10500,10500,0,2,2,0,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(2,1,'DAY','2023-12-02',2023,12,48,2,22000,0,22000,2,0,2,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(3,1,'DAY','2023-12-03',2023,12,48,3,15000,15000,0,2,2,0,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(4,1,'DAY','2023-12-04',2023,12,49,4,14300,0,14300,1,0,1,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(5,1,'WEEK','2023-12-03',2023,12,48,0,47500,25500,22000,6,4,2,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(6,1,'MONTH','2023-12-01',2023,12,0,0,61800,25500,36300,7,4,3,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(7,1,'DAY','2025-05-09',2025,5,19,9,15000,10000,5000,10,6,4,'2025-05-09 11:40:00','2025-05-09 11:40:00'),(8,1,'DAY','2025-05-08',2025,5,19,8,12000,8000,4000,8,5,3,'2025-05-09 11:40:00','2025-05-09 11:40:00');
/*!40000 ALTER TABLE `salesstats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-09 18:00:19
