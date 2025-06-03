-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: orderme
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `optioncategories`
--

DROP TABLE IF EXISTS `optioncategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `optioncategories` (
  `category_id` int NOT NULL AUTO_INCREMENT COMMENT '옵션 카테고리 ID',
  `category_name` varchar(50) NOT NULL COMMENT '옵션 카테고리명',
  `is_required` tinyint(1) NOT NULL DEFAULT '0' COMMENT '필수여부',
  `display_order` int NOT NULL DEFAULT '0' COMMENT '정렬순서',
  `is_sold_out` tinyint(1) NOT NULL DEFAULT '0' COMMENT '품절여부',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '삭제여부',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`category_id`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `optioncategories`
--

LOCK TABLES `optioncategories` WRITE;
/*!40000 ALTER TABLE `optioncategories` DISABLE KEYS */;
INSERT INTO `optioncategories` VALUES (1,'HOT/ICED',1,1,0,0,NULL),(2,'사이즈',0,2,0,0,NULL),(3,'얼음',0,3,0,0,NULL),(4,'휘핑 크림',0,4,0,0,NULL),(5,'샷 추가',0,5,0,0,NULL),(6,'우유 변경',0,6,0,0,NULL);
/*!40000 ALTER TABLE `optioncategories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 14:52:18
