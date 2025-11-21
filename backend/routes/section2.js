const express = require('express');
const router = express.Router();
const db = require('../config/connection'); // your MySQL connection

// POST /section2
router.post('/', (req, res) => {
    const data = req.body;

    if (!data.section1Id) {
        return res.status(400).json({ message: 'section1Id is required' });
    }

    const sql = `
    INSERT INTO section2 
    (section1_id, identifier, dataset_description, dataset_description_link, keywords,language, metadata_documentation, metadata_standards, score_metadata_documentation,
     access_restrictions, api_availability, usage_rights, data_format, format_standards, score_accessibility,
     crs, positional_accuracy, spatial_uncertainty, score_spatial_accuracy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.section1Id,
        data.identifier || null,
        data.dataset_description || null,
        data.dataset_description_link || null,
        data.keywords || null,  
        data.language || null,
        data.metadata_documentation || null,
        data.metadata_standards || null,
        data.score_metadata_documentation || null,

        data.access_restrictions || null,
        data.api_availability || null,
        data.usage_rights || null,
        data.data_format || null,
        data.format_standards || null,
        data.score_accessibility || null,

        data.crs || null,
        data.positional_accuracy || null,
        data.spatial_uncertainty || null,
        data.score_spatial_accuracy || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving Section 2 data' });
        }
        res.json({ message: 'Section 2 data saved successfully', id: result.insertId });
    });
});

module.exports = router;
