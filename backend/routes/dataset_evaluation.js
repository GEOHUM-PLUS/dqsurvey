const express = require('express');
const router = express.Router();
const app = express();
app.use(express.json());
const pool = require('../config/connection'); // mysql2/promise pool
const { datasetSchema, useCaseSchema }  = require('../models/intial_dataset');

// POST /dataset
// router.post('/', async (req, res) => {
//   // Validate request body
//   const { error, value } = datasetEvaluationSchema.validate(req.body, { abortEarly: false });

//   if (error) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Validation failed',
//       details: error.details.map(d => d.message)
//     });
//   }

//   // Insert into database
//   const query = `
//     INSERT INTO dataset_evaluation
//       (title, evaluator, affiliation, data_processing_level, data_type, evaluation_id, evaluation_type, creation_date)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const params = [
//     value.title,
//     value.evaluator,
//     value.affiliation,
//     value.data_processing_level,
//     value.data_type,
//     value.evaluation_id,
//     value.evaluation_type,
//     value.creation_date,
//   ];

//   try {
//     const [result] = await pool.execute(query, params);
//     res.status(201).json({
//       status: 'success',
//       message: 'Dataset added successfully',
//       data: { id: result.insertId, ...value }
//     });
//   } catch (err) {
//     console.error('Error inserting dataset:', err);
//     res.status(500).json({ status: 'error', message: 'Database insertion failed' });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const {
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      evaluation_id,       // 0 = general, 1 = use-case
      evaluation_type,
      use_case_description,
      requirements,
      optimum_data_collection,
      optimum_spatial_resolution,
      aoi_input_method,
      other_requirements
    } = req.body;

    // Validate basic dataset input
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

    // 1️⃣ Insert into dataset_evaluation table
    const datasetInsertQuery = `
      INSERT INTO dataset_evaluation 
      (title, evaluator, affiliation, data_processing_level, data_type, evaluation_id, evaluation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const datasetValues = [
      title, evaluator, affiliation, data_processing_level,
      data_type, evaluation_id, evaluation_type
    ];

    const [datasetResult] = await pool.query(datasetInsertQuery, datasetValues);
    const datasetId = datasetResult.insertId; // newly created id

    // 2️⃣ If use-case-specific → Insert into use_case_specific table
    if (evaluation_id === 1) {
      const { error: useCaseError } = useCaseSchema.validate({
        use_case_description,
        requirements,
        optimum_data_collection,
        optimum_spatial_resolution,
        aoi_input_method,
        other_requirements,
      });

      if (useCaseError) {
        return res.status(400).json({ message: useCaseError.details[0].message });
      }

      const useCaseInsertQuery = `
        INSERT INTO use_case_specific
        (dataset_evaluation_id, use_case_description, requirements, optimum_data_collection,
         optimum_spatial_resolution, aoi_input_method, other_requirements)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const useCaseValues = [
        datasetId,
        use_case_description,
        requirements,
        optimum_data_collection,
        optimum_spatial_resolution,
        aoi_input_method,
        other_requirements,
      ];

      await pool.query(useCaseInsertQuery, useCaseValues);
    }

    return res.status(201).json({
      message: "Dataset saved successfully!",
      datasetId,
    });

  } catch (err) {
    console.error("Error saving dataset:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
