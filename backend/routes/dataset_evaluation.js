const express = require('express');
const router = express.Router();
const app = express();
app.use(express.json());
const pool = require('../config/connection'); // mysql2/promise pool
const { datasetSchema, useCaseSchema }  = require('../models/intial_dataset');

router.post("/", async (req, res) => {
  try {
    const {
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      other_data_type, 
      evaluation_id,
      evaluation_type,

      // use case fields:
      use_case_description,
      optimum_data_collection,
      aoi_input_method,

      aoi_coordinates,
      aoi_file,
      aoi_geographical_identifier,

      other_requirements
    } = req.body;

    // Validate dataset
    const { error } = datasetSchema.validate({
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      evaluation_id,
      evaluation_type,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Insert dataset
    const insertDataset = `
      INSERT INTO dataset_evaluation
      (title, evaluator, affiliation, data_processing_level, data_type, other_data_type, evaluation_id, evaluation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [datasetResult] = await pool.query(insertDataset, [
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      data_type === "other" ? other_data_type : null, 
      evaluation_id,
      evaluation_type
    ]);

    const datasetId = datasetResult.insertId;

    // If use-case specific
    if (evaluation_id === 1) {
      const insertUseCase = `
        INSERT INTO use_case_specific
        (dataset_evaluation_id, use_case_description, optimum_data_collection,
        aoi_input_method, aoi_coordinates,
        aoi_file, aoi_geographical_identifier, other_requirements)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.query(insertUseCase, [
        datasetId,
        use_case_description,
        optimum_data_collection,
        aoi_input_method,
        aoi_coordinates || null,
        aoi_file || null,
        aoi_geographical_identifier || null,
        other_requirements
      ]);
    }

    return res.status(201).json({ 
      message: "Dataset saved successfully!", 
      datasetId 
    });

  } catch (err) {
    console.error("Error saving dataset:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
