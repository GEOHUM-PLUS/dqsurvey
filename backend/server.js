// backend/server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// db file lives next to server.js
const db = new sqlite3.Database(path.join(__dirname, "dq.sqlite"));

// create table with constraints (0–100 checks, required fields, etc.)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasetTitle TEXT NOT NULL,
      evaluatorName TEXT,
      evaluatorOrg TEXT,
      dataprocessinglevel TEXT CHECK(dataprocessinglevel IN ('primary','products')),
      dataType TEXT,
      evaluationType TEXT CHECK(evaluationType IN ('general-quality','use-case-adequacy')),
      // section 2 (examples)
      language TEXT,
      identifier TEXT,
      datasetDescription TEXT,
      // section 3 design scores (0–4)
      score_design_resolution INTEGER CHECK(score_design_resolution BETWEEN 0 AND 4),
      score_design_coverage   INTEGER CHECK(score_design_coverage   BETWEEN 0 AND 4),
      score_design_timeliness INTEGER CHECK(score_design_timeliness BETWEEN 0 AND 4),
      // section 4 conformance % with 0–100 checks
      valuesCompleteness INTEGER CHECK(valuesCompleteness BETWEEN 0 AND 100),
      attributeCompleteness INTEGER CHECK(attributeCompleteness BETWEEN 0 AND 100),
      topoConsistency INTEGER CHECK(topoConsistency BETWEEN 0 AND 100),
      // section 5 context scores (0–4)
      score_context_reputation INTEGER CHECK(score_context_reputation BETWEEN 0 AND 4),
      score_context_applicability INTEGER CHECK(score_context_applicability BETWEEN 0 AND 4),
      score_context_transferability INTEGER CHECK(score_context_transferability BETWEEN 0 AND 4),
      // raw JSON copy for anything else
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
});

app.post("/api/evaluations", (req, res) => {
  try {
    const p = req.body || {};
    const b = p.dataset?.basic || {};
    const scores = p.qualityScores?.summary?.byGroup || {};

    const stmt = `
      INSERT INTO evaluations (
        datasetTitle, evaluatorName, evaluatorOrg, dataprocessinglevel, dataType, evaluationType,
        language, identifier, datasetDescription,
        score_design_resolution, score_design_coverage, score_design_timeliness,
        valuesCompleteness, attributeCompleteness, topoConsistency,
        score_context_reputation, score_context_applicability, score_context_transferability,
        payload_json, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const params = [
      b.datasetTitle || "Untitled",
      b.evaluatorName || null,
      b.evaluatorOrg || null,
      b.dataprocessinglevel || null,
      b.dataType || null,
      b.evaluationType || null,
      p.dataset?.descriptives?.languageDropdown || null,
      p.dataset?.descriptives?.identifier || null,
      p.dataset?.descriptives?.datasetDescription || null,
      scores["design-resolution"]?.average ?? null,
      scores["design-coverage"]?.average ?? null,
      scores["design-timeliness"]?.average ?? null,
      p.conformance?.valuesCompleteness ?? null,
      p.conformance?.attributeCompleteness ?? null,
      p.conformance?.topoConsistency ?? null,
      scores["context-reputation"]?.average ?? null,
      scores["context-applicability"]?.average ?? null,
      scores["context-transferability"]?.average ?? null,
      JSON.stringify(p),
      new Date().toISOString()
    ];

    db.run(stmt, params, function (err) {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      res.json({ ok: true, id: this.lastID });
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(3001, () => console.log("DB server on http://localhost:3001"));
