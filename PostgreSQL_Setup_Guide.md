# PostgreSQL Database Connection Guide for Data Quality Survey

## Overview
This guide explains how to connect your PostgreSQL database (managed via pgAdmin) to the Data Quality Survey form for storing survey responses.

## Prerequisites
- PostgreSQL installed and running
- pgAdmin 4 installed
- Node.js and npm (for API server)
- Basic knowledge of SQL and REST APIs

## Step 1: Database Setup in pgAdmin

### 1.1 Create Database
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `dq_survey` (or your preferred name)
5. Click "Save"

### 1.2 Create Survey Table
Execute the following SQL in pgAdmin Query Tool:

```sql
-- Create schema for survey data
CREATE SCHEMA IF NOT EXISTS survey;

-- Create main survey responses table
CREATE TABLE survey.responses (
    id SERIAL PRIMARY KEY,
    survey_id VARCHAR(100) UNIQUE NOT NULL,
    dataset_title VARCHAR(255),
    data_type VARCHAR(100),
    processing_level VARCHAR(100),
    evaluation_type VARCHAR(100),
    evaluator_name VARCHAR(255),
    evaluator_org VARCHAR(255),
    language VARCHAR(100),
    overall_score DECIMAL(3,2),
    total_assessments INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    use_case_description TEXT,
    optimum_collection_date DATE,
    spatial_resolution TEXT,
    aoi_coverage DECIMAL(5,2),
    cloud_cover DECIMAL(5,2),
    temporal_deviation DECIMAL(5,2),
    spatial_deviation DECIMAL(5,2),
    scores_design_resolution DECIMAL(3,2),
    scores_design_coverage DECIMAL(3,2),
    scores_design_timeliness DECIMAL(3,2),
    scores_conformance DECIMAL(3,2),
    scores_context DECIMAL(3,2),
    keywords TEXT[],
    raw_data JSONB, -- Store complete survey JSON
    metadata JSONB  -- Store additional metadata
);

-- Create indexes for better performance
CREATE INDEX idx_survey_responses_survey_id ON survey.responses(survey_id);
CREATE INDEX idx_survey_responses_dataset_title ON survey.responses(dataset_title);
CREATE INDEX idx_survey_responses_created_date ON survey.responses(created_date);
CREATE INDEX idx_survey_responses_evaluator ON survey.responses(evaluator_name);

-- Create trigger for updating last_modified
CREATE OR REPLACE FUNCTION survey.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_responses_modtime
    BEFORE UPDATE ON survey.responses
    FOR EACH ROW
    EXECUTE FUNCTION survey.update_modified_column();
```

### 1.3 Create Dashboard View
```sql
-- Create view for dashboard data
CREATE VIEW survey.dashboard_summary AS
SELECT 
    dataset_title,
    data_type,
    processing_level,
    evaluation_type,
    evaluator_name,
    overall_score,
    created_date,
    aoi_coverage,
    cloud_cover,
    scores_design_resolution,
    scores_design_coverage,
    scores_design_timeliness,
    scores_conformance,
    scores_context
FROM survey.responses
WHERE overall_score IS NOT NULL
ORDER BY created_date DESC;
```

## Step 2: API Server Setup

### 2.1 Create Node.js API Server
Create a new directory for your API server:

```bash
mkdir dq-survey-api
cd dq-survey-api
npm init -y
```

### 2.2 Install Dependencies
```bash
npm install express pg cors dotenv helmet express-rate-limit
npm install --save-dev nodemon
```

