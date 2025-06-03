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
-- Table structure for table `menupopularitystats`
--

DROP TABLE IF EXISTS `menupopularitystats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menupopularitystats` (
  `stats_id` int NOT NULL AUTO_INCREMENT COMMENT '통계 ID',
  `store_id` int NOT NULL COMMENT '매장 ID',
  `menu_id` int NOT NULL COMMENT '메뉴 ID',
  `stats_date` date NOT NULL COMMENT '통계 날짜',
  `order_count` int NOT NULL DEFAULT '0' COMMENT '주문 수량',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`stats_id`),
  KEY `idx_store_menu_date` (`store_id`,`menu_id`,`stats_date`),
  KEY `idx_menu_count` (`menu_id`,`order_count` DESC),
  CONSTRAINT `FK_Stores_TO_MenuPopularityStats_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menupopularitystats`
--

LOCK TABLES `menupopularitystats` WRITE;
/*!40000 ALTER TABLE `menupopularitystats` DISABLE KEYS */;
INSERT INTO `menupopularitystats` VALUES (1,1,4,'2023-12-01',15,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(2,1,1,'2023-12-01',12,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(3,1,7,'2023-12-01',8,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(4,1,4,'2023-12-02',18,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(5,1,1,'2023-12-02',14,'2025-05-09 11:13:22','2025-05-09 11:13:22'),(6,1,7,'2023-12-02',10,'2025-05-09 11:13:22','2025-05-09 11:13:22');
/*!40000 ALTER TABLE `menupopularitystats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-09 18:00:17
