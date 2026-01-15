-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 03, 2025 at 03:17 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `geo_hum`
--

-- --------------------------------------------------------

--
-- Table structure for table `section1`
--

CREATE TABLE `section1` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `dataset_title` varchar(255) NOT NULL,
  `evaluator_name` varchar(255) DEFAULT NULL,
  `affiliation` varchar(255) DEFAULT NULL,
  `data_processing_level` varchar(50) NOT NULL,
  `data_type` varchar(50) NOT NULL,
  `data_type_other` varchar(255) DEFAULT NULL,
  `evaluation_type` varchar(50) NOT NULL,
  `use_case_description` text DEFAULT NULL,
  `optimum_data_collection` date DEFAULT NULL,
  `optimum_pixel_resolution` decimal(10,2) DEFAULT NULL,
  `optimum_pixel_resolution_unit` varchar(10) DEFAULT NULL,
  `optimum_gis_resolution` decimal(10,2) DEFAULT NULL,
  `optimum_gis_resolution_unit` varchar(10) DEFAULT NULL,
  `optimum_ml_resolution` decimal(10,2) DEFAULT NULL,
  `optimum_ml_resolution_unit` varchar(10) DEFAULT NULL,
  `optimum_prediction_spatial_resolution` decimal(10,2) DEFAULT NULL,
  `optimum_prediction_spatial_resolution_unit` varchar(10) DEFAULT NULL,
  `optimum_prediction_temporal_resolution` varchar(50) DEFAULT NULL,
  `optimum_survey_aggregation_primary` varchar(50) DEFAULT NULL,
  `optimum_survey_aggregation_secondary` varchar(50) DEFAULT NULL,
  `optimum_other_resolution` text DEFAULT NULL,
  `aoi_type` varchar(50) DEFAULT NULL,
  `aoi_location` varchar(255) DEFAULT NULL,
  `min_lat` decimal(9,6) DEFAULT NULL,
  `max_lat` decimal(9,6) DEFAULT NULL,
  `min_lon` decimal(9,6) DEFAULT NULL,
  `max_lon` decimal(9,6) DEFAULT NULL,
  `aoi_file_name` varchar(255) DEFAULT NULL,
  `other_requirements` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section1`
--

INSERT INTO `section1` (`id`, `dataset_title`, `evaluator_name`, `affiliation`, `data_processing_level`, `data_type`, `data_type_other`, `evaluation_type`, `use_case_description`, `optimum_data_collection`, `optimum_pixel_resolution`, `optimum_pixel_resolution_unit`, `optimum_gis_resolution`, `optimum_gis_resolution_unit`, `optimum_ml_resolution`, `optimum_ml_resolution_unit`, `optimum_prediction_spatial_resolution`, `optimum_prediction_spatial_resolution_unit`, `optimum_prediction_temporal_resolution`, `optimum_survey_aggregation_primary`, `optimum_survey_aggregation_secondary`, `optimum_other_resolution`, `aoi_type`, `aoi_location`, `min_lat`, `max_lat`, `min_lon`, `max_lon`, `aoi_file_name`, `other_requirements`, `created_at`) VALUES
(2, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', '', 'general-quality', '', NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', '', '', '', '', '', '', NULL, NULL, NULL, NULL, '', '', '2025-11-20 00:54:54'),
(3, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', '', 'general-quality', '', NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', '', '', '', '', '', '', NULL, NULL, NULL, NULL, '', '', '2025-11-20 00:54:58'),
(4, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', '', 'general-quality', '', NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', '', '', '', '', '', '', NULL, NULL, NULL, NULL, '', '', '2025-11-20 00:55:08'),
(5, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', '', 'general-quality', '', NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', '', '', '', '', '', '', NULL, NULL, NULL, NULL, '', '', '2025-11-20 00:55:09'),
(6, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', '', 'use-case-adequacy', 'reuire', '2025-11-19', NULL, 'm', '5.00', 'km', NULL, 'm', NULL, 'm', '', '', '', '', 'dropdown', 'CI', NULL, NULL, NULL, NULL, '', 'lkdkjsd', '2025-11-20 00:56:09'),
(7, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 01:02:25'),
(8, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 21:31:42'),
(9, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 21:36:16'),
(10, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'asfdzc', '2025-11-14', NULL, 'm', NULL, 'm', NULL, 'm', '1000.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CI', NULL, NULL, NULL, NULL, NULL, 'sded', '2025-11-20 21:37:12'),
(11, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'asfdzc', '2025-11-14', NULL, 'm', NULL, 'm', NULL, 'm', '1000.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CI', NULL, NULL, NULL, NULL, NULL, 'sded', '2025-11-20 21:42:27'),
(12, 'dataset', 'jonny', 'salzburg', 'primary', 'model-ml', NULL, 'general-quality', NULL, NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 21:46:08'),
(13, 'dataset', 'jonny', 'salzburg', 'primary', 'model-ml', NULL, 'general-quality', NULL, NULL, NULL, 'm', NULL, 'm', NULL, 'm', NULL, 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 21:46:29'),
(14, 'dataset', 'jonny', 'salzburg', 'primary', 'other', 'json', 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 21:53:30'),
(15, 'dataset', 'jonny', 'salzburg', 'primary', 'other', 'json', 'use-case-adequacy', 'abs', '2025-11-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sasfdf', 'dropdown', 'DJ', NULL, NULL, NULL, NULL, NULL, 'asdfcgvbnmbhg', '2025-11-20 21:54:15'),
(16, 'dataset', 'jonny', 'salzburg', 'products', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:05:38'),
(17, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:13:58'),
(18, 'dataset', 'jonny', 'salzburg', 'primary', 'survey', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:14:58'),
(19, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:15:40'),
(20, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:20:13'),
(21, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 22:21:59'),
(22, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 01:42:11'),
(23, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 14:38:55'),
(24, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 14:50:56'),
(25, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 14:52:06'),
(26, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:01:47'),
(27, 'dataset', 'jonny', 'salzburg', 'primary', 'model-ml', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:07:00'),
(28, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:14'),
(29, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:32'),
(30, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:34'),
(31, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:37'),
(32, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:41'),
(33, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:08:43'),
(34, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:10:41'),
(35, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:10:43'),
(36, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:10:53'),
(37, 'dataset', 'jonny', 'salzburg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:10:53'),
(38, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:14:32'),
(39, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:14:34'),
(40, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:14:35'),
(41, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:14:35'),
(42, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:14:35'),
(43, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:16:55'),
(44, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:17:06'),
(45, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'skjh', '2025-11-24', NULL, NULL, NULL, NULL, NULL, NULL, '100.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CF', NULL, NULL, NULL, NULL, NULL, 'ksugshvn', '2025-11-24 15:17:38'),
(46, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'skjh', '2025-11-24', NULL, NULL, NULL, NULL, NULL, NULL, '100.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CF', NULL, NULL, NULL, NULL, NULL, 'ksugshvn', '2025-11-24 15:17:39'),
(47, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'skjh', '2025-11-24', NULL, NULL, NULL, NULL, NULL, NULL, '100.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CF', NULL, NULL, NULL, NULL, NULL, 'ksugshvn', '2025-11-24 15:17:39'),
(48, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'skjh', '2025-11-24', NULL, NULL, NULL, NULL, NULL, NULL, '100.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CF', NULL, NULL, NULL, NULL, NULL, 'ksugshvn', '2025-11-24 15:17:40'),
(49, 'dataset', 'jonny', 'salzburg', 'primary', 'prediction', NULL, 'use-case-adequacy', 'skjh', '2025-11-24', NULL, NULL, NULL, NULL, NULL, NULL, '100.00', 'cm', 'monthly', NULL, NULL, NULL, 'dropdown', 'CF', NULL, NULL, NULL, NULL, NULL, 'ksugshvn', '2025-11-24 15:19:19'),
(50, 'dataset', 'jonny', 'salzburg', 'products', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:20:01'),
(51, 'dataset', 'jonny', 'salzburg', 'primary', 'model-ml', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:20:45'),
(52, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:21:42'),
(53, 'dataset', 'jonny', 'salzburg', 'primary', 'gis', NULL, 'use-case-adequacy', 'jhgfdzxghj', '2025-11-24', NULL, NULL, '44.00', 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dropdown', 'TD', NULL, NULL, NULL, NULL, NULL, 'gfck', '2025-11-24 15:22:22'),
(54, 'datasetf', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'use-case-adequacy', 'jhgfdzxghj', '2025-11-24', NULL, NULL, '44.00', 'm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dropdown', 'TD', NULL, NULL, NULL, NULL, NULL, 'gfck', '2025-11-24 15:22:33'),
(55, 'datasetf', 'jonnyg', 'salzburgg', 'products', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:23:24'),
(56, 'datasetf', 'jonnyg', 'salzburgg', 'products', 'survey', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-25 14:19:22'),
(57, 'datasetf', 'jonnyg', 'salzburgg', 'products', 'model-ml', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-25 14:52:12'),
(58, 'datasetf', 'jonnyg', 'salzburgg', 'products', 'prediction', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-27 09:53:11'),
(59, 'datasetf', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 11:03:14'),
(60, 'datasetf', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 12:02:21'),
(61, 'datasetf', 'jonnyg', 'salzburgg', 'primary', 'remote-sensing', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 12:07:38'),
(62, 'datasetf', 'jonnyg', 'salzburgg', 'products', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 12:08:40'),
(63, 'datasetf new', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 12:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `section2`
--

CREATE TABLE `section2` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section1Id` bigint(20) UNSIGNED NOT NULL,
  `identifier` varchar(255) DEFAULT NULL,
  `dataset_description` text DEFAULT NULL,
  `dataset_description_link` varchar(255) DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `metadata_documentation` text DEFAULT NULL,
  `metadata_standards` varchar(50) DEFAULT NULL,
  `score_metadata_documentation` tinyint(4) DEFAULT NULL,
  `access_restrictions` varchar(255) DEFAULT NULL,
  `api_availability` varchar(50) DEFAULT NULL,
  `usage_rights` varchar(50) DEFAULT NULL,
  `data_format` varchar(50) DEFAULT NULL,
  `format_standards` varchar(50) DEFAULT NULL,
  `score_accessibility` tinyint(4) DEFAULT NULL,
  `crs` varchar(50) DEFAULT NULL,
  `positional_accuracy` text DEFAULT NULL,
  `spatial_uncertainty` text DEFAULT NULL,
  `score_spatial_accuracy` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section2`
--

INSERT INTO `section2` (`id`, `section1Id`, `identifier`, `dataset_description`, `dataset_description_link`, `keywords`, `language`, `metadata_documentation`, `metadata_standards`, `score_metadata_documentation`, `access_restrictions`, `api_availability`, `usage_rights`, `data_format`, `format_standards`, `score_accessibility`, `crs`, `positional_accuracy`, `spatial_uncertainty`, `score_spatial_accuracy`, `created_at`, `updated_at`) VALUES
(1, 59, 'new Identifier', 'jsjhs', 'jnn', '[\"Land Cover\"]', 'French', 'Metadata Documentation', 'unclear', 2, 'Other', 'manual', 'Open', 'Shapefile', 'OGC', 3, 'Mercator', 'sdvc', 'sefbgvc', 2, '2025-11-28 11:34:50', '2025-11-28 11:34:50'),
(2, 59, 'new Identifier new', 'jsjhs', 'amsms', '[\"Spatial Data\"]', 'French', 'Metadata Documentation', 'no', 3, 'Restricted', 'partial', 'Restricted', 'XML', 'Unclear', 2, 'ETRS89', 'sdvc', 'sefbgvc', 3, '2025-11-28 11:46:34', '2025-11-28 11:46:34'),
(3, 63, 'new Identifier new', 'jsjhs', 'amsms', '[]', 'Spanish', 'Metadata Documentation', 'no', 1, 'Public', 'manual', 'Open', 'XML', 'No', 1, 'Unknown', 'sdvc', 'sefbgvc', 1, '2025-12-01 14:23:30', '2025-12-01 14:23:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `section1`
--
ALTER TABLE `section1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `section2`
--
ALTER TABLE `section2`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section1Id_idx` (`section1Id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `section1`
--
ALTER TABLE `section1`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `section2`
--
ALTER TABLE `section2`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
