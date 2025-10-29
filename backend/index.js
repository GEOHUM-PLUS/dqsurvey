require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/connection');
const datasetEvaluationRoutes = require('./routes/dataset_evaluation');


const app = express();
const PORT = process.env.PORT || 5000;
const api = process.env.API_URL;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/dataset', datasetEvaluationRoutes);

// Route example
app.get('/', (req, res) => {
  res.send('🚀 Backend is working!');
});

app.get('/checkdb', async (req, res) => {
    const currentTime = getCurrentDateTime();
    try {
        const [rows, fields] = await pool.query('SELECT 1');
        logger.info(`Get Hit on /checkdb - ${currentTime}`);
        res.status(200).json({ message: 'Database connection is active.' });
    } catch (error) {
        console.error('Error checking database connection:', error);
        res.status(500).json({ error: 'Database connection is not available.' });
    }
});
// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
