-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 09:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ba_map`
--

-- --------------------------------------------------------

--
-- Table structure for table `berths`
--

CREATE TABLE `berths` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `startKd` int(11) NOT NULL,
  `endKd` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communication_logs`
--

CREATE TABLE `communication_logs` (
  `id` int(11) NOT NULL,
  `dateTime` varchar(100) DEFAULT NULL,
  `petugas` varchar(100) DEFAULT NULL,
  `stakeholder` varchar(100) DEFAULT NULL,
  `pic` varchar(100) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `commChannel` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_schedules`
--

CREATE TABLE `maintenance_schedules` (
  `id` int(11) NOT NULL,
  `type` enum('maintenance','no-vessel') DEFAULT 'maintenance',
  `startKd` int(11) DEFAULT NULL,
  `endKd` int(11) DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rest_schedules`
--

CREATE TABLE `rest_schedules` (
  `id` int(11) NOT NULL,
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ship_schedules`
--

CREATE TABLE `ship_schedules` (
  `id` int(11) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `shipName` varchar(255) DEFAULT NULL,
  `code` varchar(100) DEFAULT NULL,
  `length` int(11) DEFAULT NULL,
  `draft` float DEFAULT NULL,
  `destPort` varchar(100) DEFAULT NULL,
  `berthLocation` int(11) DEFAULT NULL,
  `nKd` int(11) DEFAULT NULL,
  `minKd` int(11) DEFAULT NULL,
  `loadValue` int(11) DEFAULT 0,
  `dischargeValue` int(11) DEFAULT 0,
  `etaTime` datetime DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `etcTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `berthSide` varchar(50) DEFAULT NULL,
  `bsh` int(11) DEFAULT NULL,
  `qccName` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `shipping_company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ship_schedules`
--

INSERT INTO `ship_schedules` (`id`, `company`, `shipName`, `code`, `length`, `draft`, `destPort`, `berthLocation`, `nKd`, `minKd`, `loadValue`, `dischargeValue`, `etaTime`, `startTime`, `etcTime`, `endTime`, `status`, `berthSide`, `bsh`, `qccName`, `created_at`, `shipping_company_id`) VALUES
(1, 'CTP', 'ghjj', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-05 07:03:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stakeholders`
--

CREATE TABLE `stakeholders` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('user','company') DEFAULT 'company'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stakeholders`
--

INSERT INTO `stakeholders` (`id`, `name`, `type`) VALUES
(1, 'PT Pelabuhan Indonesia', 'company'),
(2, 'PT Angkasa Pura', 'company'),
(3, 'John Doe', 'user'),
(4, 'Jane Smith', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `berths`
--
ALTER TABLE `berths`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `communication_logs`
--
ALTER TABLE `communication_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rest_schedules`
--
ALTER TABLE `rest_schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ship_schedules`
--
ALTER TABLE `ship_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ship_berth` (`berthLocation`),
  ADD KEY `fk_ship_company` (`shipping_company_id`);

--
-- Indexes for table `stakeholders`
--
ALTER TABLE `stakeholders`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `berths`
--
ALTER TABLE `berths`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `communication_logs`
--
ALTER TABLE `communication_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rest_schedules`
--
ALTER TABLE `rest_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ship_schedules`
--
ALTER TABLE `ship_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stakeholders`
--
ALTER TABLE `stakeholders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ship_schedules`
--
ALTER TABLE `ship_schedules`
  ADD CONSTRAINT `fk_ship_berth` FOREIGN KEY (`berthLocation`) REFERENCES `berths` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ship_company` FOREIGN KEY (`shipping_company_id`) REFERENCES `shipping_companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Tabel master data untuk nama pelayaran
--
CREATE TABLE `shipping_companies` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `flag_image` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan data nama pelayaran ke tabel shipping_companies
INSERT INTO `shipping_companies` (`name`, `code`, `flag_image`) VALUES
('SPIL', 'SPIL', NULL),
('CTP', 'CTP', NULL),
('MERATUS', 'MERATUS', NULL),
('TANTO', 'TANTO', NULL),
('PPNP', 'PPNP', NULL),
('ICON', 'ICON', NULL),
('TEMAS LINE', 'TEMAS', NULL),
('LAINNYA', 'LAINNYA', NULL);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
