// SUMMARY PAGE: SUMMARY & CREDITS
// import {  initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, getGrade, getGradeColor, clearAllSurveyData } from './shared-utils.js';
import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons} from './shared-utils.js';
import { DataManager } from './core/datamanager.js';


document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  DataManager.init();
  // Validate presence of Section 1 and Section 2 IDs
  const section1Id = sessionStorage.getItem("section1_id");
  const section2Id = sessionStorage.getItem("section2_id");
  const section3Id = sessionStorage.getItem("section3_id");
  const section4Id = sessionStorage.getItem("section4_id");
  const section5Id = sessionStorage.getItem("section5_id");

  if (!section1Id || !section2Id || !section3Id || !section5Id) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

   console.log("✔ Section5 loaded with IDs:", { section1Id, section2Id, section3Id, section4Id, section5Id });
  // Initialize conformance visibility
  const savedProcessingLevel = localStorage.getItem('dataProcessingLevel');
  if (savedProcessingLevel) {
    applyConformanceVisibility(savedProcessingLevel);
  }
  updateNavigationButtons();
  const downloadPDFBtn = document.getElementById('downloadPDF');
  if (downloadPDFBtn) {
    downloadPDFBtn.addEventListener('click', downloadPDF);
  }

  const downloadJSONBtn = document.getElementById('downloadJSON');
  if (downloadJSONBtn) {
    downloadJSONBtn.addEventListener('click', downloadJSON);
  }

  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }

  async function loadSummaryData() {

    try {

      const API = "http://localhost:8020";

      const section1Id = sessionStorage.getItem("section1_id");
      const section2Id = sessionStorage.getItem("section2_id");
      const section3Id = sessionStorage.getItem("section3_id");
      const section4Id = sessionStorage.getItem("section4_id");
      const section5Id = sessionStorage.getItem("section5_id");
      console.log("📡 Fetching summary data using IDs:", {
        section1Id,
        section2Id,
        section3Id,
        section4Id,
        section5Id
      });

      // SECTION 1
      const section1 = await fetch(
        `${API}/section1/${section1Id}`
      ).then(r => r.json());
      // SECTION 2
      const section2 = await fetch(
        `${API}/section2/bySection1/${section1Id}`
      ).then(r => r.json());
      // SECTION 3
      const section3 = await fetch(
        `${API}/section3/bySection1And2/${section1Id}/${section2Id}`
      ).then(r => r.json());
      // SECTION 4 (OPTIONAL)

      let section4 = null;
      if (section4Id && section4Id !== "null") {
        section4 = await fetch(
          `${API}/section4/bySection1And2And3/${section1Id}/${section2Id}/${section3Id}`
        ).then(r => r.json());
      }
      // SECTION 5 (SMART NULL SUPPORT)
      let section5Url;

      if (section4Id && section5Id !== "null") {
        section5Url = `${API}/section5/bySection1And2And3/${section1Id}/${section2Id}/${section3Id}/${section4Id}/${section5Id}`;
      } else {
        section5Url = `${API}/section5/bySection1And2And3/${section1Id}/${section2Id}/${section3Id}/null/${section5Id}`;
      }

      const section5 = await fetch(section5Url).then(r => r.json());

      console.log("✅ Summary Data Loaded:", {
        section1,
        section2,
        section3,
        section4,
        section5
      });

      // -----------------------------
      // POPULATE SUMMARY PAGE
      // -----------------------------
      populateSummary(section1, section2, section3, section4, section5);

    } catch (err) {
      console.error("❌ Error loading summary:", err);
      alert("Failed to load summary data");
    }
  }

  function populateSummary(s1, s2, s3, s4, s5) {

    // -----------------------------
    // DATASET INFO
    // -----------------------------
    document.getElementById("summaryTitle").textContent =
      s1?.dataset_title || "N/A";

    document.getElementById("summaryDataType").textContent =
      s1?.data_type || "N/A";

    document.getElementById("summaryProcessingLevel").textContent =
      s1?.processing_level || "N/A";

    document.getElementById("summaryEvaluationType").textContent =
      s1?.evaluation_type || "N/A";

    document.getElementById("summaryEvaluator").textContent =
      s1?.evaluator_name || "N/A";

    document.getElementById("summaryOrg").textContent =
      s1?.evaluator_org || "N/A";

    document.getElementById("summaryLanguage").textContent =
      s1?.language || "N/A";

    document.getElementById("summaryDate").textContent =
      s1?.created_at
        ? new Date(s1.created_at).toLocaleDateString()
        : "N/A";

    // -----------------------------
    // USE CASE SECTION
    // -----------------------------
    if (s2?.usecase_description) {

      document.getElementById("useCaseCard").style.display = "block";

      document.getElementById("summaryUseCaseDesc").textContent =
        s2.usecase_description;

      document.getElementById("summaryOptimumDate").textContent =
        s2.optimum_date || "N/A";

      document.getElementById("summarySpatialRes").textContent =
        s2.spatial_resolution || "N/A";

      document.getElementById("summaryAOI").textContent =
        s2.area_of_interest || "N/A";
    }

    // -----------------------------
    // SCORES
    // -----------------------------
    document.getElementById("scoreResolution").textContent =
      s3?.score_resolution || "-";

    document.getElementById("scoreCoverage").textContent =
      s3?.score_coverage || "-";

    document.getElementById("scoreTimeliness").textContent =
      s3?.score_timeliness || "-";

    document.getElementById("scoreConformance").textContent =
      s4?.score_conformance || "-";

    document.getElementById("scoreContext").textContent =
      s5?.score_transferability || "-";

  }

  loadSummaryData();
