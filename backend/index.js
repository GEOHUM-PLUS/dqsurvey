require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/connection');
const datasetEvaluationRoutes = require('./routes/dataset_evaluation');
const section1Routes = require('./routes/section1');
const section2Routes = require('./routes/section2');

const app = express();
const PORT = process.env.PORT || 5000;
const api = process.env.API_URL;

// Middleware
// app.use(cors());
// const cors = require('cors');

// app.use(cors());
// app.options('*', cors()); // handle preflight
app.use(cors({
  origin: "https://geohum-plus.github.io",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

// app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/dataset', datasetEvaluationRoutes);
app.use('/section1', section1Routes);
app.use('/section2', section2Routes);

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
