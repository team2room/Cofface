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
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `menu_id` int NOT NULL AUTO_INCREMENT COMMENT '메뉴 ID',
  `category_id` int NOT NULL COMMENT '카테고리 ID',
  `menu_name` varchar(100) NOT NULL COMMENT '메뉴명',
  `price` int NOT NULL COMMENT '가격',
  `is_sold_out` tinyint(1) NOT NULL DEFAULT '0' COMMENT '품절여부',
  `image_url` varchar(255) NOT NULL COMMENT '이미지 URL',
  `description` text COMMENT '설명',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '삭제여부',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`menu_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_menu_name` (`menu_name`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,1,'왕카페라떼',4800,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee1.jpg','진한 에스프레소와 부드러운 우유가 어우러져 고소한 풍미를 완성한 메가MGC커피만의 왕메가사이즈 라떼',0,NULL),(2,1,'라이트 바닐라 아몬드 라떼',5300,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee2.jpg','비건 음료 아몬드브리즈와 칼로리를 낮춘 라이트 바닐라 시럽이 만나 가볍지만 부드~러워진 라떼',0,NULL),(3,1,'연유 라떼',5700,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee3.jpg','향기로운 에스프레소 샷, 부드러운 우유 그리고 달콤한 연유가 조화롭게 어우러진 라떼',0,NULL),(4,1,'아메리카노',5900,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee4.jpg','깊고 진한 메가MGC커피 아메리카노를 \"960ml\" 더 큼직하게 즐길 수 있는 대용량 커피.',0,NULL),(5,1,'연유라떼',4200,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee5.jpg','향기로운 에스프레소 샷, 부드러운 우유 그리고 달콤한 연유가 조화롭게 어우러진 라떼.',0,NULL),(6,2,'왕메가사과유자',4700,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/TEA1.jpg','애플티의 향긋함과 유자청의 상큼달콤함을 느낄 수 있는 메가MGC커피만의 왕메가사이즈 과일티',0,NULL),(7,2,'상큼 리치티',4500,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/TEA2.jpg','리치, 라임, 망고스틴 베이스에 레드 커런트, 로즈마리를 더한 상큼한 과일티',0,NULL),(8,2,'녹차',4600,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/TEA3.jpg','고소한 감칠맛과 부드러운 목넘김으로 산뜻하게 마음을 위로하는 국내산 녹차',0,NULL),(9,2,'사과유자차',4800,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/TEA4.jpg','애플티의 향긋함과 유자청의 상큼달콤함을 한컵에 담아낸 과일티.',0,NULL),(10,2,'복숭아아이스티',5000,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/TEA5.jpg','깊은 맛의 홍차와 달콤한 복숭아의 은은한 향이 어우러진 시원한 여름철 인기 음료.',0,NULL),(11,3,'제로 부스트 에이드',5800,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/ade1.jpg','지친 현대인들에게 필요한 한 잔의 에너지! 타우린 1,000mg이 들어가 활력이 충전되는 에너지드링크맛 제로 칼로리 에이드',0,NULL),(12,3,'블루베리플럼주스',5800,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/ade2.jpg','새콤달콤한 블루베리와 식이섬유가 풍부한 플럼, 프리바이오틱스를 더해 건강한 블렌딩 주스',0,NULL),(13,3,'골드키위주스',6100,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/ade3.jpg','상큼달콤한 프리미엄 골드키위에 밀크씨슬을 더해 일상의 활력을 선사하는 건강한 블렌딩 주스',0,NULL),(14,3,'딸기주스',5900,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/ade4.jpg','새콤달콤한 딸기주스에 피쉬 콜라겐을 더해 건강한 블렌딩 주스',0,NULL),(15,3,'딸기바나나주스',6200,0,'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/ade5.jpg','상큼한 딸기와 부드러운 바나나가 만나, 새콤달콤한 매력이 살아 있는 과일 음료.',0,NULL),(36,8,'아메리카노',4300,0,'https://example.com/images/americano.jpg','신촌점 특별 로스팅 원두로 추출한 깊은 맛의 아메리카노',0,NULL),(37,8,'카페 라떼',4800,0,'https://example.com/images/caffe_latte.jpg','고소한 우유와 에스프레소가 어우러진 카페 라떼',0,NULL),(38,8,'카푸치노',5000,0,'https://example.com/images/cappuccino.jpg','풍성한 우유 거품이 특징인 이탈리아 정통 카푸치노',0,NULL),(39,9,'녹차 라떼',5300,0,'https://example.com/images/green_tea_latte.jpg','향긋한 녹차 가루와 부드러운 우유의 조화',0,NULL);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 14:52:17