### 2.3 Create API Server (`server.js`)
```javascript
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dq_survey',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Database connected successfully');
        release();
    }
});

// API Routes
app.post('/api/survey', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const surveyData = req.body;
        
        // Extract data for structured columns
        const {
            dataset: { basic = {} } = {},
            descriptives = {},
            design = {},
            qualityScores = {},
            timestamps = {}
        } = surveyData;
        
        const insertQuery = `
            INSERT INTO survey.responses (
                survey_id, dataset_title, data_type, processing_level, evaluation_type,
                evaluator_name, evaluator_org, language, overall_score, total_assessments,
                use_case_description, optimum_collection_date, spatial_resolution,
                aoi_coverage, cloud_cover, temporal_deviation, spatial_deviation,
                scores_design_resolution, scores_design_coverage, scores_design_timeliness,
                scores_conformance, scores_context, keywords, raw_data, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            ON CONFLICT (survey_id) 
            DO UPDATE SET
                dataset_title = EXCLUDED.dataset_title,
                data_type = EXCLUDED.data_type,
                processing_level = EXCLUDED.processing_level,
                evaluation_type = EXCLUDED.evaluation_type,
                evaluator_name = EXCLUDED.evaluator_name,
                evaluator_org = EXCLUDED.evaluator_org,
                language = EXCLUDED.language,
                overall_score = EXCLUDED.overall_score,
                total_assessments = EXCLUDED.total_assessments,
                use_case_description = EXCLUDED.use_case_description,
                optimum_collection_date = EXCLUDED.optimum_collection_date,
                spatial_resolution = EXCLUDED.spatial_resolution,
                aoi_coverage = EXCLUDED.aoi_coverage,
                cloud_cover = EXCLUDED.cloud_cover,
                temporal_deviation = EXCLUDED.temporal_deviation,
                spatial_deviation = EXCLUDED.spatial_deviation,
                scores_design_resolution = EXCLUDED.scores_design_resolution,
                scores_design_coverage = EXCLUDED.scores_design_coverage,
                scores_design_timeliness = EXCLUDED.scores_design_timeliness,
                scores_conformance = EXCLUDED.scores_conformance,
                scores_context = EXCLUDED.scores_context,
                keywords = EXCLUDED.keywords,
                raw_data = EXCLUDED.raw_data,
                metadata = EXCLUDED.metadata,
                last_modified = CURRENT_TIMESTAMP
            RETURNING id, survey_id;
        `;
        
        const values = [
            `survey_${Date.now()}`,
            basic.datasetTitle || null,
            basic.dataType || null,
            basic.dataprocessinglevel || null,
            basic.evaluationType || null,
            basic.evaluatorName || null,
            basic.evaluatorOrg || null,
            descriptives.languageDropdown || null,
            qualityScores.overall || null,
            qualityScores.summary?.totalScores || 0,
            surveyData.dataset?.useCase?.useCaseDescription || null,
            surveyData.dataset?.useCase?.optimumDataCollection || null,
            getSpatialResolutionText(surveyData.dataset?.spatial),
            design.spatialCoverage?.aoiCoverage || null,
            design.spatialCoverage?.cloudCover || null,
            design.timeliness?.temporalDeviation || null,
            design.spatialResolution?.spatialDeviation || null,
            qualityScores.summary?.byGroup?.['design-resolution']?.average || null,
            qualityScores.summary?.byGroup?.['design-coverage']?.average || null,
            qualityScores.summary?.byGroup?.['design-timeliness']?.average || null,
            qualityScores.summary?.byGroup?.['conformance']?.average || null,
            qualityScores.summary?.byGroup?.['context']?.average || null,
            descriptives.keywords || [],
            JSON.stringify(surveyData),
            JSON.stringify({
                userAgent: req.headers['user-agent'],
                timestamp: new Date().toISOString(),
                ip: req.ip
            })
        ];
        
        const result = await client.query(insertQuery, values);
        
        res.json({
            success: true,
            message: 'Survey data saved successfully',
            id: result.rows[0].id,
            survey_id: result.rows[0].survey_id
        });
        
    } catch (error) {
        console.error('Error saving survey data:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving survey data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        client.release();
    }
});

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM survey.dashboard_summary LIMIT 100');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
});

// Get survey by ID
app.get('/api/survey/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM survey.responses WHERE survey_id = $1 OR id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Survey not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching survey'
        });
    }
});

// Helper function
function getSpatialResolutionText(spatialData) {
    if (!spatialData) return null;
    if (spatialData.pixelSize) return `${spatialData.pixelSize}m (pixel)`;
    if (spatialData.gridSize) return `${spatialData.gridSize}m (grid)`;
    if (spatialData.aggregationLevel) return `${spatialData.aggregationLevel} (aggregation)`;
    return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
```

### 2.4 Create Environment File (`.env`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dq_survey
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# API Security
API_KEY=your_secure_api_key_here
```

### 2.5 Update package.json Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Step 3: Frontend Integration

### 3.1 Update Database Configuration in Survey Form
The survey form will automatically use the new API endpoints. Make sure your API server is running on `http://localhost:3001`.

### 3.2 Test the Connection
1. Start your API server:
   ```bash
   npm run dev
   ```

2. In your survey form, click "Save to Database" after completing a survey.

3. Check pgAdmin to see if data was inserted into `survey.responses` table.

## Step 4: Production Deployment

### 4.1 Secure Your Database
1. Create dedicated database user:
   ```sql
   CREATE USER dq_survey_app WITH PASSWORD 'secure_password';
   GRANT USAGE ON SCHEMA survey TO dq_survey_app;
   GRANT SELECT, INSERT, UPDATE ON survey.responses TO dq_survey_app;
   GRANT USAGE, SELECT ON SEQUENCE survey.responses_id_seq TO dq_survey_app;
   ```

2. Update connection settings in production `.env`

### 4.2 Deploy API Server
- Use PM2 for process management
- Set up reverse proxy with nginx
- Enable SSL/HTTPS
- Configure firewall rules

### 4.3 Monitor Your Database
Set up monitoring for:
- Connection count
- Query performance
- Disk usage
- Response times

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check PostgreSQL is running
   - Verify connection parameters
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password
   - Check pg_hba.conf configuration
   - Ensure user has proper permissions

3. **API Errors**
   - Check server logs
   - Verify CORS settings
   - Test endpoints with Postman/curl

4. **Data Not Saving**
   - Check table permissions
   - Verify JSON structure
   - Review error logs

### Monitoring Queries:
```sql
-- Check recent surveys
SELECT dataset_title, evaluator_name, created_date, overall_score
FROM survey.responses 
ORDER BY created_date DESC 
LIMIT 10;

-- Dashboard statistics
SELECT 
    COUNT(*) as total_surveys,
    AVG(overall_score) as avg_score,
    COUNT(DISTINCT evaluator_name) as unique_evaluators
FROM survey.responses;

-- Performance by data type
SELECT 
    data_type,
    COUNT(*) as count,
    AVG(overall_score) as avg_score,
    MIN(overall_score) as min_score,
    MAX(overall_score) as max_score
FROM survey.responses 
WHERE overall_score IS NOT NULL
GROUP BY data_type;
```

## Support
For issues with this setup:
1. Check PostgreSQL logs in pgAdmin
2. Review API server console output
3. Test database connectivity separately
4. Verify all environment variables are set correctly

This guide provides a complete setup for connecting your PostgreSQL database to the survey form with proper data structure, API integration, and security considerations.