// At the top of your DOMContentLoaded listener
let currentSummaryData = null; // declare globally at the top

async function loadSummaryData() {
    try {
        const API = "http://localhost:8020";
        const section1Id = sessionStorage.getItem("section1_id");
        const section2Id = sessionStorage.getItem("section2_id");
        const section3Id = sessionStorage.getItem("section3_id");
        const section4Id = sessionStorage.getItem("section4_id");
        const section5Id = sessionStorage.getItem("section5_id");

        // Fetch all sections
        const [s1, s2, s3, s4, s5] = await Promise.all([
            fetch(`${API}/section1/${section1Id}`).then(r => r.json()),
            fetch(`${API}/section2/bySection1/${section1Id}`).then(r => r.json()),
            fetch(`${API}/section3/bySection1And2/${section1Id}/${section2Id}`).then(r => r.json()),
            (section4Id && section4Id !== "null")
                ? fetch(`${API}/section4/bySection1And2And3/${section1Id}/${section2Id}/${section3Id}`).then(r => r.json())
                : Promise.resolve(null),
            fetch(`${API}/section5/bySection1And2And3/${section1Id}/${section2Id}/${section3Id}/${section4Id || 'null'}/${section5Id}`).then(r => r.json())
        ]);

        currentSummaryData = { s1, s2, s3, s4, s5 }; // ✅ now this works
        console.log("✅ Summary Data Loaded:", currentSummaryData);

        populateSummary(s1, s2, s3, s4, s5);

    } catch (err) {
        console.error("❌ Error loading summary:", err);
        alert("Failed to load summary data");
    }
}

// Helper to generate the object used for downloads
function generateSummaryData() {
    if (!currentSummaryData) return null;
    const { s1, s2, s3, s4, s5 } = currentSummaryData;

    return {
        datasetTitle: s1?.dataset_title || "N/A",
        dataType: s1?.data_type || "N/A",
        processingLevel: s1?.processing_level || "N/A",
        evaluationType: s1?.evaluation_type || "N/A",
        language: s1?.language || "N/A",
        evaluatorName: s1?.evaluator_name || "N/A",
        evaluatorOrg: s1?.evaluator_org || "N/A",
        useCaseDesc: s2?.usecase_description || "N/A",
        optimumDate: s2?.optimum_date || "N/A",
        spatialRes: s2?.spatial_resolution || "N/A",
        areaOfInterest: s2?.area_of_interest || "N/A",
        scores: {
            resolution: parseFloat(s3?.score_resolution) || 0,
            coverage: parseFloat(s3?.score_coverage) || 0,
            timeliness: parseFloat(s3?.score_timeliness) || 0,
            conformance: parseFloat(s4?.score_conformance) || 0,
            context: parseFloat(s5?.score_transferability) || 0,
            overall: 0 // You can calculate an average here if desired
        },
        timestamps: {
            created: s1?.created_at || new Date(),
            lastModified: new Date()
        }
    };
}

// Helper to get grade based on score (0-5 scale assumed)
function getGrade(score) {
    if (score >= 4.5) return "Excellent";
    if (score >= 3.5) return "Good";
    if (score >= 2.5) return "Fair";
    return "Poor";
}


//   function downloadPDF() {
//     const data = generateSummaryData();
//     const pdfContent = `DATA QUALITY EVALUATION REPORT
// =====================================
// Generated: ${new Date().toLocaleString()}

