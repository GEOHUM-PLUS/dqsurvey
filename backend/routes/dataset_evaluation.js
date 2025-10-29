const express = require('express');
const router = express.Router();
const app = express();
app.use(express.json());
const pool = require('../config/connection'); // mysql2/promise pool
const datasetEvaluationSchema = require('../models/intial_dataset');

// POST /dataset
router.post('/', async (req, res) => {
  // Validate request body
  const { error, value } = datasetEvaluationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  // Insert into database
  const query = `
    INSERT INTO dataset_evaluation
      (title, evaluator, affiliation, data_processing_level, data_type, evaluation_id, evaluation_type, creation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    value.title,
    value.evaluator,
    value.affiliation,
    value.data_processing_level,
    value.data_type,
    value.evaluation_id,
    value.evaluation_type,
    value.creation_date
  ];

  try {
    const [result] = await pool.execute(query, params);
    res.status(201).json({
      status: 'success',
      message: 'Dataset added successfully',
      data: { id: result.insertId, ...value }
    });
  } catch (err) {
    console.error('Error inserting dataset:', err);
    res.status(500).json({ status: 'error', message: 'Database insertion failed' });
  }
});


module.exports = router;
