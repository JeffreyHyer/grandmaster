SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `tvix`;
CREATE TABLE `tvix` (
  `start` datetime NOT NULL,
  `open` decimal(15, 4) unsigned DEFAULT NULL,
  `high` decimal(15, 4) unsigned DEFAULT NULL,
  `low` decimal(15, 4) unsigned DEFAULT NULL,
  `close` decimal(15, 4) unsigned DEFAULT NULL,
  `volume` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`start`),
  KEY `close` (`close`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `spy`;
CREATE TABLE `spy` (
  `start` datetime NOT NULL,
  `open` decimal(15, 4) unsigned DEFAULT NULL,
  `high` decimal(15, 4) unsigned DEFAULT NULL,
  `low` decimal(15, 4) unsigned DEFAULT NULL,
  `close` decimal(15, 4) unsigned DEFAULT NULL,
  `volume` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`start`),
  KEY `close` (`close`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `fb`;
CREATE TABLE `fb` (
  `start` datetime NOT NULL,
  `open` decimal(15, 4) unsigned DEFAULT NULL,
  `high` decimal(15, 4) unsigned DEFAULT NULL,
  `low` decimal(15, 4) unsigned DEFAULT NULL,
  `close` decimal(15, 4) unsigned DEFAULT NULL,
  `volume` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`start`),
  KEY `close` (`close`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `nflx`;
CREATE TABLE `nflx` (
  `start` datetime NOT NULL,
  `open` decimal(15, 4) unsigned DEFAULT NULL,
  `high` decimal(15, 4) unsigned DEFAULT NULL,
  `low` decimal(15, 4) unsigned DEFAULT NULL,
  `close` decimal(15, 4) unsigned DEFAULT NULL,
  `volume` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`start`),
  KEY `close` (`close`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
