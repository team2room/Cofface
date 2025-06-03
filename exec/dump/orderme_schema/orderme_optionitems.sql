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
-- Table structure for table `optionitems`
--

DROP TABLE IF EXISTS `optionitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `optionitems` (
  `item_id` int NOT NULL AUTO_INCREMENT COMMENT '옵션 항목 ID',
  `category_id` int NOT NULL COMMENT '옵션 카테고리 ID',
  `option_name` varchar(100) NOT NULL COMMENT '옵션명',
  `additional_price` int NOT NULL DEFAULT '0' COMMENT '추가금액',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '기본선택여부',
  `display_order` int NOT NULL DEFAULT '0' COMMENT '정렬순서',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '삭제여부',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`item_id`),
  KEY `idx_category_display` (`category_id`,`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `optionitems`
--

LOCK TABLES `optionitems` WRITE;
/*!40000 ALTER TABLE `optionitems` DISABLE KEYS */;
INSERT INTO `optionitems` VALUES (1,1,'차갑게',0,1,1,0,NULL),(2,1,'뜨겁게',0,0,2,0,NULL),(3,2,'작은',0,1,1,0,NULL),(4,2,'중간',500,0,2,0,NULL),(5,2,'큰',1000,0,3,0,NULL),(6,3,'적게',0,0,1,0,NULL),(7,3,'보통',0,1,2,0,NULL),(8,3,'많이',0,0,3,0,NULL),(9,4,'없음',0,0,1,0,NULL),(10,4,'적게',0,0,2,0,NULL),(11,4,'보통',0,1,3,0,NULL),(12,4,'많이',0,0,4,0,NULL),(13,5,'없음',0,1,1,0,NULL),(14,5,'1샷',500,0,2,0,NULL),(15,5,'2샷',1000,0,3,0,NULL),(16,5,'3샷',1500,0,4,0,NULL),(17,6,'없음',0,1,1,0,NULL),(18,6,'오트(귀리)',600,0,2,0,NULL),(19,6,'아몬드',600,0,3,0,NULL),(20,6,'두유',600,0,4,0,NULL);
/*!40000 ALTER TABLE `optionitems` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 14:52:19
