CREATE DATABASE IF NOT EXISTS `vidshare`;
USE `vidshare`;

-- vidshare.movie definition
CREATE TABLE `movie` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `moviename` varchar(255) NOT NULL,
  `paused` int(1) NOT NULL DEFAULT 0,
  `currentTime` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `totalTime` decimal(10,6) DEFAULT 0.000000,
  `dateAdded` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `movie_unique` (`moviename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- vidshare.chat definition
CREATE TABLE `chat` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `movie` int(10) unsigned NOT NULL,
  `username` varchar(100) NOT NULL,
  `usertext` text NOT NULL,
  `usertime` varchar(20) NOT NULL,
  `videotime` decimal(10,6) DEFAULT 0.000000,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
