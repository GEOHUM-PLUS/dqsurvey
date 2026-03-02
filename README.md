
# Data Quality And Adequacy Assessment Tool (DQAAT)

A structured web-based research tool for assessing and documenting the quality of spatial and geospatial datasets.

**Frontend (Live):**
[https://geohum-plus.github.io/dqsurvey/index.html](https://geohum-plus.github.io/dqsurvey/index.html)

**Backend Repository:**
[https://github.com/GEOHUM-PLUS/dqsurvey-backend](https://github.com/GEOHUM-PLUS/dqsurvey-backend)

---

# Overview

DQAAT provides a structured framework for:

* General data quality assessment
* Use-case specific adequacy evaluation
* Standardized 1–4 scoring rubric
* Conditional workflow logic
* Exportable summary reports

The system consists of:

* **Frontend (this repository)** – User interface, routing, scoring, export
* **Backend (separate repository)** – API service and database layer

---

# Section Structure

| Section                                   | Focus                               | Purpose                                                      |
| ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **1. Initial Information**                | Dataset setup                       | Defines processing level, evaluation type, and routing logic |
| **2. Descriptives**                       | Metadata & access                   | Assesses documentation quality and accessibility             |
| **3. Design**                             | Resolution & coverage               | Evaluates structural suitability of the dataset              |
| **4. Conformance** *(Data Products only)* | Completeness, consistency, accuracy | Assesses internal validity of derived datasets               |
| **5. Context**                            | Reputation & relevance              | Evaluates trust, applicability, and transferability          |
| **Summary**                               | Aggregated output                   | Consolidates scores and generates reports                    |

---

# Routing Model

The tool uses:

* **Page-based navigation** (separate HTML pages)
* **Conditional branching** based on Section 1 selections

Dynamic workflow includes:

* Conformance section enabled only for *Data Products*
* Use-case mode activates requirement-based scoring
* Data-type selection adapts resolution inputs

This ensures methodological consistency across evaluation paths.

---

# Architecture & Deployment

## Frontend

* Static multi-page web application
* Hosted via **GitHub Pages**
* Built with HTML, Bootstrap, and modular JavaScript
* Deployed using **Jekyll-compatible structure** [Due to multiple `HTML` pages].

### Deployment Flow

1. Code pushed to GitHub
2. GitHub Pages builds via Jekyll
3. Static site is published automatically

---

## Backend

* Separate Node-based API
* Deployed via Render
* Uses PostgreSQL for data storage

For backend implementation details, see the backend repository.

---

## Current Hosting Setup

| Component | Platform              | Tier      |
| --------- | --------------------- | --------- |
| Frontend  | GitHub Pages (Jekyll) | Free      |
| Backend   | Render                | Free Tier |
| Database  | PostgreSQL (Render)   | Managed   |

### Note on Render Free Tier

- The API may enter sleep mode after inactivity

- Initial requests may experience a short cold-start delay

- Suitable for research and demonstration purposes

---

# License

* **Code:** MIT License
* **Documentation & non-code content:** CC BY 4.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](LICENSE-CC-BY-4.0.md)

---

# Suggested Citation

[![Paper: under review](https://img.shields.io/badge/Paper-under%20review-blue.svg)](#suggested-citation)

The Data Quality And Adequacy Assessment Tool (DQAAT) forms part of a peer-reviewed research manuscript currently under review.

Full citation details will be shared upon publication.

