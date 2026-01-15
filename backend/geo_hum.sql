-- --------------------------------------------------------
-- Drop tables if they exist (avoids "relation already exists" errors)
-- --------------------------------------------------------
DROP TABLE IF EXISTS section2;
DROP TABLE IF EXISTS section1;

-- --------------------------------------------------------
-- Table: section1
-- --------------------------------------------------------
CREATE TABLE section1 (
    id BIGINT PRIMARY KEY,
    dataset_title VARCHAR(255) NOT NULL,
    evaluator_name VARCHAR(255),
    affiliation VARCHAR(255),
    data_processing_level VARCHAR(50) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    data_type_other VARCHAR(255),
    evaluation_type VARCHAR(50) NOT NULL,
    use_case_description TEXT,
    optimum_data_collection DATE,
    optimum_pixel_resolution NUMERIC(10,2),
    optimum_pixel_resolution_unit VARCHAR(10),
    optimum_gis_resolution NUMERIC(10,2),
    optimum_gis_resolution_unit VARCHAR(10),
    optimum_ml_resolution NUMERIC(10,2),
    optimum_ml_resolution_unit VARCHAR(10),
    optimum_prediction_spatial_resolution NUMERIC(10,2),
    optimum_prediction_spatial_resolution_unit VARCHAR(10),
    optimum_prediction_temporal_resolution VARCHAR(50),
    optimum_survey_aggregation_primary VARCHAR(50),
    optimum_survey_aggregation_secondary VARCHAR(50),
    optimum_other_resolution TEXT,
    aoi_type VARCHAR(50),
    aoi_location VARCHAR(255),
    min_lat NUMERIC(9,6),
    max_lat NUMERIC(9,6),
    min_lon NUMERIC(9,6),
    max_lon NUMERIC(9,6),
    aoi_file_name VARCHAR(255),
    other_requirements TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: section2
-- --------------------------------------------------------
CREATE TABLE section2 (
    id BIGINT PRIMARY KEY,
    section1Id BIGINT NOT NULL REFERENCES section1(id),
    identifier VARCHAR(255),
    dataset_description TEXT,
    dataset_description_link VARCHAR(255),
    keywords TEXT,
    language VARCHAR(50),
    metadata_documentation TEXT,
    metadata_standards VARCHAR(50),
    score_metadata_documentation SMALLINT,
    access_restrictions VARCHAR(255),
    api_availability VARCHAR(50),
    usage_rights VARCHAR(50),
    data_format VARCHAR(50),
    format_standards VARCHAR(50),
    score_accessibility SMALLINT,
    crs VARCHAR(50),
    positional_accuracy TEXT,
    spatial_uncertainty TEXT,
    score_spatial_accuracy SMALLINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Insert data into section1
-- --------------------------------------------------------
INSERT INTO section1 (
    id, dataset_title, evaluator_name, affiliation, data_processing_level, data_type, data_type_other,
    evaluation_type, use_case_description, optimum_data_collection, optimum_pixel_resolution,
    optimum_pixel_resolution_unit, optimum_gis_resolution, optimum_gis_resolution_unit,
    optimum_ml_resolution, optimum_ml_resolution_unit, optimum_prediction_spatial_resolution,
    optimum_prediction_spatial_resolution_unit, optimum_prediction_temporal_resolution,
    optimum_survey_aggregation_primary, optimum_survey_aggregation_secondary, optimum_other_resolution,
    aoi_type, aoi_location, min_lat, max_lat, min_lon, max_lon, aoi_file_name, other_requirements, created_at
) VALUES
(59, 'datasetf', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 11:03:14'),
(63, 'datasetf new', 'jonnyg', 'salzburgg', 'primary', 'gis', NULL, 'general-quality', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 12:09:53');

-- --------------------------------------------------------
-- Insert data into section2
-- --------------------------------------------------------
INSERT INTO section2 (
    id, section1Id, identifier, dataset_description, dataset_description_link, keywords,
    language, metadata_documentation, metadata_standards, score_metadata_documentation,
    access_restrictions, api_availability, usage_rights, data_format, format_standards,
    score_accessibility, crs, positional_accuracy, spatial_uncertainty, score_spatial_accuracy,
    created_at, updated_at
) VALUES
(1, 59, 'new Identifier', 'jsjhs', 'jnn', '["Land Cover"]', 'French', 'Metadata Documentation', 'unclear', 2, 'Other', 'manual', 'Open', 'Shapefile', 'OGC', 3, 'Mercator', 'sdvc', 'sefbgvc', 2, '2025-11-28 11:34:50', '2025-11-28 11:34:50'),
(2, 59, 'new Identifier new', 'jsjhs', 'amsms', '["Spatial Data"]', 'French', 'Metadata Documentation', 'no', 3, 'Restricted', 'partial', 'Restricted', 'XML', 'Unclear', 2, 'ETRS89', 'sdvc', 'sefbgvc', 3, '2025-11-28 11:46:34', '2025-11-28 11:46:34'),
(3, 63, 'new Identifier new', 'jsjhs', 'amsms', '[]', 'Spanish', 'Metadata Documentation', 'no', 1, 'Public', 'manual', 'Open', 'XML', 'No', 1, 'Unknown', 'sdvc', 'sefbgvc', 1, '2025-12-01 14:23:30', '2025-12-01 14:23:30');
