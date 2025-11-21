const express = require('express');
const router = express.Router();
const db = require('../config/connection'); // make sure this is your MySQL pool/connection

// POST /section1
router.post('/', (req, res) => {
    const data = req.body;

    const sql = `
    INSERT INTO section1
    (dataset_title, evaluator_name, affiliation, data_processing_level, data_type, data_type_other, 
    evaluation_type, use_case_description, optimum_data_collection, 
    optimum_pixel_resolution, optimum_pixel_resolution_unit, 
    optimum_gis_resolution, optimum_gis_resolution_unit, 
    optimum_ml_resolution, optimum_ml_resolution_unit, 
    optimum_prediction_spatial_resolution, optimum_prediction_spatial_resolution_unit, 
    optimum_prediction_temporal_resolution, 
    optimum_survey_aggregation_primary, optimum_survey_aggregation_secondary, 
    optimum_other_resolution, aoi_type, aoi_location, min_lat, max_lat, min_lon, max_lon, aoi_file_name, other_requirements)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

   
const values = [
    data.datasetTitle || null,
    data.evaluatorName || null,
    data.affiliation || null,
    data.dataProcessingLevel || null,
    data.dataType || null,
    data.dataTypeOther || null,
    data.evaluationType || null,
    data.useCaseDescription || null,
    data.optimumDataCollection || null,
    data.optimumPixelResolution || null,
    data.optimumPixelResolutionUnit || null,
    data.optimumGISResolution || null,
    data.optimumGISResolutionUnit || null,
    data.optimumMLResolution || null,
    data.optimumMLResolutionUnit || null,
    data.optimumPredictionSpatialResolution || null,
    data.optimumPredictionSpatialResolutionUnit || null,
    data.optimumPredictionTemporalResolution || null,
    data.optimumSurveyAggregationPrimary || null,
    data.optimumSurveyAggregationSecondary || null,
    data.optimumOtherResolution || null,
    data.aoiType || null,
    data.aoiLocation || null,
    data.minLat || null,
    data.maxLat || null,
    data.minLon || null,
    data.maxLon || null,
    data.aoiFileName || null,
    data.otherRequirements || null
];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error saving data' });
        } else {
            res.json({ message: 'Data saved successfully', id: result.insertId });
        }
    });
});

module.exports = router;