// DATASET INFORMATION:
// - Title: ${data.datasetTitle}
// - Data Type: ${data.dataType}
// - Processing Level: ${data.processingLevel}
// - Evaluation Type: ${data.evaluationType}
// - Language: ${data.language}
// - Evaluator: ${data.evaluatorName}
// - Organization: ${data.evaluatorOrg}

// USE-CASE INFORMATION:
// - Description: ${data.useCaseDesc}
// - Optimum Collection Date: ${data.optimumDate}
// - Spatial Resolution: ${data.spatialRes}
// - Area of Interest: ${data.areaOfInterest}

// QUALITY ASSESSMENT SCORES:
// - Overall: ${(data.scores.overall || 0).toFixed(1)} (${getGrade(data.scores.overall)})
// - Resolution: ${(data.scores.resolution || 0).toFixed(1)} (${getGrade(data.scores.resolution)})
// - Coverage: ${(data.scores.coverage || 0).toFixed(1)} (${getGrade(data.scores.coverage)})
// - Timeliness: ${(data.scores.timeliness || 0).toFixed(1)} (${getGrade(data.scores.timeliness)})
// - Conformance: ${(data.scores.conformance || 0).toFixed(1)} (${getGrade(data.scores.conformance)})
// - Context/Transferability: ${(data.scores.context || 0).toFixed(1)} (${getGrade(data.scores.context)})

// EVALUATION METADATA:
// - Created: ${new Date(data.timestamps.created).toLocaleString()}
// - Last Modified: ${new Date(data.timestamps.lastModified).toLocaleString()}

// =====================================
// End of Report`;

//     const blob = new Blob([pdfContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${data.datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }
  
async function downloadPDF() {
    if (!currentSummaryData) {
        alert("Data not loaded yet!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10; // starting Y position
    const lineHeight = 8;

    const addLine = (text) => {
        doc.text(10, y, text);
        y += lineHeight;
    }

    addLine("📊 DATA QUALITY EVALUATION SUMMARY");
    addLine("Generated: " + new Date().toLocaleString());
    addLine("===============================");

    // Loop through sections
    for (let section in currentSummaryData) {
        addLine(`\n📁 ${section.toUpperCase()}`);
        const data = currentSummaryData[section];

        for (let key in data) {
            let value = data[key];
            if (typeof value === 'object' && value !== null) {
                addLine(`  ${key}:`);
                for (let subKey in value) {
                    addLine(`    ${subKey}: ${value[subKey]}`);
                }
            } else {
                addLine(`  ${key}: ${value}`);
            }
        }
    }

    doc.save(`Summary_${new Date().toISOString().slice(0,10)}.pdf`);
}


  // function downloadJSON() {
  //   const data = generateSummaryData();
  //   const jsonData = JSON.stringify(data, null, 2);
  //   const blob = new Blob([jsonData], { type: 'application/json' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${data.datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Summary.json`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }

  // ---- SUBMIT FORM ----
  function downloadJSON() {
    if (!currentSummaryData) {
        alert("Data not loaded yet!");
        return;
    }

    const data = currentSummaryData; // use everything as-is
    const jsonData = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Summary_${new Date().toISOString().slice(0,10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

  const submitBtn = document.getElementById('submitForm');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();

      if (confirm('Are you sure you want to submit the evaluation? Your data will be cleared.')) {
        // Set flag to prevent further updates from sections
        localStorage.setItem('formSubmitted', 'true');

        // Clear all form data - comprehensive cleanup
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Remove all survey-related keys
          if (key && (key.includes('dataset') || key.includes('data') || key.includes('evaluator') ||
            key.includes('evaluation') || key.includes('survey') || key.includes('section') ||
            key.includes('keyword') || key.includes('language') || key.includes('documentation') ||
            key.includes('accessibility') || key.includes('metadata') || key.includes('optimum') ||
            key.includes('spatial') || key.includes('aoi') || key.includes('creator') ||
            key.includes('conformance') || key.includes('accuracy') || key.includes('quality') ||
            key.includes('reputation') || key.includes('lineage') || key.includes('processing') ||
            key.includes('useCase') || key.includes('org') || key.includes('completed'))) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        alert('Evaluation submitted successfully! All data cleared. Redirecting to home page.');
        window.location.href = '../index.html';
      }
    });
  }

  // ---- CLEAR & START NEW SURVEY ----
  const clearBtn = document.getElementById('clearAllData');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();

      if (confirm('Clear all survey data and start fresh? This action cannot be undone.')) {
        clearAllSurveyData();
        localStorage.removeItem('formSubmitted');
        alert('All survey data cleared. You can now start a new evaluation.');
        window.location.href = '../index.html';
      }
    });
  }

});
